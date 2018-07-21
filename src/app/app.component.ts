import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

import { LoginDbProvider } from '../providers/login-db/login-db';

import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { ParametragePage } from '../pages/parametrage/parametrage';
import { CollectePage } from '../pages/collecte/collecte';

@Component({
  templateUrl: 'app.html'
})



export class SayGISM {
 
  rootPage:any = LoginPage;

  constructor(platform: Platform, statusBar: StatusBar,public splashScreen: SplashScreen, public logindb: LoginDbProvider, public sqlite: SQLite) {


    platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();
        this.createDatabase();
    });

  }

  private createDatabase(){
    this.sqlite.create({
      name: 'data.db',
      location: 'default' // the location field is required
    })
    .then((db) => {
      this.logindb.setDatabase(db);
      return this.logindb.createTableUsers();
    })
    .then(() =>{
      this.splashScreen.hide();
      this.rootPage = 'HomePage';
    })
    .catch(error =>{
      console.error(error);
    });
  }


}

