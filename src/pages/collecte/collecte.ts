import { Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

declare const L:any;
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
	drawnItems: any;	
	modalQuestList: any;
	constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl : ModalController) {}

	ionViewDidLoad() {
		console.log('ionViewDidLoad CollectePage');
	}

	ionViewDidEnter() {
		// this.loadmap();
	}

	ngOnInit(){
		this.loadmap();
	}

	public openQuestListe(){
		let quest = [{ "name":"John", "id":30},{ "name":"ayoub", "id":29 },{ "name":"marouane", "id":25}];
		let data = { message : quest };
		this.modalQuestList = this.modalCtrl.create('ModalPage', data, { cssClass:"QuestListe" });
		this.modalQuestList.present();

		this.modalQuestList.onDidDismiss((data) => {
			console.log("I have dismissed.");
			console.log(data);
		});

		this.modalQuestList.onWillDismiss((data) => {
			console.log("I'm about to dismiss");
			console.log(data);
		});
	} 

 	loadmap() {

		// ---------------------------------------------------------------------------------//
		// ---------------------------:: Variables Declatation :: --------------------------//
		let drawnItems = new L.FeatureGroup();

		// ---------------------------------------------------------------------------------//
		// ---------------------------:: Initiation of the map :: --------------------------//
		let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
		let mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
		let googleUrl = 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}';

		let grayscale   =new L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr});
		let	streets  =new L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});
		let	google  =new L.tileLayer(googleUrl, {attribution: "google"});

		let map = new L.map('map', {
		center: [39.73, -104.99],
		zoom: 10,
		tap: false,
		zoomControl: false,
		layers: [streets]
		});

		map.doubleClickZoom.disable();
		drawnItems.addTo(map);
		// ---------------------------------------------------------------------------------//
		// --------------------------:: Controllers of the map :: --------------------------//

		// ---------------:: Layers Control ::-------------- //
		let baseLayers = {
		"Grayscale": grayscale,
		"Streets": streets,
		"Google": google
		};
		let overlays = {
		"Dessins": drawnItems
		};
		L.control.layers(baseLayers, overlays).addTo(map);

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
		map.addControl(zoomHome);

		var self = this; // store here

		// ---------------:: Save Control ::-------------- //
		let saveControl = L.Control.extend({
			options: {
		    position: 'topright' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
			container.style.backgroundColor = 'white';
			container.style.width = '36px';
			container.style.height = '36px';
			container.style.backgroundImage = "url(img/save.png)";
			container.style.backgroundRepeat="no-repeat";
			container.style.backgroundSize = "36px 36px";

			container.onclick = function(){
				self.openQuestListe();
			}
			return container;
		}
		});

		let saveCtrl = new saveControl();
		map.addControl(saveCtrl);
		// ---------------:: Draw Control ::-------------- //
		let optionsDraw = {
			snappable: true,
			snapDistance: 20,
			snapMiddle: true,    // allow snapping to the middle of segments
			allowSelfIntersection: false,  // self intersection
			finishOn: 'dblclick',
			templineStyle: {       // the lines between coordinates/markers
				color: '#00cccc',
			},    
			hintlineStyle: {  // the line from the last marker to the mouse cursor
				color: '#51ffff',
				dashArray: [5, 5],
			},
			cursorMarker: true ,   // show a marker at the cursor
			markerStyle: {    // custom marker style (only for Marker draw)
				opacity: 1,
				draggable: true,
			}
		}

		let options = {
			position: 'topleft', 
			drawMarker: true, 
			drawPolyline: true, 
			drawRectangle: false, 
			drawPolygon: true, 
			drawCircle: false, 
			cutPolygon: true, 
			editMode: false,
			removalMode: true
		};

		map.pm.addControls(options);

		map.pm.setPathOptions({
		color: 'black',
		fillColor: '#808080',
		fillOpacity: 0.3,
		});

		map.pm.enableDraw('Poly', optionsDraw);
		map.pm.disableDraw('Poly');
		map.pm.enableDraw('Line', optionsDraw);
		map.pm.disableDraw('Line');
		map.pm.enableDraw('Marker', optionsDraw);
		map.pm.disableDraw('Marker');

		// map.pm.Draw.getShapes();
		// ---------------------------------------------------------------------------------//
		// ----------------------:: Gestion of event on the map :: -------------------------//

		map.on('pm:drawstart', function(e) {
		// console.info(e.shape); // the name of the shape being drawn (i.e. 'Circle')
		// console.info(e.workingLayer); // the leaflet layer displayed while drawing
		});

		// listen to when a new layer is created
		map.on('pm:create', function(e) {
			console.info(e.shape); // the name of the shape being drawn (i.e. 'Circle')
			console.info(e.layer); // the leaflet layer created
			let latlngs:any;
			if(e.shape == 'Marker'){
				latlngs = e.layer._latlng;
			}
			if(e.shape == 'Line'){
				latlngs = e.layer._latlng;
			}
			if(e.shape == 'Poly'){
				latlngs = e.layer._latlng;
			}
			drawnItems.addLayer(e.layer);
			// map.pm.Draw.getShapes();
		});
	}

	openFormio(){
		let formData = {
		  components: [
		    {
		      type: 'textfield',
		      key: 'firstName',
		      label: 'First Name',
		      placeholder: 'Enter your first name.',
		      input: true
		    },
		    {
		      type: 'textfield',
		      key: 'lastName',
		      label: 'Last Name',
		      placeholder: 'Enter your last name',
		      input: true
		    },
		    {
		      type: 'button',
		      action: 'submit',
		      label: 'Submit',
		      theme: 'primary'
		    }
		  ]
		};
		let formio = new  Formio.createForm(document.getElementById('formio'), formData, {
				language: 'en',  i18n: { 'en': { 
				Submit: 'Sauvegarder',
				error : "Veuillez corriger les erreurs mentionnées avant de soumettre.",
				cancel:'Vider',
				next:'Suivant',
				previous : "Précedent",
				complete:'Enregistrement avec succès'
			}}
		});

		formio.then(function(form) {        
			form.on('submit', function(submission) {

			});
		});
	}

}


