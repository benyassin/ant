import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, FabContainer , AlertController} from 'ionic-angular';

import { ParamsDbProvider } from '../../providers/params-db/params-db';
import { CollectDbProvider } from '../../providers/collect-db/collect-db';
import { timer } from 'rxjs/observable/timer';

import { MenuPage } from '../menu/menu';


declare const Formio: any;
declare const $: any;


@IonicPage()
@Component({
  selector: 'page-sondage',
  templateUrl: 'sondage.html',
})
export class SondagePage {
  
  @ViewChild('fab') fab: FabContainer;

  @ViewChild('infoCard')
  infoCrd: ElementRef;

  @ViewChild('frmio')
  frmo: ElementRef;

  @ViewChild('listCollect')
  listColl: ElementRef;

  public FForms: any = []; // list of all the forms loaded in constructor by campaign. 
  public ZZones: any = []; // list of all the zones loaded in constructor by campaign. 
  ZoneChoisie:any = 0; // variable to handle schoosen zone in select of ZZones.

  // Booleans to handle show/hide of elements in the view :
  showSelectZone:any=false;
  showInfoCard:any=false;
  showReturnButton:any=false;
 
  collectedElements: any = []; // varaible to handle created/to update data.
  // formsData: any=[];
  private mode: string; // Access mode to this page : new / edit.
  private rowId: number; // rowId of collect to update.
  private id_area: number; // id area in which we collect data.
  private name: string; // To Remove?
  private id_campaign: number; 
  private numero: number;
  modalFormsList: any;

  constructor(public navCtrl: NavController, public alertCtrl:AlertController, public modalCtrl: ModalController, public collectdb: CollectDbProvider,
    private toastCtrl: ToastController, public navParams: NavParams, public paramsdb: ParamsDbProvider) {
    this.mode = this.navParams.get("mode");
    this.id_area = this.navParams.get("id_area");
    this.name = this.navParams.get("name");
    this.id_campaign = this.navParams.get("id_campaign");
    console.log("this.mode= " + this.mode);
		console.log("this.id_area= "+this.id_area);
		console.log("this.name= "+this.name);
    console.log("this.id_campaign= "+this.id_campaign);
    
    if(this.mode=="edit"){
      this.rowId = this.navParams.get("row_id");
      this.LoadCollectByRowId(this.rowId);
    }else{
      this.LoadMaxNumeroByCampaign();
    }

    this.LoadAllZonesByArea();
    this.loadAllFormsByCampaign();
		
  }

  // Load All forms by campaign 
  loadAllFormsByCampaign(){
    this.paramsdb.getAllFormsByCampaign(this.id_campaign).then((forms) => {
      for (let i = 0; i < forms.length; i++) {
        this.FForms.push({ id_form: forms[i].id_form, name: forms[i].name, color: forms[i].color, id_campaign: forms[i].id_campaign, schema: forms[i].schema });
      }

    }, (error) => {
      console.log("getAllFormsByCampaign error = " + JSON.stringify(error));
    });
  }

  // Load All zones by area
  LoadAllZonesByArea(){
    this.paramsdb.getAllZonesByArea(this.id_area).then((zones) => {
      for (let i = 0; i < zones.length; i++) {
        this.ZZones.push({ id_zone: zones[i].id_zone, name: zones[i].name, id_area: zones[i].id_area });
      }
      console.log(this.ZZones);
    }, (error) => {
      console.log("getAllZonesByArea error = " + JSON.stringify(error));
    });
  }

  // Load max 'numero' by campaign if mode ='new'
  LoadMaxNumeroByCampaign(){
    this.collectdb.getMaxNumeroByCampaign(this.id_campaign).then((max) => {
      console.log("max= "+max);
      this.numero = ++max;
      console.log("this.numero= "+this.numero);
    }, (error) => {
      console.log("getMaxNumeroByCampaign error = " + JSON.stringify(error));
    });
  }

  // Load collect to update by rowid if mode ='edit'
  LoadCollectByRowId(rowId){
    this.collectdb.getCollectByRowId(rowId, 0).then((collect) => {
      this.numero = collect.numero;
      let entit = JSON.parse(collect.entities);
      for (let i = 0; i < entit.length; i++) {
        console.log(entit[i].data);
        let entity = {
          numero: entit[i].numero,
          form: entit[i].form,
          name: entit[i].name,
          color: entit[i].color,
          data: entit[i].data,
          geometry: entit[i].geometry,
          area: entit[i].area,
          zone: entit[i].zone
        };
        console.log(entity);
        this.collectedElements.push(entity);
      }
    }, (error) => {
      console.log("getCollectByRowId error = " + JSON.stringify(error));
    });
  }


  ZoneSelected(ele){
    console.log(ele);
    if(ele!=0){
      $(".formio-component-submit").css("display", "block");
      this.showInfoCard = false;
    }
  }

  goToMenu() {
    // this.navCtrl.push(MenuPage);
    this.navCtrl.setRoot(MenuPage);
  }

  retour() {
    this.showSelectZone = false;
    this.showInfoCard = false;
    this.showReturnButton = false;
    this.frmo.nativeElement.style.display = "none";
    this.listColl.nativeElement.style.display = "block";
  }

  // Delete a selected collect from the list :)
  removeCollecte(collect){
    console.log(collect);
    for(let i = 0;i< this.collectedElements.length; i++){
      if (this.collectedElements[i] == collect){
        this.collectedElements.splice(i, 1);
      }
    }
    
    console.log(this.collectedElements.length);
    for (let i = 0; i < this.collectedElements.length; i++) {
        this.collectedElements[i].numero = i+1;
    }
  }

  // Load the seleted collect from the list :)
  showCollecte(collect) {
    this.showSelectZone = true; // Show the select of ZZones.
    this.showReturnButton = true; // Show the Return Button.
    this.showInfoCard = false; // Hide the Info Card.
    this.ZoneChoisie = collect.zone;
    let form = this.getFormById(collect.form);
   
    this.listColl.nativeElement.style.display = "none"; // Rendre la liste des collectes actuelles invisible.
    let self = this;

    let formio = new Formio.createForm(document.getElementById('formio'), JSON.parse(form.schema), {
      language: 'fr', i18n: {
        'fr': {
          Submit: 'Sauvegarder',
          error: "Veuillez corriger les erreurs mentionnées avant de soumettre.",
          cancel: 'Vider',
          next: 'Suivant',
          previous: "Précedent",
          complete: 'Enregistrement avec succès'
        }
      }
    });


    formio.then(function (frm) {
      self.frmo.nativeElement.style.display = "block"; // Rendre le formulaire visible pour l'alimenter avec du Data ;)
      frm.submission = collect.data;
      
      frm.on('submit', function (submission) {
 
        for (let i = 0; i < self.collectedElements.length; i++) {
          if (self.collectedElements[i].numero == collect.numero) {
            self.collectedElements[i].data = submission; // Update the form data.
            self.collectedElements[i].zone = self.ZoneChoisie; // Update the zone selected.
            break;
          }
        }
        console.log(self.collectedElements);
        self.frmo.nativeElement.style.display = "none"; // Rendre le formulaire invisible après submission correcte ;)
        self.listColl.nativeElement.style.display = "block"; // Rendre la liste visible après submission correcte ;)
        self.showReturnButton = false; // Hide the Return Button. 
        self.showSelectZone = false; // Hide the select of ZZones.
        self.ZoneChoisie = 0; // Reinitialiser le Select des zones.
      });
    });

  }

  // get the form information from the array list of FForms.
  getFormById(id_form){
    for (let i = 0; i < this.FForms.length; i++) {
      if (this.FForms[i].id_form = id_form) {
        return this.FForms[i];
      }
    }
  }

  // Open a modal to shoose o form structure from the array list of FForms.
  public openFormList() {
    this.fab.toggleList();
    let self = this;
    this.modalFormsList = this.modalCtrl.create('ModalPage', { forms: this.FForms }, { cssClass: "QuestListe" });
    this.modalFormsList.present();
    this.modalFormsList.onDidDismiss((choice) => {
      console.log("I have dismissed. modalFormsList  " + JSON.stringify(choice));
      if (choice != undefined) {
          self.loadForm(choice);
      }
    });
  }

  // Open a form to collect data based on the shosen form structure.
  loadForm(form) {
    console.log(form);
    console.log(form.id);
    console.log(form.name);
    console.log(form.color);
    console.log(JSON.parse(form.schema));

    this.showSelectZone = true;
    this.showInfoCard = true;
    this.showReturnButton = true;
   
    let self = this;
    self.frmo.nativeElement.style.display = "block"; // Rendre le formulaire visible avant création ;)
    self.listColl.nativeElement.style.display = "none"; // Rendre le formulaire visible avant création ;)
    let formio = new Formio.createForm(document.getElementById('formio'), JSON.parse(form.schema), {
      language: 'fr', i18n: {
        'fr': {
          Submit: 'Sauvegarder',
          error: "Veuillez corriger les erreurs mentionnées avant de soumettre.",
          cancel: 'Vider',
          next: 'Suivant',
          previous: "Précedent",
          complete: 'Enregistrement avec succès'
        }
      }
    });

    formio.then(function (frm) {
      $(".formio-component-submit").css("display", "none");
      frm.on('submit', function (submission) {
        console.log(submission);     

        
        self.collectedElements.push({
          numero: self.collectedElements.length + 1,
          form: form.id,
          name: form.name,
          color: form.color,
          data: submission,
          geometry: null,
          zone: self.ZoneChoisie,
          area: self.id_area,
          campaign: self.id_campaign,
          status: 0
        });
        console.log(self.collectedElements);
        self.frmo.nativeElement.style.display = "none"; // Rendre le formulaire invisible après submission correcte ;)
        self.listColl.nativeElement.style.display = "block"; // Rendre le formulaire invisible après submission correcte ;)
        self.showReturnButton = false; // Hide le Select des zones :) 
        self.showSelectZone = false; // Hide le Select des zones :) 
        self.showInfoCard = false; // Hide le Select des zones :) 
        self.ZoneChoisie = 0; // Reinitialiser le Select des zones ;)
      });
    });
    
    
  }


  // Call a Confirm Alert to register data to DB:
  ConfirmAlertRegisterDataToDB() {
    if (this.collectedElements.length == 0) return;
    let title = this.mode == "new" ? '<span style="background-color:red">Voulez-vous enregistrer la collecte en cours?</span>' : 'Voulez-vous enregistrer les modifications en cours?';
    let alert = this.alertCtrl.create({
      title: title,
      message: '',
      buttons: [
        {
          text: 'Non', handler: () => {

          }
        },
        {
          text: 'Oui', handler: () => {
            this.registerDataToDB();
          }
        }
      ]
    });
    alert.present();

  }
  // Register collected data to DataBase :)
  registerDataToDB(){    
    let entities: any = [];
    let collect: any = {};
    for (let i = 0; i < this.collectedElements.length; i++) {
      console.log(this.collectedElements[i]);
      let entity = {
        numero: this.collectedElements[i].numero,
        form: this.collectedElements[i].form,
        name: this.collectedElements[i].name,
        color: this.collectedElements[i].color,
        data: this.collectedElements[i].data,
        geometry: this.collectedElements[i].geometry,
        area: this.collectedElements[i].area,
        zone: this.collectedElements[i].zone
      };
      console.log(entity);
      entities.push(entity);
    }
    collect.numero = this.numero;
    collect.campaign = this.id_campaign;
    collect.area = this.id_area;
    collect.form = null;
    collect.data = null;
    collect.entities = JSON.stringify(entities);
    console.log(collect);
    
    if(this.mode=="new"){

      this.collectdb.createCollect(collect).then(dataCollect => {
        console.log(dataCollect);
        this.toastCtrl.create({ message: "Données enregistrées avec succès.", duration: 3000, position: 'middle' }).present();
        timer(3000).subscribe(() => this.navCtrl.setRoot(MenuPage)); // <-- go to menu after success message displayed (3sec).
      });

    }else{
      this.collectdb.updateCollect(this.rowId, collect).then(dataCollect => {
        console.log(dataCollect);
        this.toastCtrl.create({ message: "Données modifiées avec succès.", duration: 3000, position: 'middle' }).present();
        timer(3000).subscribe(() => this.navCtrl.setRoot(MenuPage)); // <-- go to menu after success message displayed (3sec).
      });
    }
    
  }

  // Sync collected data to DataBase :)
  SynchroDataToDB() {
    let entities: any = [];
    let collect: any = {};
    for (let i = 0; i < this.collectedElements.length; i++) {
      console.log(this.collectedElements[i]);
      let entity = {
        numero: this.collectedElements[i].numero,
        form: this.collectedElements[i].form,
        data: this.collectedElements[i].data,
        geometry: this.collectedElements[i].geometry,
        area: this.collectedElements[i].area,
        zone: this.collectedElements[i].zone
      };
      console.log(entity);
      entities.push(entity);
    }
    collect.numero = "this.numero";
    collect.campaign = this.id_campaign;
    collect.area = this.id_area;
    collect.form = null;
    collect.data = null;
    collect.entities = entities;

    console.log(collect);
    this.collectdb.createCollect(collect).then(dataCollect => {
      console.log(dataCollect);
      this.toastCtrl.create({ message: "Données enregistrées avec succès.", duration: 3000, position: 'center' }).present();
      timer(3000).subscribe(() => this.navCtrl.setRoot(MenuPage)); // <-- go to menu after success message displayed (3sec).
    });

  }
  
}
