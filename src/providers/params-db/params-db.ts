import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';


@Injectable()
export class ParamsDbProvider {

	db: SQLiteObject = null;

	constructor(public http: HttpClient, private sqlite: SQLite) {
		console.log('Hello LoginDbProvider Provider');
	}

	//---------------------------------------//
	// Configuration : 
	setDatabase(db: any){
		if(this.db === null){
			this.db = db;
		}
	}

	createParametrageTables(){
		Promise.all([this.createTableAssignments(),this.createTableCompaigns(), 
			this.createTableForms(),this.createTableAreas(),this.createTableZones()]).then(values => {

		});
	}

	//---------------------------------------//
	// Create Tables SQL:
	createTableAssignments(){
		let sql='CREATE TABLE IF NOT EXISTS assignments(rowid INTEGER PRIMARY KEY, id_campaign INT, id_area INT,UNIQUE(id_campaign, id_area))';
		return this.db.executeSql(sql, []);
	  }
	
	createTableCompaigns(){
		let sql = 'CREATE TABLE IF NOT EXISTS compaigns(rowid INTEGER PRIMARY KEY, id_campaign INT UNIQUE, name TEXT, snap BOOLEAN, tolerance_snap INT, overlap BOOLEAN, tolerance_overlap INT, geometry BOOLEAN, checked BOOLEAN)';
		return this.db.executeSql(sql, []);
	}
	  
	createTableForms(){
		let sql= 'CREATE TABLE IF NOT EXISTS forms(rowid INTEGER PRIMARY KEY, id_form INT, name TEXT, color TEXT, geometry TEXT, schema TEXT, id_campaign INT,UNIQUE(id_campaign, id_form) )';
		return this.db.executeSql(sql, []);
	}
	createTableAreas(){
		let sql= 'CREATE TABLE IF NOT EXISTS areas(rowid INTEGER PRIMARY KEY, id_area INT, name TEXT, id_campaign INT, UNIQUE(id_campaign, id_area))';
		return this.db.executeSql(sql, []);
	}
	createTableZones(){
		let sql= 'CREATE TABLE IF NOT EXISTS zones(rowid INTEGER PRIMARY KEY, id_zone INT, name TEXT, geometry TEXT, id_area INT, UNIQUE(id_zone, id_area))';
		return this.db.executeSql(sql, []);
	}

	//---------------------------------------//
	// Insert Elements in Database Tables :
	createAssignments(assignment: any){
		let sql = "INSERT OR IGNORE INTO assignments (id_campaign, id_area) VALUES(?,?)";
		return this.db.executeSql(sql, [assignment.id_campaign, assignment.id_area]);
  	}
	createCompaign(compaign: any){
		console.log(compaign);
		let sql = "INSERT OR IGNORE INTO compaigns (id_campaign, name, snap, tolerance_snap, overlap, tolerance_overlap, geometry, checked) VALUES(?,?,?,?,?,?,?,?)";
		return this.db.executeSql(sql, [compaign.id, compaign.name, compaign.snap, compaign.tolerance_snap, compaign.overlap, compaign.tolerance_overlap, compaign.geometry, 0]).catch(function (err) {
			console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
		});;
  	}
	createForm(form: any){
			let sql = "INSERT OR IGNORE INTO forms (id_form, name, color, geometry, schema, id_campaign) VALUES(?,?,?,?,?,?)";
			return this.db.executeSql(sql, [form.id, form.name, form.color, form.geometry, form.schema, form.id_campaign]);
	}
	createArea(area: any){
			let sql = "INSERT OR IGNORE INTO areas (id_area, name, id_campaign) VALUES(?,?,?)";
			return this.db.executeSql(sql, [area.id, area.name, area.id_campaign]);
	}
	createZone(zone: any){
			let sql = "INSERT OR IGNORE INTO zones (id_zone, name, geometry, id_area) VALUES(?,?,?,?)";
			return this.db.executeSql(sql, [zone.id, zone.name, zone.geometry, zone.areaId]);
	}

	//---------------------------------------//
	// Drop Tables :
	dropTableCompaigns() {
		let sql = ' DROP TABLE IF EXISTS compaigns ';
		return this.db.executeSql(sql, []);
	}

	//---------------------------------------//
	// Delete All Element from Tables :
	deleteAllAssignments(){
		let sql = 'DELETE FROM assignments';
		return this.db.executeSql(sql, []);
	}
	deleteAllCompaigns(){
		let sql = 'DELETE FROM compaigns';
		return this.db.executeSql(sql, []);
	}
	deleteAllForms(){
			let sql = 'DELETE FROM forms';
			return this.db.executeSql(sql, []);
	}
	deleteAllAreas(){
			let sql = 'DELETE FROM areas';
			return this.db.executeSql(sql, []);
	}
	deleteAllZones(){
		let sql = 'DELETE FROM zones';
		return this.db.executeSql(sql, []);
	}
	deleteAllParams(){
		return Promise.all([this.deleteAllAssignments(),this.deleteAllCompaigns(), 
			this.deleteAllForms(),this.deleteAllAreas(),this.deleteAllZones()]).then(values => {
				
		});
	}

	//---------------------------------------//
	//  Select All Element in the Database Tables :  
	getAllCompaigns(){
		let sql = 'SELECT * FROM compaigns';
		return this.db.executeSql(sql, [])
		.then(response => {
			let compaigns = [];
			for (let index = 0; index < response.rows.length; index++) {
				compaigns.push( response.rows.item(index) );
			}
			return Promise.resolve( compaigns );
		})
		.catch(error => Promise.reject(error));
  	}
	getAllForms(){
			let sql = 'SELECT * FROM forms';
			return this.db.executeSql(sql, [])
			.then(response => {
				let forms = [];
				for (let index = 0; index < response.rows.length; index++) {
					forms.push( response.rows.item(index) );
				}
				return Promise.resolve( forms );
			})
			.catch(error => Promise.reject(error));
	}
	getAllZones(){
			let sql = 'SELECT * FROM zones';
			return this.db.executeSql(sql, [])
			.then(response => {
				let zones = [];
				for (let index = 0; index < response.rows.length; index++) {
					zones.push( response.rows.item(index) );
				}
				return Promise.resolve( zones );
			})
			.catch(error => Promise.reject(error));
	}
	getAllZonesByArea(area:number){
		let sql = 'SELECT * FROM zones WHERE id_area = ?';
		return this.db.executeSql(sql, [area])
		.then(response => {
			let zones = [];
			for (let index = 0; index < response.rows.length; index++) {
				zones.push( response.rows.item(index) );
			}
			return Promise.resolve( zones );
		})
		.catch(error => Promise.reject(error));
	}
	getAllFormsByCampaign(campaign:number){
		let sql = 'SELECT * FROM forms WHERE id_campaign = ?';
		return this.db.executeSql(sql, [campaign])
		.then(response => {
			let forms = [];
			for (let index = 0; index < response.rows.length; index++) {
				forms.push( response.rows.item(index) );
			}
			return Promise.resolve( forms );
		})
		.catch(error => Promise.reject(error));
	}
	getAllAreas(){
			let sql = 'SELECT * FROM areas';
			return this.db.executeSql(sql, [])
			.then(response => {
				let areas = [];
				for (let index = 0; index < response.rows.length; index++) {
					areas.push( response.rows.item(index) );
				}
				return Promise.resolve( areas );
			})
			.catch(error => Promise.reject(error));
	}


	//---------------------------------------//
	// different Functions !	
	checkCompaign(id: number){
		let sql = 'UPDATE compaigns SET checked=? WHERE id_campaign=?';
		return this.db.executeSql(sql, [1, id]).then(result => {
		    console.info(result);
		}).catch( error => {
		    console.error(error);
		});
	}
	
	getCampaignChecked(){
		let sql = ' SELECT * FROM compaigns WHERE checked = 1 ';
		return this.db.executeSql(sql, [])
		.then(response => {
			let campaign = [];
			for (let index = 0; index < response.rows.length; index++) {
				campaign.push( response.rows.item(index) );
			}
			return Promise.resolve( campaign );
		})
		.catch(error => Promise.reject(error));
	}

	getAreasOnCampaignChecked(){
		let sql = 'SELECT id_area, name, id_campaign FROM areas WHERE id_campaign IN (SELECT id_campaign FROM compaigns WHERE checked = 1)';
		return this.db.executeSql(sql, [])
		.then(response => {
			let areas = [];
			for (let index = 0; index < response.rows.length; index++) {
				areas.push( response.rows.item(index) );
			}
			return Promise.resolve( areas );
		})
		.catch(error => Promise.reject(error));
	}

	getAllCampaignsWithNonSyncData(){
		let sql = 'SELECT id_campaign, name FROM compaigns WHERE id_campaign IN (SELECT DISTINCT id_campaign FROM collects WHERE sync = 0)';
		return this.db.executeSql(sql, [])
			.then(response => {
				let compaigns = [];
				for (let index = 0; index < response.rows.length; index++) {
					compaigns.push(response.rows.item(index));
				}
				return Promise.resolve(compaigns);
			})
			.catch(error => Promise.reject(error));
	}
  
	
  
}
