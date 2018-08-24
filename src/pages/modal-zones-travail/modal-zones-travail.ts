import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalZonesTravailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-zones-travail',
  templateUrl: 'modal-zones-travail.html',
})
export class ModalZonesTravailPage {

  listeQuestionnaires: any;

  constructor(public navCtrl: NavController, public viewCtrl : ViewController , public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
    console.log(this.navParams.get('message'));
    // this.listeQuestionnaires ="";
    this.listeQuestionnaires = this.navParams.get('message');
  }

  public fermerModal(data){
    this.viewCtrl.dismiss(data);
  }

  getSelectedQuestionnaire(id, name){
    console.info(id+" - "+name);
    let data = {
      id: id,
      name: name
    };
    this.fermerModal(data);
  }


}
