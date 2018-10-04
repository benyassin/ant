import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-modal-collecte-edit',
  templateUrl: 'modal-collecte-edit.html',
})
export class ModalCollecteEditPage {

  listCollects: any;
  mode:any="new";

  constructor(public navCtrl: NavController, public viewCtrl : ViewController , public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
    console.log(this.navParams.get('collects'));
    this.listCollects = this.navParams.get('collects');
  }

  public fermerModal(data){
    this.viewCtrl.dismiss(data);
  }

  getSelectedCollect(row_id, numero, id_campaign){
    console.info(row_id+" - "+numero+" - "+id_campaign);
    let data = {
      row_id: row_id,
      numero: numero,
      id_campaign: id_campaign
    };
    this.fermerModal(data);
  }

}
