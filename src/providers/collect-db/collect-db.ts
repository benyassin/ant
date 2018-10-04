import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';


@Injectable()
export class CollectDbProvider {

  db: SQLiteObject = null;

	constructor(public http: HttpClient, private sqlite: SQLite) {
		console.log('Hello CollectDbProvider Provider');
	}

	setDatabase(db: any){
		if(this.db === null){
			this.db = db;
		}
		// this.deleteAllCollects();
	}

	// Create Tables SQL:
	createTableCollect(){
		let sql ='CREATE TABLE IF NOT EXISTS collects(rowid INTEGER PRIMARY KEY, numero INT, campaign INT, area INT,';
		sql +=' form INT, data TEXT, entities TEXT, sync INT, UNIQUE(campaign, numero))';
		// let sql='CREATE TABLE IF NOT EXISTS collects(rowid INTEGER PRIMARY KEY, id_campaign INT, id_area INT, id_zone INT,';
		// sql +=' numero INT, geometry TEXT, id_form TEXT, data TEXT, sync INT, UNIQUE(id_campaign, numero))';
		return this.db.executeSql(sql, []);
 	}
  
	// Insert Elements in Database Tables :
	createCollect(collect: any){
		console.log(collect);
		console.log(collect.numero);
		console.log(collect.campaign);
		console.log(collect.area);
		console.log(collect.form);
		console.log(collect.data);
		console.log(collect.entities);

		// let sql = "INSERT OR IGNORE INTO collects (id_campaign, id_area, id_zone, numero, geometry, id_form, data, sync) VALUES(?,?,?,?,?,?,?,?)";
		let sql = "INSERT OR IGNORE INTO collects (numero, campaign, area, form, data, entities, sync) VALUES(?,?,?,?,?,?,?)";
		return this.db.executeSql(sql, [collect.numero, collect.campaign, collect.area, collect.form, collect.data, collect.entities, 0]);
	}

	// Insert Elements in Database Tables :
	updateCollect(rowid:number, collect: any){
		console.log(rowid);
		console.log(collect);
		console.log(collect.numero);
		console.log(collect.campaign);
		console.log(collect.area);
		console.log(collect.form);
		console.log(collect.data);
		console.log(collect.entities);

		let sql = 'UPDATE collects SET entities=?, form=?, data=? WHERE rowid=?';
		return this.db.executeSql(sql, [collect.entities, collect.form, collect.data, rowid]);
	}

	getMaxNumeroByCampaign(compaign: number) {
		let sql = 'SELECT max(numero) as max FROM collects WHERE campaign = ?';
		return this.db.executeSql(sql, [compaign])
			.then(response => {
				console.log(response.rows.item(0).max);
				let max = 0;
				if (response.rows.length > 0) {
					max = response.rows.item(0).max == null ? 0 : response.rows.item(0).max;
				} else {
					max = 0;
				}
				console.log("max => "+max);
				return Promise.resolve(max);
			})
			.catch(error => Promise.reject(error));
	}
	
	// Delete All Element from Tables :
	deleteAllCollects(){
		let sql = 'DELETE FROM collects';
		return this.db.executeSql(sql, []);
	}
	
	//  Select All Element in the Database Tables :  
	getAllCollects(){
		let sql = 'SELECT * FROM collects';
		return this.db.executeSql(sql, [])
		.then(response => {
			let collects = [];
			for (let index = 0; index < response.rows.length; index++) {
				collects.push( response.rows.item(index) );
			}
			return Promise.resolve( collects );
		})
		.catch(error => Promise.reject(error));
  	}
	
	getAllCollectsBySync(sync:number) {
		let sql = 'SELECT * FROM collects where sync = ?';
		return this.db.executeSql(sql, [sync])
			.then(response => {
				let collects = [];
				for (let index = 0; index < response.rows.length; index++) {
					collects.push(response.rows.item(index));
				}
				return Promise.resolve(collects);
			})
			.catch(error => Promise.reject(error));
	}

 	getCollectByRowId(rowId:number, sync:number){
		let sql = 'SELECT * FROM collects WHERE rowid= ? AND sync = ?';
		  return this.db.executeSql(sql, [rowId, sync])
		.then(response => {
			let collects = [];
			for (let index = 0; index < response.rows.length; index++) {
				collects.push( response.rows.item(index) );
			}
			return Promise.resolve( response.rows.item(0) );
		})
		.catch(error => Promise.reject(error));
 	}

	getAllCollectsByNumero(compaign:number, numero:number){
			let sql = 'SELECT * FROM collects WHERE campaign = ? AND numero= ?';
			return this.db.executeSql(sql, [compaign, numero])
			.then(response => {
				let collects = [];
				for (let index = 0; index < response.rows.length; index++) {
					collects.push( response.rows.item(index) );
				}
				return Promise.resolve( collects );
			})
			.catch(error => Promise.reject(error));
	}

	getAllCollectsByArea(compaign:number, area:number, sync:number){
			let sql = 'SELECT * FROM collects WHERE campaign = ? AND area= ? AND sync = ?';
			return this.db.executeSql(sql, [compaign, area, sync])
			.then(response => {
				let collects = [];
				for (let index = 0; index < response.rows.length; index++) {
					collects.push( response.rows.item(index) );
				}
				return Promise.resolve( collects );
			})
			.catch(error => Promise.reject(error));
	}
	
	// getAllCollectsByZone(compaign:number, zone:number){
	// 		let sql = 'SELECT * FROM collects WHERE  id_campaign = ? AND  id_zone= ?';
	// 		return this.db.executeSql(sql, [compaign, zone])
	// 		.then(response => {
	// 			let collects = [];
	// 			for (let index = 0; index < response.rows.length; index++) {
	// 				collects.push( response.rows.item(index) );
	// 			}
	// 			return Promise.resolve( collects );
	// 		})
	// 		.catch(error => Promise.reject(error));
	// }


}
