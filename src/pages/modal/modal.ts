import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {

  listeFormulaires: any;
  constructor(public navCtrl: NavController, public viewCtrl : ViewController , public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
    console.log(this.navParams.get('forms'));
    this.listeFormulaires = this.navParams.get('forms');
  }

  public fermerModal(data){
    this.viewCtrl.dismiss(data);
  }

  getSelectedForm(id, name, color, schema){
    console.info(id + " - " + name + " - " + color+ " - " + schema);
    let data = {
      id: id,
      name: name,
      color: color,
      schema: schema
    };
    this.fermerModal(data);
  }



}
