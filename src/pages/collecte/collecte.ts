import { Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController  } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { timer } from 'rxjs/observable/timer';

import { MenuPage } from '../menu/menu';

import { ParamsDbProvider } from '../../providers/params-db/params-db';
import { CollectDbProvider } from '../../providers/collect-db/collect-db';
// import  from 'turf';

declare const L:any;
declare const turf:any;
declare const jsts:any;
declare const $: any;
declare const Formio: any;

@IonicPage()
@Component({
  selector: 'page-collecte',
  templateUrl: 'collecte.html',
})
export class CollectePage implements OnInit {

	@ViewChild('map') mapContainer: ElementRef;

	map: any;	
	neighbors:any = new L.GeoJSON(); // Layer of neighbors data of the same campaign & area.
	ZonesLayer: any;
	zonesData: any={}; // Holds the geojson of zones.
	markersZones:any = new L.LayerGroup(); // Holds the labels of the zones layer.

	// DRAW Handlers ::
	drawControl: any;
	guideLayers: any=[]; // To hold all geometries For Snapping :
	drawnItems: any= new L.FeatureGroup();	// Holds the drawing layers.
	collectedElements:any=[]; // Group of collects 'Fresh created' / 'To update'.
	NeighborsElements:any=[]; // Group of synchronized collects.
	workingLayer:any;

	// Boolean for the 'Select' & 'Edit' Map Controls.
	boolEdit:boolean = false;
	boolSelect:boolean = false;

	public FForms: any = []; // list of all the forms loaded in constructor by campaign. 
  	public ZZones: any = []; // list of all the zones loaded in constructor by campaign. 
	
	private mode: string; // Access mode to this page : new / edit.
	private rowId: number; // rowId of collect to update.
	private id_area : number; // id area in which we collect data.
	private areaName : string; // area name in which we collect data.
	private id_campaign : number ; // The campaign ID.
	private numero : number; // The Collect number.
	private config:any; // The Collect number.
	formIdentif: any = null; // the form id of the identification form.
	dataIdentif: any = null; // the form data of the identification form.	
	
	// Styles des zones ::
	styleZone: any = { weight: 2, opacity: 1, dashArray: '3', color: 'yellow', fillOpacity: 0.3, fillColor: 'grey' };
	
	// Styles des Polygons : 
	PolygonStyle: any = { weight: 2, opacity: 1, color: 'black', fillOpacity: 0.3, fillColor: 'red' };
	PolygonSelected: any = { weight: 2, opacity: 1, color: '#00ffff' };
	PolygonBD: any = { weight: 2, opacity: 1, color: 'black', fillOpacity: 0.3, fillColor: '#8a8c8b' };
	PolygonNeighbour: any = { weight: 2, opacity: 1, color: 'black', fillOpacity: 0.3, fillColor: '#ffffff' };
	
	// Styles des Polylines : 
	LineStringStyle: any = { weight: 3, opacity: 1, color: 'red' };
	LineStringSelected: any = { weight: 3, opacity: 1, color: '#00ffff' };
	LineStringBD: any = { weight: 3, opacity: 1, color: '#8a8c8b' };
	LineStringNeighbour: any = { weight: 3, opacity: 1, color: '#ffffff' };

	// Styles des Points : 
	LeafIcon:any = L.Icon.extend({ options: { iconSize: [25, 42], iconAnchor: [12, 42], popupAnchor: [8, 0] } });
	MarkerStyle:any = new this.LeafIcon({ iconUrl: 'img/markerStyle.png' });
	MarkerBD:any = new this.LeafIcon({ iconUrl: 'img/markerBD.png' });
	MarkerSelected:any = new this.LeafIcon({ iconUrl: 'img/markerSelected.png' });
	MarkerNeighbour: any = new this.LeafIcon({ iconUrl: 'img/markerNeighbour.png' });

	constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public modalCtrl : ModalController,
		public paramsdb: ParamsDbProvider, public collectdb: CollectDbProvider, private toastCtrl: ToastController) {
		
		this.mode = this.navParams.get("mode");
		this.id_area = this.navParams.get("id_area");
        this.areaName = this.navParams.get("name");
		this.id_campaign = this.navParams.get("id_campaign");
		this.config = this.navParams.get("config");
		console.log(this.config);
		
		// ********************************** //
		if (this.mode == "edit") {
			this.rowId = this.navParams.get("row_id");
			this.LoadCollectByRowId(this.rowId);
		} else {
			this.LoadMaxNumeroByCampaign();
		}
		// ********************************** //
		// this.LoadAllZonesByArea();
		this.loadAllFormsByCampaign();
		this.LoadNeighbors();

	}

	// Load All forms by campaign 
	loadAllFormsByCampaign() {
		this.paramsdb.getAllFormsByCampaign(this.id_campaign).then((forms) => {
			for (let i = 0; i < forms.length; i++) {
				this.FForms.push({ id_form: forms[i].id_form, name: forms[i].name, color: forms[i].color, geometry: forms[i].geometry, id_campaign: forms[i].id_campaign, schema: forms[i].schema });
			}
		}, (error) => {
			console.log("getAllFormsByCampaign error = " + JSON.stringify(error));
		});
	}

	// Load All zones by area
	LoadAllZonesByArea() {
		this.paramsdb.getAllZonesByArea(this.id_area).then((zones) => {
			console.log(zones);
			for (let i = 0; i < zones.length; i++) {
				this.ZZones.push({ id_zone: zones[i].id_zone, name: zones[i].name, id_area: zones[i].id_area });
			}
			console.log(this.ZZones);
			this.zonesData['type'] = 'FeatureCollection';
			this.zonesData['features'] = [];
			for (let i = 0; i < zones.length; i++) {
				let prop = JSON.parse(zones[i].geometry);
				prop.properties.id_zone = zones[i].id_zone;
				prop.properties.name = zones[i].name;
				prop.properties.id_area = zones[i].id_area;
				this.zonesData['features'].push(prop);
			}
			console.log(this.zonesData);
			console.log(JSON.stringify(this.zonesData));
			 this.loadmap();
		}, (error) => {
			console.log("getAllZonesByArea error = " + JSON.stringify(error));
		});
	}

	// Load max 'numero' by campaign if mode ='new'
	LoadMaxNumeroByCampaign(){
		this.collectdb.getMaxNumeroByCampaign(this.id_campaign).then((max) => {
		console.log("max= "+max);
		this.numero = ++max;
		console.log("this.numero= "+this.numero);
		}, (error) => {
		console.log("getMaxNumeroByCampaign error = " + JSON.stringify(error));
		});
	}

	// Open Identification Form to update data:
	openIdentification(){
		let self = this;
		let formModal:any;
		for(let k = 0; k < self.FForms.length;k++){
			if(self.FForms[k].id_form == self.formIdentif){
				let data = { id: self.FForms[k].id_form, name: self.FForms[k].name, color: self.FForms[k].color, schema: self.FForms[k].schema, data:self.dataIdentif };
				console.log(data);
				formModal = self.modalCtrl.create('FormPage', { formData: data }, { cssClass: "FormListe" });
				formModal.present();
				self.disableSelectControl();
				formModal.onDidDismiss((form) => {
					if (form != undefined) {
						console.log(form);
						console.log(form.data);
						self.dataIdentif = JSON.stringify(form.data);
						console.log(self.dataIdentif);
					}
				});
			}
		}
	}

 	// Load collect to update by rowid if mode ='edit'
	LoadCollectByRowId(rowId){
		this.collectdb.getCollectByRowId(rowId,0).then((collect) => {
			this.numero = collect.numero;
			this.formIdentif = collect.form;
			this.dataIdentif = collect.data;

			let entit = JSON.parse(collect.entities);
			for (let i = 0; i < entit.length; i++) {
				console.log(entit[i].data);

				let entity = {
					id: entit[i].numero,
					numero: entit[i].numero,
					form: entit[i].form,
					name: entit[i].name,
					color: entit[i].color,
					data: entit[i].data,
					geometry: entit[i].geometry,
					area: entit[i].area,
					zone: entit[i].zone
				};
				console.log(entity);
				this.collectedElements.push(entity);
				console.log(entit[i].geometry);
				this.drawCollectData(JSON.parse(entit[i].geometry),entit[i].numero);
			}
		}, (error) => {
		console.log("getCollectByRowId error = " + JSON.stringify(error));
		});
	}

	// Draw collect to Update.
	drawCollectData(geojson, numero){
		let self = this;
		let layertype="polygon";
		let a = new L.GeoJSON(geojson, {
			onEachFeature: function (feature, layer) {
				if (geojson.type=="Point"){
					layer.setIcon(self.MarkerBD);
					layertype = "marker";
				}else{
					if (geojson.type =="LineString"){
						layer.setStyle(self.LineStringBD);
						layertype = "polyline";
					}else{
						layer.setStyle(self.PolygonBD);						
					}
				}

				// event to lunch on layer dragend: Marker 
				layer.on('dragend', function (c) {
					self.layerDragend(c);
				});

				// event to lunch on layer edit: Polyline && Polygon 
				layer.on('edit', function (c) {
					self.layerEdit(c,layertype);
				});

				layer.editing._leaflet_id = numero;
				self.layerClick(layer);	
				self.guideLayers.push(layer);
				self.drawnItems.addLayer(layer);
			}
		});
	}

	// Load Neighbors data 
	LoadNeighbors(){
		let self = this;
		this.collectdb.getAllCollectsByArea(this.id_campaign, this.id_area, 0).then((collects) => {
			console.log(collects);
			let geojson: any = {};
			geojson['type'] = 'FeatureCollection';
			geojson['features'] = [];
			for (let i = 0; i < collects.length; i++) {
				if(self.mode == "edit" && collects[i].rowid!=self.rowId){
					let entit = JSON.parse(collects[i].entities);
					console.log(entit);
					for (let k = 0; k < entit.length; k++) {
						console.log(entit[k].geometry);
						if(entit[k].geometry!=null) geojson['features'].push(JSON.parse(entit[k].geometry));
					}
				}
			}
			// this.drawCollectData(geojson);
			this.neighbors = new L.GeoJSON(geojson, {
				name: 'Neighbors',
				onEachFeature: function (feature, layer) {
					if (geojson.type == "Point") {
						layer.setIcon(self.MarkerNeighbour);
					} else {
						if (geojson.type == "LineString") {
							layer.setStyle(self.LineStringNeighbour);
						} else {
							layer.setStyle(self.PolygonNeighbour);
						}
					}
					self.guideLayers.push(layer);
					self.NeighborsElements.push(layer);
				}
			});



		}, (error) => {
			console.log("getAllCollectsByArea error = " + JSON.stringify(error));
		});
	}

	ngOnInit(){
		this.LoadAllZonesByArea();
	}

	goToMenu() {
		this.navCtrl.setRoot(MenuPage);
	}

	// Open the form list to input forms data:
	public openQuestListe(collectId) {
		let formModal: any;
		let modalFormsList = this.modalCtrl.create('ModalPage', { forms: this.FForms }, { cssClass: "QuestListe" });
		modalFormsList.present();

		modalFormsList.onDidDismiss((data) => {
			console.log("I have dismissed.  " + JSON.stringify(data));
			if (data != undefined) {
				let form = {id: data.id, name: data.name, color: data.color, schema: data.schema, data: null}
				formModal = this.modalCtrl.create('FormPage', { formData: form }, { cssClass: "FormListe" });
				formModal.present();
				formModal.onDidDismiss((form) => {
					if (form != undefined) {
						console.log(form);
						console.log(form.data);
						this.saveDataTodrawendElements(collectId, form.id, form.name, form. color, form.data);
					}
				});
			}
		});

	}

	// Open the form with the given data and form:
	openForm(collectId, formId, formioData){
		let self = this;
		let formModal:any;
		for(let k = 0; k < self.FForms.length;k++){
			if(self.FForms[k].id_form == formId){
				let data = { id: self.FForms[k].id_form,  name: self.FForms[k].name,  color: self.FForms[k].color, schema: self.FForms[k].schema, data :formioData};
				console.log(data);
				formModal = self.modalCtrl.create('FormPage', { formData: data }, { cssClass: "FormListe" });
				formModal.present();
				// self.disableSelectControl();
				formModal.onDidDismiss((form) => {
					if (form != undefined) {
						console.log(form);
						console.log(form.data);
						self.saveDataTodrawendElements(collectId, form.id, form.name, form. color, form.data);
					}
				});
			}
		}
	}

	// Save the input data from the form to the collectedElement Array:
	saveDataTodrawendElements(collectId, id, name, color, data){
		let self= this;
		for(let i= 0; i< this.collectedElements.length; i++){
			if(this.collectedElements[i].id==collectId){
				this.collectedElements[i].form =id;
				this.collectedElements[i].name = name;
				this.collectedElements[i].color =color;
				this.collectedElements[i].data = JSON.stringify(data);

				this.drawnItems.eachLayer(function (lyr) {
					if(lyr.editing._leaflet_id == collectId){
						if ((lyr instanceof L.Polyline) && !(lyr instanceof L.Polygon)) lyr.setStyle(self.LineStringStyle);
						if (lyr instanceof L.Polygon) lyr.setStyle(self.PolygonStyle);
						if (lyr instanceof L.Marker) lyr.setIcon(self.MarkerStyle);
					}
				});
			}
		}
		
		
	}

	// Call a Confirm Alert to register data to DB:
	ConfirmAlertRegisterDataToDB() {
		if(this.collectedElements.length==0) return;
		let title = this.mode=="new"? '<span style="background-color:red">Voulez-vous enregistrer la collecte en cours?</span>' : 'Voulez-vous enregistrer les modifications en cours?';
		let alert = this.alertCtrl.create({
			title: title,
			message: '',
			buttons: [
				{ text:'Non', handler: () => { 
					
					}  },
				{ text: 'Oui', handler: () => {
						this.registerDataToDB();
				}  }
			]
		});
		alert.present();
	
	}
	
	// Register collected data to DB:
	registerDataToDB() {
		let entities: any = [];
		let collect: any = {};
		for (let i = 0; i < this.collectedElements.length; i++) {
			console.log(this.collectedElements[i]);
			let entity = {
				numero: this.collectedElements[i].numero,
				form: this.collectedElements[i].form,
				name: this.collectedElements[i].name,
				color: this.collectedElements[i].color,
				data: this.collectedElements[i].data,
				geometry: this.collectedElements[i].geometry,
				area: this.collectedElements[i].area,
				zone: this.collectedElements[i].zone
			};
			console.log(entity);
			entities.push(entity);
		}
		collect.numero = this.numero;
		collect.campaign = this.id_campaign;
		collect.area = this.id_area;
		collect.form = this.formIdentif;
		collect.data = this.dataIdentif;
		collect.entities = JSON.stringify(entities);
		console.log(collect);

		if (this.mode == "new") {

			this.collectdb.createCollect(collect).then(dataCollect => {
				console.log(dataCollect);
				this.toastCtrl.create({ message: "Données enregistrées avec succès.", duration: 3000, position: 'middle' }).present();
				timer(3000).subscribe(() => this.navCtrl.setRoot(MenuPage)); // <-- go to menu after success message displayed (3sec).
			});

		} else {
			this.collectdb.updateCollect(this.rowId, collect).then(dataCollect => {
				console.log(dataCollect);
				this.toastCtrl.create({ message: "Données modifiées avec succès.", duration: 3000, position: 'middle' }).present();
				timer(3000).subscribe(() => this.navCtrl.setRoot(MenuPage)); // <-- go to menu after success message displayed (3sec).
			});
		}

	}
	
	// The main function of map functions ;)
 	loadmap() {
		  
		var self = this; // store here
		// ---------------------------------------------------------------------------------//
		// ---------------------------:: Initiation of the map :: --------------------------//
		
		let osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		let googleStreetsUrl = 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
		let googleHybridUrl = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
		let googleSatUrl = 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
		let googleTerrainUrl = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

		let	osm  =new L.tileLayer(osmUrl, {attribution: "openstreetmap", maxZoom: 18});
		let	Streets  =new L.tileLayer(googleStreetsUrl, {attribution: "Google Streets", maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
		let	Hybrid  =new L.tileLayer(googleHybridUrl, {attribution: "Google Hybrid", maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
		let	Sat  =new L.tileLayer(googleSatUrl, {attribution: "Google Satellite", maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
		let	Terrain  =new L.tileLayer(googleTerrainUrl, {attribution: "Google Terrain", maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});

		this.map = new L.map('map', {
			center: [39.73, -104.99],
			zoom: 10,
			tap: false,
			zoomControl: false,
			layers: [osm]
		});	

		self.ZonesLayer= L.geoJson(this.zonesData, {
			name: 'Zones',
			onEachFeature: function(feature, layer) {
					layer.setStyle(self.styleZone);
					 var label = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: 'labelZones',
							html: feature.properties["name"]
						})
					});
					self.markersZones.addLayer(label);
				self.guideLayers.push(layer);
			}
	 	 }).addTo(self.map);
		self.markersZones.addTo(self.map);
		self.map.fitBounds(self.ZonesLayer.getBounds());

		self.map.doubleClickZoom.disable();
		self.drawnItems.addTo(self.map);

		self.neighbors.addTo(self.map); // Add Neighbors layer to the Map.
		// ---------------------------------------------------------------------------------//
		// --------------------------:: Controllers of the map :: --------------------------//

		// ---------------:: Layers Control ::-------------- //
		let baseLayers = {
			"Streets":Streets,
			"Hybrid":Hybrid,
			"Satellite":Sat,
			"Terrain":Terrain,
			"OSM":osm,
		};
		let overlays = {
			"Zones": self.ZonesLayer,
			"Dessins": self.drawnItems,
			"Neighbors": self.neighbors
		};
		L.control.layers(baseLayers, overlays).addTo(self.map);

		// ----------------:: Zoom Control ::--------------- //
		L.Control.zoomHome = L.Control.extend({
			options: {
				position: 'topleft',
				zoomInText: '+',
				zoomInTitle: 'Zoom in',
				zoomOutText: '-',
				zoomOutTitle: 'Zoom out',
				// zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
				zoomHomeText: 'H',
				zoomHomeTitle: 'Zoom home'
			},

			onAdd: function (map) {
				var controlName = 'gin-control-zoom',
					container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
					options = this.options;

				this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
					controlName + '-in', container, this._zoomIn);
				this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
					controlName + '-home', container, this._zoomHome);
				this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
					controlName + '-out', container, this._zoomOut);

				this._updateDisabled();
				map.on('zoomend zoomlevelschange', this._updateDisabled, this);

				return container;
			},

			onRemove: function (map) {
				map.off('zoomend zoomlevelschange', this._updateDisabled, this);
			},

			_zoomIn: function (e) {
				this._map.zoomIn(e.shiftKey ? 3 : 1);
			},

			_zoomOut: function (e) {
				this._map.zoomOut(e.shiftKey ? 3 : 1);
			},

			_zoomHome: function (e) {
				// var extent = bbox(communesGeoJson);
				// var Pt1 = new L.latLng(extent[1], extent[0]);
				// var Pt2 = new L.latLng(extent[3], extent[2]);
				//  bounds = new L.LatLngBounds(Pt1, Pt2);
				// map.fitBounds(bounds);
			},

			_createButton: function (html, title, className, container, fn) {
				var link = L.DomUtil.create('a', className, container);
				link.innerHTML = html;
				link.href = '#';
				link.title = title;

				L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
					.on(link, 'click', L.DomEvent.stop)
					.on(link, 'click', fn, this)
					.on(link, 'click', this._refocusOnMap, this);
				return link;
			},

			_updateDisabled: function () {
				var map = this._map,
					className = 'leaflet-disabled';
				L.DomUtil.removeClass(this._zoomInButton, className);
				L.DomUtil.removeClass(this._zoomOutButton, className);
				if (map._zoom === map.getMinZoom()) {
					L.DomUtil.addClass(this._zoomOutButton, className);
				}
				if (map._zoom === map.getMaxZoom()) {
					L.DomUtil.addClass(this._zoomInButton, className);
				}
			}
		});
		let zoomHome = new L.Control.zoomHome();
		self.map.addControl(zoomHome);

		// -----------:: Identification Control ::--------- //
		let formControl = L.Control.extend({
			options: {
				position: 'topright' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
			},
			onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom controlsLeaflet');
				container.style.width = '36px';
				container.style.height = '36px';
				container.style.backgroundImage = "url(img/form.png)";
				container.style.backgroundRepeat = "no-repeat";
				container.style.backgroundPosition = "center";
				container.style.backgroundSize = "30px 30px";


				container.onclick = function () {
					self.openIdentification();
				}
				return container;
			}
		});

		let formCtrl = new formControl();
		self.map.addControl(formCtrl);

		// ---------------:: Save Control ::-------------- //
		let saveControl = L.Control.extend({
			options: {
				position: 'topright' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
			},
			onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom controlsLeaflet');
				container.style.backgroundImage = "url(img/save.png)";
				container.style.backgroundRepeat = "no-repeat";
				container.style.backgroundSize = "30px 30px";
				container.style.backgroundPosition = "center";
				container.style.width = '36px';
				container.style.height = '36px';
			
				container.onclick = function () {
					self.ConfirmAlertRegisterDataToDB();
				}
				return container;
			
			}
		});

		let saveCtrl = new saveControl();
		self.map.addControl(saveCtrl);

		// ---------------------------------------------------------------------------------//
		// -----------------------------:: DRAW on the map :: ------------------------------//
	

		// ----------:: Draw Controller ::--------- //
		let  optionsDraw = {
			position:'topleft',
			edit: {
				featureGroup: self.drawnItems,
				polygon : {
					allowIntersection : false,
					guideLayers: self.guideLayers
				},
				marker:{
					guideLayers: self.guideLayers
				},
				polyline: {
					guideLayers: self.guideLayers
				},
				remove:true,
				edit:false
			},
			draw: {
				marker: {
					guideLayers: self.guideLayers
				},
				polygon: {
					allowIntersection: false, // Restricts shapes to simple polygons
					drawError: {
						color: '#e1e100', // Color the shape will turn when intersects
						message: '<strong>Attention!<strong>Intersection!' // Message that will show when intersect
					},
					shapeOptions: self.PolygonStyle,
					guideLayers: self.guideLayers
				},
				polyline: {
					metric:true,
					shapeOptions: self.LineStringStyle,
					guideLayers: self.guideLayers
				}
			}
		};
		L.DrawToolbar.prototype.options={
			marker: {},
			polyline : {},
			polygon: {}
		};
		L.DrawToolbar.prototype.getModeHandlers= function (map) {
			var arrayModeHandlers = [];
			arrayModeHandlers.push({
			enabled: this.options.marker,
			handler: new L.Draw.Marker(map, this.options.marker),
			title: L.drawLocal.draw.toolbar.buttons.marker
			});
			
			arrayModeHandlers.push({
			enabled: this.options.polyline,
			handler: new L.Draw.Polyline(map, this.options.polyline),
			title: L.drawLocal.draw.toolbar.buttons.polyline
			});
		
			arrayModeHandlers.push({
			enabled: this.options.polygon,
			handler: new L.Draw.Polygon(map, this.options.polygon),
			title: L.drawLocal.draw.toolbar.buttons.polygon
			});
			
			return arrayModeHandlers;
		};
		self.drawControl =  new L.Control.Draw(optionsDraw);
		self.map.addControl(self.drawControl);

		// ---------------:: Edit Control ::-------------- //
		let editControl = L.Control.extend({
			options: {
				position: 'topleft' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
			},
			onAdd: function (map) {
				
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom controlsLeaflet editCtrl');
				container.style.width = '26px';
				container.style.height = '26px';
				container.style.backgroundImage = "url(img/noedit.png)";
				container.style.backgroundRepeat = "no-repeat";
				container.style.backgroundPosition = "center";
				container.style.backgroundSize = "24px 24px";

				container.onclick = function () {
					self.disableSelectControl();
					container.style.backgroundImage = self.boolEdit ? "url(img/noedit.png)" : "url(img/edit.png)";

					if (self.boolEdit) {
						if (self.workingLayer != null) {
							if (self.workingLayer instanceof L.Marker) {
								self.workingLayer.dragging.disable();
							} else {
								self.workingLayer.snapediting.disable();							
							}
						}
						self.boolEdit = false;
					} else {
						self.workingLayer = null;
						self.boolEdit = true;
					}
				}
				return container;
			}
		});

		let editCtrl = new editControl();
		self.map.addControl(editCtrl);
		
		// ---------------:: Select Control ::-------------- //
		let selectControl = L.Control.extend({
			options: {
				position: 'topleft' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
			},
			onAdd: function (map) {
				
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom controlsLeaflet selectCtrl');
				container.style.width = '26px';
				container.style.height = '26px';
				container.style.backgroundImage = "url(img/noselect.png)";
				container.style.backgroundRepeat = "no-repeat";
				container.style.backgroundPosition = "center";
				container.style.backgroundSize = "24px 24px";

				container.onclick = function () {
					self.disableEditControl();
					let MarkrtSty = self.mode=="new"? self.MarkerStyle: self.MarkerBD;
					let LinestringSty = self.mode=="new"? self.LineStringStyle: self.LineStringBD;
					let PolygonSty = self.mode=="new"? self.PolygonStyle: self.PolygonBD;
					if (self.boolSelect){
						self.drawnItems.eachLayer( function (lyr){
							if ((lyr instanceof L.Polyline) && !(lyr instanceof L.Polygon))  lyr.setStyle(LinestringSty);
							if (lyr instanceof L.Polygon) lyr.setStyle(PolygonSty);
							if (lyr instanceof L.Marker) lyr.setIcon(MarkrtSty);
						});
					}

					container.style.backgroundImage = self.boolSelect ? "url(img/noselect.png)" : "url(img/select.png)";
					self.boolSelect = !self.boolSelect;
				}
				return container;
			}
		});

		let selectCtrl = new selectControl();
		self.map.addControl(selectCtrl);

		// ---------------------------------------------------------------------------------//
		// ----------------------------:: Events on the map :: -----------------------------//
		self.map.on("overlayremove",function(e){
			if(e.name=="Zones"){
				self.map.removeLayer(self.ZonesLayer);
				self.map.removeLayer(self.markersZones);
			}
		});

		self.map.on("overlayadd",function(e){
			if(e.name=="Zones"){
				self.ZonesLayer.addTo(self.map);
				self.markersZones.addTo(self.map);
			}		  
		});

		self.map.on('zoomend', function () {
			console.info("zoom= "+self.map.getZoom());
			if (self.map.getZoom() >= 14 ){
				self.map.removeLayer(self.ZonesLayer);
				self.map.removeLayer(self.markersZones);
			}
			if( self.map.getZoom() < 14 ){
				self.ZonesLayer.addTo(self.map);
				self.markersZones.addTo(self.map);
			}
	 	});
	
		// ---------------------------------------------------------------------------------//
		// --------------------------:: Gestion of maps event :: ---------------------------//
		
		// Disable Other Leaflet Controllers when start drawing or start deleting :
        self.map.on('draw:drawstart', function (e) {
            self.disableEditControl();
            self.disableSelectControl();
		});
		
        self.map.on('draw:deletestart', function (e) {
               self.disableEditControl();
               self.disableSelectControl();
        });
		
		// Listen to when a layer is deleted:
	  	self.map.on('draw:deleted', function (e) {

			var layers = e.layers;
			console.info(layers.length);
			layers.eachLayer(function (layer) {
				console.info(layer._leaflet_id);
				self.drawnItems.removeLayer(layer);

				// Annulation du Bloc supprimé du tableau des GuideLayers :
				for (var i = 0; i < self.guideLayers.length; i++) {
					if (self.guideLayers[i]._leaflet_id == layer._leaflet_id) {
						console.log("guideLayers del : OK " + self.guideLayers.length);
						self.guideLayers.splice(i, 1);
					}
				}

				// Suppression de l'élement déssiné :
				for (var i = 0; i < self.collectedElements.length; i++) {
					if (self.collectedElements[i].id == layer.editing._leaflet_id) {
						console.log("élement del : OK avant " + self.collectedElements.length);
						self.collectedElements.splice(i, 1);
						console.log("élement del : OK après " + self.collectedElements.length);
					}
				}
							
			});
			  
		});

		// listen to when a new layer is created
		self.map.on('draw:created', function(e) {
			let couche = e.layer;
			console.info(e.layer); // the leaflet layer created
			console.info(e.layer.editing._leaflet_id); // the leaflet layer created		

			let gjsonString:any = JSON.stringify(e.layer.toGeoJSON());
	
			// let indice = self.collectedElements.length - 1;
			// if (self.collectedElements.length > 0 && self.collectedElements[indice].data==null){
			// 		self.map.removeLayer(self.workingLayer); 
			// 		self.collectedElements.splice(indice);
			// }
			
			// Check if 1: In Zone && 2: not Self Intersect :
			let zoneIntersect: any = self.getZoneIntersection(e.layer, e.layerType);
			if(zoneIntersect==-1){
				self.map.removeLayer(e.layer); 
				return; 
			}
			if(e.layerType=="polygon"){
				let isSelfIntersect:any = self.selfIntersect(e.layer.toGeoJSON().geometry);
				if(isSelfIntersect== -1){
					self.map.removeLayer(e.layer); 
					return; 
				}
			}

			// event to lunch on layer dragend: Marker 
			e.layer.on('dragend', function (c) {
				self.layerDragend(c);
			});

			// event to lunch on layer edit: Polyline && Polygon 
			e.layer.on('edit', function (c) {
				self.layerEdit(c,e.layerType);
			});
			
			self.workingLayer = e.layer;
			self.layerClick(e.layer);
			
			// Affect numero to drawned layer id ;)
			e.layer.editing._leaflet_id = self.collectedElements.length+1;
			console.info(e.layer.editing._leaflet_id);

			self.collectedElements.push({
				id: e.layer.editing._leaflet_id,
				numero: self.collectedElements.length+1,
				form: null,
				name: null,
				color: null,
				data:null,
				geometry: gjsonString,
				zone: zoneIntersect.id_zone,
				area: self.id_area,
				campaign: self.id_campaign
			});
			console.log(self.collectedElements);
			
			// Add drawned element to drawItems && to guideLayers.
			self.drawnItems.addLayer(e.layer);
			self.guideLayers.push(e.layer);

		});
	}


	// Bind event on Layer dragEnd:
	layerDragend(e){
        let self = this;
		console.log(e);
		// Check if In Zone
		let zoneIntersect: any = self.getZoneIntersection(e.target, "marker");			
		if(zoneIntersect==-1){
			self.workingLayer.dragging.disable();
				for(let i=0; i < self.collectedElements.length; i++){
				if(self.collectedElements[i].id == e.target.editing._leaflet_id){
					
					new L.GeoJSON(JSON.parse(self.collectedElements[i].geometry), { onEachFeature: function (feature, couche) {
						couche.editing._leaflet_id = e.target.editing._leaflet_id;
						// self.drawnItems.removeLayer(e.target);
						self.drawnItems.eachLayer(function (l) {
							console.log(l.editing._leaflet_id);
							console.log(e.target.editing._leaflet_id);
							if(l.editing._leaflet_id == e.target.editing._leaflet_id){
								self.drawnItems.removeLayer(l);
							}
						});
						couche.setIcon(self.MarkerStyle); 
						self.drawnItems.addLayer(couche);
						couche.on('dragend', function (k) {
							self.layerDragend(k);
						});
						self.layerClick(couche);
					}
					});
				}
			}
			// self.drawnItems.removeLayer(self.workingLayer); 
			return; 
		}

		// change geometry when layer edited changed succesfully (without errors);
		for(let i=0; i < self.collectedElements.length; i++){
			if(self.collectedElements[i].id == e.target.editing._leaflet_id){
				console.log("zzzzzzzzzzzzzzzzzzzzzzzz  PPPPPPP");
				self.collectedElements[i].geometry = JSON.stringify(e.target.toGeoJSON());
			}
		}
                
	}

	// Bind event On Edit a layer:
	layerEdit(e, layerType){
		let self = this;
		console.log(layerType);
		console.log(e);

		// Check if 1: In Zone && 2: not Self Intersect :
		let zoneIntersect: any = self.getZoneIntersection(e.target, layerType);			
		let isSelfIntersect: any = self.selfIntersect(e.target.toGeoJSON().geometry);
		if(zoneIntersect==-1 || isSelfIntersect== -1){
			e.target.snapediting.disable();
			self.drawnItems.removeLayer(e.target);
			for(let i=0; i < self.collectedElements.length; i++){
				if(self.collectedElements[i].id == e.target.editing._leaflet_id){
					// self.drawnItems.eachLayer(function (l) {
					// 	if (l instanceof L.Marker) {
					// 		l.dragging.disable();
					// 	} else {
					// 		l.snapediting.disable();
					// 	}
					// 	// if(l.editing._leaflet_id == e.target.editing._leaflet_id){
					// 	// 	self.drawnItems.removeLayer(l.editing._leaflet_id);
					// 	// }
					// });
					// self.drawnItems.removeLayer(e.target.editing._leaflet_id);
					new L.GeoJSON(JSON.parse(self.collectedElements[i].geometry), { onEachFeature: function (feature, couche) {
						couche.editing._leaflet_id = e.target.editing._leaflet_id;
						couche.setStyle(self.PolygonBD); 
						self.drawnItems.addLayer(couche);
						couche.on('edit', function (k) {
							self.layerEdit(k,e.layerType);
						});
						self.layerClick(couche);
					}
					});
					
				}
			}
			return; 
		}
	
		// change geometry when layer edited changed succesfully (without errors);
		for(let i=0; i < self.collectedElements.length; i++){
			if(self.collectedElements[i].id == e.target.editing._leaflet_id){
				console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
				self.collectedElements[i].geometry = JSON.stringify(e.target.toGeoJSON());
			}
		}
	}

	// Get the zone intersected with the layer drawned:
	getZoneIntersection(layer, typeGeometry){
		let featureGroup = new L.FeatureGroup();
		let lng, lat, center;
	
		if (typeGeometry =="marker"){
			center = layer.getLatLng();
			lat = center.lat;
			lng =center.lng;
		 }
	
		if (typeGeometry =="polyline"){
			center = layer.getBounds().getCenter();
			lat = center.lat;
			lng =center.lng;
		}
	
		if (typeGeometry =="polygon"){
			center = layer.getBounds().getCenter();
			lat = center.lat;
			lng =center.lng;
		}	
		console.info("LatLng()= "+lat+" - "+lng);
	
		let point = {
			"type": "FeatureCollection",
			"features": [
			 {
				"type": "Feature",
				"properties": {},
				"geometry": {
				  "type": "Point",
				  "coordinates": [lng, lat]
				}
			  }
			]
		  };
		
		console.log(JSON.stringify(point));
		let zoneIntersect = -1;
		this.ZonesLayer.eachLayer(function(lyr) {
			featureGroup.clearLayers();
			featureGroup.addLayer(lyr);
			var isInside = turf.within(point, featureGroup.toGeoJSON());
			if(isInside.features.length >0){
				zoneIntersect = lyr.feature.properties;
			}
		});
		if(zoneIntersect==-1) this.toastCtrl.create({ message: "Zonede dessin non permise !", duration: 3000, position: 'middle' }).present();
		console.log(zoneIntersect);
		return zoneIntersect;
	}

	// Check if a Layer is selfIntersected:
	selfIntersect(layer){
		let coordinatesOfGeometry = [];
		// let couche = layer.toGeoJSON().geometry;
		console.log(layer);
        coordinatesOfGeometry =layer.coordinates;
		coordinatesOfGeometry = coordinatesOfGeometry[0];
		
		let geomFactory = new jsts.geom.GeometryFactory();
		let jstsCoordinates = coordinatesOfGeometry.map(function(pt) {
			return new jsts.geom.Coordinate(pt[0], pt[1]);
		});

		let linearRing = geomFactory.createLinearRing(jstsCoordinates);
		// turns out you can just ask if it is simple... i.e. does not have any self intersections.
		console.log(linearRing.isSimple()); //so this is false
		//  false = the polygon is in a irregular shape (there is an intersection)
		//  true = the polygon is in a normal shape
		let polygonSelfInterct :any = linearRing.isSimple();
		if(polygonSelfInterct==false){
			console.log('Forme polygonale irrégulière ! ');
			this.toastCtrl.create({ message: "Forme polygonale irrégulière !", duration: 3000, position: 'middle' }).present();
			return -1;
        }else{
			return 1;
		}
	}

	// disable the Select Control
	disableSelectControl(){
		let self = this;
		let MarkrtSty = self.mode=="new"? self.MarkerStyle: self.MarkerBD;
		let LinestringSty = self.mode=="new"? self.LineStringStyle: self.LineStringBD;
		let PolygonSty = self.mode=="new"? self.PolygonStyle: self.PolygonBD;
		if (self.boolSelect){
			self.drawnItems.eachLayer( function (lyr){
				if ((lyr instanceof L.Polyline) && !(lyr instanceof L.Polygon))  lyr.setStyle(LinestringSty);
				if (lyr instanceof L.Polygon) lyr.setStyle(PolygonSty);
				if (lyr instanceof L.Marker) lyr.setIcon(MarkrtSty);
			});
			$( ".selectCtrl" ).css( "backgroundImage", "url(img/noselect.png)" );
			this.boolSelect = false;
		}
	}
	
	// disable the Edit Control
	disableEditControl(){
		if (this.boolEdit){
               if(this.workingLayer){
					if (this.workingLayer instanceof L.Marker) {
						this.workingLayer.dragging.disable();
					}else{
						this.workingLayer.snapediting.disable();                    
					}
               }
               $( ".editCtrl" ).css( "backgroundImage", "url(img/noedit.png)" );
               this.boolEdit = false;
        }
	}
	
	// Bind events to layer when drawned:
	layerClick(layer){
		let self = this;
		layer.on('click', function(e){
			console.log(e);
			console.log(e.target.editing._leaflet_id);

			// Control de Selection activé :D
			let MarkrtSty = self.mode=="new"? self.MarkerStyle: self.MarkerBD;
			let LinestringSty = self.mode=="new"? self.LineStringStyle: self.LineStringBD;
			let PolygonSty = self.mode=="new"? self.PolygonStyle: self.PolygonBD;
			
			if (self.boolSelect){
				self.drawnItems.eachLayer( function (lyr){
					if ((lyr instanceof L.Polyline) && !(lyr instanceof L.Polygon))  lyr.setStyle(LinestringSty);
					if (lyr instanceof L.Polygon) lyr.setStyle(PolygonSty);
					if (lyr instanceof L.Marker) lyr.setIcon(MarkrtSty);
				});
				if ((e.target instanceof L.Polyline) && !(e.target instanceof L.Polygon))  e.target.setStyle(self.LineStringSelected);
				if(e.target instanceof L.Polygon) e.target.setStyle(self.PolygonSelected);
				if(e.target instanceof L.Marker) e.target.setIcon(self.MarkerSelected);

				for(let i= 0; i< self.collectedElements.length; i++){
					if(self.collectedElements[i].id==e.target.editing._leaflet_id){
						if(self.collectedElements[i].data==null){
							self.openQuestListe(self.collectedElements[i].id);
						}else{
							let alert = self.alertCtrl.create({
								title: 'Voulez-vous changer le formulaire pour cette entité?',
								message: '',
								// id: "ouiClass",
								buttons: [
									{ text:'Non', handler: () => { 
										self.openForm(self.collectedElements[i].id, self.collectedElements[i].form, self.collectedElements[i].data);
									 }  },
									{ text: 'Oui',  handler: () => {
										 self.openQuestListe(self.collectedElements[i].id); 
									}  }
								]
							});
							alert.present();
							// self.openForm(self.collectedElements[i].id, self.collectedElements[i].form, self.collectedElements[i].data);
						}
					}
				}
			}
			// Control d'Edition activé :D
			if (self.boolEdit){
				if(self.workingLayer){
					if (self.workingLayer instanceof L.Marker) {
						self.workingLayer.dragging.disable();
					}else{
						self.workingLayer.snapediting.disable();		
					}
				}


				self.workingLayer = e.target;
				e.target.options.editing || (e.target.options.editing = {});
				if (layer instanceof L.Marker) {
					self.workingLayer.dragging.enable();
				}else{
					e.target.snapediting = new L.Handler.PolylineSnap(self.map, e.target);
					e.target.snapediting.addGuideLayer(self.drawnItems);
					e.target.snapediting.enable();
				}

			}

        });
	}



}


