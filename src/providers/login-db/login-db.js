var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite';
// import { SQLiteMock } from '@ionic-native-mocks/sqlite';
var LoginDbProvider = /** @class */ (function () {
    function LoginDbProvider(http, sqlite) {
        this.http = http;
        this.sqlite = sqlite;
        this.db = null;
        console.log('Hello LoginDbProvider Provider');
    }
    LoginDbProvider.prototype.setDatabase = function (db) {
        if (this.db === null) {
            this.db = db;
        }
    };
    LoginDbProvider.prototype.createTableUsers = function () {
        var sql = 'CREATE TABLE IF NOT EXISTS users(rowid INTEGER PRIMARY KEY, login TEXT, password TEXT, token TEXT, email TEXT, role TEXT,';
        sql += ' nom TEXT, prenom TEXT, tel TEXT, userId INT, region INT, province INT)';
        return this.db.executeSql(sql, []);
    };
    LoginDbProvider.prototype.create = function (user) {
        var sql = "INSERT INTO users (login, password) VALUES(?,?)";
        return this.db.executeSql(sql, [user.login, user.password]);
    };
    LoginDbProvider.prototype.selectUserByParams = function (user) {
        var sql = 'SELECT * FROM users WHERE login=? AND password =?';
        return this.db.executeSql(sql, [user.login, user.password])
            .then(function (response) {
            return Promise.resolve(response.rows.length);
        })
            .catch(function (error) { return Promise.reject(error); });
    };
    LoginDbProvider.prototype.delete = function (user) {
        var sql = 'DELETE FROM users WHERE rowid=?';
        return this.db.executeSql(sql, [user.rowid]);
    };
    LoginDbProvider.prototype.deleteAll = function () {
        var sql = 'DELETE * FROM users';
        return this.db.executeSql(sql, []);
    };
    LoginDbProvider.prototype.update = function (user) {
        var sql = 'UPDATE users SET token=? WHERE rowid=?';
        this.db.executeSql(sql, [user.token, user.rowid]).then(function (result) {
            console.info(result);
        })
            .catch(function (error) {
            console.error(error);
        });
    };
    LoginDbProvider.prototype.getAll = function () {
        var sql = 'SELECT * FROM users';
        return this.db.executeSql(sql, [])
            .then(function (response) {
            var users = [];
            for (var index = 0; index < response.rows.length; index++) {
                users.push(response.rows.item(index));
            }
            return Promise.resolve(users);
        })
            .catch(function (error) { return Promise.reject(error); });
    };
    LoginDbProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpClient, SQLite])
    ], LoginDbProvider);
    return LoginDbProvider;
}());
export { LoginDbProvider };
//# sourceMappingURL=login-db.js.map