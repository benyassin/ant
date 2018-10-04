import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

import { timer } from 'rxjs/observable/timer';

import { LoginDbProvider } from '../providers/login-db/login-db';
import { ParamsDbProvider } from '../providers/params-db/params-db';
import { CollectDbProvider } from '../providers/collect-db/collect-db';

import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { ParametragePage } from '../pages/parametrage/parametrage';
import { CollectePage } from '../pages/collecte/collecte';

@Component({
  templateUrl: 'app.html'
})

export class SayGISM {
 
  showSplash = true; // <-- show animation

  rootPage:any;
  // rootPage:any = CollectePage;
  // rootPage:any = MenuPage;

  constructor(platform: Platform, statusBar: StatusBar,public splashScreen: SplashScreen, public collectdb:CollectDbProvider, 
    public paramsdb:ParamsDbProvider, public logindb: LoginDbProvider, public sqlite: SQLite) {

    platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();

        timer(3000).subscribe(() => this.showSplash = false); // <-- hide animation after 3s
      
        this.createDatabase();
        this.rootPage = LoginPage;
        
    });

  }


  private createDatabase(){

    this.sqlite.create({
      name: 'data17.db',
      location: 'default' // the location field is required
    })
    .then((db) => {
      this.logindb.setDatabase(db);
      this.paramsdb.setDatabase(db);
      this.collectdb.setDatabase(db);
      
      this.logindb.createTableUsers();
      this.collectdb.createTableCollect();
      return this.paramsdb.createParametrageTables();
    })
    .then(() =>{
      this.splashScreen.hide();
      // this.rootPage = MenuPage;
    })
    .catch(error =>{
      console.error(error);
    });
  }


}

