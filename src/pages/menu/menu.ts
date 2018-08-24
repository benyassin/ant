import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';


import { ParametragePage } from '../parametrage/parametrage';
import { CollectePage } from '../collecte/collecte';


@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  modalZone: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams , public modalCtrl : ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  goToParametrage(){
 	console.log("goToParametrage function");
 	this.navCtrl.push(ParametragePage);
  }

  goToCollecte(){
  	// console.log("goToCollecte function");	
    // this.navCtrl.push(CollectePage);

      let zones = [{"id":1, "name":"zone 1"},{"id":2, "name":"zone 2"},{"id":3, "name":"zone 3"}];
      let data = { message : zones };
      this.modalZone = this.modalCtrl.create('ModalZonesTravailPage', data, { cssClass:"QuestListe" });
      this.modalZone.present();
  
      this.modalZone.onDidDismiss((data) => {
        console.log("I have dismissed.");
        console.log(data);
        if(data){
          this.navCtrl.push(CollectePage);
        }else{
          console.log("walooooo");
        }
      });
  
      this.modalZone.onWillDismiss((data) => {
        console.log("I'm about to dismiss");
        console.log(data);
      });
    
  }

  synchronisation(){
  	console.log("synchronisation function");
  }

}
