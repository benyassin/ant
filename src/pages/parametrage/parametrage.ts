import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators} from "@angular/forms";
import { Http, Headers, RequestOptions } from '@angular/http';

import { timer } from 'rxjs/observable/timer';

import { LoginPage } from '../login/login';
import { MenuPage } from '../menu/menu';

import { GlobalsProvider } from '../../providers/globals/globals'
import { ParamsDbProvider } from '../../providers/params-db/params-db';
import { LoginDbProvider } from '../../providers/login-db/login-db';

import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-parametrage',
  templateUrl: 'parametrage.html',
})
export class ParametragePage  implements OnInit {

  compaignSelected: any=1;
  
  public CCompaigns:any = [];
  public FForms:any = [];
  public ZZones:any = [];


  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, public paramsdb: ParamsDbProvider, public logindb:LoginDbProvider,
    public http: Http, private globals:GlobalsProvider, private toastCtrl: ToastController, public loadingCtrl: LoadingController, private storage:Storage) { 
      
    }

    ngOnInit(){
      this.getParametrageLocalDB();
    }

    testStorage(){    
      this.globals.getStorage("token").then((result)=> {
        console.log("token = "+result);
      });
    }

    compaignChecked(id){
      console.log(id);
      console.log(this.compaignSelected);

      this.paramsdb.checkCompaign(id).then((result)=> {
          console.log("createCompaign result = "+JSON.stringify(result));
      },(error)=> {
          console.log("createCompaign error = "+JSON.stringify(error));
      });


    }

    goToMenu(){
      this.navCtrl.push(MenuPage);
    }

    getParametrageLocalDB(){
   
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: `<img src="assets/imgs/loading.gif" class="img-align" />`
        // duration: 5000
      });
    
      loading.onDidDismiss(() => {
        console.log('Dismissed loading');
      });
    
      loading.present(); 
      
      this.paramsdb.getAllCompaigns().then((campaigns)=> {
        console.log("getAllCompaigns compaigns = "+JSON.stringify(campaigns));
        for(let i=0; i< campaigns.length; i++){
          this.CCompaigns.push({id: campaigns[i].id_campaign, name: campaigns[i].name});
        }
      },(error)=> {
          console.log("getAllCompaigns error = "+JSON.stringify(error));
      });

      this.paramsdb.getAllForms().then((forms)=> {
        console.log("getAllForms forms = "+JSON.stringify(forms));
        for(let i=0; i< forms.length; i++){
          this.FForms.push({id: forms[i].id_form, name: forms[i].name, color: forms[i].color, id_campaign: forms[i].id_campaign});
        }
      },(error)=> {
          console.log("getAllForms error = "+JSON.stringify(error));
      });

      this.paramsdb.getAllAreas().then((areas)=> {
        console.log("getAllAreas areas = "+JSON.stringify(areas));
        for(let i=0; i< areas.length; i++){
          this.ZZones.push({id: areas[i].id_area, name: areas[i].name, id_campaign: areas[i].id_campaign});
        }
      },(error)=> {
          console.log("getAllAreas error = "+JSON.stringify(error));
      });

      loading.dismiss();
        
    }

    // Download of all Server Parameters according to user token ::> Assignement - Compaigns - Forms - Areas <::
    downloadParametrageServer(ev){
      
      ev.stopPropagation();
      let link =  this.globals.API+"/assignments";
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: `<img src="assets/imgs/loading.gif" class="img-align" />`
        // duration: 5000
      });
    
      loading.onDidDismiss(() => {
        console.log('Dismissed loading');
      });
    
      loading.present();    


      this.paramsdb.deleteAllParams().then((res)=> {
        console.log("deleteAllParams res = "+JSON.stringify(res));

      // this.globals.setStorage("token","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJheW91YiIsIm9yZ2FuaXphdGlvbiI6bnVsbCwiaWF0IjoxNTM1NzEwMzkyLCJleHAiOjE1MzU3MTEyOTJ9.fQlRa876uvDtZe3KN68TIQPbCWLndIeWma9HKlHeQ7Y");
			// this.globals.setStorage("refresh_token","716b73c0-ac62-11e8-a383-9d020783b264");
						
      let p1 = this.globals.getStorage("token");
      let p2 = this.globals.getStorage("refresh_token");
      Promise.all([p1, p2])
      .then(values => {
        console.log(values);
        console.log(values[0]);
        console.log(values[1]);

        this.CCompaigns = [];
        this.FForms = [];
        this.ZZones = [];

        let downloadCompaignsPromises:any=[];
        let downloadFormsPromises:any=[];
        let downloadAreasPromises:any=[];
        let compaigns :any=[];
        let areas :any=[];
        let assignments :any;
        let assignmentsPromises :any=[];

        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization','Bearer ' +(values[0]));
        this.http.get(link, {headers: headers}) 
        .subscribe(data => {
        
          assignments = JSON.parse(data["_body"]);
          for(let i=0; i< assignments.length; i++){
              let assignment = {
                id_campaign:assignments[i].id_campaign,
                id_area:assignments[i].id_area
              };
              console.log(assignments[i].id_campaign);
              console.log(assignments[i].id_area);
              compaigns.push(assignments[i].id_campaign);
              areas.push(assignments[i].id_area);
              assignmentsPromises.push(this.paramsdb.createAssignments(assignment));            
          }

          let uniqueCompaigns = compaigns.filter(function(item, pos){ return compaigns.indexOf(item) == pos; });
          let uniqueAreas = areas.filter(function(item, pos){ return areas.indexOf(item) == pos; });

          downloadCompaignsPromises.push(this.getServerCompaigns(uniqueCompaigns, values[0]));
          downloadFormsPromises.push(this.getServerForms(uniqueCompaigns, values[0]));
          downloadAreasPromises.push(this.getServerAreas(uniqueAreas, values[0]));
          Promise.all([assignmentsPromises, downloadCompaignsPromises, downloadAreasPromises, downloadFormsPromises])
         .then(valeurs => {
            for(let j=0; j< valeurs.length; j++){
              console.log("valeurs["+j+"] => "+valeurs[j]);
            }
            loading.dismiss();
          });
          
        },error => {
          let err = JSON.parse(error["_body"]);
          if((err.error =="Unauthorized") && (err.message=="Invalid bearer token")){
            
            this.logindb.deleteAll().then(result => {
              console.log("result = " + result);
              this.toastCtrl.create({ message: "Votre session a expirée !", duration: 3000, position: 'center' }).present();
              timer(3000).subscribe(() => this.navCtrl.setRoot(LoginPage)); 
            }).catch(error => {
              console.log("error = " + JSON.stringify(error));
            });	

          }
          loading.dismiss();
        });

      });
      

    },(error)=> {
      console.log("deleteAllParams error = "+JSON.stringify(error));
    });
            
    }

    
    // Functions of getting Compaigns from Server based on Assignements Compaigns list :
    getServerCompaigns(compaigns, token){
      let prom:any = [];
      for(let i=0; i< compaigns.length; i++){
        prom.push(this.getHTTPCompaign(compaigns[i], token));
      }
      
      return new Promise((resolve, reject) => {
        Promise.all(prom).then(values => {
          for(let k=0; k< values.length; k++){
            console.log(values[k]);
            let data = <any>{};
            data = values[k];
            this.CCompaigns.push({id: data.id, name: data.name});
            // this.paramsdb.createCompaign({ id: data.id, name: data.name, snap: data.snap, tolerance_snap: data.tolerance_snap, overlap: data.overlap, tolerance_overlap: data.tolerance_overlap, geometry: data.geometry}).then((result)=> {
            
            this.paramsdb.createCompaign({ id: data.id, name: data.name, snap: 1, tolerance_snap: 12, overlap: 1, tolerance_overlap: 25, geometry: 1}).then((result)=> {
                console.log("createCompaign result = "+JSON.stringify(result));
                resolve(1);
            },(error)=> {
                console.log("createCompaign error = "+JSON.stringify(error));
                reject(JSON.stringify(error));
            });
          }          
        });
      });

    }

    getHTTPCompaign(id,token){
      let link =  this.globals.API+"/campaigns/"+id;
      let headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization','Bearer '+token);
     
      return new Promise((resolve, reject) => {
        this.http.get(link, {headers: headers}).subscribe(res => {
          // let dataaa = {"token":JSON.parse(res["_body"]).token, "refresh_token" : JSON.parse(res["_body"]).refresh_token};
          resolve(JSON.parse(res["_body"]));
        }, (err) => {
          reject(err);
        });
      });
      
    }

    // Functions of getting Forms from Server based on Array of Compaigns :
    getServerForms(compaigns, token){
      let prom:any = [];
      for(let i=0; i< compaigns.length; i++){
        prom.push(this.getHTTPForms(compaigns[i], token));
      }
      
      return new Promise((resolve, reject) => {
        Promise.all(prom).then(values => {
          for(let k=0; k< values.length; k++){
            console.log(values[k]);
            let data = <any>[];
            let forms :any=[];
            data = values[k];
            for(let m=0; m< data.length; m++){
              let formData = {
                components: [
                  {
                    type: 'textfield',
                    key: 'firstName',
                    label: 'First Name',
                    placeholder: 'Enter your first name.',
                    input: true
                  },
                  {
                    type: 'textfield',
                    key: 'lastName',
                    label: 'Last Name',
                    placeholder: 'Enter your last name',
                    input: true
                  },
                  {
                    type: 'button',
                    action: 'submit',
                    label: 'Submit',
                    theme: 'primary'
                  }
                ]
              };
              forms.push(this.paramsdb.createForm({ id: data[m].id, name: data[m].name, color: data[m].color, geometry: data[m].geometry, schema: JSON.stringify(formData), id_campaign: data[m].campaignId}));
              // forms.push(this.paramsdb.createForm({id: data[m].id, name: data[m].name, color: data[m].color, geometry: data[m].geometry, schema: data[m].schema, id_campaign: data[m].campaignId}));
              this.FForms.push({id: data[m].id, name: data[m].name, color: data[m].color, geometry: data[m].geometry, id_campaign: data[m].campaignId});
            }
            Promise.all(forms).then(res =>{
              console.log("res=> "+JSON.stringify(res));
              resolve(1);
            });
            
          }          
        });
      });

    }

    getHTTPForms(id,token){
      let link =  this.globals.API+"/forms/"+id;
      let headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization','Bearer '+token);
     
      return new Promise((resolve, reject) => {
        this.http.get(link, {headers: headers}).subscribe(res => {
          resolve(JSON.parse(res["_body"]));
        }, (err) => {
          reject(err);
        });
      });
      
    }

    // Functions of getting Areas bases on Assignements Areas list :
    getServerAreas(areas, token){
      let promises:any = [];
      for(let i=0; i< areas.length; i++){
        promises.push(this.getHTTPArea(areas[i], token));
      }
      
      return new Promise((resolve, reject) => {
        Promise.all(promises).then(values => {
          for(let k=0; k< values.length; k++){
            console.log(values[k]);
            let data = <any>{};
            data = values[k];
            this.ZZones.push({id: data.id, name: data.name, id_campaign: data.campaignId});
            this.paramsdb.createArea({id: data.id, name: data.name, id_campaign: data.campaignId}).then((result)=> {
                console.log("createArea result = "+JSON.stringify(result));
                
                this.createZones(data.zones).then( res => {
                  console.log(JSON.stringify(res));
                  console.log("hamzaa");
                  resolve(5);
                },(err)=> {
                  console.log("createZones error = "+JSON.stringify(err));
                  reject(JSON.stringify(err));
                });

            },(error)=> {
                console.log("createArea error = "+JSON.stringify(error));
                reject(JSON.stringify(error));
            });
          }          
        });
      });

    }

    getHTTPArea(id,token){
      let link =  this.globals.API+"/areas/"+id;
      let headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization','Bearer '+token);
     
      return new Promise((resolve, reject) => {
        this.http.get(link, {headers: headers}).subscribe(res => {
          resolve(JSON.parse(res["_body"]));
        }, (err) => {
          reject(err);
        });
      });
      
    }

    // Function Injection of zones issued from areas :
    createZones(zones){
      console.log(zones);
      let promises:any = [];
      let geoms:any = [
        '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-6.798477,34.06176],[-6.798477,34.078255],[-6.821823,34.054935],[-6.831436,34.044125],[-6.833496,34.036728],[-6.821823,34.03104],[-6.799164,34.03104],[-6.8190765,34.027622],[-6.8369293,34.028194],[-6.850662,34.027054],[-6.8767548,33.982086],[-6.870575,33.955322],[-6.8341827,33.953613],[-6.692047,33.965004],[-6.6913605,34.01055],[-6.6893005,34.088493],[-6.798477,34.06176]]]}}',
        '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-6.997261047363281,33.89806198291597],[-7.003440856933594,33.875831536946336],[-6.969795227050781,33.860722928812585],[-6.9124603271484375,33.85986764461944],[-6.879501342773437,33.890082489364794],[-6.901130676269531,33.92911789997692],[-6.9440460205078125,33.93310591314123],[-6.997261047363281,33.89806198291597]]]}}'
      ];
     
      for(let i=0; i< zones.length; i++){
        console.log("geoms["+i+"]");
        console.log(geoms[i]);
        promises.push(this.paramsdb.createZone({id: zones[i].id, geometry: geoms[i], name: zones[i].name, areaId: zones[i].areaId}));
        // promises.push(this.paramsdb.createZone({id: zones[i].id, geometry: zones[i].geometry, name: zones[i].name, areaId: zones[i].areaId}));
      }
      
      return new Promise((resolve, reject) => {
        Promise.all(promises).then(values => {
          console.log(JSON.stringify(values));
          console.log("ayoubb");
          resolve(7);
        });
      });
    }



}
