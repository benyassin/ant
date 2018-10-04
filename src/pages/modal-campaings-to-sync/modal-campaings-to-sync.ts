import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalCampaingsToSyncPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-campaings-to-sync',
  templateUrl: 'modal-campaings-to-sync.html',
})
export class ModalCampaingsToSyncPage {
  
  listeCampaigns: any;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
    console.log(this.navParams.get('message'));
    this.listeCampaigns = this.navParams.get('message');
  }

  public fermerModal(data) {
    this.viewCtrl.dismiss(data);
  }

  getSelectedCampaign(name, id_campaign) {
    console.info(name + " - " + id_campaign);
    let data = {
      name: name,
      id_campaign: id_campaign
    };
    this.fermerModal(data);
  }

}
