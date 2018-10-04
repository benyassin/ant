import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Http, HttpModule } from '@angular/http';

import { SQLite, SQLiteDatabaseConfig } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

import { Network } from '@ionic-native/network';


import { Geolocation ,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation'; 

import { IonicStorageModule } from '@ionic/storage';


import { SayGISM } from './app.component';
import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { ParametragePage } from '../pages/parametrage/parametrage';
// import { CollectePage } from '../pages/collecte/collecte';
import { SondagePage } from '../pages/sondage/sondage';

import { LoginDbProvider } from '../providers/login-db/login-db';
import { GlobalsProvider } from '../providers/globals/globals';
import { ParamsDbProvider } from '../providers/params-db/params-db';
import { CollectDbProvider } from '../providers/collect-db/collect-db';
// import { GlobalProvider } from '../providers/global/global';

// ----------------------------------------------------------------- //

declare const SQL;

class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    let db;
    let storeddb = localStorage.getItem("database");

    if (storeddb) {
      let arr = storeddb.split(',');
      db = new SQL.Database(arr);
    }
    else {
      db = new SQL.Database();
    }

    return new Promise((resolve, reject) => {
      resolve(new SQLiteObject(db));
    });
  }
}

class SQLiteObject {
  _objectInstance: any;

  constructor(_objectInstance: any) {
    this._objectInstance = _objectInstance;
  };

  executeSql(statement: string, params: any): Promise<any> {

    return new Promise((resolve, reject) => {
      try {
        var st = this._objectInstance.prepare(statement, params);
        var rows: Array<any> = [];
        while (st.step()) {
          var row = st.getAsObject();
          rows.push(row);
        }
        var payload = {
          rows: {
            item: function (i) {
              return rows[i];
            },
            length: rows.length
          },
          rowsAffected: this._objectInstance.getRowsModified() || 0,
          insertId: this._objectInstance.insertId || void 0
        };

        //save database after each sql query 

        var arr: ArrayBuffer = this._objectInstance.export();
        localStorage.setItem("database", String(arr));
        resolve(payload);
      } catch (e) {
        reject(e);
      }
    });
  };
}

// ----------------------------------------------------------------- //


@NgModule({
  declarations: [
    SayGISM,
    LoginPage,
    MenuPage,
    ParametragePage,
    // CollectePage,
    // SondagePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SayGISM),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SayGISM,
    LoginPage,
    MenuPage,
    ParametragePage,
    // CollectePage,
    // SondagePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: SQLite, useClass: SQLiteMock},
    // SQLite,
    Toast,
    Network,
    Geolocation,
    LoginDbProvider,
    GlobalsProvider,
    ParamsDbProvider,
    CollectDbProvider
    // GlobalProvider
  ]
})
export class AppModule {}
