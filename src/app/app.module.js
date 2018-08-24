var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { Geolocation } from '@ionic-native/geolocation';
import { SayGISM } from './app.component';
import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { ParametragePage } from '../pages/parametrage/parametrage';
import { CollectePage } from '../pages/collecte/collecte';
import { LoginDbProvider } from '../providers/login-db/login-db';
import { GlobalsProvider } from '../providers/globals/globals';
// import { GlobalProvider } from '../providers/global/global';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
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
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                SQLite,
                Toast,
                Geolocation,
                LoginDbProvider,
                GlobalsProvider
                // GlobalProvider
            ]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map