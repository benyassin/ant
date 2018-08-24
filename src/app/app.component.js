var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { LoginDbProvider } from '../providers/login-db/login-db';
import { CollectePage } from '../pages/collecte/collecte';
var SayGISM = /** @class */ (function () {
    function SayGISM(platform, statusBar, splashScreen, logindb, sqlite) {
        var _this = this;
        this.splashScreen = splashScreen;
        this.logindb = logindb;
        this.sqlite = sqlite;
        // rootPage:any = LoginPage;
        this.rootPage = CollectePage;
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
            _this.createDatabase();
        });
    }
    SayGISM.prototype.createDatabase = function () {
        var _this = this;
        this.sqlite.create({
            name: 'data.db',
            location: 'default' // the location field is required
        })
            .then(function (db) {
            _this.logindb.setDatabase(db);
            return _this.logindb.createTableUsers();
        })
            .then(function () {
            _this.splashScreen.hide();
            _this.rootPage = 'HomePage';
        })
            .catch(function (error) {
            console.error(error);
        });
    };
    SayGISM = __decorate([
        Component({
            templateUrl: 'app.html'
        }),
        __metadata("design:paramtypes", [Platform, StatusBar, SplashScreen, LoginDbProvider, SQLite])
    ], SayGISM);
    return SayGISM;
}());
export { SayGISM };
//# sourceMappingURL=app.component.js.map