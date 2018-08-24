import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {

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
