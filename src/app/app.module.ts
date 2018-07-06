import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Http, HttpModule } from '@angular/http';

import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';


import { SayGISM } from './app.component';
import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { ParametragePage } from '../pages/parametrage/parametrage';
import { CollectePage } from '../pages/collecte/collecte';


import { LoginDbProvider } from '../providers/login-db/login-db';

@NgModule({
  declarations: [
    SayGISM,
    LoginPage,
    MenuPage,
    ParametragePage,
    CollectePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SayGISM),
    HttpClientModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SayGISM,
    LoginPage,
    MenuPage,
    ParametragePage,
    CollectePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite,
    Toast,
    LoginDbProvider
  ]
})
export class AppModule {}
