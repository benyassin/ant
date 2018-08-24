/*
*
* Controller : CarteCtrl ( Controlleur de la carte).
*
* Description:
* Le controlleur 'CarteCtrl' est utlisé pour gérer toutes les input et les output de la carte de Leaflet mobile
* Il comprends un ensemble de fonctions et procédures allant de la chargement de la carte (différents
* couches et fonds de carte présents dans la carte)  jusqu'au dessin de différents entités géographiques (point;
* polyline; polygon) et leurs stockage en interne (sur le dispositif mobile) et leurs synchronisation vers le Cloud.
*
* Copyright: BENYASSIN Ayoub - GEOCODING.
*
* Date de modification : 23-01-2017.
*
*/

app.controller("CollCtrl", function($scope, leafletData,$timeout,$location,$ionicGesture,$rootScope,$ionicLoading,$ionicPopup,
  $ionicModal,$state,$window,$cordovaSQLite,$ionicSideMenuDelegate,ionicToast, $ionicHistory, $stateParams, $ionicPlatform,
  $ionicPopover,$compile,$parse, $cordovaGeolocation,$q, $ionicSlideBoxDelegate, $cordovaCamera, $localStorage, $ionicScrollDelegate, ConnectivityMonitor ) {

// $scope.lastViewTitle = $ionicHistory.backView().stateName;
// console.info("$scope.lastViewTitle= "+$ionicHistory.backView().stateName);
// console.info("$ionicHistory.backView() = "+JSON.stringify($ionicHistory.backView()));
// console.info("$ionicHistory..backTitle() = "+$ionicHistory.backTitle());
// console.info("$localStorage.tabActive = "+$localStorage.tabActive);
// console.info("$ionicHistory.viewHistory().views = "+JSON.stringify($ionicHistory.viewHistory().views));
// console.info("$ionicHistory.viewHistory().histories = "+JSON.stringify($ionicHistory.viewHistory().histories));

  if($localStorage.tabActive=="menu"){

  }else{
        $timeout(function () {
              $( "#editBtn" ).click();
        }, 3000);

  }

 $ionicHistory.clearCache();


$scope.showAdminBtn = false;
$timeout(function () {
       $scope.showAdminBtn = true;
}, 3800);


var sidebar;
$scope.couchesOverlays;


$scope.boolScroll = false;
// $scope.showAdminBtn = false;
//---------------------------------------------------------------------------------//
// Adaptation du drawController selon les questionnaires du projet sélectionné
// Adaptation du drawController selon les questionnaires du projet sélectionné

var boolFormPoint=false;
var boolFormPolyline=false;
var boolFormPolygon=false;
// $scope.boolFormNone=false;
var optionsDraw;

$scope.loginG=$localStorage.loginParam;
$scope.userId = $localStorage.userIdParam;

// alert(" $localStorage.tuileChoisie "+$localStorage.tuileChoisie);
// alert(" $localStorage.tuileChoisie "+$cordova.file.externalRootDirectory+"Ortho/"+$localStorage.tuileChoisie);
console.info(" $scope.userId"+$scope.userId);

console.info("$stateParams.numCollecte");
console.info($stateParams.numCollecte);
console.info("$stateParams.mode");
console.info($stateParams.mode);

function loadProjectData(){
        $scope.selectedProject="";
        var querySelectedProject = " SELECT _id, support FROM projets WHERE checkd =1 AND userId="+$scope.userId;

               $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {

                      if(res.rows.length > 0) {
                              for (var i = 0; i < res.rows.length ; i++) {
                                     $scope.selectedProject = res.rows.item(i)._id;
                                     $scope.support = res.rows.item(i).support;
                                     console.info(typeof($scope.support));
                                     // if(typeof($scope.support)!="string") {
                                             
                                             $scope.hasSupport = ($scope.support !="")? true : false;
                                             if($scope.hasSupport){
                                                $scope.typeSupport = JSON.parse($scope.support).type;
                                                console.info($scope.typeSupport);
                                             }else{
                                                $scope.typeSupport = "";
                                             }
                                             console.info($scope.hasSupport);
                                     // }

                                      var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+$scope.selectedProject+"'";
                                      console.info(querySelectForms);

                                      $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                                             console.info(res.rows.length);
                                             if(res.rows.length > 0) {
                                                    for (var i = 0; i < res.rows.length ; i++) {
                                                            var  id = res.rows.item(i)._id;
                                                            var  name = res.rows.item(i).name;
                                                            var  geometry = res.rows.item(i).geometry;
                                                            var  id_fields = res.rows.item(i).id_fields;
                                                            var  fields = res.rows.item(i).fields;
                                                            if(geometry=="point"){
                                                                   $scope.idFormPoint=id;
                                                                   $scope.nameFormPoint=name;
                                                                   $scope.geometryFormPoint=geometry;
                                                                   $scope.idFieldsFormPoint=id_fields;
                                                                   $scope.fieldsFormPoint=fields;
                                                                   boolFormPoint=true;
                                                            }
                                                            if(geometry=="polyline"){
                                                                   $scope.idFormPolyline=id;
                                                                   $scope.nameFormPolyline=name;
                                                                   $scope.geometryFormPolyline=geometry;
                                                                   $scope.idFieldsFormPolyline=id_fields;
                                                                   $scope.fieldsFormPolyline=fields;
                                                                   boolFormPolyline=true;
                                                            }
                                                            if(geometry=="polygone"){
                                                                   $scope.idFormPolygon=id;
                                                                   $scope.nameFormPolygon=name;
                                                                   $scope.geometryFormPolygon=geometry;
                                                                   $scope.idFieldsFormPolygon=id_fields;
                                                                   $scope.fieldsFormPolygon=fields;
                                                                   boolFormPolygon=true;
                                                            }
                                                             if(geometry=="none"){
                                                                   $scope.idFormNone=id;
                                                                   $scope.nameFormNone=name;
                                                                   $scope.geometryFormNone=geometry;
                                                                   $scope.idFieldsFormNone=id_fields;
                                                                   $scope.fieldsFormNone=fields;
                                                                   $scope.boolFormNone=true; // Pour afficher le boutton du 'Questionnaire d'Identification'.
                                                            }
                                                             // $localStorage.formTest = JSON.parse($scope.fieldsFormPolygon);
                                                    }
                                                    if($stateParams.mode=="m"){
                                                           console.info($stateParams.numCollecte);
                                                           $scope.numeroCollecte = $stateParams.numCollecte;
                                                            if($localStorage.tabActive=="menu"){
                                                                   loadDynamicDataBD($stateParams.numCollecte);
                                                            }else{
                                                                    loadTempData($scope.numeroCollecte, $stateParams.mode).then(function(){

                                                                          // $timeout(function () {
                                                                          //         map.removeLayer(drawnItems);
                                                                          //         map.removeLayer(SupportLayer);
                                                                          //         map.addLayer(SupportLayer);
                                                                          //         map.addLayer(drawnItems);
                                                                          // }, 1000);

                                                                    });
                                                            }

                                                    }else{
                                                           getNewNumeroToCollecte($scope.selectedProject).then(function() {
                                                                   console.info("$scope.numeroCollecte= "+$scope.numeroCollecte);
                                                                   loadTempData($scope.numeroCollecte, $stateParams.mode).then(function(){

                                                                          // $timeout(function () {
                                                                          //   leafletData.getMap().then(function(map) {
                                                                          //         // map.removeLayer(drawnItems);
                                                                          //         // map.removeLayer(SupportLayer);
                                                                          //         // map.addLayer(SupportLayer);
                                                                          //         // map.addLayer(drawnItems);
                                                                          //       });
                                                                          // }, 1000);

                                                                    });
                                                           });
                                                    }

                                             }

                                             leafletData.getMap().then(function(map) {

                                                    optionsDraw = {
                                                           position:'topleft',
                                                           edit: {
                                                                featureGroup: drawnItems,
                                                                polygon : {
                                                                  allowIntersection : false
                                                                },
                                                                marker:{
                                                                  guideLayers: $scope.guideLayers
                                                               },
                                                                polyline: {
                                                                   guideLayers: $scope.guideLayers
                                                                },
                                                                remove:true,
                                                                edit:false
                                                              },
                                                           draw: {
                                                               rectangle: false,
                                                               circle: false,
                                                               polygon: boolFormPolygon,
                                                               polyline: boolFormPolyline,
                                                               marker: boolFormPoint,
                                                              }
                                                      };

                                                    if(!boolFormPolyline){
                                                           optionsDraw.draw.polyline= {
                                                                   metric:true,
                                                                   shapeOptions: {
                                                                          color: 'red',
                                                                          weight: 3,
                                                                          opacity: 1
                                                                   },
                                                                   guideLayers: $scope.guideLayers
                                                              }
                                                    }

                                                    if(boolFormPolygon){
                                                           optionsDraw.draw.polygon= {
                                                                   allowIntersection: false, // Restricts shapes to simple polygons
                                                                   drawError: {
                                                                          color: '#e1e100', // Color the shape will turn when intersects
                                                                          message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                                                                   },
                                                                   shapeOptions: {
                                                                          weight: 2,
                                                                          opacity: 0.4,
                                                                          color: 'black',
                                                                          dashArray: '3',
                                                                          fillOpacity: 0.3,
                                                                          fillColor: 'blue'
                                                                   },
                                                                   guideLayers: $scope.guideLayers
                                                           }
                                                    }

                                                    L.DrawToolbar.prototype.options={
                                                            marker: {},
                                                            polyline : {},
                                                            polygon: {}
                                                    };
                                                    L.DrawToolbar.prototype.getModeHandlers= function (map) {
                                                            var arrayModeHandlers = [];
                                                            if(boolFormPoint){
                                                                    arrayModeHandlers.push({
                                                                          enabled: this.options.marker,
                                                                          handler: new L.Draw.Marker(map, this.options.marker),
                                                                          title: L.drawLocal.draw.toolbar.buttons.marker
                                                                      });
                                                             }
                                                             if(boolFormPolyline){
                                                                    arrayModeHandlers.push({
                                                                          enabled: this.options.polyline,
                                                                          handler: new L.Draw.Polyline(map, this.options.polyline),
                                                                          title: L.drawLocal.draw.toolbar.buttons.polyline
                                                                      });
                                                             }
                                                             if(boolFormPolygon){
                                                                     arrayModeHandlers.push({
                                                                          enabled: this.options.polygon,
                                                                          handler: new L.Draw.Polygon(map, this.options.polygon),
                                                                          title: L.drawLocal.draw.toolbar.buttons.polygon
                                                                      });
                                                             }
                                                            return arrayModeHandlers;
                                                    };
                                                    var optionsDrawParcelles = {
                                                            position: 'bottomright',
                                                            draw: {
                                                              polygon: {
                                                                allowIntersection: false, // Restricts shapes to simple polygons
                                                                drawError: {
                                                                    color: '#e1e100', // Color the shape will turn when intersects
                                                                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                                                                },
                                                                    shapeOptions: {
                                                                        weight: 2,
                                                                        opacity: 1,
                                                                        color: 'black',
                                                                        dashArray: '3',
                                                                        fillOpacity: 0,
                                                                        fillColor: 'red'
                                                                    },
                                                                     guideLayers: $scope.guideLayers
                                                                  },
                                                               polyline: {
                                                                    metric:true,
                                                                    shapeOptions: {
                                                                         color: '#931993',
                                                                         weight: 3,
                                                                         opacity: 1
                                                                    },
                                                                    guideLayers: $scope.guideLayers
                                                                },
                                                               // polygon: false,
                                                                polygon: boolFormPolygon,
                                                                polyline: boolFormPolygon,
                                                                circle: false, // Turns off this drawing tool
                                                                rectangle: false,
                                                                marker: false
                                                            },
                                                            edit: {
                                                                featureGroup: drawnItemsParcelles, //REQUIRED!!
                                                                remove: boolFormPolygon,
                                                                edit:false
                                                            }
                                                    };
                                                    drawControl =  new L.Control.Draw(optionsDraw);
                                                    drawControlParcelles =  new L.Control.Draw(optionsDrawParcelles);
                                             });

                                     }, function (err) {
                                            console.info("err => "+err+ " "+querySelectForms);
                                     });
                                      //--------------------------------------------------------------------------------------------------------------------------------------------------------------//

                              }

                       }else{
                               // Table des Forms est vide !!
                       }

               }, function (err) {
                      console.info(err);
                      console.info("err => "+querySelectedProject);
               });
}

var communesLayer;
var communesGeoJson;
$scope.guideLayersCommunes = [];

function loadCommune(){

        var deferred = $q.defer();
        leafletData.getMap().then(function(map) {
               $scope.selectedRegion="";
               $scope.selectedProvince="";
               $scope.selectedCommune="";
               var querySelectedCommune = " SELECT id_region, id_province, id_commune, name, id_projet, geometry FROM communes WHERE checkd =1 AND userId="+$scope.userId;
               console.info(querySelectedCommune);
               $cordovaSQLite.execute(db, querySelectedCommune).then(function(res) {
                console.info(res.rows.length);
                     if(res.rows.length > 0) {
                              // console.info(JSON.stringify(res.rows.item(0)));
                             $scope.selectedRegion = res.rows.item(0).id_region;
                             $scope.selectedProvince = res.rows.item(0).id_province;
                             $scope.selectedCommune = res.rows.item(0).id_commune;
                             console.info($scope.selectedRegion);
                             console.info($scope.selectedProvince);
                             console.info($scope.selectedCommune);
                             console.info(JSON.parse(res.rows.item(0).geometry));
                              communesGeoJson = JSON.parse(res.rows.item(0).geometry);
                              communesLayer= L.geoJson(JSON.parse(res.rows.item(0).geometry), {
                                    name: 'Communes',
                                    style: {color: "#FFF", weight: 3, opacity: 1, fillOpacity: 0},
                                    onEachFeature: function(feature, layer) {
                                             $scope.guideLayers.push(layer);
                                             $scope.guideLayersCommunes.push(layer);
                                             var label = L.marker(layer.getBounds().getCenter(), {
                                                    icon: L.divIcon({
                                                           className: 'labelCOMMUNE',
                                                           html: res.rows.item(0).name
                                                    })
                                            });
                                            markersCOMMUNE.addLayer(label);
                                    }

                            }).addTo(map);
                              // $scope.guideLayers = $scope.guideLayers.concat($scope.guideLayersCommunes);
                            // });

                             map.fitBounds(communesLayer.getBounds());
                             deferred.resolve();
                     }else{

                     }
               });

        });

        return deferred.promise;
}

var tileIndexSupport;
var tileLayerSupport;
var SupportLayer;

function getIdPropertySupport(data){
        // myObj = JSON.parse(res.rows.item(i).support).properties;
        var myObj = JSON.parse(data).properties;
        var id;
        for (x in myObj) {
               var str ="";
               str+=x;
               if(str.includes("id_echantillon") && str!="id_region" && str!="id_province" && str!="id_commune"){
                       console.info(x);
                      id = ""+x;
               }
        }
        return id;
}

styleSupport = {
      weight: 2,
      opacity: 1,
      color: 'yellow',
      dashArray: '3',
      fillOpacity: 0.3,
      fillColor: 'grey'
};
 var listSupports = [];
function loadSupports(){
        leafletData.getMap().then(function(map) {

               var querySelectedSegment = " SELECT cid, id, id_commune, support FROM supports WHERE id_commune ="+ $scope.selectedCommune+" AND userId="+$scope.userId;
               console.info(querySelectedSegment);
               $cordovaSQLite.execute(db, querySelectedSegment).then(function(res) {
                console.info(res);
                console.info(res.rows.length);
                     if(res.rows.length > 0) {
                              var geojson = {};
                              geojson['type'] = 'FeatureCollection';
                              geojson['features'] = [];
                              var featureAttribute =  getIdPropertySupport(res.rows.item(0).support);
                              for(var i=0; i< res.rows.length; i++){
                                     console.info(JSON.parse(res.rows.item(i).support));
                                     geojson['features'].push(JSON.parse(res.rows.item(i).support));
                                      var obj = {id:  res.rows.item(i).id, n: 'Support N°. ' + JSON.parse(res.rows.item(i).support).properties[featureAttribute], support: JSON.parse(res.rows.item(i).support).properties};
                                      console.info(obj);
                                      listSupports.push(obj);
                                      // listSupports.push({id:  res.rows.item(i).id, n: 'Support N°. ' + res.rows.item(i).support[featureAttribute], support: res.rows.item(i).support});
                              }

                              // console.info(geojson);
                              // console.info(JSON.stringify(geojson));
                              // map.createPane('supp');
                              // map.getPane('supp').style.zIndex = 300;

                              SupportLayer= L.geoJson(geojson, {
                                    name: 'Supports',
                                    // pane: 'tilePane',
                                    onEachFeature: function(feature, layer) {
                                            layer.setStyle(styleSupport);
                                             // listSupports.push({id:  feature.properties, n: 'Support N°. ' + feature.properties[featureAttribute]});
                                             // listSupports.push({id:  id, n: 'Support N°. ' + feature.properties[featureAttribute], support: feature.properties});
                                             var label = L.marker(layer.getBounds().getCenter(), {
                                                    icon: L.divIcon({
                                                           className: 'labelSupports',
                                                           html: feature.properties[featureAttribute]
                                                    })
                                            });
                                             $scope.guideLayers.push(layer);
                                            markersSupport.addLayer(label);
                                    }
                              }).addTo(map);


                              // map.hasLayer()
                              // map.removeLayer(drawnItems);
                              // map.addLayer(SupportLayer);
                              // map.addLayer(drawnItems);
                              // drawnItems.bringToFront();
                              // SupportLayer.setZIndex(9);
                              // map.removeLayer(drawnItems);
                              // map.addLayer(drawnItems);
                              // drawnItems.setZIndex(99);
                              // SupportLayer.bringToBack();
                              // drawnItems.bringToFront();
                              // SupportLayer.bringToBack();

                             // tileIndexSupport = geojsonvt(geojson, tileOptionsSupport);
                             // tileLayerSupport = L.canvasTiles()
                             //          .params({ debug: false, padding: 3 })
                             //          .drawing(drawingOnCanvasSegment)
                             // tileLayerSupport.addTo(map);

                     }
               });

        });
}

function loadSupportsTabulaire(){
               var querySelectedSegment = " SELECT cid, id, id_commune, support FROM supports WHERE id_commune ="+ $scope.selectedCommune+" AND userId="+$scope.userId;
               console.info(querySelectedSegment);
               $cordovaSQLite.execute(db, querySelectedSegment).then(function(res) {
                      console.info(res);
                      console.info(res.rows.length);
                       if(res.rows.length > 0) {
                              for(var i=0; i< res.rows.length; i++){
                                     var supp = JSON.parse(JSON.parse(res.rows.item(i).support));
                                     var obj = {};
                                      if(supp["id_echantillon2"]==undefined){
                                           obj = {id:  res.rows.item(i).id, id_echantillon: supp["id_echantillon"]};
                                      }else{
                                           obj = {id:  res.rows.item(i).id, id_echantillon: supp["id_echantillon"], id_echantillon2: supp["id_echantillon2"]};
                                      }
                                      // var obj = {id:  res.rows.item(i).id, support: supp["id_echantillon"]};
                                      console.info(obj);
                                      // listSupports.push(obj);
                              }
                       }
               });
}

var tileIndexParcelle;
var tileLayerParcelle;
var parcelleLayer;

function getNewNumeroToCollecte(id_projet){
        console.info("id_projet="+id_projet);
        var deferred = $q.defer();
        $scope.numeroCollecte=0;
        var querySelectNumeroCollecte = " SELECT MAX(numero) as max FROM dynamicData WHERE id_projet ='"+id_projet+"' AND userId="+$scope.userId;
        console.info(querySelectNumeroCollecte);
        $cordovaSQLite.execute(db, querySelectNumeroCollecte).then(function(res) {
               console.info(res.rows.length);
               if(res.rows.length > 0) {
                      if(res.rows.item(0).max==null){
                              $scope.numeroCollecte = 1;
                      }else{
                              $scope.numeroCollecte = res.rows.item(0).max;
                              $scope.numeroCollecte++;
                      }
                      console.info("$scope.numeroCollecte= "+$scope.numeroCollecte);
                      deferred.resolve();
               }else{
                    $scope.numeroCollecte = 1;
               }
        });
        return deferred.promise;
}

function loadCouchData(comm){
        var sqlData= "SELECT id_projet, numero, userId, data, sync, id_collecte FROM dynamicData WHERE id_projet ='"+$scope.selectedProject+"' AND id_commune='"+comm+"' AND userId="+$scope.userId;
        if($stateParams.mode=="m"){
                sqlData +=" AND numero != '"+$stateParams.numCollecte+"' ";
        }
        console.info(sqlData);
        $cordovaSQLite.execute(db, sqlData).then(function(res) {
               console.info(res.rows.length);
               if(res.rows.length > 0) {
                       for (var i = 0; i < res.rows.length ; i++) {
                              var input =  JSON.parse(res.rows.item(i).data);
                              for(var k = 0; k< input.length; k++){
                                     var data = input[k].data;
                                     //POINT
                                     console.info(JSON.stringify(data));
                                     if(input[k].form==$scope.idFieldsFormPoint){
                                             for(var b = 0; b<data.length; b++){
                                                    if(res.rows.item(i).sync==1){
                                                           drawDynamicDataSupport("POINT", data[b].gjson,  (res.rows.item(i).id_collecte+"-"+res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }else{
                                                           drawDynamicDataSupport("POINT", data[b].gjson,  (res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }
                                             }
                                     }
                                     // POLYLINE:
                                     if(input[k].form==$scope.idFieldsFormPolyline){
                                             for(var b = 0; b<data.length; b++){
                                                    if(res.rows.item(i).sync==1){
                                                           drawDynamicDataSupport("POLYLINE", data[b].gjson, (res.rows.item(i).id_collecte+"-"+res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }else{
                                                           drawDynamicDataSupport("POLYLINE", data[b].gjson, (res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }
                                             }
                                     }
                                     //POLYGON
                                     if(input[k].form==$scope.idFieldsFormPolygon){
                                             for(var b = 0; b<data.length; b++){
                                                    if(res.rows.item(i).sync==1){
                                                           drawDynamicDataSupport("POLYGONE", data[b].gjson, (res.rows.item(i).id_collecte+"-"+res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }else{
                                                           drawDynamicDataSupport("POLYGONE", data[b].gjson, (res.rows.item(i).userId+"-"+res.rows.item(i).numero), res.rows.item(i).sync);
                                                    }
                                             }
                                     }
                              }
                      }

               }else{
                    // BD des dynamicData est vide !!
               }

        }, function (err) {
               console.log('ERR SQL sqlData= '+sqlData);
        });
}

// ------------------------------------------------------------------------------------------------ //

$ionicPlatform.registerBackButtonAction(function (event) {
    event.preventDefault();
}, 100);

var Projection26191 = "+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs";
// var ProjectionUTM28 = "+proj=utm +zone=28 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
// var ProjectionUTM29 = "+proj=utm +zone=29 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
// var ProjectionUTM30 = "+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ";

////////////////////////////////////////////////////////////////////////////////////

var allOverlaysMarkers;

// Initiate the draw controller (dealing with error : map freezing when initiate):

leafletData.getMap().then(function(map) {

        var polylineDrawer = new L.Draw.Polyline(map);
        polylineDrawer.enable();

        $timeout(function () {
               polylineDrawer.disable();

        }, 1000);


          var extent = bbox(utm);
          var Pt1 = new L.latLng(extent[1], extent[0]);
          var Pt2 = new L.latLng(extent[3], extent[2]);
           bounds = new L.LatLngBounds(Pt1, Pt2);
          // map.fitBounds(bounds);
          // map.setMinZoom(7);
          tileLayerUTM.addTo(map);
          markerPoint.addTo(map);
          markerPolyline.addTo(map);
          markerPolygon.addTo(map);
          markerPointBD.addTo(map);
          markerPolylineBD.addTo(map);
          markerPolygonBD.addTo(map);

          markerPointSupport.addTo(map);
          markerPolylineSupport.addTo(map);
          markerPolygonSupport.addTo(map);

          // alert("$localStorage.tuileChoisie= "+$localStorage.tuileChoisie);

          $ionicPlatform.ready(function() {
                loadProjectData();
                loadCommune().then(function(){
                      console.info("loadSupports");
                      loadCouchData($scope.selectedCommune);

                        if($scope.hasSupport){
                               $scope.couchesOverlays = {
                                       tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
                                       drawnItems: $scope.definedOverlays.drawnItems,
                                       communesLayer: $scope.definedOverlays.communesLayer,
                                       SupportLayer: $scope.definedOverlays.SupportLayer,
                                       // tileLayerParcelle: $scope.definedOverlays.tileLayerParcelle,
                                       allOverlaysMarkers: $scope.definedOverlays.allOverlaysMarkers

                                }
                                  angular.extend($scope.layers.overlays, {
                                             tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
                                             drawnItems: $scope.definedOverlays.drawnItems,
                                             communesLayer: $scope.definedOverlays.communesLayer,
                                             SupportLayer: $scope.definedOverlays.SupportLayer,
                                             // tileLayerParcelle: $scope.definedOverlays.tileLayerParcelle,
                                             allOverlaysMarkers: $scope.definedOverlays.allOverlaysMarkers

                                // }
                               });
                                if($scope.typeSupport=="tabulaire"){
                                        // loadSupportsTabulaire();
                                }else{
                                        loadSupports();
                                }
                              
                               allOverlaysMarkers = L.layerGroup([markersUTM, markersCOMMUNE, markersSupport]);
                        }else{
                                $scope.couchesOverlays = {
                                      tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
                                      drawnItems: $scope.definedOverlays.drawnItems,
                                      communesLayer: $scope.definedOverlays.communesLayer,
                                      allOverlaysMarkers: $scope.definedOverlays.allOverlaysMarkers

                                }
                              angular.extend($scope.layers.overlays, {
                                      tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
                                       drawnItems: $scope.definedOverlays.drawnItems,
                                      communesLayer: $scope.definedOverlays.communesLayer,
                                      allOverlaysMarkers: $scope.definedOverlays.allOverlaysMarkers

                                // }
                               });
                                allOverlaysMarkers = L.layerGroup([markersUTM, markersCOMMUNE]);
                        }


                       // angular.extend($scope, {
                       //         layers: {
                       //                baselayers: {
                       //                       googleHybrid: $scope.definedLayers.googleHybrid
                       //                       // xyz: $scope.definedLayers.xyz
                       //                },
                       //                overlays: $scope.couchesOverlays
                       //         }
                       // });
               });

          });

});

  function dragendEventFunction_POINT(e){
                var numero;
                var arrayPoint  = $scope.points;
                if($stateParams.mode=="m"){ arrayPoint = $scope.pointsBD;}
                for(var i=0; i<arrayPoint.length; i++){
                       if(arrayPoint[i].id==e.target._leaflet_id){
                              numero= arrayPoint[i].numero;
                       }
                }

                //***********************************************************************
                var errorDessin = false;
                var support;
                var inCommune = getCommuneIntersection(e.target, "POINT");
                if($scope.hasSupport){
                       if($scope.typeSupport!="tabulaire"){
                               support = getSupportIntersection(e.target, "POINT");
                               console.info("SUPPORT= "+support);
                               if(support==-1){
                                      ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                      errorDessin = true;
                                      // return;
                               }
                       }else{
                               support = -2;
                              if(inCommune==-1){
                                         ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                         errorDessin = true;
                                         // return;
                               }
                       }                                      
                }else{
                       support = -2;
                       if(inCommune==-1){
                               ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                               errorDessin = true;
                               // return;
                       }
                }

                console.info(errorDessin);
                //***********************************************************************


                var projection= getUTMProjection(e.target, "POINT");
                if(projection=="" || errorDessin==true){
                       ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                       e.target.setLatLng(layerToEdit);
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(e.target._leaflet_id);
                                deplaceMarkerPointBD(e.target, e.target._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(e.target._leaflet_id);
                              deplaceMarkerPoint(e.target, e.target._leaflet_id, numero);
                        }
                       return;
               }else{
                       var Gjson = e.target.toGeoJSON();
                       layerToEdit = e.target._latlng;
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(e.target._leaflet_id);
                                deplaceMarkerPointBD(e.target, e.target._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(e.target._leaflet_id);
                              deplaceMarkerPoint(e.target, e.target._leaflet_id, numero);
                        }

                       // Parcourir les Points pour changer le shape et gjson de l'entité éditée :
                       for (var i = 0; i < arrayPoint.length; i++) {
                               if (arrayPoint[i].id == e.target._leaflet_id) {
                                      latlngs = e.target._latlng;
                                      shape = getShapeOfGeometry(projection, latlngs,"POINT");
                                      arrayPoint[i].shape = shape;
                                      arrayPoint[i].gjson = JSON.stringify(Gjson);
                               }
                       }
               }
                if($stateParams.mode=="m"){
                       $scope.pointsBD = arrayPoint;
               }else{
                       $scope.points = arrayPoint;
               }

               valider_Geometrie_Informations_Feature_POINT(selectedFeature);
       }


function loadTempData(numCollecte, mode){
        // var sqlTempData = "tempData ( id text, numCollecte text, numero integer, mode text, type text, data text, formdata text)";
        var deferred = $q.defer();
        var group = L.featureGroup();
        var compt = 0;
        var sqlselect= "SELECT id, numero, type,  data FROM tempData WHERE numCollecte = '"+numCollecte+"' ";
         console.info(sqlselect);
        $cordovaSQLite.execute(db, sqlselect).then(function(res) {
               console.info(res);
               if(res.rows.length>0){

                       for (var i = 0; i < res.rows.length ; i++) {
                              console.info(res.rows.item(i).type);
                              var dataOBJ = JSON.parse(res.rows.item(i).data);
                              if(res.rows.item(i).type=="ATTRIBUT"){
                                     console.info(dataOBJ)
                                     console.info("$scope.identificationData> "+$scope.identificationData);
                                     console.info($scope.identificationData);
                                     console.info(typeof(JSON.stringify($scope.identificationData)));
                                     console.info(JSON.stringify($scope.identificationData));

                                     if(JSON.stringify(dataOBJ)=="{}"){
                                            $scope.identificationData = undefined;
                                     }else{
                                            $scope.identificationData = dataOBJ;
                                     }
                              }else{
                                      compt++;
                                      dataOBJ = JSON.parse(res.rows.item(i).data);
                                      var dataGeometry = JSON.parse(dataOBJ.gjson);
                                      console.info(dataGeometry);
                                      console.info(dataOBJ.formdata);
                                      var dataNumero= res.rows.item(i).numero;
                              }
                              if(mode=="n"){
                                      if(res.rows.item(i).type=="POINT"){
                                            $scope.points.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POINT");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                                       if(res.rows.item(i).type=="POLYLINE"){
                                            $scope.polylines.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POLYLINE");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                                      if(res.rows.item(i).type=="POLYGONE"){
                                            $scope.polygons.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POLYGONE");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                              }
                              if(mode=="m"){
                                      if(res.rows.item(i).type=="POINTBD"){
                                            $scope.pointsBD.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POINTBD");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                                       if(res.rows.item(i).type=="POLYLINEBD"){
                                            $scope.polylinesBD.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POLYLINEBD");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                                      if(res.rows.item(i).type=="POLYGONEBD"){
                                            $scope.polygonsBD.push(JSON.parse(res.rows.item(i).data));
                                            drawTempData(parseInt(res.rows.item(i).id), dataGeometry, dataNumero, "POLYGONEBD");
                                             var gj = L.geoJson(dataGeometry);
                                             group.addLayer(gj);
                                      }
                              }

                       }

                       leafletData.getMap().then(function(map) {
                              if(compt>0){  map.fitBounds(group.getBounds()); }
                              // map.removeLayer(drawnItems);
                              // map.removeLayer(SupportLayer);
                              // map.addLayer(SupportLayer);
                              // map.addLayer(drawnItems);
                              deferred.resolve();
                       });
               }

        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlselect= '+sqlselect);
               deferred.resolve();
        });
        return deferred.promise;
}

function drawTempData(id, Gjson, numero, geometry){
        console.info(id+" , "+ Gjson+" , "+ numero+" , "+ geometry);

        if(geometry=="POINT"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       layer.setIcon(IconNew);
                       layer._leaflet_id = id;
                       layerClick(layer);
                       layer.on('dragend', function (e) {
                              dragendEventFunction_POINT(e);
                       });
                       addMarkerPointTemp(layer, layer._leaflet_id , numero);
                       drawnItems.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }
         if(geometry=="POINTBD"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       layer.setIcon(IconBD);
                       layer._leaflet_id = "Point_"+numero;
                       layerClickBD(layer);
                       layer.on('dragend', function (e) {
                              dragendEventFunction_POINT(e);
                       });
                       addMarkerPointBD(layer, layer._leaflet_id , numero);
                       drawnItems.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }

       if(geometry=="POLYLINE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       layer.setStyle(StylePolyline);
                       layer._leaflet_id = id;
                       layerClick(layer);
                       addMarkerPolylineTemp(layer, layer._leaflet_id , numero);
                       drawnItems.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }
        if(geometry=="POLYLINEBD"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       layer.setStyle(StylePolylineBD);
                       layer._leaflet_id = "Polyline_"+numero;
                       layerClickBD(layer);
                       addMarkerPolylineBD(layer, layer._leaflet_id , numero);
                       drawnItems.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }

       if(geometry=="POLYGONE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                      layer.setStyle(StylePolygon);
                      layer._leaflet_id = id;
                      layerClick(layer);
                       addMarkerPolygonTemp(layer,layer._leaflet_id, numero);
                      drawnItems.addLayer(layer);
                      $scope.guideLayers.push(layer);
                 }
               });
        }
       if(geometry=="POLYGONEBD"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                      layer.setStyle(StylePolygonBD);
                      layer._leaflet_id = "Polygon_"+numero;
                      layerClickBD(layer);
                       addMarkerPolygonBD(layer,layer._leaflet_id, numero);
                      drawnItems.addLayer(layer);
                      $scope.guideLayers.push(layer);
                 }
               });
        }

}

//=============================================//

  $scope.latGPS=0;
  $scope.lngGPS=0;

  $scope.getGPS=function(){

        $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> <br/> Acquisition en cours ...',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
        });

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                $scope.latGPS = position.coords.latitude;
                $scope.lngGPS = position.coords.longitude;
                console.info("//=========================================================//");
                $ionicLoading.hide();
                console.info($scope.latGPS+" - "+$scope.lngGPS);
                console.info("//=========================================================//");
        }, function(err) {
               // console.info(err);
               console.info(err.message);
               $ionicLoading.hide();
        });
  }

//-----------------------------------------------------------------------//


// Labels des point nouvelement crées
var markerPoint = new L.LayerGroup();
var markersPointObject = {};

// Labels des polylines nouvelement crées
var markerPolyline = new L.LayerGroup();
var markersPolylineObject = {};

// Labels des polygons nouvelement crées
var markerPolygon = new L.LayerGroup();
var markersPolygonObject = {};


// Labels des points stockés dans la BD et non synchronisés
var markerPointBD = new L.LayerGroup();
var markersPointBDObject = {};

// Labels des polylines stockés dans la BD et non synchronisés
var markerPolylineBD = new L.LayerGroup();
var markersPolylineBDObject = {};

// Labels des polygons stockés dans la BD et non synchronisés
var markerPolygonBD = new L.LayerGroup();
var markersPolygonBDObject = {};

//-----------------------------------------------------------------------//
// Labels des points stockés dans la BD et non synchronisés
var markerPointSupport = new L.LayerGroup();
var markersPointSupportObject = {};

// Labels des polylines stockés dans la BD et non synchronisés
var markerPolylineSupport  = new L.LayerGroup();
var markersPolylineSupportObject = {};

// Labels des polygons stockés dans la BD et non synchronisés
var markerPolygonSupport  = new L.LayerGroup();
var markersPolygonSupportObject = {};
//-----------------------------------------------------------------------//


  // Boolean : Activation / Désactivation du mode Edition.
  modeEdition=false;

$scope.points=[];
$scope.polylines=[];
$scope.polygons = [];

$scope.pointsBD=[];
$scope.polylinesBD=[];
$scope.polygonsBD = [];

$scope.guideLayers = [];


// Déclaration des Controlleurs de dessins qui vont abriter les éléments déssinés  { Blocs - Parcelles }.
  var drawControl;
  var drawControlParcelles;

  var drawnItems = new L.FeatureGroup();
  var drawnItemsSync = new L.FeatureGroup();
  var drawnItemsParcelles = new L.FeatureGroup();

 var boolEdit = false;
  var selectedFeature = null;

 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Déclaration et définition des couches de bases et des Overlays à afficher sur la carte:

$scope.definedLayers = {
      googleHybrid: {
          name: 'Google',
          layerType: 'HYBRID',
          type: 'google'
      },
      xyz: {
          name:'Tuile local',
          // url: cordova.file.externalRootDirectory+"SayGIS/"+$localStorage.tuileChoisie+"/{z}/{x}/{y}.jpg",
          // url: $localStorage.tuileChoisie+"/{z}/{x}/{y}.jpg",
          url: "donnees/test2/{z}/{x}/{y}.jpg",
          type:"xyz",
          // visible: true,
          layerOptions: {
                attribution: 'Geocoding MA © \<a href="http://www.geocoding.ma/"> www.geocoding.ma </a>',
                tileSize: 256,
                opacity :0.7,
                // tms:true,
                maxZoom: 22
          }
      }
};

$scope.definedOverlays = {
     tileLayerUTM: {
          name: 'UTM',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: true
          }
      },
      communesLayer: {
          name: 'Communes',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: true
          }
      },
       SupportLayer: {
          name: 'Supports',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: true
          }
      },

      allOverlaysMarkers: {
          name: 'Libellés',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      },

      drawnItems: {
          name: 'Collecte',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: true
          }
      }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// déclaration et définition des couches et paramètres de la carte 'map'.

var couchesBase;
if(!ConnectivityMonitor.isOnline()) {
        couchesBase =  {
              xyz: $scope.definedLayers.xyz
        };
}else{
        couchesBase =  {
              googleHybrid: $scope.definedLayers.googleHybrid,
              xyz: $scope.definedLayers.xyz
          };
}

// leafletData.getMap().then(function(map) {
  // $ionicPlatform.ready(function() {
angular.extend($scope, {
      center: {
            lat: 31.599, //   347411.951141
            lng: -7.713, //  347411.951141
            zoom: 12
            // maxBounds: bounds
           //  maxBounds: bounds,
           // maxBoundsViscosity: 1.0
        },
        // tiles: tilesDict.xyz,
      defaults: {
            zoomControl :false,
            attributionControl: false,  /*Remove Attribution & Terms Of Use of Leaflet */
            // minZoom:7,
            tap:false,       // cette ligne est très importante => pour permettre l'utilisation du Pen Tablet.
            // tapTolerance:55,
            scrollWheelZoom:true,
            maxZoom:22,
            //   crs: crr,
            // continuousWorld: true
        },
      controls: {
        scale: true
            // custom: [zoomHome]
        },
      layers: {
          baselayers: couchesBase,
          // baselayers: {
          //     googleHybrid: $scope.definedLayers.googleHybrid,
          //     xyz: $scope.definedLayers.xyz
          // },
          // // overlays: $scope.couchesOverlays
          overlays: {
          //     tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
          //     communesLayer: $scope.definedOverlays.communesLayer,
          //     // tileLayerSupport: $scope.definedOverlays.tileLayerSupport,
          //     // tileLayerParcelle: $scope.definedOverlays.tileLayerParcelle,
          //     allOverlaysMarkers: $scope.definedOverlays.allOverlaysMarkers,
              // draw: $scope.definedOverlays.drawnItems
          }
      }
});

// });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Définission des couches Input pour des opérations d'affichage et d'intersection avec les entités déssinées.

var pad = 0;
var bbounds;
var markersUTM = new L.LayerGroup();
var markersCOMMUNE = new L.LayerGroup();
var markersSupport = new L.LayerGroup();

 var tileOptions = {
        maxZoom: 22,  // max zoom to preserve detail on
        tolerance: 5, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64,   // tile buffer on each side
        debug: 0,      // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 22,        // max zoom in the initial tile index
        indexMaxPoints: 100000, // max number of points per tile in the index
  };

var tileOptionsSupport = {
        maxZoom: 24,  // max zoom to preserve detail on
        tolerance: 1, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 14,   // tile buffer on each side
        debug: 0,      // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 26,        // max zoom in the initial tile index
        indexMaxPoints: 100000, // max number of points per tile in the index
    };

var UTM= L.geoJson(utm, {
  name: 'UTM',
  onEachFeature: function(feature, layer) {
    var label = L.marker(layer.getBounds().getCenter(), {
      icon: L.divIcon({
      className: 'labelUTM',
      html: feature.properties.zone
      })
  });
  markersUTM.addLayer(label);
  }
});

var tileIndexUTM = geojsonvt(utm, tileOptions);

var tileLayerUTM = L.canvasTiles()
                      .params({ debug: false, padding: 3 })
                      .drawing(drawingOnCanvasUTM)

 function drawingOnCanvasUTM(canvasOverlay, params) {
            var bounds = params.bounds;
            bbounds = bounds;

            params.tilePoint.z = params.zoom;
            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';

            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndexUTM.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
            if (!tile) {
                // console.log('tile empty');
                return;
            }

            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

            var features = tile.features;

            ctx.strokeStyle = 'yellow';


            for (var i = 0; i < features.length; i++) {
                var feature = features[i],
                    type = feature.type;
                    // $scope.guideLayers.push(feature);

                ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0.1)';
                ctx.beginPath();

              for (var j = 0; j < feature.geometry.length; j++) {
                    var geom = feature.geometry[j];

                    if (type === 1) {
                        ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                        continue;
                    }

                    for (var k = 0; k < geom.length; k++) {
                        var p = geom[k];
                        var extent = 4096;

                        var x = p[0] / extent * 256;
                        var y = p[1] / extent * 256;
                        if (k) ctx.lineTo(x  + pad, y   + pad);
                        else ctx.moveTo(x  + pad, y  + pad);
                    }
                }

                if (type === 3 || type === 1) ctx.fill('evenodd');
                ctx.stroke();
            }
        };


 function drawingOnCanvasSegment(canvasOverlay, params) {
            var bounds = params.bounds;
            bbounds = bounds;

            params.tilePoint.z = params.zoom;
            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';

            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndexSupport.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
            if (!tile) {
                // console.log('tile empty');
                return;
            }

            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

            var features = tile.features;

            ctx.strokeStyle = 'Yellow';


            for (var i = 0; i < features.length; i++) {
                var feature = features[i],
                    type = feature.type;
                    // $scope.guideLayers.push(feature);

                ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0.1)';
                ctx.beginPath();

              for (var j = 0; j < feature.geometry.length; j++) {
                    var geom = feature.geometry[j];

                    if (type === 1) {
                        ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                        continue;
                    }

                    for (var k = 0; k < geom.length; k++) {
                        var p = geom[k];
                        var extent = 4096;

                        var x = p[0] / extent * 256;
                        var y = p[1] / extent * 256;
                        if (k) ctx.lineTo(x  + pad, y   + pad);
                        else ctx.moveTo(x  + pad, y  + pad);
                    }
                }

                if (type === 3 || type === 1) ctx.fill('evenodd');
                ctx.stroke();
            }
        };


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*
  * Déclaration des Fonctions du Controlleur :'CollecteCtrl'.
  */
 /////////////////////////////////// Functions of Header & Footer buttons :: Carte.html  ////////////////////

function viderTableTemporaire(){

        var deferred = $q.resolve();
        var sqlselect= "DELETE  FROM tempData ";
        $cordovaSQLite.execute(db, "DELETE  FROM tempData ").then(function(reso) {
          console.info(reso);
          deferred.resolve();
        });

        return deferred.promise;
}

$scope.goParametrage = function(){
        if($scope.points.length!=0 || $scope.polylines.length!=0 || $scope.polygons.length!=0){
              var myPopup = $ionicPopup.show({
                             subTitle: '<span style="font-size:19;"><b>Voulez vous vraiment quitter avant d\'enregistrer le dessin en cours ? </b></span>',
                             scope: $scope,
                             buttons: [
                                { text: 'Annuler',type:'button-dark' }, {
                                   text: '<b>OK</b>',
                                   type: 'button-positive',
                                      onTap: function(e) {
                                            // $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
                                            viderTableTemporaire().then(function(){
                                                    $state.go('menu', {});
                                                    sidebar.close();
                                                    $("#sidebar").css( "display", "none");
                                            });
                                      }
                                }
                             ]
              });

        }else{
              // $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
              $state.go('menu', {});
              sidebar.close();
              $("#sidebar").css( "display", "none");
        }
 };

$scope.ToogleEdition=function(modeEdition){

    sidebar.close();
    sidebar.on('closing', function(e) {
      $("#sidebar").css( "display", "none");
    })

    console.log(modeEdition);
    $scope.modeEdit = modeEdition;

    leafletData.getMap().then(function(map) {
        if(modeEdition){
        map.addControl(drawControl);
        // map.addControl(drawControlParcelles);
        map.addControl(editCtrl);
        map.addControl(saveCtrl);
        }else{
            map.removeControl(drawControl);
            // map.removeControl(drawControlParcelles);
            map.removeControl(editCtrl);
            map.removeControl(saveCtrl);
        }
    });
}

$scope.disableDrawControllers=function(){

        for (var toolbarId in drawControl._toolbars) {
               drawControl._toolbars[toolbarId].disable();
        }

        for (var toolbarId in drawControlParcelles._toolbars) {
               drawControlParcelles._toolbars[toolbarId].disable();
        }
        if(selectedFeature!=null){
                console.log(selectedFeature);
                console.log(selectedFeature._leaflet_id);
                if (selectedFeature instanceof L.Marker) {
                        selectedFeature.dragging.disable();
                        valider_Geometrie_Informations_Feature_POINT(selectedFeature);
                }else{
                        selectedFeature.snapediting.disable();
                        if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon))  {

                        }else{
                                valider_Geometrie_Informations_Feature(selectedFeature);
                        }
                }
         }
        // if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible') ){
        //         console.info(drawControl.options.edit.remove);
        //         for (var toolbarId in drawControlParcelles._toolbars) {
        //                drawControlParcelles._toolbars[toolbarId].disable();
        //          }
        // }else{
        //         for (var toolbarId in drawControl._toolbars) {
        //                drawControl._toolbars[toolbarId].disable();
        //         }
        // }
 }

$scope.showPopupValidatePolygon = function() {
  $scope.disableDrawControllers();
  if($scope.modeEdit){
    $scope.data = {};
    // Custom popup
    var myPopup = $ionicPopup.show({
       subTitle: '<span style="font-size:19;"><b>Voulez vous vraiment valider la campagne de collecte en cours ? </b></span>',
       scope: $scope,
       buttons: [
          { text: 'Annuler',type:'button-grisClair' }, {
             text: '<b>Valider</b>',
             type: 'button-bleuClair',
                onTap: function(e) {
                    $scope.Validation();
                }
          }
       ]
     });
  }
}


$scope.Validation = function(){

        if (($scope.points.length==0 &&  $scope.polylines.length==0 && $scope.polygons.length==0) && ($scope.pointsBD.length==0 && $scope.polylinesBD.length==0 && $scope.polygonsBD.length==0)){
                ionicToast.show(' Aucune entité déssinée !', 'middle', false, 2500);
                return;
        }

        console.info("$scope.identificationData> "+JSON.stringify($scope.identificationData));
        console.info("$scope.boolFormNone> "+$scope.boolFormNone);


        if($scope.boolFormNone &&  $scope.identificationData==undefined){
                console.info($scope.identificationData);
                ionicToast.show(' Veuillez renseigner le questionnaire d\'identification ! ', 'middle', false, 2500);
                return;
        }

        //--------------------------------------------------------------------------------------//
        if($scope.points.length>0){
               for (var i = 0; i < $scope.points.length; i++) {
                       if($scope.points[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités ponctuelles déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                               return;
                       }
                }
        }
          if($scope.polylines.length>0){
               for (var i = 0; i < $scope.polylines.length; i++) {
                       if($scope.polylines[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités linéaires déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                              return;
                       }
                }
        }
          if($scope.polygons.length>0){
               for (var i = 0; i < $scope.polygons.length; i++) {
                       if($scope.polygons[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités polygonales déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                               return;
                       }
                }
        }
        //--------------------------------------------------------------------------------------//
        if($scope.pointsBD.length>0){
               for (var i = 0; i < $scope.pointsBD.length; i++) {
                       if($scope.pointsBD[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités ponctuelles déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                               return;
                       }
                }
        }
          if($scope.polylinesBD.length>0){
               for (var i = 0; i < $scope.polylinesBD.length; i++) {
                       if($scope.polylinesBD[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités linéaires déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                               return;
                       }
                }
        }
          if($scope.polygonsBD.length>0){
               for (var i = 0; i < $scope.polygonsBD.length; i++) {
                       if($scope.polygonsBD[i].formdata==undefined){
                              ionicToast.show(' Veuillez renseigner les questionnaires des entités polygonales déssinées ! ', 'middle', false, 2500);
                              $scope.errorDetected = true;
                               return;
                       }
                }
        }
        //--------------------------------------------------------------------------------------//


          $ionicLoading.show({
                  template: '<ion-spinner></ion-spinner> <br/> Enregistrement en cours ...',
                  content: 'Loading',
                  animation: 'fade-in',
                  showBackdrop: true,
                  maxWidth: 200,
                  showDelay: 0
            });

            // $timeout(function () {
                  if($stateParams.mode=="m"){
                           $scope.UpdateJsonData().then(function(){
                                     $timeout(function () {
                                             $ionicLoading.hide();
                                             if(!$scope.errorDetected){
                                                    $scope.pointsBD = [];
                                                    $scope.polylinesBD = [];
                                                    $scope.polygonsBD = [];
                                                    viderTableTemporaire().then(function(){
                                                            $scope.goParametrage();
                                                    });

                                             }
                                     }, 3000);
                        });
                  }else{
                        $scope.SaveAllJsonData().then(function(){
                                     $timeout(function () {
                                             $ionicLoading.hide();
                                             if(!$scope.errorDetected){
                                                     $scope.points = [];
                                                     $scope.polylines = [];
                                                     $scope.polygons = [];
                                                     viderTableTemporaire().then(function(){
                                                            $scope.goParametrage();
                                                    });
                                             }
                                      }, 3000);
                        });
                  }
                // }, 3000);
}

 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////////////////////////// Fonctions standards du controlleur collecteCtrl //////////////////////////////

Number.prototype.padLeft = function(base,chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
  }

$scope.formattedDate=function() {
      var d = new Date,
        dformat = [ d.getFullYear(),(d.getMonth()+1).padLeft(),
                    d.getDate().padLeft() ].join('-')+
                    ' ' +
                  [ d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft()].join(':');

        return dformat;
  }

$scope.desableMapControllers = function(){
        $("div.leaflet-popup").remove();
        if (boolEdit){
               if(selectedFeature){
                       if (selectedFeature instanceof L.Marker) {
                              selectedFeature.dragging.disable();
                              valider_Geometrie_Informations_Feature_POINT(selectedFeature);
                       }else{
                              selectedFeature.snapediting.disable();
                              if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon))  {

                              }else{
                                     valider_Geometrie_Informations_Feature(selectedFeature);
                              }
                       }
               }
               $( ".editionGeometrie" ).css( "backgroundImage", "url(img/noedit.png)" );
               boolEdit = false;
        }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 ////////////////////// Fonctions de gestion des Données dynamiques :: Enregistrement BD /////////////////////////////

//-------------------------------------------------------//
 // Save All drawned DynamicData To DB :
  $scope.SaveAllJsonData= function(){

         var Points = [];
         var Polylines = [];
         var Polygons = [];
         var allData=[];
         var superficieTotale = 0;
         $scope.errorDetected = false;
         var deferred = $q.defer();

         if($scope.points.length>0){
                 for (var i = 0; i < $scope.points.length; i++) {
                       // if($scope.points[i].formdata==undefined){
                       //        ionicToast.show(' Veuillez renseigner les questionnaires des entités ponctuelles déssinées ! ', 'middle', false, 2500);
                       //        $scope.errorDetected = true;
                       //        deferred.resolve();
                       //        return deferred.promise;
                       // }
                        var data;
                       if(typeof($scope.points[i].formdata)=="string"){
                            data  = JSON.parse($scope.points[i].formdata);
                       }else{
                            data  = $scope.points[i].formdata;
                       }
                       var jsonDataPoint= {
                              numero: $scope.points[i].numero,
                              id_support: $scope.points[i].id_support,
                              support: $scope.points[i].support,
                              shape: $scope.points[i].shape,
                              gjson: JSON.parse($scope.points[i].gjson).geometry,
                              date_creation: $scope.points[i].date_creation,
                              // formdata: $scope.points[i].formdata,
                              formdata: data,
                              capture: $scope.points[i].capture
                       };

                       Points.push(jsonDataPoint);
                       // allDataPoint.push({"type": $scope.geometryFormPoint, "form": $scope.idFieldsFormPoint, "formname": $scope.nameFormPoint, "data": Points});
                       // enregisterDonneesJsonBD($scope.selectedProject,$scope.numeroCollecte ,  JSON.stringify(allDataPoint));

                 }
         }

         if($scope.polylines.length>0){
                 for (var i = 0; i < $scope.polylines.length; i++) {
                       // if($scope.polylines[i].formdata==undefined){
                       //        ionicToast.show(' Veuillez renseigner les questionnaires des entités linéaires déssinées ! ', 'middle', false, 2500);
                       //        $scope.errorDetected = true;
                       //        deferred.resolve();
                       //        return deferred.promise;
                       // }
                       var data;
                       if(typeof($scope.polylines[i].formdata)=="string"){
                            data  = JSON.parse($scope.polylines[i].formdata);
                       }else{
                            data  = $scope.polylines[i].formdata;
                       }
                       var jsonDataPolyline= {
                              numero: $scope.polylines[i].numero,
                              id_support: $scope.polylines[i].id_support,
                              support: $scope.polylines[i].support,
                              shape: $scope.polylines[i].shape,
                              gjson: JSON.parse($scope.polylines[i].gjson).geometry,
                              date_creation: $scope.polylines[i].date_creation,
                              // formdata: JSON.parse($scope.polylines[i].formdata),
                              // formdata: $scope.polylines[i].formdata,
                              formdata: data,
                              capture: $scope.polylines[i].capture
                       };

                       Polylines.push(jsonDataPolyline);
                       // allDataPolyline.push({"type": $scope.geometryFormPolyline, "form": $scope.idFieldsFormPolyline, "formname": $scope.nameFormPolyline, "data": Polylines});
                       // enregisterDonneesJsonBD($scope.selectedProject, $scope.numeroCollecte ,  JSON.stringify(allDataPolyline));
                 }
         }

         if($scope.polygons.length>0){
                 for (var i = 0; i < $scope.polygons.length; i++) {
                       // if($scope.polygons[i].formdata==undefined){
                       //        ionicToast.show(' Veuillez renseigner les questionnaires des entités polygonales déssinées ! ', 'middle', false, 2500);
                       //        $scope.errorDetected = true;
                       //        deferred.resolve();
                       //        return deferred.promise;
                       // }
                       var data;
                       if(typeof($scope.polygons[i].formdata)=="string"){
                            data  = JSON.parse($scope.polygons[i].formdata);
                       }else{
                            data  = $scope.polygons[i].formdata;
                       }
                       var jsonDataPolygon= {
                              numero: $scope.polygons[i].numero,
                              id_support: $scope.polygons[i].id_support,
                              support: $scope.polygons[i].support,
                              shape: $scope.polygons[i].shape,
                              gjson: JSON.parse($scope.polygons[i].gjson),
                              superficie: $scope.polygons[i].superficie,
                              date_creation: $scope.polygons[i].date_creation,
                              // formdata: JSON.parse($scope.polygons[i].formdata),
                              // formdata: $scope.polygons[i].formdata,
                              formdata: data,
                              capture: $scope.polygons[i].capture
                       };

                       superficieTotale+= $scope.polygons[i].superficie;
                       Polygons.push(jsonDataPolygon);
                       // allDataPolygon.push({"type": $scope.geometryFormPolygon, "form": $scope.idFieldsFormPolygon, "formname": $scope.nameFormPolygon, "data": Polygons });
                       // enregisterDonneesJsonBD($scope.selectedProject, $scope.numeroCollecte ,  JSON.stringify(allDataPolygon));
                 }
         }

          var dataPoint = {"type": $scope.geometryFormPoint, "form": $scope.idFieldsFormPoint, "formname": $scope.nameFormPoint, "data": Points};
          var dataPolyline =   {"type": $scope.geometryFormPolyline, "form": $scope.idFieldsFormPolyline, "formname": $scope.nameFormPolyline, "data": Polylines} ;
          var dataPolygon = {"type": $scope.geometryFormPolygon, "form": $scope.idFieldsFormPolygon, "formname": $scope.nameFormPolygon, "data": Polygons } ;

          console.info(Points);
          console.info(Polylines);
          console.info(Polygons);

          if(Points.length!=0){  allData.push(dataPoint); }
          if(Polylines.length!=0){  allData.push(dataPolyline); }
          if(Polygons.length!=0){  allData.push(dataPolygon); }

           var exploitation = {};
          if($scope.boolFormNone){
               exploitation = {
                       form: $scope.idFieldsFormNone,
                       formname:$scope.nameFormNone,
                       formdata: $scope.identificationData
               }
          }else{
                exploitation = {};
          }

          $scope.latGPS = 0;
          $scope.lngGPS = 0;

           console.info("----------------GEOCODING----------------");
           console.info("----------------------------------------------");
           console.info("$scope.selectedProject= "+$scope.selectedProject);
           console.info("$scope.selectedRegion= "+$scope.selectedRegion);
           console.info("$scope.selectedProvince= "+$scope.selectedProvince);
           console.info("$scope.selectedCommune= "+$scope.selectedCommune);
           console.info("$scope.numeroCollecte= "+$scope.numeroCollecte);
           console.info("JSON.stringify($scope.identificationData)= "+JSON.stringify($scope.identificationData));
           console.info("JSON.stringify(exploitation)= "+JSON.stringify(exploitation));
          console.info("JSON.stringify(allData)= "+JSON.stringify(allData));
          console.info("----------------------------------------------");

          // enregisterDonneesJsonBD($scope.selectedProject, $scope.numeroCollecte, JSON.stringify(exploitation), JSON.stringify(allData), $scope.selectedRegion, $scope.selectedProvince, $scope.selectedCommune, $scope.latGPS, $scope.lngGPS);

         enregisterDonneesJsonBD($scope.selectedProject, $scope.numeroCollecte, $scope.userId, superficieTotale, JSON.stringify(exploitation), JSON.stringify(allData), $scope.selectedRegion, $scope.selectedProvince, $scope.selectedCommune).then(function(){
                deferred.resolve();
         });

          // Raffrichir la Carte après enregistrement des éléments déssinés dans la BD :
          // $timeout(function() {
          //         $ionicHistory.clearCache([$state.current.name]).then(function() {
          //                 $state.reload();
          //         });
          // });
          return deferred.promise;

 }

 function enregisterDonneesJsonBD(id_projet, numero, userId, area, exp, data, id_reg, id_prov, id_com){
        var deferred = $q.defer();
        console.info(id_projet+" - "+numero+" - "+userId+" - "+exp+" - "+data+" - "+id_reg+" - "+id_prov+" - "+id_com);

        var sqlInsertData= "INSERT INTO dynamicData (id_projet, numero, userId, superficie, exploitation, data, id_region, id_province, id_commune, geo, sync) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
        $cordovaSQLite.execute(db, sqlInsertData,[id_projet, numero, userId, area, exp, data, id_reg, id_prov, id_com, "true", 0]).then(function(res) {
              deferred.resolve();
         }, function (err) {
            console.log(err);
            console.log('ERR SQL sqlInsertData= '+sqlInsertData);
         });

        return deferred.promise;
 }

//-------------------------------------------------------//
// Update Modified DynamicData Rows in DB :
$scope.UpdateJsonData= function(id){

         var Points = [];
         var Polylines = [];
         var Polygons = [];
         var allData=[];
         var superficieTotale = 0;
         $scope.errorDetected = false;
         var deferred = $q.defer();
         var idToUpdate;
         if($scope.pointsBD.length>0){
                 for (var i = 0; i < $scope.pointsBD.length; i++) {
                              var data;
                               if(typeof($scope.pointsBD[i].formdata)=="string"){
                                    data  = JSON.parse($scope.pointsBD[i].formdata);
                               }else{
                                    data  = $scope.pointsBD[i].formdata;
                               }
                              var jsonDataPoint= {
                                    numero: $scope.pointsBD[i].numero,
                                    id_support: $scope.pointsBD[i].id_support,
                                    support: $scope.pointsBD[i].support,
                                    shape: $scope.pointsBD[i].shape,
                                    gjson: JSON.parse($scope.pointsBD[i].gjson),
                                    date_creation: $scope.pointsBD[i].date_creation,
                                    // formdata: $scope.pointsBD[i].formdata,
                                    formdata: data,
                                    capture: $scope.pointsBD[i].capture
                              };
                              if($scope.pointsBD[i].db_id!=undefined){
                                    idToUpdate = $scope.pointsBD[i].db_id;
                              }
                              Points.push(jsonDataPoint);
                 }
         }

         if($scope.polylinesBD.length>0){
               for (var i = 0; i < $scope.polylinesBD.length; i++) {
                               var data;
                               if(typeof($scope.polylinesBD[i].formdata)=="string"){
                                    data  = JSON.parse($scope.polylinesBD[i].formdata);
                               }else{
                                    data  = $scope.polylinesBD[i].formdata;
                               }
                              var jsonDataPolyline= {
                                    numero: $scope.polylinesBD[i].numero,
                                    id_support: $scope.polylinesBD[i].id_support,
                                    support: $scope.polylinesBD[i].support,
                                    shape: $scope.polylinesBD[i].shape,
                                    gjson: JSON.parse($scope.polylinesBD[i].gjson),
                                    date_creation: $scope.polylinesBD[i].date_creation,
                                    // formdata: $scope.polylinesBD[i].formdata,
                                    formdata: data,
                                    capture: $scope.polylinesBD[i].capture
                              };

                              Polylines.push(jsonDataPolyline);
                              if($scope.polylinesBD[i].db_id!=undefined){
                                   idToUpdate = $scope.polylinesBD[i].db_id;
                              }
               }
          }

          if($scope.polygonsBD.length>0){
                 for (var i = 0; i < $scope.polygonsBD.length; i++) {
                      var data;
                       if(typeof($scope.polygonsBD[i].formdata)=="string"){
                            data  = JSON.parse($scope.polygonsBD[i].formdata);
                       }else{
                            data  = $scope.polygonsBD[i].formdata;
                       }
                        var jsonDataPolygon= {
                                numero: $scope.polygonsBD[i].numero,
                                id_support: $scope.polygonsBD[i].id_support,
                                support: $scope.polygonsBD[i].support,
                                shape: $scope.polygonsBD[i].shape,
                                gjson: JSON.parse($scope.polygonsBD[i].gjson),
                                superficie: $scope.polygonsBD[i].superficie,
                                date_creation: $scope.polygonsBD[i].date_creation,
                                // formdata: $scope.polygonsBD[i].formdata,
                                formdata: data,
                                capture: $scope.polygonsBD[i].capture
                        };
                        superficieTotale+= $scope.polygonsBD[i].superficie;
                       Polygons.push(jsonDataPolygon);
                       if($scope.polygonsBD[i].db_id!=undefined){
                            idToUpdate = $scope.polygonsBD[i].db_id;
                       }

                 }
          }

          var dataPoint = {"type": $scope.geometryFormPoint, "form": $scope.idFieldsFormPoint, "formname": $scope.nameFormPoint, "data": Points};
          var dataPolyline =   {"type": $scope.geometryFormPolyline, "form": $scope.idFieldsFormPolyline, "formname": $scope.nameFormPolyline, "data": Polylines} ;
          var dataPolygon = {"type": $scope.geometryFormPolygon, "form": $scope.idFieldsFormPolygon, "formname": $scope.nameFormPolygon, "data": Polygons } ;

          if(Points.length!=0){  allData.push(dataPoint); }
          if(Polylines.length!=0){  allData.push(dataPolyline); }
          if(Polygons.length!=0){  allData.push(dataPolygon); }


          console.info("================================================");
          console.info("AYB = "+Polygons.length);
          console.info("-----------------------------------");
          console.info("$scope.identificationData> "+$scope.identificationData);
          console.info("================================================");

           var exploitation = {};
          if($scope.boolFormNone){
               exploitation = {
                       form: $scope.idFieldsFormNone,
                       formname:$scope.nameFormNone,
                       formdata: $scope.identificationData
               }
          }else{
                exploitation = {};
          }

         updateDonneesJsonBD(idToUpdate, superficieTotale, JSON.stringify(exploitation), JSON.stringify(allData)).then(function(){
                deferred.resolve();
                $ionicLoading.hide();
         });

          return deferred.promise;
 }

function updateDonneesJsonBD(id, sup, exp, data){

        var deferred = $q.defer();

        var exp = exp.replace("'", "''");
        var data = data.replace("'", "''");
        var sqlUpdateData= "Update dynamicData SET superficie= "+sup+", exploitation= '"+exp+"', data = '"+data+"' WHERE id = '"+id+"' ";
        console.info(sqlUpdateData);
        deferred.resolve();
        $cordovaSQLite.execute(db, sqlUpdateData).then(function(res) {
          console.info(JSON.stringify(res));
         }, function (err) {
            console.log(err);
            console.log('ERR SQL sqlUpdateData= '+sqlUpdateData);
        });
        return deferred.promise;
 }

//-------------------------------------------------------//
// Load DynamicData Rows in DB & Draw them to the map :

$scope.totalPoint=0;
$scope.totalPolyline=0;
$scope.totalPolygon=0;

function loadDynamicDataBD(num){

       var sqlData= "SELECT id, id_projet, numero, exploitation, data, sync FROM dynamicData WHERE id_projet ='"+$scope.selectedProject+"' AND numero ='"+num+"' AND sync = 0 AND userId="+$scope.userId;

       console.info(sqlData);
       $cordovaSQLite.execute(db, sqlData).then(function(res) {
               console.info(res.rows.length);
               if(res.rows.length > 0) {
                      //FeatureGroup dans lequel on va stocker tous les entitées spatiales de la collecte à modifer pour que on leur applique  un ZOOM.
                      var group = new L.featureGroup();

                      $scope.idCollecte= res.rows.item(0).id;

                      for (var i = 0; i < res.rows.length ; i++) {

                              if(JSON.parse(res.rows.item(i).exploitation).formdata!=undefined){
                                     $scope.identificationData = JSON.parse(res.rows.item(i).exploitation).formdata;
                                     alimenterTableTemporaire("", $scope.numeroCollecte, 0, $stateParams.mode, "ATTRIBUT", JSON.stringify($scope.identificationData), JSON.stringify($scope.identificationData));
                              }else{
                                     $scope.identificationData = {};
                              }
                              console.info("$scope.identificationData> "+JSON.stringify($scope.identificationData));

                              var input =  JSON.parse(res.rows.item(i).data);
                              for(var k = 0; k< input.length; k++){
                                            var data = input[k].data;
                                            //POINT
                                             console.info(JSON.stringify(data));
                                            if(input[k].form==$scope.idFieldsFormPoint){
                                                  for(var b = 0; b<data.length; b++){
                                                           var idobj =  "Point_"+data[b].numero;
                                                           var jsonDataPoint= {
                                                                   db_id: res.rows.item(i).id,
                                                                   id: "Point_"+data[b].numero,
                                                                   numero:data[b].numero,
                                                                   id_support:data[b].id_support,
                                                                   support:data[b].support,
                                                                   shape: data[b].shape,
                                                                   gjson: JSON.stringify(data[b].gjson),
                                                                   date_creation: data[b].date_creation,
                                                                   // formdata: JSON.stringify(data[b].formdata)
                                                                   formdata: data[b].formdata
                                                           };
                                                            console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ data[b].numero+" , "+ $stateParams.mode+" , "+ "POINTBD"+" , "+ JSON.stringify(jsonDataPoint));
                                                           alimenterTableTemporaire(idobj, $scope.numeroCollecte, data[b].numero, $stateParams.mode, "POINTBD", JSON.stringify(jsonDataPoint), "" );
                                                           if(res.rows.item(i).sync==0){ $scope.pointsBD.push(jsonDataPoint); }
                                                           if($scope.totalPoint< data[b].numero){
                                                                   $scope.totalPoint = data[b].numero;
                                                           }
                                                           drawDynamicDataBD("POINT", data[b].gjson, data[b].numero, res.rows.item(i).sync);
                                                           var gj = L.geoJson(data[b].gjson);
                                                           group.addLayer(gj);
                                                           console.info("data[b].support= "+data[b].support);
                                                  }
                                            }
                                            // POLYLINE:
                                           if(input[k].form==$scope.idFieldsFormPolyline){
                                                 for(var b = 0; b<data.length; b++){
                                                    var idobj =  "Polyline_"+data[b].numero;
                                                    var jsonDataPolyline= {
                                                            db_id: res.rows.item(i).id,
                                                            id: "Polyline_"+data[b].numero,
                                                            numero:data[b].numero,
                                                            id_support:data[b].id_support,
                                                            support:data[b].support,
                                                            shape: data[b].shape,
                                                            gjson: JSON.stringify(data[b].gjson),
                                                            date_creation: data[b].date_creation,
                                                            // formdata: JSON.stringify(data[b].formdata)
                                                            formdata: data[b].formdata
                                                    };
                                                    console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ data[b].numero+" , "+ $stateParams.mode+" , "+ "POLYLINEBD"+" , "+ JSON.stringify(jsonDataPolyline));
                                                    alimenterTableTemporaire(idobj, $scope.numeroCollecte, data[b].numero, $stateParams.mode, "POLYLINEBD", JSON.stringify(jsonDataPolyline), "" );
                                                      if(res.rows.item(i).sync==0){ $scope.polylinesBD.push(jsonDataPolyline); }
                                                      if($scope.totalPolyline< data[b].numero){
                                                            $scope.totalPolyline = data[b].numero;
                                                      }
                                                     drawDynamicDataBD("POLYLINE", data[b].gjson, data[b].numero, res.rows.item(i).sync);
                                                     var gj = L.geoJson(data[b].gjson);
                                                     group.addLayer(gj);
                                                     console.info("data[b].support= "+data[b].support);
                                                }
                                           }
                                           //POLYGON
                                           if(input[k].form==$scope.idFieldsFormPolygon){
                                                 for(var b = 0; b<data.length; b++){
                                                            var idobj =  "Polygon_"+data[b].numero;
                                                            var jsonDataPolygon= {
                                                                    db_id: res.rows.item(i).id,
                                                                     id: "Polygon_"+data[b].numero,
                                                                    numero:data[b].numero,
                                                                    id_support:data[b].id_support,
                                                                    support:data[b].support,
                                                                    shape: data[b].shape,
                                                                    gjson: JSON.stringify(data[b].gjson),
                                                                    superficie: data[b].superficie,
                                                                    date_creation: data[b].date_creation,
                                                                    // formdata: JSON.stringify(data[b].formdata)
                                                                    formdata: data[b].formdata
                                                             };

                                                            console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ data[b].numero+" , "+ $stateParams.mode+" , "+ "POLYGONEBD"+" , "+ JSON.stringify(jsonDataPolygon));
                                                            alimenterTableTemporaire(idobj, $scope.numeroCollecte, data[b].numero, $stateParams.mode, "POLYGONEBD", JSON.stringify(jsonDataPolygon), "" );
                                                             console.info(jsonDataPolygon);
                                                             if(res.rows.item(i).sync==0){ $scope.polygonsBD.push(jsonDataPolygon); }
                                                              if($scope.totalPolygon< data[b].numero){
                                                                    $scope.totalPolygon = data[b].numero;
                                                             }
                                                             drawDynamicDataBD("POLYGONE", data[b].gjson, data[b].numero, res.rows.item(i).sync);
                                                             var gj = L.geoJson(data[b].gjson);
                                                             group.addLayer(gj);
                                                             console.info("data[b].support= "+JSON.stringify(data[b].support));
                                                 }
                                           }
                              }
                      }

                       leafletData.getMap().then(function(map) {
                              map.fitBounds(group.getBounds());

                       });

               }else{
                    // BD des dynamicData est vide !!
               }
               console.info("$scope.pointsBD.length: "+$scope.pointsBD.length);
               console.info("$scope.polylinesBD.length: "+$scope.polylinesBD.length);
               console.info("$scope.polygonsBD.length: "+$scope.polygonsBD.length);
               $scope.totalPoint = $scope.pointsBD.length;
               $scope.totalPolyline = $scope.polylinesBD.length;
               $scope.totalPolygon = $scope.polygonsBD.length;

         }, function (err) {
            console.log('ERR SQL sqlData= '+sqlData);
         });
}

function drawDynamicDataBD(geometry, Gjson, numero, sync){

        if(geometry=="POINT"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                      if(sync==0){
                             layer.setIcon(IconBD);
                             layer._leaflet_id = "Point_"+numero;
                             layerClickBD(layer);
                              addMarkerPointBD(layer, layer._leaflet_id , numero);
                              drawnItems.addLayer(layer);
                      }else{
                             layer.setIcon(IconSync);
                             layer._leaflet_id = "Point_"+numero;
                              addMarkerPointSync(layer, layer._leaflet_id , numero);
                              drawnItemsSync.addLayer(layer);
                      }

                       $scope.guideLayers.push(layer);
                 }
               });
        }

       if(geometry=="POLYLINE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       if(sync==0){
                              layer.setStyle(StylePolylineBD);
                              layer._leaflet_id = "Polyline_"+numero;
                              layerClickBD(layer);
                              addMarkerPolylineBD(layer, layer._leaflet_id , numero);
                              drawnItems.addLayer(layer);
                       }else{
                              layer.setStyle(StylePolylineSync);
                              layer._leaflet_id = "Polyline_"+numero;
                              addMarkerPolylineSync(layer, layer._leaflet_id , numero);
                              drawnItemsSync.addLayer(layer);
                       }

                       $scope.guideLayers.push(layer);
                 }
               });
        }

       if(geometry=="POLYGONE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       if(sync==0){
                              layer.setStyle(StylePolygonBD);
                              layer._leaflet_id = "Polygon_"+numero;
                              layerClickBD(layer);
                              addMarkerPolygonBD(layer, layer._leaflet_id , numero);
                              drawnItems.addLayer(layer);
                       }else{
                              layer.setStyle(StylePolygonSync);
                              layer._leaflet_id = "Polygon_"+numero;
                              addMarkerPolygonSync(layer, layer._leaflet_id , numero);
                              drawnItemsSync.addLayer(layer);
                       }

                       $scope.guideLayers.push(layer);
                 }
               });
        }
}

//----------------- Les différents styles des entités déssinées  -----------------

//------------ Style des données BD non sync (A modifier) et Sync ----------//
var LeafIcon = L.Icon.extend({
    options: {
    iconSize: [25, 42],
    iconAnchor: [22, 18],
    popupAnchor: [8, 0]
    }
   });
var IconBD = new LeafIcon({
    iconUrl: 'img/pointBD.png'
   });
var IconNew = new LeafIcon({
    iconUrl: 'img/marker-icon-2x.png'
   });
var IconSync = new LeafIcon({
    iconUrl: 'img/pointSync.png'
   });

StylePolyline = {
       color: 'red',
       weight: 3,
       opacity: 1
  };

StylePolylineBD = {
       color: '#911111',
       weight: 3,
       opacity: 1
  };
StylePolylineSync = {
       color: '#323232',
       weight: 3,
       opacity: 1
  };

StylePolygonBD = {
      weight: 2,
      opacity: 0.4,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.3,
      fillColor: '#104e8b'
};
StylePolygonSync = {
      weight: 2,
      opacity: 0.4,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.3,
      fillColor: '#323232'
};
//-------------------- Style des données supports  --------------------------//

var IconSupport = new LeafIcon({
    iconUrl: 'img/pointSupport.png'
   });
var IconSupportSync = new LeafIcon({
    iconUrl: 'img/pointSupportSync.png'
   });

StylePolylineSupport = {
       color: '#8B0000',
       weight: 3,
       opacity: 1
  };
StylePolylineSupportSync = {
       color: '#600000',
       weight: 3,
       opacity: 1
  };

var StylePolygonSupport = {
    weight: 2,
    opacity: 1,
    color: 'green',
    dashArray: '3',
    fillOpacity: 0.05,
    fillColor: 'green'
 };
var StylePolygonSupportSync = {
    weight: 2,
    opacity: 1,
    color: '#006400',
    dashArray: '3',
    fillOpacity: 0.2,
    fillColor: '#006400'
 };

//---------------------------------------------------------------------------//

function drawDynamicDataSupport(geometry, Gjson, numero, sync){
        if(geometry=="POINT"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                      if(sync==0){
                              layer.setIcon(IconSupport);
                       }else{
                             layer.setIcon(IconSync);
                       }
                       addMarkerPointSupport(layer, layer._leaflet_id , numero);
                       drawnItemsSync.addLayer(layer);
                       $scope.guideLayers.push(layer);
                }
               });
        }

       if(geometry=="POLYLINE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       if(sync==0){
                              layer.setStyle(StylePolylineSupport);
                       }else{
                             layer.setStyle(StylePolylineSync);
                       }
                       addMarkerPolylineSupport(layer, layer._leaflet_id , numero);
                       drawnItemsSync.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }

       if(geometry=="POLYGONE"){
               L.geoJson(Gjson, { onEachFeature: function (feature, layer) {
                       if(sync==0){
                              layer.setStyle(StylePolygonSupport);
                       }else{
                             layer.setStyle(StylePolygonSync);
                       }
                       addMarkerPolygonSupport(layer, layer._leaflet_id , numero, sync);
                       drawnItemsSync.addLayer(layer);
                       $scope.guideLayers.push(layer);
                 }
               });
        }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// Fonction de  chargement des différents entités enregistrées sur la BD locale ///////////////////////


$scope.openModal = function(index) {
      if (index == 1) $scope.oModal1.show();
      if (index == 2) $scope.oModal2.show();
      if (index == 3) $scope.oModal3.show();
      if (index == 5) $scope.oModal5.show();
      if (index == 7) $scope.oModal7.show();
      if (index == 8) $scope.oModal8.show();
      if (index == 9) $scope.oModal9.show();
      if (index == 10) $scope.oModal10.show();

      // else $scope.oModal2.show();
    };
$scope.closeModal = function(index) {
      if (index == 1) $scope.oModal1.hide();
      if (index == 2) $scope.oModal2.hide();
      if (index == 3) $scope.oModal3.hide();
      if (index == 5) {
        $scope.oModal5.hide();

          $timeout(function() {
                // $window.location.reload();
                $ionicHistory.clearCache([$state.current.name]).then(function() {
                  $state.reload();
                });

            });

      }
       if (index == 7) $scope.oModal7.hide();
       if (index == 8) $scope.oModal8.hide();
       if (index == 9) $scope.oModal9.hide();
       if (index == 10) $scope.oModal10.hide();
      // else $scope.oModal2.hide();
    };

var modalID=0;

$scope.$on('modal.shown', function(event, modal) {
      console.info('Modal ' + modal.id + ' is shown!');
      modalID=modal.id;
    });

$scope.$on('modal.hidden', function(event, modal) {
      console.info('Modal ' + modal.id + ' is hidden!');
      modalID=0;
    });

 /*
 * Déclaration des Entités de la Carte.
 */

var StylePolygon = {
    weight: 2,
    opacity: 1,
    color: 'blue',
    dashArray: '3',
    fillOpacity: 0.05,
    fillColor: 'blue'
 };

var geolocateIcon = L.Icon.extend({
    options: {
    iconSize: [36, 36],
    iconAnchor: [8, 17],
    popupAnchor: [8, 0]

    }
   });

var gpsIcon = new geolocateIcon({
    iconUrl: 'img/gpsIcon.png'
   });

var gpsMarker = L.marker([0, 0], {icon: gpsIcon});

var gpsControl =  L.Control.extend({
      options: {
        position: 'topright'
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },

        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom gpsCtrl');

          container.style.backgroundColor = '#fff';
          container.style.width = '36px';
          container.style.height = '36px';
           container.style.borderRadius="4px";
          container.style.backgroundImage = "url(img/gps.png)";
          container.style.backgroundRepeat="no-repeat";
          container.style.backgroundPosition= "center";
          container.style.backgroundSize = "26px 26px";

          container.onclick = function(){


             var posOptions = {timeout: 10000, enableHighAccuracy: true};
             $cordovaGeolocation
             .getCurrentPosition(posOptions)

             .then(function (position) {
                var latGPS  = position.coords.latitude;
                var lngGPS = position.coords.longitude;
                // alert(latGPS+" : "+lngGPS);
                map.setView(new L.LatLng(latGPS, lngGPS), 18);
                gpsMarker.setLatLng(new L.LatLng(latGPS, lngGPS));
                map.removeLayer(gpsMarker);
                gpsMarker.addTo(map);
                 $( ".gpsCtrl" ).css( "backgroundImage", "url(img/gpsON.png)" );
             }, function(err) {
                // console.info(err);
                alert(err.message);
                $( ".gpsCtrl" ).css( "backgroundImage", "url(img/gps.png)" );
             });

          }

          return container;
        }
      });

var gpsCtrl = new gpsControl();

///////////////////////////////////////////////////////////////////////////////////////
// Control d'enregistrement sur les entités déssinées.

var sidebarBool = false;

var saveControl = L.Control.extend({
       options: {
                position: 'topright'
                //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
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
                   leafletData.getMap().then(function(map) {
                           if (sidebarBool==false){
                                  showDrawingDataInSidebar();
                                  sidebarBool = true;
                                  $("#sidebar").css( "display", "initial");
                                  sidebar.open('home');
                           }else{
                                  sidebarBool = false;
                                  sidebar.close();
                                  $("#sidebar").css( "display", "none");
                           }
                   });
               }
               return container;
        }
});

var saveCtrl = new saveControl();

function showDrawingDataInSidebarOld(){

    //------------------------------------//
    var polygonDiv = document.getElementById('polygonsTab');
    var htmlPolygon = "";
    console.info("$scope.polygonsBD.length = "+$scope.polygonsBD.length);
    for (var i = 0; i < $scope.polygonsBD.length; i++) {
       htmlPolygon+="<span onclick=showFormByGeometryTypeBD('POLYGONE','"+$scope.polygonsBD[i].id+"','"+$scope.polygonsBD[i].numero+"')><img src='img/parcelleOld.png' id='geomDataElements' width='35px' height='35px'>&nbsp; "+$scope.polygonsBD[i].numero+"</span></br>";
    }
    polygonDiv.innerHTML = htmlPolygon;

   //------------------------------------//
    console.info("$scope.polygons.length = "+$scope.polygons.length);
    for (var i = 0; i < $scope.polygons.length; i++) {
       htmlPolygon+="<span onclick=showFormByGeometryType('POLYGONE','"+$scope.polygons[i].id+"','"+$scope.polygons[i].numero+"')><img src='img/parcelleNew.png' id='geomDataElements' width='35px' height='35px'>&nbsp; "+$scope.polygons[i].numero+"</span></br>";
    }
    polygonDiv.innerHTML = htmlPolygon;

     //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

    var polylineDiv = document.getElementById('polylinesTab');
    var htmlPolyline = "";
    console.info("$scope.polylinesBD.length = "+$scope.polylinesBD.length);
    for (var i = 0; i < $scope.polylinesBD.length; i++) {
       htmlPolyline+="<span onclick=showFormByGeometryTypeBD('POLYLINE','"+$scope.polylinesBD[i].id+"','"+$scope.polylinesBD[i].numero+"')><img src='img/limiteRecOld.png' id='geomDataElements' width='35px' height='35px'> &nbsp;"+$scope.polylinesBD[i].numero+"</span></br>";
    }
    polylineDiv.innerHTML = htmlPolyline;

     //------------------------------------//
    console.info("$scope.polylines.length = "+$scope.polylines.length);
    for (var i = 0; i < $scope.polylines.length; i++) {
       htmlPolyline+="<span onclick=showFormByGeometryType('POLYLINE','"+$scope.polylines[i].id+"','"+$scope.polylines[i].numero+"')><img src='img/limiteRecNew.png' id='geomDataElements' width='35px' height='35px'> &nbsp;"+$scope.polylines[i].numero+"</span></br>";
    }
    polylineDiv.innerHTML = htmlPolyline;

    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

    var pointDiv = document.getElementById('pointsTab');
    var htmlPoint = "";
    console.info("$scope.pointsBD.length = "+$scope.pointsBD.length);
    for (var i = 0; i < $scope.pointsBD.length; i++) {
       htmlPoint+="<span onclick=showFormByGeometryTypeBD('POINT','"+$scope.pointsBD[i].id+"','"+$scope.pointsBD[i].numero+"')><img src='img/pointBD.png' id='geomDataElements' width='25px' height='35px'> &nbsp;"+$scope.pointsBD[i].numero+"</span></br>";
    }
    pointDiv.innerHTML = htmlPoint;

     //------------------------------------//
    console.info("$scope.points.length = "+$scope.points.length);
    for (var i = 0; i < $scope.points.length; i++) {
       htmlPoint+="<span onclick=showFormByGeometryType('POINT','"+$scope.points[i].id+"','"+$scope.points[i].numero+"')><img src='img/pointNV.png' id='geomDataElements' width='25px' height='35px'> &nbsp;"+$scope.points[i].numero+"</span></br>";
    }
    pointDiv.innerHTML = htmlPoint;
}

function showDrawingDataInSidebar(){

    //------------------------------------//
    var polygonDiv = document.getElementById('polygonsTab');
    var htmlPolygon = "";
    console.info("$scope.polygonsBD.length = "+$scope.polygonsBD.length);
    for (var i = 0; i < $scope.polygonsBD.length; i++) {
       htmlPolygon+="<span onclick=showFormByGeometryType('POLYGONEBD','"+$scope.polygonsBD[i].id+"','"+$scope.polygonsBD[i].numero+"')><img src='img/parcelleOld.png' id='geomDataElements' width='35px' height='35px'>&nbsp; "+$scope.polygonsBD[i].numero+"</span></br>";
    }
    polygonDiv.innerHTML = htmlPolygon;

   //------------------------------------//
    console.info("$scope.polygons.length = "+$scope.polygons.length);
    for (var i = 0; i < $scope.polygons.length; i++) {
      console.info($scope.polygons[i]);
       htmlPolygon+="<span onclick=showFormByGeometryType('POLYGONE','"+$scope.polygons[i].id+"','"+$scope.polygons[i].numero+"')><img src='img/parcelleNew.png' id='geomDataElements' width='35px' height='35px'>&nbsp; "+$scope.polygons[i].numero+"</span></br>";
    }
    polygonDiv.innerHTML = htmlPolygon;

     //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

    var polylineDiv = document.getElementById('polylinesTab');
    var htmlPolyline = "";
    console.info("$scope.polylinesBD.length = "+$scope.polylinesBD.length);
    for (var i = 0; i < $scope.polylinesBD.length; i++) {
       htmlPolyline+="<span onclick=showFormByGeometryType('POLYLINEBD','"+$scope.polylinesBD[i].id+"','"+$scope.polylinesBD[i].numero+"')><img src='img/limiteRecOld.png' id='geomDataElements' width='35px' height='35px'> &nbsp;"+$scope.polylinesBD[i].numero+"</span></br>";
    }
    polylineDiv.innerHTML = htmlPolyline;

     //------------------------------------//
    console.info("$scope.polylines.length = "+$scope.polylines.length);
    for (var i = 0; i < $scope.polylines.length; i++) {
       htmlPolyline+="<span onclick=showFormByGeometryType('POLYLINE','"+$scope.polylines[i].id+"','"+$scope.polylines[i].numero+"')><img src='img/limiteRecNew.png' id='geomDataElements' width='35px' height='35px'> &nbsp;"+$scope.polylines[i].numero+"</span></br>";
    }
    polylineDiv.innerHTML = htmlPolyline;

    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

    var pointDiv = document.getElementById('pointsTab');
    var htmlPoint = "";
    console.info("$scope.pointsBD.length = "+$scope.pointsBD.length);
    for (var i = 0; i < $scope.pointsBD.length; i++) {
       htmlPoint+="<span onclick=showFormByGeometryType('POINTBD','"+$scope.pointsBD[i].id+"','"+$scope.pointsBD[i].numero+"')><img src='img/pointBD.png' id='geomDataElements' width='25px' height='35px'> &nbsp;"+$scope.pointsBD[i].numero+"</span></br>";
    }
    pointDiv.innerHTML = htmlPoint;

     //------------------------------------//
    console.info("$scope.points.length = "+$scope.points.length);
    for (var i = 0; i < $scope.points.length; i++) {
       htmlPoint+="<span onclick=showFormByGeometryType('POINT','"+$scope.points[i].id+"','"+$scope.points[i].numero+"')><img src='img/pointNV.png' id='geomDataElements' width='25px' height='35px'> &nbsp;"+$scope.points[i].numero+"</span></br>";
    }
    pointDiv.innerHTML = htmlPoint;
}

$scope.hideModalRender=function(){
     // $scope.modalRender.hide();
     $scope.modalRender.remove();
}


 $scope.dataViewer = {
        numViewableSlides : 0,
        slideIndex : 0
 };

$scope.next = function() {
    $ionicSlideBoxDelegate.next();
};
$scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
};
$scope.slideChanged = function(index) {
    $scope.dataViewer.slideIndex = index;
};

////////////////////////////////////////

var layerToEdit;

function if_InsideSupportCommune(layer, geometry){
        var result = true;
        var inCommune = getCommuneIntersection(layer, geometry);
        if($scope.hasSupport && $scope.typeSupport!="tabulaire"){
                var support = getSupportIntersection(layer, geometry);
                console.info("SUPPORT= "+support);
                 if(support==-1){
                        result = false;
                }
        }else{
               if(inCommune==-1){
                       result = false;
               }
        }
        return result;
}


layerClick=function(layer){

        leafletData.getMap().then(function(map) {
               layer.on('click', function(e){

                       $("div.leaflet-popup").remove();
                       if (boolEdit==true){

                              if(selectedFeature){
                                     if (selectedFeature instanceof L.Marker) {
                                             selectedFeature.dragging.disable();
                                             console.info("valider_Geometrie_Informations_Feature_POINT layerClick");
                                             valider_Geometrie_Informations_Feature_POINT(selectedFeature);
                                     }else{
                                             selectedFeature.snapediting.disable();
                                              if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon))  {

                                              }else{
                                                      valider_Geometrie_Informations_Feature(selectedFeature);
                                              }
                                     }
                              }

                              console.info("layerClick");
                              var projection;
                              var supportCommune;
                              selectedFeature = e.target;
                              e.target.options.editing || (e.target.options.editing = {});

                              if (layer instanceof L.Marker) {
                                   layerToEdit = e.target._latlng;
                                   selectedFeature.dragging.enable();
                                   projection = getUTMProjection(e.target, "POINT");
                                   supportCommune =  if_InsideSupportCommune(e.target, "POINT");
                             }else{
                                     layerToEdit = e.target.getLatLngs();
                                     console.info("1- "+layerToEdit);
                                     e.target.snapediting = new L.Handler.PolylineSnap(map, e.target);
                                     e.target.snapediting.addGuideLayer(drawnItems);
                                     e.target.snapediting.enable();
                                     if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
                                             projection = getUTMProjection(e.target, "POLYLINE");
                                             supportCommune =  if_InsideSupportCommune(e.target, "POLYLINE");
                                     }
                                     if (layer instanceof L.Polygon)  {
                                             projection = getUTMProjection(e.target, "POLYGONE");
                                             supportCommune =  if_InsideSupportCommune(e.target, "POLYGONE");
                                     }
                             }


                              if((projection=="") || (supportCommune==false)){
                                     ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                     return;
                              }
                         }
                  });
        });
};

layerClickBD=function(layer){

  leafletData.getMap().then(function(map) {
        //---------------------------------------------//
        layer.on('click', function(e){
              $("div.leaflet-popup").remove();
              if (boolEdit==true){
                       if(selectedFeature){
                              if (selectedFeature instanceof L.Marker) {
                                     selectedFeature.dragging.disable();
                                     valider_Geometrie_Informations_Feature_POINT(selectedFeature);
                              }else{
                                     selectedFeature.snapediting.disable();
                                      if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon))  {

                                      }else{
                                             valider_Geometrie_Informations_Feature(selectedFeature);
                                      }
                               }
                       }

                       console.info("layerClickBD");
                       var projection;
                       selectedFeature = e.target;
                       e.target.options.editing || (e.target.options.editing = {});

                       if (layer instanceof L.Marker){
                         layerToEdit = e.target._latlng;
                         selectedFeature.dragging.enable();
                         projection = getUTMProjection(e.target, "POINT");
                       }else{
                              layerToEdit = e.target.getLatLngs();
                              e.target.snapediting = new L.Handler.PolylineSnap(map, e.target);
                              e.target.snapediting.addGuideLayer(drawnItems);
                              e.target.snapediting.enable();
                              if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
                                     projection = getUTMProjection(e.target, "POLYLINE");
                              }

                              if (layer instanceof L.Polygon)  {
                                     projection = getUTMProjection(e.target, "POLYGONE");
                              }
                       }
                       if(projection==""){
                              ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                              return;
                       }
               }
        });
        //---------------------------------------------//
        // layer.on('edit', function (e) {
        //        var projection;
        //        var numero;
        //        var db_id;
        //        if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
        //                projection = getUTMProjection(e.target, "POLYLINE");
        //                for(var i=0; i<$scope.polylinesBD.length; i++){
        //                       if($scope.polylinesBD[i].id==e.target._leaflet_id){
        //                               numero= $scope.polylinesBD[i].numero;
        //                               db_id= $scope.polylinesBD[i].db_id;
        //                       }
        //                }
        //         }

        //        if (layer instanceof L.Polygon)  {
        //                projection = getUTMProjection(e.target, "POLYGONE");
        //                for(var i=0; i<$scope.polygonsBD.length; i++){
        //                        if($scope.polygonsBD[i].id==e.target._leaflet_id){
        //                               numero= $scope.polygonsBD[i].numero;
        //                               db_id= $scope.polygonsBD[i].db_id;
        //                        }
        //                 }
        //         }

        //        if(projection==""){
        //                ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
        //                if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon)){
        //                        deleteMarkerPolylineBD(e.target._leaflet_id);
        //                        addMarkerPolylineBD(e.target, e.target._leaflet_id, numero);
        //                }
        //                if (layer instanceof L.Polygon){
        //                        deleteMarkerPolygonBD(e.target._leaflet_id);
        //                        addMarkerPolygonBD(e.target, e.target._leaflet_id, numero);
        //                }
        //                return;
        //        }else{
        //                layerToEdit = e.target.getLatLngs();
        //                var Gjson = e.target.toGeoJSON();
        //                if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
        //                        deleteMarkerPolylineBD(e.target._leaflet_id);
        //                        addMarkerPolylineBD(e.target, e.target._leaflet_id, numero);
        //                }
        //                if (layer instanceof L.Polygon)  {
        //                        deleteMarkerPolygonBD(e.target._leaflet_id);
        //                        addMarkerPolygonBD(e.target, e.target._leaflet_id, numero);
        //                }
        //                 // Parcourir les Polylines pour changer le shape et gjson de l'entité éditée :
        //                 for (var i = 0; i < $scope.polylinesBD.length; i++) {
        //                        if ($scope.polylinesBD[i].id == e.target._leaflet_id) {
        //                               latlngs = e.target.getLatLngs();
        //                               shape = getShapeOfGeometry(projection, latlngs,"POLYLINE");
        //                               $scope.polylinesBD[i].shape = shape;
        //                               $scope.polylinesBD[i].gjson = JSON.stringify(Gjson);
        //                               // $scope.UpdateJsonData(db_id);
        //                        }
        //                 }
        //                 // Parcourir les Polygons pour changer le shape et gjson de l'entité éditée :
        //                 for (var i = 0; i < $scope.polygonsBD.length; i++) {
        //                        if ($scope.polygonsBD[i].id == e.target._leaflet_id) {
        //                                latlngs = e.target.getLatLngs();
        //                                shape = getShapeOfGeometry(projection, latlngs,"POLYGONE");
        //                                $scope.polygonsBD[i].shape = shape;
        //                                $scope.polygonsBD[i].gjson = JSON.stringify(Gjson);
        //                                var area = turf.area(Gjson.geometry);
        //                                var ha = area/10000;
        //                                var ha = parseFloat(ha.toFixed(4));
        //                                $scope.polygonsBD[i].superficie = ha;
        //                                // $scope.UpdateJsonData(db_id);

        //                        }
        //                 }
        //        }
        // });

        //---------------------------------------------//
        layer.on('dragend', function (e) {
               var numero;
               var db_id;
               for(var i=0; i<$scope.pointsBD.length; i++){
                       if($scope.pointsBD[i].id==e.target._leaflet_id){
                              numero= $scope.pointsBD[i].numero;
                              db_id= $scope.pointsBD[i].db_id;
                       }
               }
               var projection= getUTMProjection(e.target, "POINT");
               if(projection==""){
                       ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                       e.target.setLatLng(layerToEdit);
                       deleteMarkerPointBD(e.target._leaflet_id);
                       addMarkerPointBD(e.target, e.target._leaflet_id, numero);
                       return;
               }else{
                       var Gjson = e.target.toGeoJSON();
                       layerToEdit = e.target._latlng;
                       deleteMarkerPointBD(e.target._leaflet_id);
                       addMarkerPointBD(e.target, e.target._leaflet_id, numero);
                       // Parcourir les Points pour changer le shape et gjson de l'entité éditée :
                       for (var i = 0; i < $scope.pointsBD.length; i++) {
                              if ($scope.pointsBD[i].id == e.target._leaflet_id) {
                                      latlngs = e.target._latlng;
                                      shape = getShapeOfGeometry(projection, latlngs,"POINT");
                                      $scope.pointsBD[i].shape = shape;
                                      $scope.pointsBD[i].gjson = JSON.stringify(Gjson);
                                      // $scope.UpdateJsonData(db_id);
                              }
                       }
               }
        });
       //---------------------------------------------//
  });
};

function updateJsonDB(id, data, geomType){
        var jsonData;
        if(geomType=="POINT" || geomType=="POLYLINE"){
               jsonData= {
                      id: data.id,
                      numero: data.numero,
                      shape: data.shape,
                      gjson: data.gjson,
                      date_creation: data.date_creation,
                      formdata: data.formdata
               };
        }
        if(geomType=="POLYGONE"){
               jsonData= {
                      id: data.id,
                      numero: data.numero,
                      shape: data.shape,
                      gjson: data.gjson,
                      superficie: data.superficie,
                      date_creation: data.date_creation,
                      formdata: data.formdata
               };
        }
        var sqlUpdateData= "UPDATE dynamicData  SET  data = '"+JSON.stringify(jsonData)+"' WHERE id ="+id;
        $cordovaSQLite.execute(db, sqlUpdateData).then(function(res) {
        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlUpdateData= '+sqlUpdateData);
        });
}

//-------------------FIN ::: Functions de Gestion des Formulaires sur les entités déssinées  --------------------

$scope.sttButton=false;

$scope.scrollToTop = function() { //ng-click for back to top button
   $ionicScrollDelegate.scrollTop(true);
};

$scope.scrollToBottom = function() { //ng-click for back to top button
   $ionicScrollDelegate.scrollBottom(true);
};

$scope.getScrollPosition = function() {
 //monitor the scroll
  var moveData = $ionicScrollDelegate.getScrollPosition().top;
  // console.log(moveData);
     if(moveData>150){
        $scope.$apply(function(){
          $scope.sttButton=true;
        });//apply
      }else{
        $scope.$apply(function(){
          $scope.sttButton=false;
        });//apply
      }
};

$scope.formOpened;


showFormByGeometryTypeOLD = function(geomType, id, numero){

        let  html =`<ion-modal-view id="ayoub" style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;

        if(geomType=="POINT"){
               formName = "POINT N°"+numero;
               $scope.formOpened = "POINT";
               $scope.formInput = JSON.parse($scope.fieldsFormPoint);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        if(geomType=="POLYLINE"){
               formName = "POLYLINE N°"+numero;
               $scope.formOpened = "POLYLINE";
               console.info($scope.fieldsFormPolyline);
               $scope.formInput = JSON.parse($scope.fieldsFormPolyline);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        if(geomType=="POLYGONE"){
               formName = "POLYGONE N°"+numero;
               $scope.formOpened = "POLYGONE";
               $scope.formInput = JSON.parse($scope.fieldsFormPolygon);
               // $localStorage.formTest = JSON.parse($scope.fieldsFormPolygon);
               // console.info($scope.fieldsFormPolygon);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()"   overflow-scroll="true">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        html+= ` <button class="button button-full button-grisClair" ng-click="hideModalRender()">Annuler</button>`;
        html+= `</ion-content></ion-modal-view>`;

          $scope.boolScroll = true;

       $scope.modalRender  = new $ionicModal.fromTemplate(html, {
          scope: $scope,
          focusFirstInput:false,
          backdropClickToClose:false,
          hardwareBackButtonClose:false
         });

        // $scope.modalRender.show();
        var dataObject;
          for (var i = 0; i < $scope.polygons.length; i++) {
                if ($scope.polygons[i].id == id) {
                   dataObject = JSON.stringify($scope.polygons[i]);
                }
          }

         // $state.go('tab.questionnaire', {idCollecte: id, numCollecte: $scope.numeroCollecte, numero: numero, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: geomType},{reload:true});
         $state.go('tab.questionnaire', {idCollecte: id, numCollecte: $scope.numeroCollecte, numero: numero, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: geomType});


        $scope.idDrawned = id;

        sidebar.close();

        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

showFormByGeometryType = function(geomType, id, numero){
        var dataObject;
        console.info(geomType+" - "+id+" - "+numero);
        if(geomType=="POINT"){
               $scope.formInput = JSON.parse($scope.fieldsFormPoint);
                for (var i = 0; i < $scope.points.length; i++) {
                       if ($scope.points[i].id == id) {
                              dataObject = JSON.stringify($scope.points[i]);
                       }
                }
       }
       if(geomType=="POINTBD"){
               $scope.formInput = JSON.parse($scope.fieldsFormPoint);
                for (var i = 0; i < $scope.pointsBD.length; i++) {
                       if ($scope.pointsBD[i].id == id) {
                              dataObject = JSON.stringify($scope.pointsBD[i]);
                       }
                }
       }

        if(geomType=="POLYLINE"){
               $scope.formInput = JSON.parse($scope.fieldsFormPolyline);
                for (var i = 0; i < $scope.polylines.length; i++) {
                       if ($scope.polylines[i].id == id) {
                              dataObject = JSON.stringify($scope.polylines[i]);
                       }
                }
       }
        if(geomType=="POLYLINEBD"){
               $scope.formInput = JSON.parse($scope.fieldsFormPolyline);
                for (var i = 0; i < $scope.polylinesBD.length; i++) {
                       if ($scope.polylinesBD[i].id == id) {
                              dataObject = JSON.stringify($scope.polylinesBD[i]);
                       }
                }
       }

        if(geomType=="POLYGONE"){
               $scope.formInput = JSON.parse($scope.fieldsFormPolygon);
               for (var i = 0; i < $scope.polygons.length; i++) {
                       if ($scope.polygons[i].id == id) {
                              dataObject = JSON.stringify($scope.polygons[i]);
                       }
                }
       }
        if(geomType=="POLYGONEBD"){
               $scope.formInput = JSON.parse($scope.fieldsFormPolygon);
               for (var i = 0; i < $scope.polygonsBD.length; i++) {
                       if ($scope.polygonsBD[i].id == id) {
                              dataObject = JSON.stringify($scope.polygonsBD[i]);
                       }
                }
       }

         // $state.go('tab.questionnaire', {idCollecte: id, numCollecte: $scope.numeroCollecte, numero: numero, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: geomType},{reload:true});
         $state.go('tab.questionnaire', {idCollecte: id, numCollecte: $scope.numeroCollecte, numero: numero, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: geomType});

        sidebar.close();
        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

showFormByGeometryTypeBDOld = function(geomType, id, numero){

        let  html =`<ion-modal-view id="ayoub" style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;

        if(geomType=="POINT"){
               formName = "POINT N°"+numero;
               $scope.formOpened = "POINTBD";
               $scope.formInput = JSON.parse($scope.fieldsFormPoint);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        if(geomType=="POLYLINE"){
               formName = "POLYLINE N°"+numero;
               $scope.formOpened = "POLYLINEBD";
               console.info($scope.fieldsFormPolyline);
               $scope.formInput = JSON.parse($scope.fieldsFormPolyline);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        if(geomType=="POLYGONE"){
               formName = "POLYGONE N°"+numero;
               $scope.formOpened = "POLYGONEBD";
               $scope.formInput = JSON.parse($scope.fieldsFormPolygon);

               html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
               html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
               html+=  ` </ion-header-bar>`;
               html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
               html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;

               // var area;
               // for(var i=0; i< $scope.polygonsBD.length; i++){
               //         if($scope.polygonsBD[i].id==id){
               //                area= $scope.polygonsBD[i].superficie;
               //         }
               // }
               // html+=  ` <div class="item row">`;
               // html+=  ` <div class="col"><label class="item item-input"><span class="input-label">Superficie</span>`;
               // html+=  ` <input ng-model="area" type="text" disabled ng-init=area=`+area+`></label></div></div>`;

               html+=  `  <formio form="formInput" submission="formdata"></formio>`;
       }

        html+= ` <button class="button button-full button-grisClair" ng-click="hideModalRender()">Annuler</button>`;
        html+= `</ion-content></ion-modal-view>`;


       $scope.modalRender  = new $ionicModal.fromTemplate(html, {
          scope: $scope,
          focusFirstInput:true,
          backdropClickToClose:false,
          hardwareBackButtonClose:false
         });

        $scope.modalRender.show();

        $scope.idDrawned = id;

        sidebar.close();

        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

$scope.ShowIdentificationFormOld=function(){

        $scope.disableDrawControllers();

        formName = "IDENTIFICATION "+$scope.userId+"-"+$scope.numeroCollecte;
        $scope.formOpened = "ATTRIBUT";
        $scope.formInput = JSON.parse($scope.fieldsFormNone);

        let  html =`<ion-modal-view id="ayoub" style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
        html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
        html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
        html+=  ` </ion-header-bar>`;
        html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
        // html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;
        html+=  `  <formio form="formInput" submission="formdata"></formio>`;
        html+= ` <button class="button button-full button-grisClair" ng-click="hideModalRender()">Annuler</button>`;
        html+= `</ion-content></ion-modal-view>`;

        $scope.modalRender  = new $ionicModal.fromTemplate(html, {
          scope: $scope,
          focusFirstInput:true,
          backdropClickToClose:false,
          hardwareBackButtonClose:false
         });

        $scope.modalRender.show();
        // $scope.idDrawned = id;
        sidebar.close();

        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

$scope.ShowIdentificationForm=function(){

        $scope.disableDrawControllers();
        $scope.formInput = JSON.parse($scope.fieldsFormNone);
        console.info("$scope.identificationData> "+$scope.identificationData);
        var dataObject;
        if($scope.identificationData!=undefined){
                dataObject = JSON.stringify($scope.identificationData);
        }else{
                dataObject = JSON.stringify({});
                // dataObject = JSON.stringify();
        }

        checkTableTemporaire($scope.numeroCollecte, "ATTRIBUT").then(function(){
               console.info(existeDansTableTemp);
               if(existeDansTableTemp==false){
                       alimenterTableTemporaire("", $scope.numeroCollecte, 0, $stateParams.mode, "ATTRIBUT", dataObject, dataObject );
               }
        });

        $timeout(function () {
               // $state.go('tab.questionnaire', {idCollecte: "", numCollecte: $scope.numeroCollecte, numero:0, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: "ATTRIBUT"},{reload:true});
               $state.go('tab.questionnaire', {idCollecte: "", numCollecte: $scope.numeroCollecte, numero:0, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: "ATTRIBUT"});
        }, 600);

        // $state.go('tab.questionnaire', {idCollecte: "", numCollecte: $scope.numeroCollecte, numero:0, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: "ATTRIBUT"},{reload:true});


        // $state.go('tab.questionnaire', {numCollecte: $scope.numeroCollecte, mode: $stateParams.mode, questionnaire: $scope.formInput , data: dataObject, type: "ATTRIBUT"},{reload:true});

        sidebar.close();
        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

//------------------- FormBuilder Load & Submit  --------------------

 alimenterTableTemporaire = function(id, numCollecte, numero, mode, type, data, formdata){
        console.info(id+" , "+ numCollecte+" , "+ numero+" , "+ mode+" , "+ type+" , "+ data+" , "+ formdata);
        var sqlInsertTempData= "INSERT INTO tempData (id, numCollecte, numero, mode, type, data, formdata) VALUES(?,?,?,?,?,?,?)";
        $cordovaSQLite.execute(db, sqlInsertTempData,[id, numCollecte, numero, mode, type, data, formdata]).then(function(res) {
            console.info(res);
         }, function (err) {
            console.log(err);
            console.log('ERR SQL sqlInsertTempData= '+sqlInsertTempData);
        });
 }

  var existeDansTableTemp= false;
  checkTableTemporaire = function(numCollecte, type){
        console.info(numCollecte+" , "+ type);
        var deferred = $q.defer();
        var sqlselect= "SELECT increment FROM tempData WHERE numCollecte = '"+numCollecte+"' AND type = '"+type+"' ";
        console.info(sqlselect);
         existeDansTableTemp = false;
        $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                if(res.rows.length>0){
                       existeDansTableTemp = true;
                }else{
                       existeDansTableTemp = false;
                }
                console.info(res);
                deferred.resolve();
        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlselect= '+sqlselect);
               deferred.resolve();
        });
        return deferred.promise;
  }

  viderTableTemporaire = function(){
        var deferred = $q.defer();
        var sqlEmptyTemp= "DELETE  FROM tempData ";
        console.info(sqlEmptyTemp);
        $cordovaSQLite.execute(db, sqlEmptyTemp).then(function(reso) {
                console.info(reso);
                deferred.resolve();
        });
        return deferred.promise;
  }

  updateTableTemporaire = function(id, numCollecte, numero, mode, type, data, formdata){
        console.info(id+" , "+ numCollecte+" , "+ numero+" , "+ mode+" , "+ type+" , "+ data+" , "+ formdata);
         var sqlselect= "UPDATE tempData SET data = '"+data+"',  formdata = '"+formdata+"' WHERE   id ='"+id+"' ";
         sqlselect+=" AND numCollecte = '"+numCollecte+"' ";
         sqlselect+=" AND numero = "+numero;
         sqlselect+=" AND mode = '"+mode+"' ";
         sqlselect+=" AND type = '"+type+"' ";
         // sqlselect+=" AND data = '"+data+"' ";
         // sqlselect+=" AND formdata = '"+formdata+"' ";
        $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                console.info(res);
        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlselect= '+sqlselect);
        });
  }


 updateDeleteTableTemporaireGeom = function(id, numCollecte, numero, mode, type, data, operation){
        var deferred = $q.defer();
        console.info(id+" , "+ numCollecte+" , "+ numero+" , "+ mode+" , "+ type+" , "+ data+" , "+ operation);
         var sqlselect;
        if(operation=="DELETE"){
               // sqlselect= "DELETE FROM tempData WHERE id ='"+id+"' AND numCollecte = '"+numCollecte+"' AND numero = "+numero +" AND mode = '"+mode+"'  AND type = '"+type+"' ";
               sqlselect= "DELETE FROM tempData WHERE numCollecte = '"+numCollecte+"' AND numero = "+numero +" AND mode = '"+mode+"'  AND type = '"+type+"' ";
        }else{
               // sqlselect= "UPDATE tempData SET data = '"+data+"' WHERE   id ='"+id+"' AND numCollecte = '"+numCollecte+"' AND numero = "+numero +" AND mode = '"+mode+"'  AND type = '"+type+"' ";
               sqlselect= "UPDATE tempData SET data = '"+data+"' WHERE  numCollecte = '"+numCollecte+"' AND numero = "+numero +" AND mode = '"+mode+"'  AND type = '"+type+"' ";
        }
        console.info(sqlselect);
        $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                console.info(res);
                deferred.resolve();
        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlselect= '+sqlselect);
        });
        return deferred.promise;
  }

 $scope.selectAllTableTemporaire = function(){
        var sqlselect= "SELECT id, numCollecte, numero, mode, type, data FROM tempData";
        console.info(sqlselect);
        $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                console.info(res.rows.length);
                console.info("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                for(var i = 0; i< res.rows.length; i++){
                  console.info("id= "+res.rows.item(i).id);
                  console.info("numCollecte= "+res.rows.item(i).numCollecte);
                  console.info("numero= "+res.rows.item(i).numero);
                  console.info("mode= "+res.rows.item(i).mode);
                  console.info("type= "+res.rows.item(i).type);
                  console.info("data= "+res.rows.item(i).data);
                }
                console.info("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
        }, function (err) {
               console.log(err);
               console.log('ERR SQL sqlselect= '+sqlselect);
        });
  }

 $scope.removeSyncFromDynamicData = function(){
        // $cordovaSQLite.execute(db, "UPDATE dynamicData SET sync = 0 ").then(function(reso) {
        //        console.info(reso);
        //        console.info(reso.rows.length);
        // });
 }

$scope.$on('formLoad', function() {

             console.info("$scope.idDrawned = "+$scope.idDrawned);
             console.info("$scope.formOpened = "+$scope.formOpened);

              if($scope.formOpened=="POINT"){
                       for (var i = 0; i < $scope.points.length; i++) {
                              if ($scope.points[i].id == $scope.idDrawned) {
                                         console.info("$scope.points[i].id = "+$scope.points[i].id+" | $scope.idDrawned = "+$scope.idDrawned+" | $scope.points[i].formdata= "+$scope.points[i].formdata);
                                      if($scope.points[i].formdata!=undefined){
                                          $scope.formdata = JSON.parse($scope.points[i].formdata);
                                          $scope.formdata = $scope.points[i].formdata;
                                          console.info($scope.formdata);
                                       }else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.points[i].numero};
                                       }
                              }
                        }
               }
              if($scope.formOpened=="POINTBD"){
                       for (var i = 0; i < $scope.pointsBD.length; i++) {
                              if ($scope.pointsBD[i].id == $scope.idDrawned) {
                                         console.info("$scope.pointsBD[i].id = "+$scope.pointsBD[i].id+" | $scope.idDrawned = "+$scope.idDrawned+" | $scope.pointsBD[i].formdata= "+$scope.pointsBD[i].formdata);
                                      if($scope.pointsBD[i].formdata!=undefined){
                                          $scope.formdata.data.dssnumberdraw=$scope.pointsBD[i].numero;
                                          $scope.formdata = $scope.pointsBD[i].formdata;
                                          console.info($scope.formdata);
                                       }else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.pointsBD[i].numero};
                                       }
                              }
                        }
               }

               if($scope.formOpened=="POLYLINE"){
                       for (var i = 0; i < $scope.polylines.length; i++) {
                              if ($scope.polylines[i].id == $scope.idDrawned) {
                                      if($scope.polylines[i].formdata!=undefined){
                                          $scope.formdata = JSON.parse($scope.polylines[i].formdata);
                                          console.info($scope.formdata);
                                       }
                                       else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.polylines[i].numero};
                                       }
                              }
                        }
               }
                if($scope.formOpened=="POLYLINEBD"){
                       for (var i = 0; i < $scope.polylinesBD.length; i++) {
                              if ($scope.polylinesBD[i].id == $scope.idDrawned) {
                                      if($scope.polylinesBD[i].formdata!=undefined){
                                          $scope.formdata = $scope.polylinesBD[i].formdata;
                                          $scope.formdata.data.dssnumberdraw=$scope.polylinesBD[i].numero;
                                          console.info($scope.formdata);
                                       }
                                       else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.polylines[i].numero};
                                       }
                              }
                        }
               }

               if($scope.formOpened=="POLYGONE"){
                       for (var i = 0; i < $scope.polygons.length; i++) {
                              if ($scope.polygons[i].id == $scope.idDrawned) {
                                      if($scope.polygons[i].formdata!=undefined){
                                          $scope.formdata = JSON.parse($scope.polygons[i].formdata);
                                          console.info($scope.formdata);
                                       }else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.polygons[i].numero, dssareac: $scope.polygons[i].superficie};
                                       }
                              }
                        }
               }
                if($scope.formOpened=="POLYGONEBD"){
                       for (var i = 0; i < $scope.polygonsBD.length; i++) {
                              if ($scope.polygonsBD[i].id == $scope.idDrawned) {
                                      console.info($scope.polygonsBD[i].formdata);
                                      if($scope.polygonsBD[i].formdata!=undefined){
                                          $scope.formdata = $scope.polygonsBD[i].formdata;
                                          console.info( $scope.formdata.data.dssareac);
                                          console.info($scope.polygonsBD[i].superficie);
                                          $scope.formdata.data.dssnumberdraw=$scope.polygonsBD[i].numero;
                                          $scope.formdata.data.dssareac=$scope.polygonsBD[i].superficie;
                                          console.info($scope.formdata);
                                       }else{
                                            $scope.formdata = {};
                                            $scope.formdata.data = {dssnumberdraw: $scope.polygonsBD[i].numero, dssareac: $scope.polygonsBD[i].superficie};
                                       }
                              }
                        }
               }

                if($scope.formOpened=="ATTRIBUT"){
                       console.info($scope.identificationData);
                       var supTot = 0;
                       for(var i=0; i< $scope.polygons.length;  i++){
                              supTot += $scope.polygons[i].superficie;
                       }

                       if($scope.identificationData!=undefined){
                              $scope.formdata = $scope.identificationData;
                       }else{
                              $scope.formdata = {};
                       }
               }
 });

$scope.$on('formSubmit', function(err, submission) {

      console.info("$scope.formOpened = "+$scope.formOpened);
      console.info("$scope.idDrawned = "+$scope.idDrawned);
      console.info(submission);  console.info(JSON.stringify(submission.data));

       if($scope.formOpened=="POINT"){
              for (var i = 0; i < $scope.points.length; i++) {
                    if ($scope.points[i].id == $scope.idDrawned) {
                        $scope.points[i].formdata =JSON.stringify(submission);
                    }
              }
       }
       if($scope.formOpened=="POINTBD"){
              for (var i = 0; i < $scope.pointsBD.length; i++) {
                    if ($scope.pointsBD[i].id == $scope.idDrawned) {
                        $scope.pointsBD[i].formdata =submission;
                    }
              }
       }

       if($scope.formOpened=="POLYLINE"){
              for (var i = 0; i < $scope.polylines.length; i++) {
                    if ($scope.polylines[i].id == $scope.idDrawned) {
                        $scope.polylines[i].formdata =JSON.stringify(submission);
                    }
              }
       }
       if($scope.formOpened=="POLYLINEBD"){
              for (var i = 0; i < $scope.polylinesBD.length; i++) {
                    if ($scope.polylinesBD[i].id == $scope.idDrawned) {
                        $scope.polylinesBD[i].formdata =submission;
                    }
              }
       }

       if($scope.formOpened=="POLYGONE"){
              for (var i = 0; i < $scope.polygons.length; i++) {
                    if ($scope.polygons[i].id == $scope.idDrawned) {
                        $scope.polygons[i].formdata =JSON.stringify(submission);
                        // var numCollecte= $scope.userId+"-"+$scope.numeroCollecte;
                        updateTableTemporaire($scope.idDrawned, $scope.numeroCollecte, $scope.polygons[i].numero, $stateParams.mode, "POLYGONE", JSON.stringify($scope.polygons[i]), JSON.stringify(submission) );
                    }
              }
      }
       if($scope.formOpened=="POLYGONEBD"){
              for (var i = 0; i < $scope.polygonsBD.length; i++) {
                    if ($scope.polygonsBD[i].id == $scope.idDrawned) {
                        $scope.polygonsBD[i].formdata =submission;
                        console.info("$scope.polygonsBD[i].db_id= "+$scope.polygonsBD[i].db_id);
                    }
              }
      }

        if($scope.formOpened=="ATTRIBUT"){
               $scope.identificationData =submission;
        }

      $scope.hideModalRender();
      $scope.boolScroll = false;

 });

 /////////////////////////////////////////////////////////////////////////////////////////////////

   function valider_Geometrie_Informations_Feature_POINT(selectedFeature){
                console.info(" **************************************************** ");
                var numero;
                var arrayPoint  = $scope.points;
                if($stateParams.mode=="m"){ arrayPoint = $scope.pointsBD;}
                for(var i=0; i<arrayPoint.length; i++){
                       if(arrayPoint[i].id==selectedFeature._leaflet_id){
                              numero= arrayPoint[i].numero;
                       }
                }

               var inCommune = getCommuneIntersection(selectedFeature, "POINT");
                if(inCommune==-1){
                         ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                         return;
               }

                var projection= getUTMProjection(selectedFeature, "POINT");
                if(projection==""){
                       ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                       selectedFeature.setLatLng(layerToEdit);
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(selectedFeature._leaflet_id);
                                deplaceMarkerPointBD(selectedFeature, selectedFeature._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(selectedFeature._leaflet_id);
                              deplaceMarkerPoint(selectedFeature, selectedFeature._leaflet_id, numero);
                        }
                       return;
               }else{
                       var Gjson = selectedFeature.toGeoJSON();
                       layerToEdit = selectedFeature._latlng;
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(selectedFeature._leaflet_id);
                                deplaceMarkerPointBD(selectedFeature,selectedFeature._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(selectedFeature._leaflet_id);
                              deplaceMarkerPoint(selectedFeature, selectedFeature._leaflet_id, numero);
                        }

                       // Parcourir les Points pour changer le shape et gjson de l'entité éditée :
                       for (var i = 0; i < arrayPoint.length; i++) {
                               if (arrayPoint[i].id == selectedFeature._leaflet_id) {
                                      latlngs = selectedFeature._latlng;
                                      shape = getShapeOfGeometry(projection, latlngs,"POINT");
                                      arrayPoint[i].shape = shape;
                                      arrayPoint[i].gjson = JSON.stringify(Gjson);
                                       if($stateParams.mode=="m"){
                                            updateDeleteTableTemporaireGeom(selectedFeature._leaflet_id, $scope.numeroCollecte, arrayPoint[i].numero, $stateParams.mode, "POINTBD", JSON.stringify(arrayPoint[i]), "UPDATE").then(function(){ });
                                       }else{
                                            updateDeleteTableTemporaireGeom(selectedFeature._leaflet_id, $scope.numeroCollecte, arrayPoint[i].numero, $stateParams.mode, "POINT", JSON.stringify(arrayPoint[i]), "UPDATE" ).then(function(){ });

                                       }
                               }
                       }
               }
                if($stateParams.mode=="m"){
                       $scope.pointsBD = arrayPoint;
               }else{
                       $scope.points = arrayPoint;
               }

       }

function valider_Geometrie_Informations_Feature(selectedFeature){
        var support;
        if($scope.hasSupport && $scope.typeSupport!="tabulaire"){    support = getSupportIntersection(selectedFeature, "POLYGONE");  console.info(support);}
        console.info(support);
        var polygonACliper;
        var difference = selectedFeature.toGeoJSON().geometry;
        var Gjson = selectedFeature.toGeoJSON();
        var latlngs = selectedFeature.getLatLngs();
        var projection = getUTMProjection(selectedFeature, "POLYGONE");
        var errorDessin = false;
        var idSelectedFeature = selectedFeature._leaflet_id;

        //Check if polygon is in a regular shape form
        var coordinatesOfGeometry = [];
        coordinatesOfGeometry =difference.coordinates;
        coordinatesOfGeometry = coordinatesOfGeometry[0];
        var polygonSelfInterct = selfIntersect(coordinatesOfGeometry);
        if(polygonSelfInterct==false){
                ionicToast.show('Forme polygonale irrégulière ! ', 'middle', false, 2500);
                errorDessin = true;
        }

        //Work with a general array whether its a new created polygon or from BD ($scope.polygons || $scope.polygonsBD):
         var arrayPolygon  = $scope.polygons;
        if($stateParams.mode=="m"){ arrayPolygon = $scope.polygonsBD;}
        //--------------------------------------------------------------------------
        // If there is no error, i.e. the polygon is not self-intersect... (errorDessin = false)
        // We surround this piece of code with a "Try-Catch"  in case there is an error with topology in Turf functions...
       if(!errorDessin){
              try{
                      if(($scope.hasSupport && $scope.typeSupport!="tabulaire") && (support == -1)){
                        errorDessin = true;
                        console.info("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                      }
                       // Loop through Support Layer (if there is one) & get the polygon geometry clipped by the intersected support.
                       if(($scope.hasSupport && $scope.typeSupport!="tabulaire") && (support != -1)){
                              SupportLayer.eachLayer(function(layer) {
                                      if(layer.feature.properties ==support){
                                              polygonACliper = layer.feature.geometry;
                                              var diff = turf.difference(difference, polygonACliper);
                                              if(diff!=null){
                                                      var buffDiff = turf.buffer(diff, 0.001,'meters');
                                                      difference = turf.difference(difference, buffDiff);
                                                      difference = turf.simplify(difference, 0.000001, true);
                                                       var differe = L.geoJson(difference, { onEachFeature: function (feature, lay) {
                                                               Gjson =lay.toGeoJSON();
                                                               latlngs = lay.getLatLngs();
                                                               projection = getUTMProjection(layer, "POLYGONE");
                                                           }
                                                       });
                                              }
                                      }
                              });
                       }
                        // Loop through Communes Layer (if there isn't  a  support layer) & get the polygon geometry clipped by the intersected support.
                       if(!$scope.hasSupport && $scope.typeSupport!="tabulaire"){
                              communesLayer.eachLayer(function(layer) {
                                      supportATester = layer.feature.geometry;
                                      var diff = turf.difference(difference, supportATester);
                                      if(diff!=null){
                                             var buffDiff = turf.buffer(diff, 0.001,'meters');
                                             difference = turf.difference(difference, buffDiff);
                                             difference = turf.simplify(difference, 0.000001, true);
                                             var differe = L.geoJson(difference, { onEachFeature: function (feature, lay) {
                                                    Gjson =lay.toGeoJSON();
                                                    latlngs = lay.getLatLngs();
                                                    projection = getUTMProjection(layer, "POLYGONE");
                                                }
                                            });
                                      }
                             });
                       }

                       //---------------------------------------------------
                       // If the result of the clipped polygon by support was of "Multipolygon"
                       //  => more then 1 polygon was created AND that's an ERROR Man ;)
                       var type = difference.type;
                       if(difference.geometry!=undefined){  type = difference.geometry.type;   }
                       if(type=="Multipolygon"){
                              ionicToast.show('Entité polygonale non supportée','middle', false, 2500);
                              errorDessin = true;
                       }
                       //-------------------------------------------------------------------------
                       // Clipping the geometry of the polygon to Update with others polygons
                       for (var i = 0; i < arrayPolygon.length; i++) {
                              if(arrayPolygon[i].id != idSelectedFeature){
                                      polygonACliper  = JSON.parse(arrayPolygon[i].gjson);
                                      var intersect = turf.intersect(difference, polygonACliper);
                                      if(intersect != null){
                                                    // Cas du Chevauchement totale du polygon déssiné avec les autres polygons.
                                                    if(turf.booleanContains(difference, polygonACliper) || turf.booleanContains(polygonACliper, difference)){
                                                           ionicToast.show('Chevauchement totale !','middle', false, 2500);
                                                           console.info("Chevauchement totale");
                                                           errorDessin = true;
                                                    }
                                                    // Quand  on dessine un polygon qui passe de part et d'autre par un autre polygon
                                                    // et que le résultat de la 'Difrence' des 2 polygons est un Multipolygon .
                                                    if(turf.difference(difference, polygonACliper).geometry.type=="MultiPolygon"){
                                                           ionicToast.show('Entité polygonale non supportée !','middle', false, 2500);
                                                           errorDessin = true;
                                                    }

                                                     var buffDiff = turf.buffer(polygonACliper, 0.001,'meters');
                                                     difference = turf.difference(difference, buffDiff);
                                                    // difference = turf.difference(difference, polygonACliper);
                                                    difference = turf.simplify(difference.geometry, 0.000001, true);
                                     }
                              }
                       }

                       //------------------------------------------------------------------------------------//
                       var arraySyncItems= [];
                       drawnItemsSync.eachLayer(function(couche) {
                              arraySyncItems.push(couche.toGeoJSON());
                       });
                       for(var i=0; i< arraySyncItems.length; i++){
                              var polygonACliperSync =arraySyncItems[i];
                              if(turf.booleanContains(difference, polygonACliperSync) || turf.booleanContains(polygonACliperSync, difference)){
                                     ionicToast.show('Chevauchement totale !','middle', false, 2500);
                                     return;
                              }

                              var intersect = turf.intersect(difference, polygonACliperSync);
                              if(intersect != null){
                                     // Quand  on dessine un polygon qui passe de part et d'autre par un autre polygon
                                     // et que le résultat de la 'Difrence' des 2 polygons est un Multipolygon (2 polygons et plus en résultat).
                                     console.info("turf.difference(difference, polygonACliperSync)");
                                     console.info(JSON.stringify(turf.difference(difference, polygonACliperSync)));
                                     if(turf.difference(difference, polygonACliperSync).geometry.type=="MultiPolygon"){
                                             ionicToast.show('Forme  multi polygonale non supportée !','middle', false, 2500);
                                             return;
                                     }

                                     var buffDiff = turf.buffer(polygonACliperSync, 0.001,'meters');
                                     difference = turf.difference(difference, buffDiff);
                                     // difference = turf.difference(difference, polygonACliperSync);
                                     difference = turf.simplify(difference, 0.000001, true);
                                     boolAddPolygonTodrawnItems =false;
                              }
                       }
                       //------------------------------------------------------------------------------------//
                       // drawnItemsSync.eachLayer(function(layer) {
                       //        polygonACliper = layer.toGeoJSON();
                       //           var intersect = turf.intersect(difference, polygonACliper);
                       //                if(intersect != null){
                       //                              // Cas du Chevauchement totale du polygon déssiné avec les autres polygons.
                       //                              if(turf.booleanContains(difference, polygonACliper) || turf.booleanContains(polygonACliper, difference)){
                       //                                     ionicToast.show('Chevauchement totale !','middle', false, 2500);
                       //                                     errorDessin = true;
                       //                              }
                       //                              // Quand  on dessine un polygon qui passe de part et d'autre par un autre polygon
                       //                              // et que le résultat de la 'Difrence' des 2 polygons est un Multipolygon .
                       //                              if(turf.difference(difference, polygonACliper).geometry.type=="MultiPolygon"){
                       //                                     ionicToast.show('Entité polygonale non supportée !','middle', false, 2500);
                       //                                     errorDessin = true;
                       //                              }
                       //                              difference = turf.difference(difference, polygonACliper);
                       //                              difference = turf.simplify(difference.geometry, 0.000001, true);
                       //               }
                       // });
                       //------------------------------------------------------------------------------------//

               } //end of try
               catch(error){
                       ionicToast.show('Erreur Topologique !','middle', false, 2500);
                       errorDessin = true;
               }
         }

        //-------------------------------------------------------------------------
        // in this step we got the redraw the polygon updated...
        // The first case is : when there is an error, so we got to redraw the polygon & get his geometry stored in the array of polygons : 'arrayPolygon[i].gjson'
        if(errorDessin){
                 for (var i = 0; i < arrayPolygon.length; i++) {
                        if (arrayPolygon[i].id == idSelectedFeature) {
                               drawnItems.eachLayer(function(layer) {
                                       if(layer._leaflet_id == idSelectedFeature){
                                             drawnItems.removeLayer(idSelectedFeature);
                                             var diff = L.geoJson(JSON.parse(arrayPolygon[i].gjson), { onEachFeature: function (feature, lay) {
                                                    if($stateParams.mode=="m"){
                                                           deleteMarkerPolygonBD(idSelectedFeature);
                                                           deplaceMarkerPolygonBD(lay, idSelectedFeature, arrayPolygon[i].numero);
                                                           lay.setStyle(StylePolygonBD);
                                                    }else{
                                                           deleteMarkerPolygon(idSelectedFeature);
                                                           deplaceMarkerPolygon(lay, idSelectedFeature, arrayPolygon[i].numero);
                                                           lay.setStyle(StylePolygon);
                                                    }


                                                    Gjson =lay.toGeoJSON();
                                                    lay._leaflet_id = idSelectedFeature;
                                                    drawnItems.addLayer(lay);
                                                    layerClick(lay);
                                                }
                                              });
                                       }
                               });
                        }
                 }
         }else{  // The 2nd case : its when there was an error while applying all the topology operations to the polygon so we shall now redraw the polygon result ;)
                console.info("idSelectedFeature > "+idSelectedFeature);
                var numero;
                 drawnItems.eachLayer(function(layer) {
                       console.info("_leaflet_id > "+layer._leaflet_id);
                       if(layer._leaflet_id == idSelectedFeature){
                              console.info("kayn");
                              drawnItems.removeLayer(idSelectedFeature);
                              var diff = L.geoJson(difference, { onEachFeature: function (feature, lay) {
                                             var numero;
                                             for (var i = 0; i < arrayPolygon.length; i++) {
                                                    console.info(arrayPolygon[i].id+" <> "+idSelectedFeature);
                                                    console.info(arrayPolygon[i].numero);
                                                    if(arrayPolygon[i].id==idSelectedFeature){ numero = arrayPolygon[i].numero; }
                                                    console.info("numero> "+numero);
                                             }
                                             if($stateParams.mode=="m"){
                                                     deleteMarkerPolygonBD(idSelectedFeature);
                                                     deplaceMarkerPolygonBD(lay, idSelectedFeature, numero);
                                                     lay.setStyle(StylePolygonBD);
                                             }else{
                                                     deleteMarkerPolygon(idSelectedFeature);
                                                     deplaceMarkerPolygon(lay, idSelectedFeature, numero);
                                                     lay.setStyle(StylePolygon);
                                             }

                                             Gjson =lay.toGeoJSON();
                                             latlngs = lay.getLatLngs();
                                             lay._leaflet_id = idSelectedFeature;
                                             drawnItems.addLayer(lay);
                                             layerClick(lay);
                                     }
                              });
                       }
                 });
         }

         // Loop thorough polygons to edit data (shape, gjson, superficie) of the polygon updated :
         if(!errorDessin){
               for (var i = 0; i < arrayPolygon.length; i++) {
                       if (arrayPolygon[i].id == idSelectedFeature) {
                              shape = getShapeOfGeometry(projection, latlngs,"POLYGONE");
                              var area = turf.area(Gjson.geometry);
                              var ha = area/10000;
                              var ha = parseFloat(ha.toFixed(4));
                              arrayPolygon[i].superficie = ha;
                              arrayPolygon[i].shape = shape;
                              arrayPolygon[i].gjson = JSON.stringify(Gjson);
                              //Modifier la superficie dans le questionnaire lié au polygon modifié (en cas de modification):

                              if(arrayPolygon[i].formdata!=undefined){
                                     var formd =  arrayPolygon[i].formdata;
                                     if(typeof(arrayPolygon[i].formdata)=="string"){
                                            formd =  JSON.parse(arrayPolygon[i].formdata);
                                     }

                                     if(formd.data.dssareac!= undefined){
                                             formd.data.dssareac = ha;
                                             arrayPolygon[i].formdata = JSON.stringify(formd);
                                             // arrayPolygon[i].formdata = formd;
                                     }
                              }
                              if($stateParams.mode=="m"){
                                      console.info(idSelectedFeature+" - "+ $scope.numeroCollecte+" - "+ arrayPolygon[i].numero+" - "+ $stateParams.mode+" - "+ "POLYGONEBD"+" - "+ JSON.stringify(arrayPolygon[i])+" - "+ "UPDATE");
                                     updateDeleteTableTemporaireGeom(idSelectedFeature, $scope.numeroCollecte, arrayPolygon[i].numero, $stateParams.mode, "POLYGONEBD", JSON.stringify(arrayPolygon[i]), "UPDATE").then(function(){
                                       });
                              }else{
                                     updateDeleteTableTemporaireGeom(idSelectedFeature, $scope.numeroCollecte, arrayPolygon[i].numero, $stateParams.mode, "POLYGONE", JSON.stringify(arrayPolygon[i]), "UPDATE" ).then(function(){
                                      });
                              }


                       }
               }
               if($stateParams.mode=="m"){
                       $scope.polygonsBD = arrayPolygon;
               }else{
                       $scope.polygons = arrayPolygon;
               }
          }
       //-------------------------------------------------------------------------------------------------------//
}

// Control d'édition des entités déssinées.
var editControl =  L.Control.extend({
  options: {
    position: 'topleft'
  },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom editionGeometrie');
         L.DomEvent.addListener(container, 'mouseover', function (container) {
            this.style.cursor='pointer';
          });
         L.DomEvent.addListener(container, 'mouseout', function () {
               this.style.cursor='auto';
          });
        container.style.backgroundColor = 'white';
        container.style.backgroundImage = "url(img/noedit.png)";
        container.style.backgroundSize = "28px 28px";
        container.style.width = '28px';
        container.style.height = '28px';
        container.onclick = function(){

               for (var toolbarId in drawControl._toolbars) {
                       drawControl._toolbars[toolbarId].disable();
               }
               $("div.leaflet-popup").remove();

              if (boolEdit){
                       if(selectedFeature!=null){
                              console.log(selectedFeature);
                              console.log(selectedFeature._leaflet_id);
                              if (selectedFeature instanceof L.Marker) {
                                      selectedFeature.dragging.disable();
                                      valider_Geometrie_Informations_Feature_POINT(selectedFeature);
                              }else{
                                      selectedFeature.snapediting.disable();
                                      if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon))  {

                                      }else{
                                              valider_Geometrie_Informations_Feature(selectedFeature);
                                      }
                              }
                       }
                       container.style.backgroundImage = "url(img/noedit.png)";
                       boolEdit = false;

               }else{
                        selectedFeature=null;
                       container.style.backgroundImage = "url(img/edit.png)";
                       boolEdit = true;
               }
        }
    return container;
  }
});
var editCtrl = new editControl();


///////////////////////////////////////////////////////////////////////////////////////////////////////
//  Functions globales d'ajout et suppression des Markers des différents entités déssinées  :

function addMarkerPoint(layer, id, num){
    var length = $scope.points.length + $scope.totalPoint+1;
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPoint = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPoint',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPointObject[id] = labelPoint;
    markerPoint.addLayer(markersPointObject[id]);
}
function deleteMarkerPoint(id){
      // Suppression du label lié au point supprimé
       for (var m in markersPointObject){
              if (markersPointObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPointObject[m];
              }
       }
       markerPoint.clearLayers();
       for (var m in markersPointObject){
              markerPoint.addLayer(markersPointObject[m]);
       }
}

function addMarkerPointBD(layer, id, num){
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPointBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPointBD',
          html: num,
          iconSize: null
          })
    });

    markersPointBDObject[id] = labelPointBD;
    markerPointBD.addLayer(markersPointBDObject[id]);
}
function deleteMarkerPointBD(id){
      // Suppression du label lié au point supprimé
       for (var m in markersPointBDObject){
              if (markersPointBDObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPointBDObject[m];
              }
       }
       markerPointBD.clearLayers();
       for (var m in markersPointBDObject){
              markerPointBD.addLayer(markersPointBDObject[m]);
       }
}

function deplaceMarkerPoint(layer, id, num){
    var length = $scope.points.length + $scope.totalPoint+1;
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPoint = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPoint',
          html: num,
          // html: length,
          iconSize: null
          })
    });

    markersPointObject[id] = labelPoint;
    markerPoint.addLayer(markersPointObject[id]);
}
function deplaceMarkerPointBD(layer, id, num){
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPoint = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPoint',
          html: num,
          iconSize: null
          })
    });

    markersPointBDObject[id] = labelPoint;
    markerPointBD.addLayer(markersPointBDObject[id]);
}
function addMarkerPointSync(layer, id, num){
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPointBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPointSync',
          html: num,
          iconSize: null
          })
    });

    markersPointBDObject[id] = labelPointBD;
    markerPointBD.addLayer(markersPointBDObject[id]);
}

//------------------------------------------------//

function addMarkerPolyline(layer, id, num){
  var length = $scope.polylines.length + $scope.totalPolyline+1;
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;

    var labelPolyline = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolyline',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPolylineObject[id] = labelPolyline;
    markerPolyline.addLayer(markersPolylineObject[id]);
}
function deleteMarkerPolyline(id){
      // Suppression du label lié au polygon supprimé
       for (var m in markersPolylineObject){
              if (markersPolylineObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPolylineObject[m];
              }
       }
       markerPolyline.clearLayers();
       for (var m in markersPolylineObject){
              markerPolyline.addLayer(markersPolylineObject[m]);
       }
}


function addMarkerPolylineBD(layer, id, num){
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;

    var labelPolylineBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolylineBD',
          html: num,
          iconSize: null
          })
    });

    markersPolylineBDObject[id] = labelPolylineBD;
    markerPolylineBD.addLayer(markersPolylineBDObject[id]);
}
function deleteMarkerPolylineBD(id){
      // Suppression du label lié au polygon supprimé
       for (var m in markersPolylineBDObject){
              if (markersPolylineBDObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPolylineBDObject[m];
              }
       }
       markerPolylineBD.clearLayers();
       for (var m in markersPolylineBDObject){
              markerPolylineBD.addLayer(markersPolylineBDObject[m]);
       }
}


function deplaceMarkerPolyline(layer, id, num){
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;

    var labelPolyline = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolyline',
          html: num,
          iconSize: null
          })
    });

    markersPolylineObject[id] = labelPolyline;
    markerPolyline.addLayer(markersPolylineObject[id]);
}

function deplaceMarkerPolylineBD(layer, id, num){
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;

    var labelPolyline = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolyline',
          html: num,
          iconSize: null
          })
    });

    markersPolylineBDObject[id] = labelPolyline;
    markerPolylineBD.addLayer(markersPolylineBDObject[id]);
}

function addMarkerPolylineSync(layer, id, num){
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;

    var labelPolylineBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolylineSync',
          html: num,
          iconSize: null
          })
    });

    markersPolylineBDObject[id] = labelPolylineBD;
    markerPolylineBD.addLayer(markersPolylineBDObject[id]);
}

//------------------------------------------------//

function addMarkerPolygonTemp(layer, id, num){
    var length = num;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygon = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPolygonObject[id] = labelPolygon;
    markerPolygon.addLayer(markersPolygonObject[id]);
}

function addMarkerPolygon(layer, id, num){
    var length = $scope.polygons.length + $scope.totalPolygon+1;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygon = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPolygonObject[id] = labelPolygon;
    markerPolygon.addLayer(markersPolygonObject[id]);
}
function deleteMarkerPolygon(id){
      // Suppression du label lié au polygon supprimé
       for (var m in markersPolygonObject){
              if (markersPolygonObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPolygonObject[m];
              }
       }
       markerPolygon.clearLayers();
       for (var m in markersPolygonObject){
              markerPolygon.addLayer(markersPolygonObject[m]);
       }
}


function addMarkerPolygonBD(layer, id, num){
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygonBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygonBD',
          html: num,
          // html: length,
          iconSize: null
          })
    });

    markersPolygonBDObject[id] = labelPolygonBD;
    markerPolygonBD.addLayer(markersPolygonBDObject[id]);
}
function deleteMarkerPolygonBD(id){
      // Suppression du label lié au polygon supprimé
       for (var m in markersPolygonBDObject){
              if (markersPolygonBDObject.hasOwnProperty(m) && (m==id) ) {
                      delete markersPolygonBDObject[m];
              }
       }
       markerPolygonBD.clearLayers();
       for (var m in markersPolygonBDObject){
              markerPolygonBD.addLayer(markersPolygonBDObject[m]);
       }
}

function deplaceMarkerPolygon(layer, id, num){
  console.info(num);
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygon = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          html: num,
          iconSize: null
          })
    });

    markersPolygonObject[id] = labelPolygon;
    markerPolygon.addLayer(markersPolygonObject[id]);
}
function deplaceMarkerPolygonBD(layer, id, num){
  console.info(num);
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygon = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          html: num,
          iconSize: null
          })
    });

    markersPolygonBDObject[id] = labelPolygon;
    markerPolygonBD.addLayer(markersPolygonBDObject[id]);
}
function addMarkerPolygonSync(layer, id, num){
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygonBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygonSync',
          html: num,
          iconSize: null
          })
    });

    markersPolygonBDObject[id] = labelPolygonBD;
    markerPolygonBD.addLayer(markersPolygonBDObject[id]);
}

//---------------------- Libellés des données Supports ---------------------//

function addMarkerPointSupport(layer, id, num, sync){
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var classname = "labelPointSupport";
    if(sync){ classname = "labelPointSupportSync"; }

    var labelPointSupport = L.marker([lat, lng], {
    icon: L.divIcon({
          className: classname,
          html: num,
          iconSize: null
          })
    });

    markersPointSupportObject[id] = labelPointSupport;
    markerPointSupport.addLayer(markersPointSupportObject[id]);
}
function addMarkerPolylineSupport(layer, id, num, sync){
    var center = layer.getBounds().getCenter();
    var lat = center.lat;
    var lng =center.lng;
      var classname = "labelPolylineSupport";
    if(sync){ classname = "labelPolylineSupportSync"; }

    var labelPolylineSupport = L.marker([lat, lng], {
    icon: L.divIcon({
          className: classname,
          html: num,
          iconSize: null
          })
    });

    markersPolylineSupportObject[id] = labelPolylineSupport;
    markerPolylineSupport.addLayer(markersPolylineSupportObject[id]);
}
function addMarkerPolygonSupport(layer, id, num, sync){
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];
    var classname = "labelPolygonSupport";
    if(sync){ classname = "labelPolygonSupportSync"; }
    var labelPolygonSupport = L.marker([lat, lng], {
    icon: L.divIcon({
          className: classname,
          html: num,
          iconSize: null
          })
    });

    markersPolygonSupportObject[id] = labelPolygonSupport;
    markerPolygonSupport.addLayer(markersPolygonSupportObject[id]);
}

//------------------- Libellés des données temporaires ---------------------//

function addMarkerPointTemp(layer, id, num){
    var length = num;
    var center = layer.getLatLng();
    var lat = center.lat;
    var lng =center.lng;

    var labelPoint = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPoint',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPointObject[id] = labelPoint;
    markerPoint.addLayer(markersPointObject[id]);
}

function addMarkerPolylineTemp(layer, id, num){
    var length = num;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolyline = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPolylineObject[id] = labelPolyline;
    markerPolyline.addLayer(markersPolylineObject[id]);
}

function addMarkerPolygonTemp(layer, id, num){
    var length = num;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];

    var labelPolygon = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPolygon',
          // html: num,
          html: length,
          iconSize: null
          })
    });

    markersPolygonObject[id] = labelPolygon;
    markerPolygon.addLayer(markersPolygonObject[id]);
}

//---------------------- Gestion des données support ----------------------//

$scope.checkSupport=function(choix) {
       console.info(choix);
       if(choix=="Supports"){
            $scope.selectedAlias = "Supports";
            $scope.list = listSupports;
       }
}

$scope.clickSupport=function(selected){
        console.info(selected);
        $scope.SelectedSegmentParcelle = selected;
}

$scope.zoomToSupport=function(){
        leafletData.getMap().then(function(map) {
               if($scope.selectedAlias=="Supports"){
                       SupportLayer.eachLayer(function(lyr) {
                        console.info(JSON.stringify(lyr.feature.properties)+"   -   "+JSON.stringify($scope.SelectedSegmentParcelle));
                       if(JSON.stringify(lyr.feature.properties) ==JSON.stringify($scope.SelectedSegmentParcelle)){
                              map.fitBounds(lyr.getBounds());
                              $scope.modalRender.hide();
                       }
                      });
               }
        });
}

$scope.toggleSupport="";
$scope.chercherSupport= function(){

        $scope.disableDrawControllers();

        let  html =`<ion-modal-view id="ayoub" style="width: 40%; height: 60%; top: 20%; left: 30%; right: 30%; bottom: 20%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
        html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up button-bleuClair" ng-click="scrollToTop()"></button>`;
        html+=  `<i class="icon ion-search"></i> Localiser<button class="button button-clear icon ion-chevron-down button-bleuClair" ng-click="scrollToBottom()"></button></h1>`;
        html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
        html+=  ` </ion-header-bar>`;
        html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;
        html+=  ` <div class="row">`;
        html+=  ` <div class="col" style="text-align:center;margin-left:20px;">`;
        html+=  ` <ion-radio name="togg" ng-model="toggleSupport" ng-value="Supports" ng-click="checkSupport('Supports')">`;
        html+=  ` Support</ion-radio>`;
        html+=  ` </div>`;
        html+=  ` </div>`;
        html+=  ` <div class="list"><ion-radio collection-repeat="item in list" ng-model="data.selectedItem" ng-value="item.support"  ng-click="clickSupport(data.selectedItem)">{{item.n }}</ion-radio></div>`;

        html+= `</ion-content><ion-footer-bar class="">`;
        html+= `<div class = "button-bar nopadding"><a class = "button button-block button-bleuClair" ng-click="zoomToSupport()" style="margin:0;">Zoom</a>`;
        html+= `<a class = "button button-block button-grisClair" ng-click="hideModalRender()" style="margin:0;">Annuler</a></div> `;
        html+= `</ion-footer-bar>`;
        html+= `</ion-modal-view>`;
        // html+= ` <button class="button button-full button-bleuClair" ng-click="zoomToSupport()">Zoom</button>`;
        // html+= ` <button class="button button-full button-grisClair" ng-click="hideModalRender()">Annuler</button>`;
        // html+= `</ion-content></ion-modal-view>`;

       $scope.modalRender  = new $ionicModal.fromTemplate(html, {
               scope: $scope,
               focusFirstInput:true,
               backdropClickToClose:true,
               hardwareBackButtonClose:false
         });

        $scope.modalRender.show();
        sidebar.close();
        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//  Functions de gestion ds géométries (Intersection ; Projection ; Coordonées) :

function getShapeOfGeometry(Projection26191,latlngs, type){

  var bngcoords, X, Y, shape;

  if(type == "POINT"){
        bngcoords = proj4(Projection26191, [latlngs.lng, latlngs.lat]);
        X = bngcoords[0];
        Y = bngcoords[1];
        shape = "POINT("+X+" "+Y+")";
  }

  if(type == "POLYLINE"){
        shape = "LINESTRING(";
        for (var i = 0; i < latlngs.length-1; i++) {
            bngcoords= proj4(Projection26191, [latlngs[i].lng, latlngs[i].lat]);
            X = bngcoords[0];
            Y = bngcoords[1];
            shape+= X+" "+Y+",";
        }
        bngcoords= proj4(Projection26191, [latlngs[latlngs.length-1].lng, latlngs[latlngs.length-1].lat]);
        X = bngcoords[0];
        Y = bngcoords[1];
        shape+=X+" "+Y+")";
  }

  if(type == "POLYGONE"){
        shape = "POLYGON((";
        for (var i = 0; i < latlngs.length; i++) {
            bngcoords= proj4(Projection26191, [latlngs[i].lng, latlngs[i].lat]);
            X = bngcoords[0];
            Y = bngcoords[1];
            shape+=X+" "+Y+",";
        }
        bngcoords= proj4(Projection26191, [latlngs[0].lng, latlngs[0].lat]);
        X = bngcoords[0];
        Y = bngcoords[1];
        shape+=X+" "+Y+"))";
    }

  return shape;
}

function selfIntersect(poly){

    var geomFactory = new jsts.geom.GeometryFactory();

    var jstsCoordinates = poly.map(function(pt) {
      return new jsts.geom.Coordinate(pt[0], pt[1]);
    });

    var linearRing = geomFactory.createLinearRing(jstsCoordinates);
    // turns out you can just ask if it is simple... i.e. does not have any self intersections.
    console.log(linearRing.isSimple()); //so this is false
    //  false = the polygon is in a irregular shape (there is an intersection)
    //  true = the polygon is in a normal shape
    return linearRing.isSimple();
}

function getUTMProjection(layer, typeGeometry){

    var featureGroup = new L.FeatureGroup();
    var lng, lat, center;

    if(typeGeometry=="POINT"){
               center = layer.getLatLng();
               lat = center.lat;
               lng =center.lng;
     }

    if(typeGeometry=="POLYLINE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    if(typeGeometry=="POLYGONE"){
               // center = turf.centerOfMass(layer.toGeoJSON());
               // lat = center.geometry.coordinates[1];
               // lng =center.geometry.coordinates[0];
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    console.info("LatLng()= "+lat+" - "+lng);


    var point = {
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

    var projection = "";
    UTM.eachLayer(function(lyr) {
       featureGroup.clearLayers();
       featureGroup.addLayer(lyr);
       var isInside = turf.within(point, featureGroup.toGeoJSON());

       if(isInside.features.length >0){
          console.info(lyr.feature.properties.zone);
          console.info(lyr.feature.properties.srid);
          projection = lyr.feature.properties.srid;
       }
    });

     return projection;
}

function getCommuneIntersection(layer, typeGeometry){

    var featureGroup = new L.FeatureGroup();
    var lng, lat, center;

    if(typeGeometry=="POINT"){
               center = layer.getLatLng();
               lat = center.lat;
               lng =center.lng;
     }

    if(typeGeometry=="POLYLINE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    if(typeGeometry=="POLYGONE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    console.info("LatLng()= "+lat+" - "+lng);


    var point = {
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

    var commune = -1;
    communesLayer.eachLayer(function(lyr) {
       featureGroup.clearLayers();
       featureGroup.addLayer(lyr);
       var isInside = turf.within(point, featureGroup.toGeoJSON());

       if(isInside.features.length >0){ commune = 1;  }
    });

     return commune;
}

function getSupportIntersection(layer, typeGeometry){

    var featureGroup = new L.FeatureGroup();
    var lng, lat, center;

    if(typeGeometry=="POINT"){
               center = layer.getLatLng();
               lat = center.lat;
               lng =center.lng;
     }

    if(typeGeometry=="POLYLINE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    if(typeGeometry=="POLYGONE"){
               // center = turf.centerOfMass(layer.toGeoJSON());
               // lat = center.geometry.coordinates[1];
               // lng =center.geometry.coordinates[0];
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    console.info("LatLng()= "+lat+" - "+lng);


    var point = {
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

    var segment = -1;
    SupportLayer.eachLayer(function(lyr) {
       featureGroup.clearLayers();
       featureGroup.addLayer(lyr);
       var isInside = turf.within(point, featureGroup.toGeoJSON());

       if(isInside.features.length >0){
          // console.info(lyr.feature.properties.id_segment);
          // segment = lyr.feature.properties.id_segment;
          segment = lyr.feature.properties;
       }
    });

     return segment;
}

function getSupportId(support){
      var idS = -1;
      console.info(support);
       for (var b = 0; b < listSupports.length; b++) {
              console.info(JSON.stringify(listSupports[b].support));
               if (JSON.stringify(listSupports[b].support) == support) {
                       idS = listSupports[b].id;
               }
        }
        return idS;
}

function getSupportIntersectionLayer(layer, typeGeometry){

    var featureGroup = new L.FeatureGroup();
    var lng, lat, center;

    if(typeGeometry=="POINT"){
               center = layer.getLatLng();
               lat = center.lat;
               lng =center.lng;
     }

    if(typeGeometry=="POLYLINE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    if(typeGeometry=="POLYGONE"){
                center = layer.getBounds().getCenter();
                lat = center.lat;
                lng =center.lng;
    }

    console.info("LatLng()= "+lat+" - "+lng);
    var point = {
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

    var layer=null;
    SupportLayer.eachLayer(function(lyr) {
       featureGroup.clearLayers();
       featureGroup.addLayer(lyr);
       var isInside = turf.within(point, featureGroup.toGeoJSON());
       if(isInside.features.length >0){
          layer = lyr;
       }
    });

     return layer;
}
//------------------------------------------------//

function setNumeroForPoint(id, num){
  for (var b = 0; b < $scope.points.length; b++) {
          if ($scope.points[b].id == id) {
              $scope.points[b].numero =num;
               if($scope.points[b].formdata!=undefined){
                       // var formd =  JSON.parse($scope.points[b].formdata);
                          var formd;
                              if(typeof($scope.points[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.points[b].formdata);
                              }else{
                                      formd =  $scope.points[b].formdata;
                              }
                       if(formd.data.dssnumberdraw!= undefined){
                               formd.data.dssnumberdraw = num;
                               $scope.points[b].formdata = JSON.stringify(formd);
                       }
               }
              alimenterTableTemporaire($scope.points[b].id, $scope.numeroCollecte, num, $stateParams.mode, "POINT", JSON.stringify($scope.points[b]), "" );
          }
  }
}
function setNumeroForPolyline(id, num){

  for (var b = 0; b < $scope.polylines.length; b++) {
        if ($scope.polylines[b].id == id) {
              $scope.polylines[b].numero =num;
               if($scope.polylines[b].formdata!=undefined){
                       // var formd =  JSON.parse($scope.polylines[b].formdata);
                        var formd;
                              if(typeof($scope.polylines[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.polylines[b].formdata);
                              }else{
                                      formd =  $scope.polylines[b].formdata;
                              }
                       if(formd.data.dssnumberdraw!= undefined){
                               formd.data.dssnumberdraw = num;
                                $scope.polylines[b].formdata = JSON.stringify(formd);
                       }

               }
              alimenterTableTemporaire($scope.polylines[b].id, $scope.numeroCollecte, num, $stateParams.mode, "POLYLINE", JSON.stringify($scope.polylines[b]), "" );
        }
  }
}
function setNumeroForPolygon(id, num){
        for (var b = 0; b < $scope.polygons.length; b++) {
                if ($scope.polygons[b].id == id) {
                    $scope.polygons[b].numero =num;
                     if($scope.polygons[b].formdata!=undefined){
                              // var formd =  JSON.parse($scope.polygons[b].formdata);
                              var formd;
                              if(typeof($scope.polygons[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.polygons[b].formdata);
                              }else{
                                      formd =  $scope.polygons[b].formdata;
                              }
                              if(formd.data.dssnumberdraw!= undefined){
                                       formd.data.dssnumberdraw = num;
                                        $scope.polygons[b].formdata = JSON.stringify(formd);
                               }
                       }
                    alimenterTableTemporaire($scope.polygons[b].id, $scope.numeroCollecte, num, $stateParams.mode, "POLYGONE", JSON.stringify($scope.polygons[b]), "" );
                }
        }
}

function reaffectNumeroForPoint(){
        markerPoint.clearLayers();
        var nbr=$scope.totalPoint+1;
        for (var k in markersPointObject){
               var labelNew =L.divIcon({
                     className: 'labelPoint',
                     html: ""+nbr,
                     iconSize: [100, 40]
               });
               console.info('gggggggggggg '+k+' , '+nbr);
               setNumeroForPoint(k, nbr);
               nbr++;
               markersPointObject[k].setIcon(labelNew);
               markerPoint.addLayer(markersPointObject[k]);
        }
}
function reaffectNumeroForPolyline(){
        markerPolyline.clearLayers();
        var nbr=$scope.totalPolyline+1;
        for (var k in markersPolylineObject){
               var labelNew =L.divIcon({
                     className: 'labelPolyline',
                     html: ""+nbr,
                     iconSize: [100, 40]
               });
               console.info('gggggggggggg '+k+' , '+nbr);
               setNumeroForPolyline(k, nbr);
               nbr++;
               markersPolylineObject[k].setIcon(labelNew);
               markerPolyline.addLayer(markersPolylineObject[k]);
        }
}
function reaffectNumeroForPolygon(){
        markerPolygon.clearLayers();
        var nbr=$scope.totalPolygon+1;
        for (var k in markersPolygonObject){
               var labelNew =L.divIcon({
                     className: 'labelPolygon',
                     html: ""+nbr,
                     iconSize: [100, 40]
               });
               console.info('gggggggggggg '+k+' , '+nbr);
               setNumeroForPolygon(k, nbr);
               nbr++;
               markersPolygonObject[k].setIcon(labelNew);
               markerPolygon.addLayer(markersPolygonObject[k]);
        }
}

////////////////////////////////////////////////////////////////////////////
function setNumeroForPointBD(id, num){
        for (var b = 0; b < $scope.pointsBD.length; b++) {
                if ($scope.pointsBD[b].id == id) {
                       $scope.pointsBD[b].numero =num;
                         var idobj =  "Point_"+num;
                         $scope.pointsBD[b].id =idobj;
                       if($scope.pointsBD[b].formdata!=undefined){
                              // var formd =  JSON.parse($scope.pointsBD[b].formdata);
                              var formd;
                              if(typeof($scope.pointsBD[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.pointsBD[b].formdata);
                              }else{
                                      formd =  $scope.pointsBD[b].formdata;
                              }
                               if(formd.data.dssnumberdraw!= undefined){
                                     formd.data.dssnumberdraw = num;
                                     $scope.pointsBD[b].formdata = JSON.stringify(formd);
                               }
                       }
                       alimenterTableTemporaire(idobj, $scope.numeroCollecte, num, $stateParams.mode, "POINTBD", JSON.stringify($scope.pointsBD[b]), "" );
                }
        }
}
function setNumeroForPolylineBD(id, num){
        for (var b = 0; b < $scope.polylinesBD.length; b++) {
                if ($scope.polylinesBD[b].id == id) {
                       $scope.polylinesBD[b].numero =num;
                       var idobj =  "Polyline_"+num;
                       $scope.polylinesBD[b].id =idobj;
                        if($scope.polylinesBD[b].formdata!=undefined){
                              var formd;
                              if(typeof($scope.polylinesBD[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.polylinesBD[b].formdata);
                              }else{
                                      formd =  $scope.polylinesBD[b].formdata;
                              }
                               if(formd.data.dssnumberdraw!= undefined){
                                     formd.data.dssnumberdraw = num;
                                     $scope.polylinesBD[b].formdata = JSON.stringify(formd);
                               }
                       }
                       alimenterTableTemporaire(idobj, $scope.numeroCollecte, num, $stateParams.mode, "POLYLINEBD", JSON.stringify($scope.polylinesBD[b]), "" );
                }
        }
}
function setNumeroForPolygonBD(id, num){
        console.info("eeeeeeeeeeeeee");
        console.info(id+" - "+num);
        for (var b = 0; b < $scope.polygonsBD.length; b++) {
               if ($scope.polygonsBD[b].id == id) {
                      console.info("<<<<<<< "+id);
                       $scope.polygonsBD[b].numero =num;
                       var idobj =  "Polygon_"+num;
                       $scope.polygonsBD[b].id =idobj;
                       if($scope.polygonsBD[b].formdata!=undefined){
                              var formd;
                              if(typeof($scope.polygonsBD[b].formdata)=="string"){
                                      formd =  JSON.parse($scope.polygonsBD[b].formdata);
                              }else{
                                      formd =  $scope.polygonsBD[b].formdata;
                              }

                               if(formd.data.dssnumberdraw!= undefined){
                                     formd.data.dssnumberdraw = num;
                                     $scope.polygonsBD[b].formdata = JSON.stringify(formd);
                               }
                       }
                       alimenterTableTemporaire(idobj, $scope.numeroCollecte, num, $stateParams.mode, "POLYGONEBD", JSON.stringify($scope.polygonsBD[b]), "" );
               }
        }
}

function reaffectNumeroForPointBD(){
        markerPointBD.clearLayers();
        var nbr=1;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POINTBD'").then(function(reso) {
          console.info(reso);

          for (var k in markersPointBDObject){
               var labelNew =L.divIcon({
                     className: 'labelPoint',
                     html: ""+nbr,
                     iconSize: [100, 40]
               });
               console.info('gggggggggggg '+k+' , '+nbr);
               setNumeroForPointBD(k, nbr);
               nbr++;
               markersPointBDObject[k].setIcon(labelNew);
               markerPointBD.addLayer(markersPointBDObject[k]);
        }

        });
}

function reaffectNumeroForPolylineBD(){

        markerPolylineBD.clearLayers();
        var nbr=1;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYLINEBD'").then(function(reso) {
          console.info(reso);
          for (var k in markersPolylineBDObject){
               var labelNew =L.divIcon({
                     className: 'labelPolyline',
                     html: ""+nbr,
                     iconSize: [100, 40]
               });
               console.info('gggggggggggg '+k+' , '+nbr);
               setNumeroForPolylineBD(k, nbr);
               nbr++;
               markersPolylineBDObject[k].setIcon(labelNew);
               markerPolylineBD.addLayer(markersPolylineBDObject[k]);
        }
        });

}

function reaffectNumeroForPolygonBD(){
        markerPolygonBD.clearLayers();
        // var nbr=$scope.totalPolygon+1;
        var nbr=1;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYGONEBD'").then(function(reso) {
          console.info(reso);
          console.info(markersPolygonBDObject.length);
          console.info($scope.polygonsBD.length);
               for (var k in markersPolygonBDObject){
                     var labelNew =L.divIcon({
                           className: 'labelPolygon',
                           html: ""+nbr,
                           iconSize: [100, 40]
                     });
                     console.info('gggggggggggg '+k+' , '+nbr);
                     setNumeroForPolygonBD(k, nbr);
                     nbr++;
                     markersPolygonBDObject[k].setIcon(labelNew);
                     markerPolygonBD.addLayer(markersPolygonBDObject[k]);
               }
        });


}

function deletePoint(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.points.length; i++){
               if($scope.points[i].id!=id){
                      arraySwitcher.push($scope.points[i]);
               }
        }
        $scope.points = arraySwitcher;
         $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POINT'").then(function(reso) {
          console.info(reso);
        });
}
function deletePolyline(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.polylines.length; i++){
               if($scope.polylines[i].id!=id){
                      arraySwitcher.push($scope.polylines[i]);
               }
        }
        $scope.polylines = arraySwitcher;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYLINE'").then(function(reso) {
          console.info(reso);
        });
}
function deletePolygon(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.polygons.length; i++){
               if($scope.polygons[i].id!=id){
                      arraySwitcher.push($scope.polygons[i]);
               }
        }
        $scope.polygons = arraySwitcher;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYGONE'").then(function(reso) {
          console.info(reso);
        });
}

function deletePointBD(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.pointsBD.length; i++){
               if($scope.pointsBD[i].id!=id){
                      arraySwitcher.push($scope.pointsBD[i]);
               }
        }
        $scope.pointsBD = arraySwitcher;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POINTBD'").then(function(reso) {
          console.info(reso);
        });
}
function deletePolylineBD(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.polylinesBD.length; i++){
               if($scope.polylinesBD[i].id!=id){
                      arraySwitcher.push($scope.polylinesBD[i]);
               }
        }
        $scope.polylinesBD = arraySwitcher;
        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYLINEBD'").then(function(reso) {
          console.info(reso);
        });
}
function deletePolygonBD(id){
        var arraySwitcher = [];
        for(var i = 0; i< $scope.polygonsBD.length; i++){
               if($scope.polygonsBD[i].id!=id){
                      arraySwitcher.push($scope.polygonsBD[i]);
               }
        }
        $scope.polygonsBD = arraySwitcher;

        $cordovaSQLite.execute(db, "DELETE  FROM tempData WHERE type =='POLYGONEBD'").then(function(reso) {
          console.info(reso);
        });
}
////////////////////////////////////////////////////////////////////////////

leafletData.getMap().then(function(map) {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
      /* Création et Ajout du controlleur "zoomHome" à ce niveau pour   qu'on puisse ajouter
             la fonction : "map.fitBounds(secteur.getBounds());"  dans ce controlleur. */

        L.Control.zoomHome = L.Control.extend({
               options: {
                 position: 'topleft',
                 zoomInText: '+',
                 zoomInTitle: 'Zoom in',
                 zoomOutText: '-',
                 zoomOutTitle: 'Zoom out',
                 zoomHomeText: '<i class="ion-earth" style="line-height:1.65;"></i>',
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
                  var extent = bbox(communesGeoJson);
                  var Pt1 = new L.latLng(extent[1], extent[0]);
                  var Pt2 = new L.latLng(extent[3], extent[2]);
                   bounds = new L.LatLngBounds(Pt1, Pt2);
                  map.fitBounds(bounds);
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
        var zoomHome = new L.Control.zoomHome();
        map.addControl(zoomHome);

        //------------------------------------------------------------------------//
        // Création du SideBar ::
        sidebar = L.control.sidebar('sidebar', { position: 'right'  }).addTo(map);

        sidebar.on('closing', function(e) {
          $("#sidebar").css( "display", "none");
        })

        map.doubleClickZoom.disable();

            // $timeout(function () {
              drawnItems.addTo(map);
        drawnItemsSync.addTo(map);
        drawnItemsParcelles.addTo(map);
        // }, 3000);


        leafletData.getLayers().then(function(baselayers) {

        map.on("overlayremove",function(e){
               if(e.name=="UTM"){
                   map.removeLayer(tileLayerUTM);
                   map.removeLayer(markersUTM);
                }
                 if(e.name=="Collecte"){
                   map.removeLayer(drawnItems);
                   map.removeLayer(drawnItemsSync);
                   map.removeLayer(drawnItemsParcelles);
                   map.removeLayer(markerPoint);
                   map.removeLayer(markerPointBD);
                   map.removeLayer(markerPolyline);
                   map.removeLayer(markerPolylineBD);
                   map.removeLayer(markerPolygon);
                   map.removeLayer(markerPolygonBD);
                }
               if(e.name=="Communes"){
                console.info("remove layer : "+e.name);
                   map.removeLayer(communesLayer);
                   map.removeLayer(markersCOMMUNE);

                  //  drawnItems.eachLayer(function(layer) {
                  //     if (layer.snapediting) { layer.snapediting._guides = []; }
                  // });

                   // console.info("$scope.guideLayers.length= "+$scope.guideLayers.length);
                   $scope.guideLayers =  $scope.guideLayers.filter( function( el ) {
                              if($scope.guideLayersCommunes.indexOf( el ) < 0){
                                    drawnItems.eachLayer(function(layer) {
                                        if (layer.snapediting) { layer.snapediting._guides.push(el); }
                                    });
                              }
                              return $scope.guideLayersCommunes.indexOf( el ) < 0;
                   });

                   // console.info("$scope.guideLayers.length= "+$scope.guideLayers.length);
                }
                if(e.name=="Supports"){
                   map.removeLayer(SupportLayer);
                   map.removeLayer(markersSupport);
                }

                if(e.name=="Libellés"){
                   map.removeLayer(allOverlaysMarkers);
                   // map.removeLayer(markersParcelle);
                }
        });

        map.on("overlayadd",function(e){
                if(e.name=="UTM"){
                    tileLayerUTM.addTo(map);
                    markersUTM.addTo(map);
                }
                if(e.name=="Collecte"){
                    drawnItems.addTo(map);
                    drawnItemsSync.addTo(map);
                    drawnItemsParcelles.addTo(map);
                    markerPoint.addTo(map);
                    markerPointBD.addTo(map);
                    markerPolyline.addTo(map);
                    markerPolylineBD.addTo(map);
                    markerPolygon.addTo(map);
                    markerPolygonBD.addTo(map);
                }
                if(e.name=="Communes"){
                  console.info("add layer : "+e.name);
                    communesLayer.addTo(map);
                    markersCOMMUNE.addTo(map);
                    // $scope.guideLayers = $scope.guideLayers.concat($scope.guideLayersCommunes);
                }
                 if(e.name=="Supports"){
                    SupportLayer.addTo(map);
                    markersSupport.addTo(map);
                }
                 if(e.name=="Libellés"){
                    allOverlaysMarkers.addTo(map);
                    // if(map.getZoom() >=16){ markersParcelle.addTo(map); }
                }
        });

        map.on('zoomend', function () {

               console.info("zoom= "+map.getZoom());
               console.info("getBounds= "+map.getBounds());


               if( map.getZoom() ==16 ){
                    // tileLayerParcelle.addTo(map);
                    // markersParcelle.addTo(map);
               }

               if( map.getZoom() ==15 ){
                    // map.removeLayer(tileLayerParcelle);
                    // map.removeLayer(markersParcelle);
               }
        });

        // Close the sidebar panel when clicking on the map & th sidebar is opened :
        map.on('click', function (e) {
               if (sidebarBool){
                       sidebar.close();
                       $("#sidebar").css( "display", "none");
                       sidebarBool = false;
               }
               // SupportLayer.bringToBack();
               // drawnItems.bringToFront();
         });

        // Disable Other Leaflet Controllers when start drawing or start deleting :
        map.on('draw:drawstart', function (e) {

               console.info(e);

               sidebar.close();

               sidebar.on('closing', function(e) {
                  $("#sidebar").css( "display", "none");
               })

               $scope.desableMapControllers();
               // $scope.disableDrawControllers();

        });

        map.on('draw:drawstop', function (e) {
               $scope.desableMapControllers();
        });

        map.on('draw:deletestart', function (e) {
                $scope.isPointBD = false;
                $scope.isPolylineBD = false;
                $scope.isPolygonBD = false;
               sidebar.close();

               sidebar.on('closing', function(e) {
                  $("#sidebar").css( "display", "none");
               })

               console.info("delete started");
               $scope.desableMapControllers();
        });

        map.on('draw:deletestop', function (e) {
                if($scope.isPointBD){
                        reaffectNumeroForPointBD();
                }
                if($scope.isPolylineBD){
                        reaffectNumeroForPolylineBD();
                }
                if($scope.isPolygonBD){
                        reaffectNumeroForPolygonBD();
                }
               
        });
        /////////////////////////////////////////////////////////////////////////

       function dragendEventFunction(e){

                console.info('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
                var numero;
                var arrayPoint  = $scope.points;
                if($stateParams.mode=="m"){ arrayPoint = $scope.pointsBD;}
                for(var i=0; i<arrayPoint.length; i++){
                       if(arrayPoint[i].id==e.target._leaflet_id){
                              numero= arrayPoint[i].numero;
                       }
                }

                //***********************************************************************
                var errorDessin = false;
                var support;
                var inCommune = getCommuneIntersection(e.target, "POINT");
                if($scope.hasSupport){
                       if($scope.typeSupport!="tabulaire"){
                               support = getSupportIntersection(e.target, "POINT");
                               console.info("SUPPORT= "+support);
                               if(support==-1){
                                      ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                      errorDessin = true;
                                      // return;
                               }
                       }else{
                               support = -2;
                              if(inCommune==-1){
                                         ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                         errorDessin = true;
                                         // return;
                               }
                       }                                      
                }else{
                       support = -2;
                       if(inCommune==-1){
                               ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                               errorDessin = true;
                               // return;
                       }
                }

                console.info(errorDessin);
                //***********************************************************************


                var projection= getUTMProjection(e.target, "POINT");
                if(projection=="" || errorDessin==true){
                       ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                       e.target.setLatLng(layerToEdit);
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(e.target._leaflet_id);
                                deplaceMarkerPointBD(e.target, e.target._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(e.target._leaflet_id);
                              deplaceMarkerPoint(e.target, e.target._leaflet_id, numero);
                        }
                       return;
               }else{
                       var Gjson = e.target.toGeoJSON();
                       layerToEdit = e.target._latlng;
                        if($stateParams.mode=="m"){
                                deleteMarkerPointBD(e.target._leaflet_id);
                                deplaceMarkerPointBD(e.target, e.target._leaflet_id, numero);
                        }else{
                              deleteMarkerPoint(e.target._leaflet_id);
                              deplaceMarkerPoint(e.target, e.target._leaflet_id, numero);
                        }

                       // Parcourir les Points pour changer le shape et gjson de l'entité éditée :
                       for (var i = 0; i < arrayPoint.length; i++) {
                               if (arrayPoint[i].id == e.target._leaflet_id) {
                                      latlngs = e.target._latlng;
                                      shape = getShapeOfGeometry(projection, latlngs,"POINT");
                                      arrayPoint[i].shape = shape;
                                      arrayPoint[i].gjson = JSON.stringify(Gjson);
                               }
                       }
               }
                if($stateParams.mode=="m"){
                       $scope.pointsBD = arrayPoint;
               }else{
                       $scope.points = arrayPoint;
               }

                valider_Geometrie_Informations_Feature_POINT(selectedFeature);
       }


        //  Leaflet draw & delete events for all draw types (point , polylines , polygons) :
        /////////////////////////////////////////////////////////////////////////
        map.on('draw:created', function (e) {

               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true ){
                       var layer = e.layer;
                       console.info(layer);
                       var id =layer._leaflet_id;
                       var shape = "";
                       var Gjson = layer.toGeoJSON();
                       console.info(Gjson);

                       var latlngs;

                       e.layer.on('edit', function (e) {
                                     var projection, commune;
                                     var numero;
                                     var arrayPolyline  = $scope.polylines;
                                     if($stateParams.mode=="m"){ arrayPolyline = $scope.polylinesBD;}
                                     var arrayPolygon  = $scope.polygons;
                                     if($stateParams.mode=="m"){ arrayPolygon = $scope.polygonsBD;}

                                     if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
                                             projection = getUTMProjection(e.target, "POLYLINE");
                                             commune = getCommuneIntersection(e.target, "POLYLINE");
                                             for(var i=0; i<arrayPolyline.length; i++){
                                                    if(arrayPolyline[i].id==e.target._leaflet_id){
                                                           numero= arrayPolyline[i].numero;
                                                    }
                                             }
                                      }

                                     if (layer instanceof L.Polygon)  {
                                             projection = getUTMProjection(e.target, "POLYGONE");
                                             commune = getCommuneIntersection(e.target, "POLYGONE");
                                             for(var i=0; i<arrayPolygon.length; i++){
                                                    if(arrayPolygon[i].id==e.target._leaflet_id){
                                                           numero= arrayPolygon[i].numero;
                                                           console.info("numero "+numero);
                                                    }
                                             }
                                     }

                                     console.info("numero "+numero);

                                     if(projection==""){
                                             ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                             if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
                                                    if($stateParams.mode=="m"){
                                                            deleteMarkerPolylineBD(e.target._leaflet_id);
                                                            deplaceMarkerPolylineBD(e.target, e.target._leaflet_id, numero);
                                                    }else{
                                                            deleteMarkerPolyline(e.target._leaflet_id);
                                                            deplaceMarkerPolyline(e.target, e.target._leaflet_id, numero);
                                                    }
                                             }
                                             if (layer instanceof L.Polygon)  {
                                                    if($stateParams.mode=="m"){
                                                           deleteMarkerPolygonBD(e.target._leaflet_id);
                                                           deplaceMarkerPolygonBD(e.target, e.target._leaflet_id, numero);
                                                    }else{
                                                           deleteMarkerPolygon(e.target._leaflet_id);
                                                           deplaceMarkerPolygon(e.target, e.target._leaflet_id, numero);
                                                    }
                                             }
                                             return;
                                     }else{
                                             layerToEdit = e.target.getLatLngs();
                                             var Gjson = e.target.toGeoJSON();
                                             if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {
                                                     if($stateParams.mode=="m"){
                                                            deleteMarkerPolylineBD(e.target._leaflet_id);
                                                            deplaceMarkerPolylineBD(e.target, e.target._leaflet_id, numero);
                                                    }else{
                                                            deleteMarkerPolyline(e.target._leaflet_id);
                                                            deplaceMarkerPolyline(e.target, e.target._leaflet_id, numero);
                                                    }
                                             }
                                             if (layer instanceof L.Polygon)  {
                                                    if($stateParams.mode=="m"){
                                                           deleteMarkerPolygonBD(e.target._leaflet_id);
                                                           deplaceMarkerPolygonBD(e.target, e.target._leaflet_id, numero);
                                                    }else{
                                                           deleteMarkerPolygon(e.target._leaflet_id);
                                                           deplaceMarkerPolygon(e.target, e.target._leaflet_id, numero);
                                                    }
                                             }

                                             // Parcourir les Polylines pour changer le shape et gjson de l'entité éditée :
                                             for (var i = 0; i < arrayPolyline.length; i++) {
                                                     if (arrayPolyline[i].id == e.target._leaflet_id) {
                                                            latlngs = e.target.getLatLngs();
                                                            shape = getShapeOfGeometry(projection, latlngs,"POLYLINE");
                                                            arrayPolyline[i].shape = shape;
                                                            arrayPolyline[i].gjson = JSON.stringify(Gjson);
                                                     }
                                             }

                                             // Parcourir les Polygons pour changer le shape et gjson de l'entité éditée :
                                             // for (var i = 0; i < arrayPolygon.length; i++) {
                                             //         if (arrayPolygon[i].id == e.target._leaflet_id) {
                                             //                latlngs = e.target.getLatLngs();
                                             //                shape = getShapeOfGeometry(projection, latlngs,"POLYGONE");
                                             //                var area = turf.area(Gjson.geometry);
                                             //                var ha = area/10000;
                                             //                var ha = parseFloat(ha.toFixed(4));
                                             //                arrayPolygon[i].superficie = ha;
                                             //                arrayPolygon[i].shape = shape;
                                             //                arrayPolygon[i].gjson = JSON.stringify(Gjson);
                                             //         }
                                             // }
                                     }

                                     if($stateParams.mode=="m"){
                                             $scope.polylinesBD = arrayPolyline;
                                             // $scope.polygonsBD = arrayPolygon;
                                     }else{
                                             $scope.polylines = arrayPolyline;
                                             // $scope.polygons = arrayPolygon;
                                     }
                       });

                       e.layer.on('dragend', function (e) {
                              dragendEventFunction(e);
                       });

                       //-------------------------------------------------------------------------------------------------------------//
                       // Click sur l'élément déssiné

                      if ( (e.layerType == 'marker') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true) ){

                              var projection = getUTMProjection(layer, "POINT");
                              if(projection==""){
                                      ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                      return;
                              }

                              var idSupport;
                              var support;
                              var inCommune = getCommuneIntersection(layer, "POINT");
                              if($scope.hasSupport){
                                     if($scope.typeSupport!="tabulaire"){
                                             support = getSupportIntersection(layer, "POINT");
                                             console.info("SUPPORT= "+support);
                                             if(support==-1){
                                                    ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                                    return;
                                             }
                                             idSupport = getSupportId(JSON.stringify(support));
                                     }else{
                                             support = -2;
                                            if(inCommune==-1){
                                                       ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                                       return;
                                             }
                                     }                                      
                              }else{
                                     support = -2;
                                     if(inCommune==-1){
                                             ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                             return;
                                     }
                              }

                               console.info("support "+JSON.stringify(support));
                               console.info("idSupport "+idSupport);
                              latlngs = layer._latlng;
                              shape = getShapeOfGeometry(projection, latlngs,"POINT");

                              var lengthMarker;
                              if($stateParams.mode=="m"){
                                     lengthMarker = $scope.pointsBD.length;
                              }else{
                                     lengthMarker = $scope.points.length+$scope.totalPoint;
                              }
                              lengthMarker++;

                              if($stateParams.mode=="m"){
                                    layer._leaflet_id = "Point_"+lengthMarker;
                                     drawnItems.addLayer(layer);
                                     id =layer._leaflet_id;
                                     addMarkerPointBD(layer, id, lengthMarker);
                                     // layerClickBD(layer);
                                     layerClick(layer);
                              }else{
                                     drawnItems.addLayer(layer);
                                      id =layer._leaflet_id;
                                     addMarkerPoint(layer, id, lengthMarker);
                                     layerClick(layer);
                              }
                              var idobj = id;
                              var dataObj;
                              if($stateParams.mode=="m"){
                                      idobj = "Point_"+lengthMarker;
                                      dataObj = {
                                             db_id: $scope.idCollecte,
                                             id: "Point_"+lengthMarker,
                                             numero:lengthMarker,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson),
                                             date_creation: $scope.formattedDate()
                                     };
                                     $scope.pointsBD.push(dataObj);
                                      console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthMarker+" , "+ $stateParams.mode+" , "+ "POINTBD"+" , "+ JSON.stringify(dataObj));
                                      alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthMarker, $stateParams.mode, "POINTBD", JSON.stringify(dataObj), "" );
                              }else{
                                      dataObj =  {
                                             id: id,
                                             numero: lengthMarker,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson),
                                             date_creation: $scope.formattedDate()
                                     };
                                     $scope.points.push(dataObj);
                                      console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthMarker+" , "+ $stateParams.mode+" , "+ "POINT"+" , "+ JSON.stringify(dataObj));
                                      alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthMarker, $stateParams.mode, "POINT", JSON.stringify(dataObj), "" );
                              }

                      }

                      if ( (e.layerType == 'polyline') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true) ){

                              var projection = getUTMProjection(layer,"POLYLINE");
                               if(projection==""){
                                      ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                      return;
                               }

                               var idSupport;
                               var inCommune = getCommuneIntersection(layer, "POLYLINE");
                              if($scope.hasSupport && $scope.typeSupport!="tabulaire"){
                                     var support = getSupportIntersection(layer, "POLYLINE");
                                      console.info("SUPPORT= "+support);
                                       if(support==-1){
                                              ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                              return;
                                      }
                                      idSupport = getSupportId(JSON.stringify(support));
                              }else{
                                     support = -2;
                                     if(inCommune==-1){
                                             ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                             return;
                                     }
                              }
                               console.info("support "+JSON.stringify(support));
                               console.info("idSupport "+idSupport);

                              latlngs = layer.getLatLngs();
                              shape = getShapeOfGeometry(projection,latlngs,"POLYLINE");

                              var lengthPolylines;
                              if($stateParams.mode=="m"){
                                     lengthPolylines = $scope.polylinesBD.length;
                              }else{
                                     lengthPolylines = $scope.polylines.length+$scope.totalPolyline;
                              }
                              lengthPolylines++;

                              if($stateParams.mode=="m"){
                                    layer._leaflet_id = "Polyline_"+lengthPolylines;
                                     drawnItems.addLayer(layer);
                                     id =layer._leaflet_id;
                                     addMarkerPolylineBD(layer, id, lengthPolylines);
                                     // layerClickBD(layer);
                                     layerClick(layer);
                              }else{
                                     drawnItems.addLayer(layer);
                                      id =layer._leaflet_id;
                                     addMarkerPolyline(layer, id, lengthPolylines);
                                     layerClick(layer);
                              }
                              var idobj = id;
                              var dataObj;
                              if($stateParams.mode=="m"){
                                     idobj = "Polyline_"+lengthPolylines;
                                      dataObj ={
                                             db_id: $scope.idCollecte,
                                             id: "Polyline_"+lengthPolylines,
                                             numero:lengthPolylines,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson),
                                             date_creation: $scope.formattedDate()
                                     };
                                     $scope.polylinesBD.push(dataObj);
                                     console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthPolylines+" , "+ $stateParams.mode+" , "+ "POLYLINEBD"+" , "+ JSON.stringify(dataObj));
                                     alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthPolylines, $stateParams.mode, "POLYLINEBD", JSON.stringify(dataObj), "" );
                              }else{
                                      dataObj = {
                                             id: id,
                                             numero: lengthPolylines,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson),
                                             date_creation: $scope.formattedDate()
                                     };
                                     $scope.polylines.push(dataObj);
                                     console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthPolylines+" , "+ $stateParams.mode+" , "+ "POLYLINE"+" , "+ JSON.stringify(dataObj));
                                     alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthPolylines, $stateParams.mode, "POLYLINE", JSON.stringify(dataObj), "" );

                              }

                      }

                       if( (e.layerType == 'polygon') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true) ) {

                              var polygonLayer=e.layer;
                              //-------------------------------------------------------------------------
                              //  Verification si le  polygon dessiné n'est pas une forme irrégulière !! :
                              var coordinatesOfGeometry = [];
                              coordinatesOfGeometry =polygonLayer.toGeoJSON().geometry.coordinates;
                              coordinatesOfGeometry = coordinatesOfGeometry[0];

                              var polygonSelfInterct = selfIntersect(coordinatesOfGeometry);
                              if(polygonSelfInterct==false){
                                     ionicToast.show('Forme polygonale irrégulière ! ', 'middle', false, 2500);
                                     return;
                              }
                              //-----------------------------------------------------------------------//
                              var projection = getUTMProjection(layer, "POLYGONE");
                              if(projection==""){
                                     ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                     return;
                              }

                              var idSupport;
                              var inCommune = getCommuneIntersection(layer, "POLYGONE");
                              console.info($scope.hasSupport);
                              if($scope.hasSupport && $scope.typeSupport!="tabulaire"){
                                     var support = getSupportIntersection(layer, "POLYGONE");
                                     if(support==-1){
                                             ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                             return;
                                     }
                                     idSupport = getSupportId(JSON.stringify(support));
                              }else{
                                     support = -2;
                                     if(inCommune==-1){
                                             ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                             return;
                                     }
                              }
                              //-------------------------------------------------------------------------
                              var supportATester;
                              var boolAddPolygonTodrawnItems = true;
                              var difference = Gjson.geometry;
                              // Fonction qui permet de cliper le polygon déssiné pour qu'il reste impérativement dans le support :
                              if($scope.hasSupport  && $scope.typeSupport!="tabulaire" && (support != -1)){
                                     SupportLayer.eachLayer(function(layer) {
                                             if(layer.feature.properties ==support){
                                                    supportATester = layer.feature.geometry;
                                                    // console.info(turf.difference(difference, supportATester).geometry.type);
                                                    //  if(turf.difference(difference, supportATester).geometry.type=="MultiPolygon"){
                                                    //         ionicToast.show('Forme  multi polygonale non supportée !','middle', false, 2500);
                                                    //         return;
                                                    //   }
                                                    var diff = turf.difference(difference, supportATester);
                                                    if(diff!=null){
                                                            var buffDiff = turf.buffer(diff, 0.001,'meters');
                                                            difference = turf.difference(difference, buffDiff);
                                                            difference = turf.simplify(difference, 0.000001, true);
                                                            boolAddPolygonTodrawnItems =false;
                                                    }else{
                                                            boolAddPolygonTodrawnItems =true;
                                                    }
                                             }
                                     });
                              }
                               if(!$scope.hasSupport && $scope.typeSupport!="tabulaire"){
                                     communesLayer.eachLayer(function(layer) {
                                             supportATester = layer.feature.geometry;
                                             var diff = turf.difference(difference, supportATester);
                                             if(diff!=null){
                                                     var buffDiff = turf.buffer(diff, 0.001,'meters');
                                                     difference = turf.difference(difference, buffDiff);
                                                     difference = turf.simplify(difference, 0.000001, true);
                                                     boolAddPolygonTodrawnItems =false;
                                             }else{
                                                     boolAddPolygonTodrawnItems =true;
                                             }
                                     });
                              }

                              console.info(JSON.stringify(difference));
                              var type = difference.type;
                              if(difference.geometry!=undefined){  type = difference.geometry.type;   }
                              console.info(type);
                              if(type=="MultiPolygon"){
                                     ionicToast.show('Forme  multi polygonale non supportée','middle', false, 2500);
                                     return;
                              }
                               //-------------------------------------------------------------------------
                               //  Intersection du Polygon nouvellement déssiné avec d'autres Polygons !! :
                              var polygonACliper;
                              var bunchOfPolygons = $scope.polygons;
                              if($stateParams.mode=="m"){ bunchOfPolygons = $scope.polygonsBD; }
                              try{
                                      for (var i = 0; i < bunchOfPolygons.length; i++) {
                                             polygonACliper  = JSON.parse(bunchOfPolygons[i].gjson);
                                             // Cas du Chevauchement totale du polygon déssiné avec les autres polygons.

                                                     if(turf.booleanContains(difference, polygonACliper) || turf.booleanContains(polygonACliper, difference)){
                                                            ionicToast.show('Chevauchement totale !','middle', false, 2500);
                                                            return;
                                                     }

                                             var intersect = turf.intersect(difference, polygonACliper);
                                             if(intersect != null){
                                                     // Quand  on dessine un polygon qui passe de part et d'autre par un autre polygon
                                                     // et que le résultat de la 'Difrence' des 2 polygons est un Multipolygon (2 polygons et plus en résultat).
                                                     console.info("turf.difference(difference, polygonACliper)");
                                                     console.info(JSON.stringify(turf.difference(difference, polygonACliper)));
                                                     if(turf.difference(difference, polygonACliper).geometry.type=="MultiPolygon"){
                                                            ionicToast.show('Forme  multi polygonale non supportée !','middle', false, 2500);
                                                            return;
                                                     }
                                                      var buffDiff = turf.buffer(polygonACliper, 0.001,'meters');
                                                     difference = turf.difference(difference, buffDiff);
                                                     difference = turf.simplify(difference, 0.000001, true);
                                                     boolAddPolygonTodrawnItems =false;
                                             }
                                      }
                              }
                             catch(error){
                                     ionicToast.show('Erreur Topologique !!','middle', false, 2500);
                                     return;
                             }

                              try{
                                      var arraySyncItems= [];
                                     drawnItemsSync.eachLayer(function(couche) {
                                            // if(couche)
                                            if (couche instanceof L.Marker) {

                                            }else{
                                                    if ((couche instanceof L.Polyline) && ! (couche instanceof L.Polygon))  {

                                                    }else{
                                                            arraySyncItems.push(couche.toGeoJSON());
                                                    }
                                            }

                                       });

                                      for(var i=0; i< arraySyncItems.length; i++){
                                             var polygonACliperSync =arraySyncItems[i];
                                             if(turf.booleanContains(difference, polygonACliperSync) || turf.booleanContains(polygonACliperSync, difference)){
                                                    ionicToast.show('Chevauchement totale !','middle', false, 2500);
                                                    return;
                                             }

                                             var intersect = turf.intersect(difference, polygonACliperSync);
                                             if(intersect != null){
                                                     // Quand  on dessine un polygon qui passe de part et d'autre par un autre polygon
                                                     // et que le résultat de la 'Difrence' des 2 polygons est un Multipolygon (2 polygons et plus en résultat).
                                                     console.info("turf.difference(difference, polygonACliperSync)");
                                                     console.info(JSON.stringify(turf.difference(difference, polygonACliperSync)));
                                                     if(turf.difference(difference, polygonACliperSync).geometry.type=="MultiPolygon"){
                                                            ionicToast.show('Forme  multi polygonale non supportée !','middle', false, 2500);
                                                            return;
                                                     }

                                                     var buffDiff = turf.buffer(polygonACliperSync, 0.001,'meters');
                                                     difference = turf.difference(difference, buffDiff);
                                                     // difference = turf.difference(difference, polygonACliperSync);
                                                     difference = turf.simplify(difference, 0.000001, true);
                                                     boolAddPolygonTodrawnItems =false;
                                             }
                                      }
                              }
                              catch(error){
                                     ionicToast.show('Erreur Topologique !!','middle', false, 2500);
                                     return;
                             }
                              //-------------------------------------------------------------------------
                              var lengthNumPolygons;
                              if($stateParams.mode=="m"){
                                     lengthNumPolygons = $scope.polygonsBD.length;
                              }else{
                                     lengthNumPolygons = $scope.polygons.length+$scope.totalPolygon;
                              }
                              lengthNumPolygons++;

                              if(boolAddPolygonTodrawnItems==true){      // si le polygon déssiné ne s'est intersecté avec aucun autre polygon.
                                    console.info("polygonLayer.toGeoJSON().geometry.type");
                                    console.info(polygonLayer.toGeoJSON().geometry.type);
                                     polygonLayer.setStyle(StylePolygon);
                                     if($stateParams.mode=="m"){ polygonLayer._leaflet_id = "Polygon_"+lengthNumPolygons; }
                                     drawnItems.addLayer(polygonLayer);
                                     if($stateParams.mode=="m"){
                                             addMarkerPolygonBD(polygonLayer,polygonLayer._leaflet_id, lengthNumPolygons);
                                     }else{
                                             addMarkerPolygon(polygonLayer,polygonLayer._leaflet_id, lengthNumPolygons);
                                     }
                                     $scope.guideLayers.push(polygonLayer);
                                     // layerClickBD(polygonLayer);
                                     layerClick(polygonLayer);
                                     id = polygonLayer._leaflet_id;
                               }else{ // si le polygon déssiné s'est intersecté avec autre polygon, et donc a subi des opérations de Clip.
                                     var diff = L.geoJson(difference, { onEachFeature: function (feature, lay) {
                                             console.info("lay.toGeoJSON().geometry.type");
                                             console.info(lay.toGeoJSON().geometry.type);
                                             lay.setStyle(StylePolygon);
                                             if($stateParams.mode=="m"){ lay._leaflet_id = "Polygon_"+lengthNumPolygons; }
                                             drawnItems.addLayer(lay);
                                             if($stateParams.mode=="m"){
                                                    addMarkerPolygonBD(lay,lay._leaflet_id, lengthNumPolygons);
                                             }else{
                                                    addMarkerPolygon(lay,lay._leaflet_id, lengthNumPolygons);
                                             }
                                             $scope.guideLayers.push(lay);
                                             // layerClickBD(lay);
                                             layerClick(lay);
                                             id = lay._leaflet_id;
                                             Gjson =lay.toGeoJSON();
                                     }
                                     });
                              }

                              latlngs = layer.getLatLngs();
                              shape = getShapeOfGeometry(projection,latlngs,"POLYGONE");
                              var area = turf.area(Gjson.geometry);
                              var ha = area/10000;
                              var ha = parseFloat(ha.toFixed(4));
                              console.info("$scope.polygonsBD.length=> "+$scope.polygonsBD.length);
                              var dataObj;
                              var idobj = id;
                              if($stateParams.mode=="m"){
                                    idobj = "Polygon_"+lengthNumPolygons;
                                    dataObj = {
                                             db_id:  $scope.idCollecte,
                                             id: "Polygon_"+lengthNumPolygons,
                                             numero: lengthNumPolygons,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson.geometry),
                                             superficie: ha,
                                             date_creation: $scope.formattedDate()
                                     };
                                     $scope.polygonsBD.push(dataObj);
                                      console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthNumPolygons+" , "+ $stateParams.mode+" , "+ "POLYGONEBD"+" , "+ JSON.stringify(dataObj));
                                      alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthNumPolygons, $stateParams.mode, "POLYGONEBD", JSON.stringify(dataObj), "" );
                               }else{
                                      dataObj = {
                                             id: id,
                                             numero: lengthNumPolygons,
                                             id_support: idSupport,
                                             support: support,
                                             shape: shape,
                                             gjson: JSON.stringify(Gjson.geometry),
                                             superficie: ha,
                                             date_creation: $scope.formattedDate()
                                     };
                                      $scope.polygons.push(dataObj);
                                       console.info(idobj+" , "+ $scope.numeroCollecte+" , "+ lengthNumPolygons+" , "+ $stateParams.mode+" , "+ "POLYGONE"+" , "+ JSON.stringify(dataObj));
                                       alimenterTableTemporaire(idobj, $scope.numeroCollecte, lengthNumPolygons, $stateParams.mode, "POLYGONE", JSON.stringify(dataObj), "" );
                               }


                              console.info("$scope.polygonsBD.length=> "+$scope.polygonsBD.length);
                       }
                       //-------------------------------------------------------------------------------------------------------------//
                       // Click sur l'élément déssiné

                       layer.on('click', function(e){
                              $("div.leaflet-popup").remove();
                       });


               }else{

                       var layer = e.layer;
                       var id = layer._leaflet_id;
                       var shape = "";
                       var bngcoords;
                       var Gjson = layer.toGeoJSON();
                       var latlngs;

                       //---------------------------------------------------------
                       // Split d'un polygon par une ligne (Polyline)
                       if (e.layerType == 'polyline'){
                                      var featureGrp = new L.FeatureGroup();
                                      var reader = new jsts.io.WKTReader();

                                      var parser = new jsts.io.GeoJSONParser();
                                      var jsonReader = new jsts.io.GeoJSONReader();

                                      var line = jsonReader.read(Gjson.geometry);
                                      var linePol = jsonReader.read(Gjson);
                                      var splitedPolygon = [];
                                      var idBloc;
                                      var numero_bloc;
                                      var idPolygonAsupprimer;

                                      //------------------------------------------------------------
                                      // Détection des polygons dont la ligne de Split passe par :
                                      for (var k = 0; k<$scope.polygons.length; k++) {

                                                     var count = 0;
                                                     var polygonizer = new jsts.operation.polygonize.Polygonizer();
                                                     var jsonPolygonPrSplit = JSON.parse($scope.polygons[k].gjson);
                                                     var intersect = turf.intersect(jsonPolygonPrSplit, Gjson); // Intersection de la ligne déssinée (Polyline) avec chacun des polygons déssinés.
                                                     console.info("intersect = "+intersect);

                                                     if(intersect !=null){ // Si l'intersection existe :
                                                            formdata = $scope.polygons[k].formdata;
                                                            console.info("intersect = "+JSON.stringify(intersect.geometry.type));
                                                            var polyg =  jsonReader.read(jsonPolygonPrSplit);
                                                            var union = polyg.getExteriorRing().union(line);
                                                            polygonizer.add(union);
                                                            var polygs = polygonizer.getPolygons(); // Liste des polygons résultats de split

                                                            for (var m = polygs.iterator(); m.hasNext();) {
                                                                   var polygonDiv = m.next();
                                                                   var divGJSON = JSON.stringify(parser.write(polygonDiv));
                                                                   var primeJSON = JSON.stringify(jsonPolygonPrSplit.geometry);
                                                                   count++;

                                                                   if(divGJSON != primeJSON){
                                                                          splitedPolygon.push({
                                                                                  gjson: JSON.stringify(parser.write(polygonDiv)),
                                                                                  formdata: formdata
                                                                          });
                                                                   }
                                                            }

                                                            console.info('count :: '+count);
                                                            if(count==2){ // L'opération de Split s'est déroulée avec succès :) => on a maintenant 2 polygons au lieu d'1 polygon (count ==2)
                                                              idPolygonAsupprimer = $scope.polygons[k].id;   //On supprime le polygon mère.
                                                              drawnItems.removeLayer(idPolygonAsupprimer);
                                                            }
                                                     }
                                      }

                                      // Suppression de la parcelle de base splité par la ligne :
                                      for (var b = 0; b < $scope.polygons.length; b++) {
                                            if ($scope.polygons[b].id == idPolygonAsupprimer) {
                                              $scope.polygons.splice(b, 1);
                                            }
                                      }

                                      // Suppression du label du polygon supprimé :
                                      for (var k in markersPolygonObject){
                                          if (markersPolygonObject.hasOwnProperty(k) && (k==idPolygonAsupprimer) ) {
                                               delete markersPolygonObject[k];
                                          }
                                      }

                                      // Ajouter les polygons résultat du Split par la ligne :
                                      for (var m = 0; m<splitedPolygon.length; m++) {
                                             var gjsonPol = JSON.parse(splitedPolygon[m].gjson);
                                             var g = L.geoJson(gjsonPol, { onEachFeature: function (feature, couche) {
                                                    couche.setStyle(StylePolygon);
                                                    drawnItems.addLayer(couche);
                                                    layerClick(couche);
                                                    var projection = getUTMProjection(couche,"POLYGONE");
                                                    console.info("projection ===== "+projection);
                                                    var shape = getShapeOfGeometry(projection,couche.getLatLngs(),"POLYGONE");
                                                    console.info("shape ====="+shape);
                                                    var area = turf.area(gjsonPol);
                                                    var ha = parseInt(area/10000);
                                                    var lengthP = $scope.polygons.length;
                                                    lengthP++;
                                                     console.info("Data polygon splited = "+JSON.stringify(dataP));
                                                   $scope.polygons.push( {
                                                         id: couche._leaflet_id,
                                                         numero: lengthP,
                                                         shape: shape,
                                                         gjson: splitedPolygon[m].gjson,
                                                         superficie: ha,
                                                         date_creation: $scope.formattedDate(),
                                                         agent: $scope.loginG,
                                                         formdata: splitedPolygon[m].formdata
                                                     });
                                                    addMarkerPolygon(couche,couche._leaflet_id, lengthP);
                                             }
                                            });
                                      }

                                      reaffectNumeroForPolygon();

                       }
                       }


                       //--------------------------------------------------------------------------------------------------------
                       // Création de Holes sur les Polygons :
                       if( (e.layerType == 'polygon') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==false) ) {
                              latlngs = layer.getLatLngs();
                              shape = getShapeOfGeometry(latlngs,"POLYGON");
                              // var Gjson =  layer.toGeoJSON();
                              var polygonForHole = Gjson.geometry;

                              // Détéction des parcelles intersectées par le Hole crée (polygon de hole) :
                              for (var i = 0; i < $scope.polygons.length; i++) {

                                     var clipping_polygon  = JSON.parse($scope.polygons[i].gjson);
                                     var id = $scope.polygons[i].id;
                                     var intersect = turf.intersect(clipping_polygon, polygonForHole);
                                     console.log("intersectttt = "+JSON.stringify(intersect));

                                     if(intersect != null){
                                            var difference = turf.difference(clipping_polygon, polygonForHole);
                                            drawnItems.removeLayer(id);

                                            L.geoJson(difference.geometry, { onEachFeature: function (feature, laye) {
                                                   laye.setStyle(StylePolygon);
                                                   laye._leaflet_id = $scope.polygons[i].id;
                                                   drawnItems.addLayer(laye);
                                                   layerClick(laye);
                                                   laye.on('edit', function (e) {
                                                       layerEdit(e);
                                                   });

                                                    var latlngHole = [laye.getLatLngs(), latlngs];
                                                    console.info("latlngHole= "+latlngHole);

                                                    var projection = getUTMProjection(laye, "POLYGONE");
                                                    var area = turf.area(laye.toGeoJSON().geometry);
                                                    var ha = parseInt(area/10000);
                                                    console.info("èèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèèè");
                                                    console.info($scope.polygons[i].shape);
                                                    console.info(getShapeOfGeometry(projection, laye.getLatLngs(),"POLYGONE"));
                                                    $scope.polygons[i].shape = getShapeOfGeometry(projection, laye.getLatLngs(),"POLYGONE");
                                                    $scope.polygons[i].gjson = JSON.stringify(laye.toGeoJSON().geometry);
                                                    $scope.polygons[i].superficie = ha;
                                                }
                                            });

                                            // $scope.polygons.splice(i, 1);
                                     }
                              }

                              console.info(" console.info($scope.polygons.length); = "+$scope.polygons.length);

                       }
        });

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////

        map.on('draw:deleted', function (e) {
               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible') ){

                      var layers = e.layers;
                      console.info(layers.length);
                      var IsMarker = true;
                      layers.eachLayer(function (layer) {
                              console.info(layer._leaflet_id);
                              drawnItems.removeLayer(layer);

                              // Annulation du Bloc supprimé du tableau des GuideLayers :
                              for (var i = 0; i < $scope.guideLayers.length; i++) {
                                     if ($scope.guideLayers[i]._leaflet_id == layer._leaflet_id) {
                                             console.log("guideLayers del : OK "+$scope.guideLayers.length);
                                             $scope.guideLayers.splice(i, 1);
                                     }
                              }

                              ////////////////////////////////////////////////////////////////////////////////////////////
                               // Suppression du Point déssiné aisni que son label :
                              for (var i = 0; i < $scope.points.length; i++) {
                                     if ($scope.points[i].id == layer._leaflet_id) {
                                             console.log("points del : OK "+$scope.points.length);
                                            updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.points[i].numero, $stateParams.mode, "POINT", JSON.stringify($scope.points[i]), "DELETE" ).then(function(){
                                                    deletePoint(layer._leaflet_id);
                                                    deleteMarkerPoint(layer._leaflet_id);
                                                    reaffectNumeroForPoint();
                                                    console.log("points del : OK "+$scope.points.length);
                                             });
                                     }
                              }
                              ////////////////////////////////////////////////////////////////////////////////////////////
                               // Suppression du Polyline déssiné aisni que son label :
                              for (var i = 0; i < $scope.polylines.length; i++) {
                                     if ($scope.polylines[i].id == layer._leaflet_id) {
                                             console.log("polylines del : OK "+$scope.polylines.length);

                                              updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.polylines[i].numero, $stateParams.mode, "POLYLINE", JSON.stringify($scope.polylines[i]), "DELETE" ).then(function(){
                                                    // $scope.polylines.splice(i, 1);
                                                    deletePolyline(layer._leaflet_id);
                                                    deleteMarkerPolyline(layer._leaflet_id);
                                                    reaffectNumeroForPolyline();
                                                    console.log("polylines del : OK "+$scope.polylines.length);
                                             });
                                     }
                              }
                              ////////////////////////////////////////////////////////////////////////////////////////////
                                // Suppression du Polygon déssiné aisni que son label
                              for (var i = 0; i < $scope.polygons.length; i++) {
                                     if ($scope.polygons[i].id == layer._leaflet_id) {
                                             console.log("polygons del : OK "+$scope.polygons.length);
                                             updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.polygons[i].numero, $stateParams.mode, "POLYGONE", JSON.stringify($scope.polygons[i]), "DELETE" ).then(function(){
                                                    // $scope.polygons.splice(i, 1);
                                                    deletePolygon(layer._leaflet_id);
                                                    deleteMarkerPolygon(layer._leaflet_id);
                                                    reaffectNumeroForPolygon();
                                                    console.log("polygons del : OK "+$scope.polygons.length);
                                             });
                                     }
                              }

                              for (var i = 0; i < $scope.polygons.length; i++) {
                                  console.info("$scope.polygons[i].id= "+$scope.polygons[i].id);
                              }

                              ////////////////////////////////////////////////////////////////////////////////////////////
                              //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

                              // Suppression du Point déssiné de la BD aisni que son label :
                              for (var i = 0; i < $scope.pointsBD.length; i++) {
                                     if ($scope.pointsBD[i].id == layer._leaflet_id) {
                                            $scope.isPointBD = true;
                                             idToDelete = $scope.pointsBD[i].db_id;
                                             console.log("pointsBD del : OK "+$scope.pointsBD.length);
                                             // updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.pointsBD[i].numero, $stateParams.mode, "POINTBD", JSON.stringify($scope.pointsBD[i]), "DELETE" ).then(function(){
                                                     $scope.pointsBD.splice(i, 1);
                                                     // deletePointBD(layer._leaflet_id);
                                                     deleteMarkerPointBD(layer._leaflet_id);
                                                     // reaffectNumeroForPointBD();
                                                      // $scope.UpdateJsonData(idToDelete);
                                             // });
                                     }
                              }
                              ////////////////////////////////////////////////////////////////////////////////////////////
                              // Suppression du Polyline déssiné de la BD aisni que son label :
                               for (var i = 0; i < $scope.polylinesBD.length; i++) {
                                     if ($scope.polylinesBD[i].id == layer._leaflet_id) {
                                             $scope.isPolylineBD = true;
                                             idToDelete = $scope.polylinesBD[i].db_id;
                                             console.log("polylinesBD del : OK "+$scope.polylinesBD.length);
                                             // updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.polylinesBD[i].numero, $stateParams.mode, "POLYLINEBD", JSON.stringify($scope.polylinesBD[i]), "DELETE" ).then(function(){
                                                    $scope.polylinesBD.splice(i, 1);
                                                    // deletePolylineBD(layer._leaflet_id);
                                                    deleteMarkerPolylineBD(layer._leaflet_id);
                                                    // reaffectNumeroForPolylineBD();
                                                    // $scope.UpdateJsonData(idToDelete);
                                             // });
                                     }
                              }
                              ////////////////////////////////////////////////////////////////////////////////////////////
                              // Suppression du Polygon déssiné de la BD aisni que son label :
                              for (var i = 0; i < $scope.polygonsBD.length; i++) {
                                     if ($scope.polygonsBD[i].id == layer._leaflet_id) {
                                             $scope.isPolygonBD = true;
                                             idToDelete = $scope.polygonsBD[i].db_id;
                                             console.log("polygonsBD del : OK "+$scope.polygonsBD.length);
                                             // updateDeleteTableTemporaireGeom(layer._leaflet_id, $scope.numeroCollecte, $scope.polygonsBD[i].numero, $stateParams.mode, "POLYGONEBD", JSON.stringify($scope.polygonsBD[i]), "DELETE" ).then(function(){
                                                     $scope.polygonsBD.splice(i, 1);
                                                     // deletePolygonBD(layer._leaflet_id);
                                                     deleteMarkerPolygonBD(layer._leaflet_id);
                                                     // reaffectNumeroForPolygonBD();

                                                     // $scope.UpdateJsonData(idToDelete);
                                             // });
                                     }
                              }


                              console.info("$scope.polygons.length=> "+$scope.polygons.length);
                              console.info("$scope.polygonsBD.length=> "+$scope.polygonsBD.length);

                              //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//
                              ////////////////////////////////////////////////////////////////////////////////////////////
                       });

               }else{
                      var layers = e.layers;
                      layers.eachLayer(function (layer) {
                              drawnItemsParcelles.removeLayer(layer);

                              // // Suppression des labels liés à l'entité supprimée
                              // for (var m in markersObjectNew){
                              //        if (markersObjectNew.hasOwnProperty(m) && (m==layer._leaflet_id) ) {
                              //                delete markersObjectNew[m];
                              //        }
                              // }
                              // markerPlleNew.clearLayers();
                              // for (var m in markersObjectNew){
                              //        markerPlleNew.addLayer(markersObjectNew[m]);
                              // }

                      });
               }
        });

        /////////////////////////////////////////////////////////////////////////

  });

 });


});
