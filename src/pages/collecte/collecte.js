var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
var CollectePage = /** @class */ (function () {
    function CollectePage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
    }
    CollectePage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad CollectePage');
        // $('.leaflet-control-zoom-out').click();
    };
    CollectePage.prototype.ionViewDidEnter = function () {
        this.loadmap();
    };
    CollectePage.prototype.presentPopover = function (myEvent) {
        var popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
            ev: myEvent
        });
    };
    CollectePage.prototype.loadmap = function () {
        // ---------------------------------------------------------------------------------//
        // ---------------------------:: Variables Declatation :: --------------------------//
        var drawnItems = new L.FeatureGroup();
        // ---------------------------------------------------------------------------------//
        // ---------------------------:: Initiation of the map :: --------------------------//
        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
        var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        var googleUrl = 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}';
        var grayscale = new L.tileLayer(mbUrl, { id: 'mapbox.light', attribution: mbAttr });
        var streets = new L.tileLayer(mbUrl, { id: 'mapbox.streets', attribution: mbAttr });
        var google = new L.tileLayer(googleUrl, { attribution: "google" });
        var map = new L.map('map', {
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
        var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets,
            "Google": google
        };
        var overlays = {
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
                var controlName = 'gin-control-zoom', container = L.DomUtil.create('div', controlName + ' leaflet-bar'), options = this.options;
                this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle, controlName + '-in', container, this._zoomIn);
                this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle, controlName + '-home', container, this._zoomHome);
                this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle, controlName + '-out', container, this._zoomOut);
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
                var map = this._map, className = 'leaflet-disabled';
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
        var zoomHome = new L.Control.zoomHome();
        map.addControl(zoomHome);
        // ---------------:: Save Control ::-------------- //
        var saveControl = L.Control.extend({
            options: {
                position: 'topright' //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                container.style.backgroundColor = 'white';
                container.style.width = '36px';
                container.style.height = '36px';
                container.style.backgroundImage = "url(img/save.png)";
                container.style.backgroundRepeat = "no-repeat";
                container.style.backgroundSize = "36px 36px";
                container.onclick = function () {
                    this.presentPopover($event);
                };
                return container;
            }
        });
        var saveCtrl = new saveControl();
        map.addControl(saveCtrl);
        // ---------------:: Draw Control ::-------------- //
        var optionsDraw = {
            snappable: true,
            snapDistance: 20,
            snapMiddle: true,
            allowSelfIntersection: false,
            finishOn: 'dblclick',
            templineStyle: {
                color: '#00cccc',
            },
            hintlineStyle: {
                color: '#51ffff',
                dashArray: [5, 5],
            },
            cursorMarker: true,
            markerStyle: {
                opacity: 1,
                draggable: true,
            }
        };
        var options = {
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
        map.on('pm:drawstart', function (e) {
            // console.info(e.shape); // the name of the shape being drawn (i.e. 'Circle')
            // console.info(e.workingLayer); // the leaflet layer displayed while drawing
        });
        // listen to when a new layer is created
        map.on('pm:create', function (e) {
            console.info(e.shape); // the name of the shape being drawn (i.e. 'Circle')
            console.info(e.layer); // the leaflet layer created
            var latlngs;
            if (e.shape == 'Marker') {
                latlngs = e.layer._latlng;
            }
            if (e.shape == 'Line') {
                latlngs = e.layer._latlng;
            }
            if (e.shape == 'Poly') {
                latlngs = e.layer._latlng;
            }
            drawnItems.addLayer(e.layer);
            // map.pm.Draw.getShapes();
        });
    };
    __decorate([
        ViewChild('map'),
        __metadata("design:type", ElementRef)
    ], CollectePage.prototype, "mapContainer", void 0);
    CollectePage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-collecte',
            templateUrl: 'collecte.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams])
    ], CollectePage);
    return CollectePage;
}());
export { CollectePage };
//# sourceMappingURL=collecte.js.map