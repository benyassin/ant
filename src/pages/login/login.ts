import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Http, HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http'; 


import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import {FormGroup, FormBuilder} from "@angular/forms";
import { Toast } from '@ionic-native/toast';

import { LoginDbProvider } from '../../providers/login-db/login-db';

import { MenuPage } from '../menu/menu';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

	authForm: FormGroup;
	 users: any[] = [];
	 header : any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder,
	 public logindb: LoginDbProvider, private sqlite: SQLite, public http: Http, private toastCtrl: ToastController) {

		this.authForm = this.formBuilder.group({
			login: [''],
			password: ['']
		});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad LoginPage');
	}

	vider(){
		this.logindb.deleteAll().then(result => {
		    this.toastCtrl.create({message:"result = "+result, duration: 3000, position: 'center'}).present();
		}).catch( error => {
		    this.toastCtrl.create({message:"error = "+error, duration: 3000, position: 'center'}).present();
		});	
	}

	login(){
		console.log(this.authForm.value.login+" - "+this.authForm.value.password);
		if((this.authForm.value.login=="") || (this.authForm.value.password=="")){
			let toast = this.toastCtrl.create({message:'Veuillez saisir votre login et password !', duration: 3000, position: 'top'});
			toast.present();
			return;
		}

		this.logindb.selectUserByParams(this.authForm.value)
		.then(result => {
		    console.info(result);
		    this.toastCtrl.create({message:"result = "+result, duration: 5000, position: 'top'}).present();
		    alert(result);
		    if(result>0){
		    	// this.navCtrl.push(MenuPage); //If user exist => go to Menu page ;)
		    }else{
		    	alert(result);
		    	this.checkUserInServer().subscribe(data=> {
		    		this.toastCtrl.create({message:"data = "+data, duration: 5000, position: 'center'}).present();
		    		alert("ayoub");
		    		// this.creerUser(this.authForm.value).subscribe(result=> {
		    		// 	this.toastCtrl.create({message:"res = "+result, duration: 3000, position: 'center'}).present();
		    		// 	this.navCtrl.push(MenuPage);
		    		// }, error=> {
		    		// 	this.toastCtrl.create({message:"Erreur SQL creerUser", duration: 3000, position: 'center'}).present();
		    		// });
		    	},error=> {
		    		this.toastCtrl.create({message:'Utilisateur non existant !', duration: 3000, position: 'top'}).present();
		    	});
		    }
		    
		}).catch( error => {
		    this.toastCtrl.create({message:'Erreur dans la fonction selectUserByParams !', duration: 3000, position: 'top'}).present();
		});		
	}

	checkUserInServer(){
		let link = "http://192.168.1.180/api/auth/login";
		let res: any;

		this.http.post(link, this.authForm.value)
		.subscribe(data => {
			console.info(data); 
			console.info(data["_body"]);
			res= JSON.parse(data["_body"]); 
			alert("res= "+res);
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
