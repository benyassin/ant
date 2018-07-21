import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
// import { SQLiteMock } from '@ionic-native-mocks/sqlite';


@Injectable()
export class LoginDbProvider {

	db: SQLiteObject = null;

	constructor(public http: HttpClient, private sqlite: SQLite) {
		console.log('Hello LoginDbProvider Provider');
	}

	setDatabase(db: any){
		if(this.db === null){
			this.db = db;
		}
	}

	createTableUsers(){
		let sql= 'CREATE TABLE IF NOT EXISTS users(rowid INTEGER PRIMARY KEY, login TEXT, password TEXT, token TEXT, email TEXT, role TEXT,';
		sql+= ' nom TEXT, prenom TEXT, tel TEXT, userId INT, region INT, province INT)';
		return this.db.executeSql(sql, []);
	}

	create(user: any){
		let sql = "INSERT INTO users (login, password) VALUES(?,?)";
		return this.db.executeSql(sql, [user.login, user.password]);
	}

	selectUserByParams(user: any){
		let sql = 'SELECT * FROM users WHERE login=? AND password =?';
		return this.db.executeSql(sql, [user.login, user.password])
		.then(response => {
			return Promise.resolve(response.rows.length);
		})
		.catch(error => Promise.reject(error));
	}

	delete(user: any){
		let sql = 'DELETE FROM users WHERE rowid=?';
		return this.db.executeSql(sql, [user.rowid]);
	}

	deleteAll(){
		let sql = 'DELETE * FROM users';
		return this.db.executeSql(sql, []);
	}

	update(user: any){
		let sql = 'UPDATE users SET token=? WHERE rowid=?';
		 this.db.executeSql(sql, [user.token,  user.rowid]).then(result => {
		    console.info(result);
		})
		.catch( error => {
		    console.error(error);
		});
	}

	getAll(){
		let sql = 'SELECT * FROM users';
		return this.db.executeSql(sql, [])
		.then(response => {
			let users = [];
			for (let index = 0; index < response.rows.length; index++) {
				users.push( response.rows.item(index) );
			}
			return Promise.resolve( users );
		})
		.catch(error => Promise.reject(error));
	}


}
