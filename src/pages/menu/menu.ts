import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ToastController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Http, Headers, RequestOptions } from '@angular/http';


import { ParametragePage } from '../parametrage/parametrage';
import { CollectePage } from '../collecte/collecte';
import { LoginPage } from '../login/login';
import { SondagePage } from '../sondage/sondage';

import { GlobalsProvider } from '../../providers/globals/globals';
import { ParamsDbProvider } from '../../providers/params-db/params-db';
import { CollectDbProvider } from '../../providers/collect-db/collect-db';



@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  modalZone: any;
  modalCollects: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams , public paramsdb: ParamsDbProvider, public alertCtrl: AlertController,
    public modalCtrl: ModalController, private storage: Storage, public toastCtrl:ToastController, public http: Http, private globals: GlobalsProvider, public collectdb: CollectDbProvider) {
    // this.globals.setStorage("token","hamza"); 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
    this.globals.getStorage("username").then((result)=> {
      console.log("username menu = "+result);
    });
    this.globals.getStorage("token").then((result)=> {
      console.log("token menu = "+result);
    });
     this.globals.getValue("refresh_token").then((result)=> {
      console.log("refresh_token getValue = "+result);
    });
  }

  goToParametrage(){
    console.log("goToParametrage function");
    this.navCtrl.setRoot(ParametragePage);
  }

  goToLogin(){
    this.globals.clear().then((msg) => {
      console.log("go to login : "+msg);
      this.navCtrl.setRoot(LoginPage);
    });
  }

  goToCollecteeee(){
    let areas:any = [];
    this.paramsdb.getAreasOnCampaignChecked().then((areasDB)=> {
        console.log("createCompaign result = "+JSON.stringify(areasDB));
        for(let i=0; i< areasDB.length; i++){
          areas.push({id_area: areasDB[i].id_area, name: areasDB[i].name, id_campaign: areasDB[i].id_campaign});
        }
    },(error)=> {
        console.log("createCompaign error = "+JSON.stringify(error));
    });

      let data = { message : areas };
      this.modalZone = this.modalCtrl.create('ModalZonesTravailPage', data, { cssClass:"QuestListe" });
      this.modalZone.present();
  
      this.modalZone.onDidDismiss((data) => {
        console.log("I have dismissed.");
        console.log(data);
        if(data){
          // this.navCtrl.push(CollectePage);
          this.navCtrl.setRoot(CollectePage,{id_area: data.id_area, name: data.name, id_campaign: data.id_campaign});

        }else{
          console.log("walooooo");
        }
      });
  
      this.modalZone.onWillDismiss((data) => {
        console.log("I'm about to dismiss");
        console.log(data);
      });
    
  }

  nonGeometric(){
    this.paramsdb.getCampaignChecked().then((campaign) => {
      console.log("getCampaignChecked result = " + JSON.stringify(campaign));
      if (campaign.length > 0) {
        console.log(campaign);
        console.log(campaign[0]);
        let config: any;
        // if (campaign[0].geometry) {
        //   config = { snap: campaign[0].snap, tolerance_snap: campaign[0].tolerance_snap, overlap: campaign[0].overlap, tolerance_overlap: campaign[0].tolerance_overlap };
        //   this.configureGoToCollect("CollectePage", config);
        // } else {
        //   config = null;
          this.configureGoToCollect("SondagePage", config);
        // }
        

      } else {
        this.toastCtrl.create({ message: "Veuillez sélectionner une campagne de collecte !", duration: 3000, position: 'bottom' }).present();

      }
    }, (error) => {
      console.log("getCampaignChecked error = " + JSON.stringify(error));
    });

  }

  goToCollect(){

    let pageToGo: string = "CollectePage";
    // let pageToGo: string ="SondagePage";
    
    this.paramsdb.getCampaignChecked().then((campaign)=> {
      console.log("getCampaignChecked result = " + JSON.stringify(campaign));
        if(campaign.length>0){
          console.log(campaign);
          console.log(campaign[0]);
          let config:any;
          if(campaign[0].geometry){
            config = { snap: campaign[0].snap, tolerance_snap: campaign[0].tolerance_snap, overlap: campaign[0].overlap, tolerance_overlap: campaign[0].tolerance_overlap };
            this.configureGoToCollect("CollectePage", config);
          }else{
            config = null;
            this.configureGoToCollect("SondagePage", config);
          }
          
        }else{
          this.toastCtrl.create({ message: "Veuillez sélectionner une campagne de collecte !", duration: 3000, position: 'bottom' }).present();

        }
    },(error)=> {
      console.log("getCampaignChecked error = "+JSON.stringify(error));
    });

  }

  configureGoToCollect(pageToGo, config){
    let areas:any = [];
    let collects:any = [];

    this.paramsdb.getAreasOnCampaignChecked().then((areasDB)=> {
      console.log("getAreasOnCampaignChecked result = "+JSON.stringify(areasDB));
        for(let i=0; i< areasDB.length; i++){
          areas.push({id_area: areasDB[i].id_area, name: areasDB[i].name, id_campaign: areasDB[i].id_campaign});
        }
    },(error)=> {
      console.log("getAreasOnCampaignChecked error = "+JSON.stringify(error));
    });

      let data = { message : areas };
      this.modalZone = this.modalCtrl.create('ModalZonesTravailPage', data, { cssClass:"QuestListe" });
      this.modalZone.present();
  
      this.modalZone.onDidDismiss((data) => {
        console.log(data);
        // console.log(data.id_campaign);
        if(data){
          if(data.mode=="new"){ // Accès en mode création.
            this.navCtrl.push(pageToGo,{mode:"new", id_area: data.id_area, name: data.name, id_campaign: data.id_campaign, config:config});
          }else{ // Accès en mode update.
            
            this.collectdb.getAllCollectsByArea(data.id_campaign, data.id_area, 0).then((collectsDB) => {
              console.log("getAllCollectsByArea result = " + JSON.stringify(collectsDB));
              for (let i = 0; i < collectsDB.length; i++) {
                collects.push({ row_id: collectsDB[i].rowid, numero: collectsDB[i].numero, id_campaign: collectsDB[i].campaign });
              }
              console.log(collectsDB.length);
              if (collectsDB.length == 0) {
                this.toastCtrl.create({ message: "Aucune collecte à modifier.", duration: 3000, position: 'bottom' }).present();
                // return;
              } else {
                this.modalCollects = this.modalCtrl.create('ModalCollecteEditPage', { collects: collects }, { cssClass: "QuestListe" });
                this.modalCollects.present();
                this.modalCollects.onDidDismiss((col) => {
                  if (col) {
                    this.navCtrl.setRoot(pageToGo, { mode: "edit", row_id: col.row_id, id_area: data.id_area, name: data.name, id_campaign: data.id_campaign, config:config });
                  }
                });
              }
            }, (error) => {
              console.log("getAllCollectsByArea error = " + JSON.stringify(error));
            });          
          }
          
        }
      });
  
  }


  synchronisation(){
    
    console.log("synchronisation function");

    let promises: any = [];
    let compaigns: any = [];
    this.paramsdb.getAllCampaignsWithNonSyncData().then((compaignsDB) => {
      console.log("getAllCampaignsWithNonSyncData result = " + JSON.stringify(compaignsDB));
      for (let i = 0; i < compaignsDB.length; i++) {
        compaigns.push({ id_campaign: compaignsDB[i].id_campaign, name: compaignsDB[i].name });
      }

      let data = { message: compaigns };
      this.modalZone = this.modalCtrl.create('ModalCampaingsToSyncPage', data, { cssClass: "QuestListe" });
      this.modalZone.present();

      this.modalZone.onDidDismiss((data) => {
        console.log("I have dismissed.");
        console.log(data);
        if (data) {
          console.log("Lunch the sync method ;)");
          this.collectdb.getAllCollectsBySync(0).then((collects) => {
            for (let c = 0; c < collects.length; c++) {
              console.log(collects[c]);
              let collect = {
                numero: collects[c].numero, 
                campaignId: collects[c].campaign, 
                areaId: collects[c].area, 
                form: collects[c].form, 
                identification: collects[c].data, 
                entities: JSON.parse(collects[c].entities)
              };
              console.log(collect);
              promises.push(this.syncToServer(collect));
            }

            Promise.all(promises).then(valeurs => {
                for (let j = 0; j < valeurs.length; j++) {
                  console.log("valeurs[" + j + "] => " + valeurs[j]);
                }
            });

          }, (error) => {
            console.log("getAllCampaignsWithNonSyncData error = " + JSON.stringify(error));
          });

        } else {
          console.log("walooooo");
        }
      });


    }, (error) => {
      console.log("getAllCampaignsWithNonSyncData error = " + JSON.stringify(error));
    });


  }
  
  syncToServer(collect:any){
    
    
    let data: any = "username=ayoub&password=ayoub";

      let p1 = this.globals.getStorage("token");
      let p2 = this.globals.getStorage("refresh_token");
      Promise.all([p1, p2])
      .then(values => {
        console.log(values);
        console.log(values[0]);
        console.log(values[1]);
        console.log(collect);
        let link = this.globals.API + "/collect";

        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', 'Bearer ' + (values[0]));
        const requestOptions = new RequestOptions({ headers: headers });

        return new Promise((resolve, reject) => {
          this.http.post(link, collect, requestOptions)
            .subscribe(res => {
              let data = { "token": JSON.parse(res["_body"]).token, "refresh_token": JSON.parse(res["_body"]).refresh_token };
              resolve(data);
            }, (err) => {
              reject(err);
            });
        });

      });
  }


}
