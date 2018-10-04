import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { FormBuilder, Validators} from "@angular/forms";
import { Http, Headers, RequestOptions  } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { MenuPage } from '../menu/menu';

import { Network } from '@ionic-native/network';

import { GlobalsProvider } from '../../providers/globals/globals'
import { LoginDbProvider } from '../../providers/login-db/login-db';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
		
	backgrounds = [
		'assets/img/background/background-1.jpg',
		'assets/img/background/background-2.jpg',
		'assets/img/background/background-3.jpg',
		'assets/img/background/background-4.jpg'
	];
	
	public loginForm: any;
	authForm: any;
	connected: Subscription;
	disconnected: Subscription;
	
	constructor(platform: Platform, public formBuilder: FormBuilder, public toast:ToastController, public alertCtrl:AlertController, private network:Network, public navCtrl: NavController, public navParams: NavParams,public logindb: LoginDbProvider,
	private sqlite: SQLite, public http: Http, public loadingCtrl: LoadingController, private toastCtrl: ToastController, private globals:GlobalsProvider) {
		this.loginForm = formBuilder.group({
			login: ['', Validators.required],
			password: ['', Validators.compose([Validators.minLength(3), Validators.required])]
		});

	}

	ionViewDidEnter() {
		this.connected = this.network.onConnect().subscribe(data => {
			console.log(data)
			this.displayNetworkUpdate(data.type);
		}, error => console.error(error));
		
		this.disconnected = this.network.onDisconnect().subscribe(data => {
			console.log(data)
			this.displayNetworkUpdate(data.type);
		}, error => console.error(error));
	}

	ionViewWillLeave() {
		this.connected.unsubscribe();
		this.disconnected.unsubscribe();
	}

	displayNetworkUpdate(connectionState: string) {
		let networkType = this.network.type;
		this.toast.create({
			message: `You are now ${connectionState} via ${networkType}`,
			duration: 3000
		}).present();
	}
	
	
	login(){
		if(!this.loginForm.valid){
			console.log('Invalid or empty data');
			return;
		}
		console.log('user data', this.loginForm.value.login, this.loginForm.value.password);
		
		let loading = this.loadingCtrl.create({
			spinner: 'hide',
			content: `<img src="assets/imgs/loading.gif" class="img-align" />`
			// duration: 5000
		});
		loading.present();
		
		// this.globals.clear().then((dddd) => {
			// console.log(dddd);
			this.logindb.checkIfUserExist(this.loginForm.value)
			.then(result => {
				console.log("result checkIfUserExist = "+result);					
				if(result>0){ //If user exist => go to Menu page ;)
					
					this.logindb.getUserTokensByParams(this.loginForm.value).then((tokenData)=> {
						console.log("getUserTokensByParams tokenData = "+JSON.stringify(tokenData));
						console.log("tokenData['token'] = "+tokenData['token']);
						this.globals.setStorage("username",this.loginForm.value.login);
						this.globals.setStorage("token",tokenData['token']);
						this.globals.setStorage("refresh_token",tokenData['refresh_token']);
						loading.dismiss();
					}, (errorToken)=> {
						console.log("getUserTokensByParams errorToken = "+errorToken);
					});
					this.navCtrl.push(MenuPage);  console.log("go to MenuPage ==> result > 0 ");
				}else{
					this.checkUserInServer().then((mydata) => {
						console.log("checkUserInServer data = "+mydata);
						let user ={"login":this.loginForm.value.login,"password":this.loginForm.value.password,
						"token":mydata['token'], "refresh_token":mydata['refresh_token']};
						console.log(user);
						// this.globals.clear();
						this.globals.setStorage("username",this.loginForm.value.login);
						this.globals.setStorage("token",mydata['token']);
						this.globals.setStorage("refresh_token",mydata['refresh_token']);
						
						this.globals.getStorage("username").then((result)=> {
							console.log("username = "+result);
						});
						
						this.logindb.create(user).then((result)=> {
							console.log("creerUser result = "+result);
							loading.dismiss();
							this.navCtrl.push(MenuPage);
						}, (error)=> {
							console.log("creerUser error = "+error);
							loading.dismiss();
						});

					},(error)=> {
						console.log('checkUserInServer error ! '+error);
						loading.dismiss();
					});
				}
				
			}).catch( error => {
				console.log('Erreur dans la fonction selectUserByParams ! '+error);
				loading.dismiss();
			});		

		// });
	}
	
	vider(){
		this.logindb.deleteAll().then(result => {
		    // this.toastCtrl.create({message:"result = "+result, duration: 3000, position: 'center'}).present();
		    console.log("result = "+result);
		}).catch( error => {
		    console.log("error = "+JSON.stringify(error));
		});	
	}
	
	checkUserInServer(){
		// let data  = {"username":this.loginForm.value.login, "password":this.loginForm.value.password};
		//  data = "username=ayoub&password=ayoub";
		let data:any = "username="+this.loginForm.value.login+"&password="+this.loginForm.value.password;

		console.log(data);
		let link = this.globals.API+"/auth";
	
		let headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded' );
		const requestOptions = new RequestOptions({ headers: headers });

		return new Promise((resolve, reject) => {
	    	this.http.post(link, data, requestOptions)
	    		.subscribe(res => {
					let dataaa = {"token":JSON.parse(res["_body"]).token, "refresh_token" : JSON.parse(res["_body"]).refresh_token};
					// this.globals.clear();
					// this.globals.setStorage("username",this.loginForm.value.login);
					// this.globals.setStorage("token",JSON.parse(res["_body"]).token);
					// this.globals.setStorage("refresh_token",JSON.parse(res["_body"]).refresh_token);
					// this.globals.getStorage("username").then((result)=> {
					// 	console.log("username = "+result);
					// });
					// this.globals.getStorage("token").then((result)=> {
					// 	console.log("token = "+result);
					// });
					// this.globals.getStorage("refresh_token").then((result)=> {
					// 	console.log("refresh_token = "+result);
					// });
					resolve(dataaa);
		        }, (err) => {
					reject(err);
		        });
	    });

	}

	checkUserInServerDD(){
		let link = "http://192.168.1.180/api/auth/login";
		// let link = "http://105.159.251.103:1115/api/auth/login";
		let res: any;

		console.log(this.loginForm.value.login+" - "+this.loginForm.value.password);

		this.http.post(link, this.loginForm.value)
		.subscribe(data => {
			console.info(data); 
			console.info(data["_body"]);
			res= JSON.parse(data["_body"]); 
		},error => {
			console.log("Oooops!");
			res = {};
			alert("res= Oooops");
		});
		return res;
	}

	creerUser(user){
		let res: any;
		this.logindb.create(user)
		.then(result => {
			res = 1;
		}).catch( error => {
		    res = 0;
		});
		return res;
	}

 }
