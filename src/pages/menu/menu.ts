import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


import { ParametragePage } from '../parametrage/parametrage';


@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  goToParametrage(){
 	console.log("goToParametrage function");
 	this.navCtrl.push(ParametragePage);
  }

  goToCollecte(){
  	console.log("goToCollecte function");	
  }

  synchronisation(){
  	console.log("synchronisation function");
  }

}
