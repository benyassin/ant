import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators} from "@angular/forms";
import { Http, Headers, RequestOptions } from '@angular/http';

import { MenuPage } from '../menu/menu';
import { GlobalsProvider } from '../../providers/globals/globals'


@IonicPage()
@Component({
  selector: 'page-parametrage',
  templateUrl: 'parametrage.html',
})
export class ParametragePage {

  compaignSelected: any=1;
  public compaigns:any = [
    {"id":1, "name":'Projet 1'},
    {"id":2,"name": 'Projet 2'},
    {"id":3, "name":'Projet 3'},
    {"id":4, "name":'Projet 4'},
    {"id":5,"name": 'Projet 5'},
    {"id":6, "name":'Projet 6'},
    {"id":7, "name":'Projet 7'}
 ];

  public forms:any = [
    {"id":1, "name":"form1", "color":"yellow", "id_projet":2},
    {"id":2, "name":"form2", "color":"red", "id_projet":2},
    {"id":3, "name":"form3", "color":"#AAACCC", "id_projet":3},
    {"id":4, "name":"form4", "color":"grey", "id_projet":3},
    {"id":5, "name":"form5", "color":"#baab11", "id_projet":3},
    {"id":6, "name":"form6", "color":"#004455", "id_projet":3},
    {"id":7, "name":"form7", "color":"#226699", "id_projet":6}
  ];
 
   public zones:any = [
    {"id":1, "name":"zone 1", "id_projet":1},
    {"id":2, "name":"zone 2", "id_projet":2},
    {"id":3, "name":"zone 3", "id_projet":3},
    {"id":4, "name":"zone 4", "id_projet":4},
    {"id":5, "name":"zone 5", "id_projet":5}
  ];
  
 
  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, 
    public http: Http, private globals:GlobalsProvider, public loadingCtrl: LoadingController) {
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParametragePage');
  
  }

  reloaddd(ev){
    ev.stopPropagation();
    console.log("reload function");
  }

  compaignChecked(id){
    console.log(id);
    console.log(this.compaignSelected);
  }

  goToMenu(){
    this.navCtrl.push(MenuPage);
  }

  downloadParametrageServer(ev){
    ev.stopPropagation();
    let res: any;
    let link =  this.globals.API+"/mobile/projets";
    // alert(link);
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: `<img src="assets/imgs/loading.gif" class="img-align" />`
      // duration: 5000
    });
  
    loading.onDidDismiss(() => {
      console.log('Dismissed loading');
    });
  
    loading.present();
    
    let headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );
    const requestOptions = new RequestOptions({ headers: headers });

    this.http.post(link, requestOptions)
		.subscribe(data => {
			console.info(data); 
      console.info(data["_body"]);
      loading.dismiss();
		},error => {
			console.log("Oooops!");
      loading.dismiss();
    });
    
  }


}
