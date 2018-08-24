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
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { SQLite } from '@ionic-native/sqlite';
import { FormBuilder } from "@angular/forms";
import { LoginDbProvider } from '../../providers/login-db/login-db';
import { MenuPage } from '../menu/menu';
import { GlobalsProvider } from '../../providers/globals/globals';
var LoginPage = /** @class */ (function () {
    function LoginPage(navCtrl, navParams, formBuilder, logindb, sqlite, http, toastCtrl, globals) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.formBuilder = formBuilder;
        this.logindb = logindb;
        this.sqlite = sqlite;
        this.http = http;
        this.toastCtrl = toastCtrl;
        this.globals = globals;
        this.users = [];
        this.authForm = this.formBuilder.group({
            login: [''],
            password: ['']
        });
    }
    LoginPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad LoginPage');
    };
    LoginPage.prototype.vider = function () {
        var _this = this;
        this.logindb.deleteAll().then(function (result) {
            _this.toastCtrl.create({ message: "result = " + result, duration: 3000, position: 'center' }).present();
        }).catch(function (error) {
            _this.toastCtrl.create({ message: "error = " + JSON.stringify(error), duration: 3000, position: 'center' }).present();
        });
    };
    LoginPage.prototype.login = function () {
        var _this = this;
        console.log(this.authForm.value.login + " - " + this.authForm.value.password);
        if ((this.authForm.value.login == "") || (this.authForm.value.password == "")) {
            this.toastCtrl.create({ message: 'Veuillez saisir votre login et password !', duration: 3000, position: 'top' }).present();
            return;
        }
        this.logindb.selectUserByParams(this.authForm.value)
            .then(function (result) {
            _this.toastCtrl.create({ message: "result = " + result, duration: 5000, position: 'top' }).present();
            if (result > 0) {
                _this.navCtrl.push(MenuPage); //If user exist => go to Menu page ;)
            }
            else {
                _this.checkUserInServer().then(function (data) {
                    _this.toastCtrl.create({ message: "data = " + data, duration: 5000, position: 'center' }).present();
                    _this.creerUser(_this.authForm.value).then(function (result) {
                        _this.toastCtrl.create({ message: "res create user = " + result, duration: 3000, position: 'center' }).present();
                        _this.navCtrl.push(MenuPage);
                    }, function (error) {
                        _this.toastCtrl.create({ message: "Erreur SQL creerUser", duration: 3000, position: 'center' }).present();
                    });
                }, function (error) {
                    _this.toastCtrl.create({ message: 'Utilisateur non existant !', duration: 3000, position: 'top' }).present();
                });
            }
        }).catch(function (error) {
            _this.toastCtrl.create({ message: 'Erreur dans la fonction selectUserByParams !', duration: 3000, position: 'top' }).present();
        });
    };
    LoginPage.prototype.tttttt = function () {
        this.checkUserInServer().then(function (data) {
            console.log(data);
        }, function (error) {
            console.error(error);
        });
    };
    LoginPage.prototype.checkUserInServer = function () {
        var _this = this;
        // let link = "http://192.168.1.180/api/auth/login";
        var link = this.globals.API + "/api/auth/login";
        alert(link);
        return new Promise(function (resolve, reject) {
            _this.http.post(link, _this.authForm.value)
                .subscribe(function (res) {
                resolve(res);
            }, function (err) {
                reject(err);
            });
        });
    };
    LoginPage.prototype.checkUserInServerDD = function () {
        var link = "http://192.168.1.180/api/auth/login";
        // let link = "http://105.159.251.103:1115/api/auth/login";
        var res;
        console.log(this.authForm.value.login + " - " + this.authForm.value.password);
        this.http.post(link, this.authForm.value)
            .subscribe(function (data) {
            console.info(data);
            console.info(data["_body"]);
            res = JSON.parse(data["_body"]);
        }, function (error) {
            console.log("Oooops!");
            res = {};
            alert("res= Oooops");
        });
        return res;
    };
    LoginPage.prototype.creerUser = function (user) {
        var res;
        this.logindb.create(user)
            .then(function (result) {
            res = 1;
        }).catch(function (error) {
            res = 0;
        });
        return res;
    };
    LoginPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-login',
            templateUrl: 'login.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams, FormBuilder,
            LoginDbProvider, SQLite, Http, ToastController,
            GlobalsProvider])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.js.map