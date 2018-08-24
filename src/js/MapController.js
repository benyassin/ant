/* 
*
* Controller : CarteCtrl ( Controlleur de la carte).
*
* Description: 
* Le controlleur 'CarteCtrl' est utlisé pour gérer toutes les input et les output de la carte de leaflet mobile
* Il comprends un ensemble de fonctions et procédures allant de la chargement de la carte (différents
* couches et fonds de carte présents dans la carte)  jusqu'au dessin de différents entités géographiques (point; 
* polyline; polygon) et leurs stockage en interne (sur le dispositif mobile) et leurs synchronisation vers le Cloud.
*
* Copyright: BENYASSIN Ayoub - GEOCODING.
*
* Date de modification : 23-01-2017.
*
*/
app.controller("CarteCtrl", function($scope, leafletData,$timeout,$location,$ionicGesture,$rootScope,$ionicLoading,$ionicPopup,
  $ionicModal,$state,$window,$cordovaSQLite,$ionicSideMenuDelegate,ionicToast, $ionicHistory, $stateParams, $ionicPlatform, 
  $ionicPopover,$compile,$parse, $cordovaGeolocation,$q, $ionicSlideBoxDelegate, $localStorage, $ionicScrollDelegate ) {


var sidebar;

console.info("$stateParams.mode");
console.info($stateParams.mode);
console.info("$stateParams.id_exploitation");
console.info($stateParams.id_exploitation);
console.info("$stateParams.id");
console.info($stateParams.id);

// Fonctions de gestion de l'enquête RNA : ( Gestion des 2 modes : Nouvelle Exploitation ou Modification d'une Exploitation non encore synchronisée)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// Fonction de  chargement des différents entités enregistrées sur la BD locale ///////////////////////
function loadProjectData(){
        $scope.selectedProject="";
        var querySelectedProject = " SELECT _id FROM projets WHERE checkd =1 and theme = 'rna' ";  

               $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
     
                      if(res.rows.length > 0) {                            
                              for (var i = 0; i < res.rows.length ; i++) {
                                     $scope.selectedProject = res.rows.item(i)._id;

                                      // var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+$localStorage.selectedProject+"'";
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
                                                            console.info(geometry);
                                                
                                                           if(geometry=="polygone"){
                                                                $scope.idFormParcelle=id;
                                                                $scope.idFieldsFormParcelle=id_fields;
                                                                $scope.nameFieldsFormParcelle=name;
                                                                $scope.fieldsFormParcelle=fields;
                                                            }
                                                             if(geometry=="point"){
                                                                $scope.idFormExploitation=id;
                                                                $scope.idFieldsFormExploitation=id_fields;
                                                                $scope.nameFieldsFormExploitation=name;
                                                                $scope.fieldsFormExploitation=fields;
                                                            }

                                                              console.info("$localStorage.idFormPoint= "+$localStorage.idFormPoint);
                                                              console.info("$localStorage.idFieldsFormPoint= "+$localStorage.idFieldsFormPoint);
                                                              // console.info("$localStorage.fieldsFormPoint= "+$localStorage.fieldsFormPoint);
                                                    }
                                             }else{
                                                // Table des Forms est vide !!
                                             } 

                                              if($stateParams.mode=="m"){
                                                    loadDonneesExploitationBD($stateParams.id);
                                              }else{
                                                      getMaxIdExploitation().then(function(){
                                                            console.info("$scope.numeroExploitation");
                                                            console.info($scope.numeroExploitation);

                                                            $scope.numeroExploitation++;

                                                            console.info("$scope.numeroExploitation");
                                                            console.info($scope.numeroExploitation);
                                                      }); 
                                              }

                                     }, function (err) {
                                            console.info("err => "+err+ " "+querySelectForms);
                                     });    
                                      //--------------------------------------------------------------------------------------------------------------------------------------------------------------//
                                                                                                                                                                                
                              }

                       }else{
                               // Table des Projets est vide !!

                       } 

               }, function (err) {
                      console.info(err);
                      console.info("err => "+querySelectedProject);
               });    
}

function getMaxIdExploitation(){

        var deferred = $q.defer();

        var sql = " SELECT max(id_exp) AS max FROM rna";
     
       $cordovaSQLite.execute(db, sql).then(function(res) {
                console.info(res.rows.length);
                if(res.rows.length > 0) {
                  for (var i = 0; i < (res.rows.length) ; i++) {
                      $scope.numeroExploitation = res.rows.item(i).max;   
                      console.info("maaaaaaaax "+$scope.numeroExploitation); 
                  }
                  deferred.resolve();

                } else {
                  console.info('err REQ( getMaxIdExploitation ) :=> res.rows.length = 0');
                   $scope.numeroExploitation = 0;
                }

        }, function (err) {
            console.info(err);
            console.info('err SQL '+sql);
        });

         return deferred.promise;
}

// ------------------------------------------------------------------------------------------------ //

$ionicPlatform.registerBackButtonAction(function (event) {
    event.preventDefault();
}, 100);

  console.info("tuileChoisie = "+$localStorage.tuileChoisie);
  $scope.loginG=$localStorage.loginParam;

var Projection26191 = "+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs";
var ProjectionUTM28 = "+proj=utm +zone=28 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
var ProjectionUTM29 = "+proj=utm +zone=29 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
var ProjectionUTM30 = "+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ";

////////////////////////////////////////////////////////////////////////////////////
$scope.idBorne="null"; 
$scope.maxIdParcelle=0;





//=========================================================//
$scope.latGPS=0;
$scope.lngGPS=0;
//  var watch=$cordovaGeolocation.watchPosition(watchOptions);
//  var watchOptions = {
//     timeout : 10000,
//     enableHighAccuracy: false // may cause errors if true
//   };
//      watch = $cordovaGeolocation.watchPosition(watchOptions);
//       watch.then(
//     null,
//     function(err) {
//       // error
//     },
//     function(position) {
//       $scope.latGPS  = position.coords.latitude;
//       $scope.lngGPS = position.coords.longitude;
//       console.info("//=========================================================//");
//       console.info($scope.latGPS+" - "+$scope.lngGPS);
//       console.info("//=========================================================//");
//   });



// //=========================================================//
// var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
// $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
//         $scope.latGPS = position.coords.latitude;
//         $scope.lngGPS = position.coords.longitude;
//         console.info("//=========================================================//");
//         console.info($scope.latGPS+" - "+$scope.lngGPS);
//         console.info("//=========================================================//");
// }, function(err) {
//        // console.info(err);
//        console.info(err.message);
// });

//=========================================================//


// Initiate the draw controller (dealing with error : map freezing when initiate):
leafletData.getMap().then(function(map) { 
  
    var polygonDrawer = new L.Draw.Polyline(map);
    polygonDrawer.enable();
    
      $timeout(function () {
                        polygonDrawer.disable();
                    }, 1000);

          var extent = bbox(utm);
          var Pt1 = new L.latLng(extent[1], extent[0]);
          var Pt2 = new L.latLng(extent[3], extent[2]);
           bounds = new L.LatLngBounds(Pt1, Pt2);
          map.fitBounds(bounds);

          map.fitBounds(UTM.getBounds());
          map.setMaxBounds(UTM.getBounds());

          tileLayerUTM.addTo(map);
          markersUTM.addTo(map);
          markerPlle.addTo(map); 
          markerPlleNew.addTo(map); 
          markerBlocNew.addTo(map); 
          markerBlocBD.addTo(map); 

           $ionicPlatform.ready(function() {
                loadProjectData();
          });
                
});
  

// Labels des parcelles enregistrées en local et non encore synchronisées.
var markerPlle = new L.LayerGroup();
var markersObject = {};

// Labels des parcelles nouvelement crées
var markerPlleNew = new L.LayerGroup();
var markersObjectNew = {};

// Labels des bloc nouvelement crées
var markerBlocNew = new L.LayerGroup();
var markersObjectBlocNew = {};

// Labels des bloc nouvelement crées
var markerBlocBD = new L.LayerGroup();
var markersObjectBlocBD = {};

  // Boolean : Activation / Désactivation du mode Edition.
  modeEdition=false;
  // Boolean : Show / Hide le formulaire de la parcelle.
  showParcelleForm=false; 


  SelectForJoin = false;   
  $scope.formActive=false; 

  var boolEdit = false;    
  var boolDrag = false;    
  var boolInfo = false;   
  var boolSelect = false;  
  var boolSplit = false;   
  var boolMerge = false;   
  var boolHole = false;   

 $scope.points=[];

  $scope.guideLayers = [];
  $scope.savedItems = [];

  $scope.polygons = [];
  $scope.polygonsBD = [];

  $scope.parcelles = [];

// Déclaration des Controlleurs de dessins qui vont abriter les éléments déssinés  { Blocs - Parcelles }.
  var drawControl;
  var drawControlParcelles;

  var drawnItems = new L.FeatureGroup();
  var drawnItemsBloc = new L.FeatureGroup();

  var drawnItemsParcelles = new L.FeatureGroup();

  var selectedFeature = null;
  var segmentsArray=[];


 //////////////////////////////////////////////////////////////////////////////////////////
// Déclaration et définition des couches de bases et des Overlays à afficher sur la carte:
$scope.definedLayers = {
      googleHybrid: {
          name: 'Google Hybrid',
          layerType: 'HYBRID',
          type: 'google'
      },
      xyz: {
          name:'Tuile local',
          // url: cordova.file.externalRootDirectory+"tuillage/aitsididaoud2/{z}/{x}/{y}.jpg",
          // url: cordova.file.externalRootDirectory+"TuileIFE/"+$rootScope.tuileChoisie+"/{z}/{x}/{y}.png",
          // url: "aitsididaoud2/{z}/{x}/{y}.jpg",
          url: $localStorage.tuileChoisie+"/{z}/{x}/{y}.jpg",
          type:"xyz",
          // visible: true,
          layerOptions: {
                attribution: 'Geocoding MA © \<a href="http://www.geocoding.ma/"> www.geocoding.ma </a>',
                tileSize: 256, 
                opacity :0.7,
                tms:true,
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
        tileLayerSecteur: {
          name: 'Sous Secteur',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: true
          }
      },
       tileLayerDouar: {
          name: 'Douar',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      },
       tileLayerMappe: {
          name: 'Mappe',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      },
        tileLayer: {
          name: 'T/R',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      },
      draw: {
          name: 'Collecte',
          type: 'group',
          visible: true,
          layerParams: {
              showOnSelector: false
          }
      },
      PlleNonSync: {
          name: 'Parcelles non synchronisées',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      },
      PlleSync: {
          name: 'Parcelles synchronisées',
          type: 'group',
          visible: false,
          layerParams: {
              showOnSelector: true
          }
      }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 /*
  * Définission des couches Mappes et Douars pour des opérations d'intersection avec les parcelles déssinées. 
  */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var pad = 0;
var bbounds;

var markersUTM = new L.LayerGroup();
var markersSecteur = new L.LayerGroup();
var markersDouars = new L.LayerGroup();
var markersMappes = new L.LayerGroup();

 var tileOptions = {
        maxZoom: 20,  // max zoom to preserve detail on
        tolerance: 5, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64,   // tile buffer on each side
        debug: 0,      // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 20,        // max zoom in the initial tile index
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

var Secteurs= L.geoJson(secteur, {
  // style:DouarStyle,
  name: 'Secteur', 
  onEachFeature: function(feature, layer) {
    var label = L.marker(layer.getBounds().getCenter(), {
      icon: L.divIcon({
      className: 'labelSecteurs',
      html: feature.properties.numero
      // iconSize: [20, 40]
      })
  });
  markersSecteur.addLayer(label);
  }
});
var douar= L.geoJson(douars, {
  // style:DouarStyle,
  name: 'Douars', 
  onEachFeature: function(feature, layer) {
    var label = L.marker(layer.getBounds().getCenter(), {
      icon: L.divIcon({
      className: 'labelDouars',
      html: feature.properties.nom_Fr,
      iconSize: [200, 40]
      })
  });
  markersDouars.addLayer(label);
  }
});
var mappess= L.geoJson(mappes, {
       // style:MappesStyle,
       name: 'Mappes', 
       onEachFeature: function(feature, layer) {
          var label = L.marker(layer.getBounds().getCenter(), {
            icon: L.divIcon({
              className: 'labelMappes',
              html: feature.properties.Text,
              iconSize: [200, 40]
            })
          });
          markersMappes.addLayer(label);
        }
});

var tileIndexUTM = geojsonvt(utm, tileOptions);
var tileIndexSecteur = geojsonvt(secteur, tileOptions);
var tileIndexDouar = geojsonvt(douars, tileOptions);
var tileIndexMappe = geojsonvt(mappes, tileOptions);

var tileLayerSecteur = L.canvasTiles()
                      .params({ debug: false, padding: 3 })
                      .drawing(drawingOnCanvasSecteur)

var tileLayerUTM = L.canvasTiles()
                      .params({ debug: false, padding: 3 })
                      .drawing(drawingOnCanvasUTM)

 var tileLayerDouar = L.canvasTiles()
                      .params({ debug: false, padding: 3 })
                      .drawing(drawingOnCanvasDouar)

 tileLayerMappe = L.canvasTiles()
                      .params({ debug: false, padding: 3 })
                      .drawing(drawingOnCanvasMappe)

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

 function drawingOnCanvasDouar(canvasOverlay, params) {
            var bounds = params.bounds;
            bbounds = bounds;

            params.tilePoint.z = params.zoom;
            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';

            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndexDouar.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
            if (!tile) {
                // console.log('tile empty');
                return;
            }

            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

            var features = tile.features;

            ctx.strokeStyle = '#8470FF';


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

 function drawingOnCanvasSecteur(canvasOverlay, params) {
            var bounds = params.bounds;
            bbounds = bounds;

            params.tilePoint.z = params.zoom;
            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';

            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndexSecteur.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
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

 function drawingOnCanvasMappe(canvasOverlay, params) {
            var bounds = params.bounds;
            bbounds = bounds;

            params.tilePoint.z = params.zoom;
            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';

            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndexMappe.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
            if (!tile) {
                // console.log('tile empty');
                return;
            }

            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

            var features = tile.features;

            ctx.strokeStyle = '#00FFFF';


            for (var i = 0; i < features.length; i++) {
                var feature = features[i],
                    type = feature.type;
                    // $scope.guideLayers.push(feature);

                ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0.0)';
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*
  * Déclaration des Fonctions du Controlleur :'CarteCtrl'. 
  */
 /////////////////////////////////// Fonctions de des Boutton Header & Footer :: Carte.html  ////////////////////
$scope.goDashboard = function(){
    $state.go('dashboard', {}, {reload: true});
 };

$scope.goParametrage = function(){
  sidebar.close();
                  $("#sidebarRNA").css( "display", "none");
    $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
    // $backView = $ionicHistory.backView();
    // $backView = $ionicHistory.goBack();
         // $backView.go();
 };

 $scope.myGoBack = function() {
         $backView = $ionicHistory.backView();
         $backView.go();
        };
  
$scope.go = function ( path ) {
   $location.path( path );
  };

$scope.ToogleEdition=function(modeEdition){

    sidebar.close();

    sidebar.on('closing', function(e) {
      $("#sidebarRNA").css( "display", "none");
    })

    console.log(modeEdition);
    $scope.modeEdit = modeEdition;

    leafletData.getMap().then(function(map) {  
        if(modeEdition){
        map.addControl(drawControl);
        map.addControl(drawControlParcelles);
        map.addControl(editCtrl);
        map.addControl(dragCtrl);
        // map.addControl(infoCtrl);
        // map.addControl(gpsCtrl);
        map.addControl(saveCtrl);
        // map.addControl(JoinCtrl);
        // map.addControl(splitCtrl);
        // map.addControl(mergeCtrl);
        // map.addControl(holeCtrl);
        }else{
            map.removeControl(drawControl);
            map.removeControl(drawControlParcelles);
            map.removeControl(editCtrl);
            map.removeControl(dragCtrl);
            // map.removeControl(infoCtrl);
            // map.removeControl(gpsCtrl);
            map.removeControl(saveCtrl);
            // map.removeControl(JoinCtrl);
            // map.removeControl(splitCtrl);
            // map.removeControl(mergeCtrl);
            // map.removeControl(holeCtrl);
        }
    });
}


$scope.showPopupValidatePolygon = function() {
  if($scope.modeEdit){
    $scope.data = {}
    // Custom popup
    var myPopup = $ionicPopup.show({
       subTitle: '<span style="font-size:19;"><b>Voulez vous vraiment valider l\'exploitation en cours ? </b></span>',
       scope: $scope,
       buttons: [
          { text: 'Annuler',type:'button-dark' }, {
             text: '<b>Valider</b>',
             type: 'button-positive',
                onTap: function(e) {
                    $scope.Validation();
                }
          }
       ]
     });
  }
}

$scope.Validation = function(){

    // if ( aSaisir== false && aDessinerPoints== false && aDessinerPolylines== false && aDessinerPolygons== false){

          $ionicLoading.show({
                  template: '<ion-spinner></ion-spinner> <br/> Enregistrement en cours ...',
                  content: 'Loading',
                  animation: 'fade-in',
                  showBackdrop: true,
                  maxWidth: 200,
                  showDelay: 0
            });         

            $timeout(function () {

                  $scope.SaveAllExploitationJsonData();
                  $ionicLoading.hide();

                }, 3000);

        // }else{

               // if (aDessinerPoints== true){
               //     ionicToast.show(' Veuillez dessiner les bornes de la parcelle ', 'middle', false, 2500);
               //     return;
               // }  
     // }    
}


 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////////////////////////// Fonctions standards du controlleur carteCtrl /////////////////////////////////////////

$scope.geojson2postgis=function(element,json){
    var str=json;
    if(element=="parcelle"){
        str = str.replace("[[[","POLYGON((").replace("]]]","))");
        str = str.replace(/,/g, ' ');
        str = str.replace(new RegExp("\\[", 'gi'), 'm');
        str = str.replace(new RegExp("\\]", 'gi'), 'm');
        str = str.replace(/m m/g, ',');
    }   
    return str;
 };  

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

                      if(selectedFeature!=null){                    
                        // for (var m in selectedFeature.snapediting._verticesHandlers[0]._markerGroup._layers) {
                        //       selectedFeature.snapediting._verticesHandlers[0]._markerGroup.clearLayers();
                        //   }
                        selectedFeature.snapediting.disable();    
                      }
                      retablirShpGjsonLimites();
                          $( ".editionGeometrie" ).css( "backgroundImage", "url(img/noedit.png)" );
                          boolEdit = false;
                    }
                    
                   
                    // $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noform.png)" );
                    $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noinfo.png)" );
                     boolInfo=false;

                    $( ".selectGeometrie" ).css( "backgroundImage", "url(img/noSelect.png)" );
                    boolSelect = false;

                    $( ".pvGeometrie" ).css( "backgroundImage", "url(img/no_pv.png)" );
                    boolPV = false;



                      // if(boolSelect==true){
                        drawnItems.eachLayer(function (layer) {
                          // layer = drawnItems[i];
                             if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                              if(layer.options.color=='#00FFFF'){
                                  
                                   for (var i = 0; i < $scope.polylines.length; i++) {  
                                      if ($scope.polylines[i].id == layer._leaflet_id) {
                                         layer.setStyle({color:'green'});
                                      }else{
                                           layer.setStyle({color:'red'});
                                      }                   
                                   }

                                }
                             }
                        });
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////// Fonctions de gestion des Parcelles /////////////////////////////////////////////.

$scope.addParcelle=function(){
        var query = ' INSERT INTO polygons(nature,numero,nombreParties,nbrBornes) ';
              query+= ' VALUES (?,?,?,?) ';
    
       $cordovaSQLite.execute(db,q,[nature,numero,nombreParties,nbrBornes]).then(function(res) {
           console.info('OK INSERT addParcelle');
         }, function (err) {
            console.info('err sql INSERT addParcelle '+err);
         });
}

$scope.SaveParcelleJsonData2= function(){

    var boolParcelles = true;
    var msgParcelles = "";
    var exploitation=[];
    var exploitationData=[];
    var bloc = [];
    var parcelles = [];

    var area_total_bloc=0.0;
    var area_total_parcelle=0.0;

    console.info("$scope.parcelleData= "+$scope.parcelleData);

    if($scope.parcelleData=="" || $scope.parcelleData==undefined){
        ionicToast.show(' Veuillez remplir le questionnaire de l\'xploitation en cours ', 'middle', false, 2500);
        // return;
    }

    // Grouper les bloc de l'exploitation collectée : 
    for (var i = 0; i < $scope.polygons.length; i++) {     

        var dataB = {
               id_exploitation: $scope.polygons[i].exp,
               numero: $scope.polygons[i].numero,
               shape: $scope.polygons[i].shape,
               gjson: $scope.polygons[i].gjson,
               superficie: $scope.polygons[i].area,
               date_creation: $scope.polygons[i].date_creation,
               agent: $scope.polygons[i].id_creator
        };

        bloc.push(dataB);
        area_total_bloc += $scope.polygons[i].area;
     }

     // Grouper les parcelles de l'exploitation collectée : 
    for (var i = 0; i < $scope.parcelles.length; i++) {      

        if($scope.parcelles[i].data=="" || $scope.parcelles[i].data==undefined){
          boolParcelles = false;
          msgParcelles+= $scope.parcelles[i].numero+" ,";
        }

        var dataP = {
               id_exploitation: $scope.parcelles[i].exp,
               numero_bloc: $scope.parcelles[i].numero_bloc,
               numero: $scope.parcelles[i].numero,
               shape: $scope.parcelles[i].shape,
               gjson: $scope.parcelles[i].gjson,
               superficie: $scope.parcelles[i].area,
               date_creation: $scope.parcelles[i].date_creation,
               agent: $scope.parcelles[i].id_creator,
               data: $scope.parcelles[i].data
        };

        parcelles.push(dataP);
        area_total_parcelle += $scope.parcelles[i].area;
     }

     var data={
        id_exploitation: $scope.numeroExploitation,
        superficieTotale: area_total_bloc,
        data: $scope.parcelleData
     };

     exploitationData.push(data);


     exploitation.push({
        "exploitation": exploitationData,
        "blocs":bloc,
        "parcelles":parcelles
     });

     console.info("area_total_bloc = "+area_total_bloc);
     console.info("area_total_parcelle = "+area_total_parcelle);

     console.info("-------------------------------------------------------------------");
     console.info(JSON.stringify(exploitation));
     console.info("-------------------------------------------------------------------");
}

$scope.SaveParcelleJsonDataOld= function(){

    var boolParcelles = true;
    var msgParcelles = "";
    var exploitation=[];
    var exploitationData=[];
    var bloc = [];
    var parcelles = [];

    var area_total_bloc=0.0;
    var area_total_parcelle=0.0;

    console.info("$scope.parcelleData= "+$scope.parcelleData);

    if($scope.parcelleData=="" || $scope.parcelleData==undefined){
        ionicToast.show(' Veuillez remplir le questionnaire de l\'xploitation en cours ', 'middle', false, 2500);
        // return;
    }

    // Grouper les bloc de l'exploitation collectée : 
    for (var i = 0; i < $scope.polygons.length; i++) {     

        var numB = $scope.polygons[i].numero;
        var parcellesDuBloc = [];
        for (var k = 0; k< $scope.parcelles.length; k++) {     
               if($scope.parcelles[k].numero_bloc==numB){ 
                     var dataP = {
                             id_exploitation: $scope.parcelles[k].exp,
                             numero_bloc: $scope.parcelles[k].numero_bloc,
                             numero: $scope.parcelles[k].numero,
                             shape: $scope.parcelles[k].shape,
                             gjson: $scope.parcelles[k].gjson,
                             superficie: $scope.parcelles[k].area,
                             date_creation: $scope.parcelles[k].date_creation,
                             agent: $scope.parcelles[k].id_creator,
                             data: $scope.parcelles[k].data
                     };

                     parcellesDuBloc.push(dataP);
                     area_total_parcelle += $scope.parcelles[k].area;
               }
        }

        var dataB = {
               id_exploitation: $scope.polygons[i].exp,
               numero: $scope.polygons[i].numero,
               shape: $scope.polygons[i].shape,
               gjson: $scope.polygons[i].gjson,
               superficie: $scope.polygons[i].area,
               date_creation: $scope.polygons[i].date_creation,
               agent: $scope.polygons[i].id_creator,
               parcelles: parcellesDuBloc
        };

        bloc.push(dataB);
        area_total_bloc += $scope.polygons[i].area;
     }

     // Grouper les parcelles de l'exploitation collectée : 
    for (var i = 0; i < $scope.parcelles.length; i++) {      

        if($scope.parcelles[i].data=="" || $scope.parcelles[i].data==undefined){
          boolParcelles = false;
          msgParcelles+= $scope.parcelles[i].numero+" ,";
        }

        var dataP = {
               id_exploitation: $scope.parcelles[i].exp,
               numero_bloc: $scope.parcelles[i].numero_bloc,
               numero: $scope.parcelles[i].numero,
               shape: $scope.parcelles[i].shape,
               gjson: $scope.parcelles[i].gjson,
               superficie: $scope.parcelles[i].area,
               date_creation: $scope.parcelles[i].date_creation,
               agent: $scope.parcelles[i].id_creator,
               data: $scope.parcelles[i].data
        };

        parcelles.push(dataP);
        area_total_parcelle += $scope.parcelles[i].area;
     }

     var data={
        id_exploitation: $scope.numeroExploitation,
        superficieTotale: area_total_bloc,
        data: $scope.parcelleData
     };
     exploitationData.push(data);

     exploitation.push({
        "exploitation": exploitationData,
        "blocs":bloc
     });

     console.info("area_total_bloc = "+area_total_bloc);
     console.info("area_total_parcelle = "+area_total_parcelle);

     console.info("-------------------------------------------------------------------");
     console.info(JSON.stringify(exploitation));
     console.info("-------------------------------------------------------------------");
}

$scope.SaveAllExploitationJsonData= function(){

    var boolParcelles = true;
    var msgParcelles = "";
    var exploitation=[];
    var exploitationData=[];
    var bloc = [];
    var parcelles = [];

    var area_total_bloc=0.0;
    var area_total_parcelle=0.0;

    console.info("$scope.exploitationData= "+$scope.exploitationData);

    if($scope.exploitationData=="" || $scope.exploitationData==undefined){
        ionicToast.show(' Veuillez remplir le questionnaire de l\'xploitation en cours ', 'middle', false, 2500);
        return;
    }

    // Grouper les bloc de l'exploitation collectée : 
    for (var i = 0; i < $scope.polygons.length; i++) {     

        var dataB = {
               id: $scope.polygons[i].id,
               numero: $scope.polygons[i].numero,
               id_exploitation: $scope.polygons[i].id_exploitation,
               shape: $scope.polygons[i].shape,
               gjson: JSON.parse($scope.polygons[i].gjson),
               superficie: $scope.polygons[i].superficie,
               date_creation: $scope.polygons[i].date_creation
               // agent: $scope.polygons[i].agent
        };

        bloc.push(dataB);
        area_total_bloc += $scope.polygons[i].superficie;
     }

     // console.info("--------------------------------------------------");
     console.info(bloc);
     console.info(bloc.toString());
     
     console.info($scope.idFieldsFormExploitation);
     console.info($scope.nameFieldsFormExploitation);
     console.info($scope.exploitationData);

     console.info("--------------------------------------------------");

     // Grouper les parcelles de l'exploitation collectée : 
    for (var i = 0; i < $scope.parcelles.length; i++) {      

        if($scope.parcelles[i].formdata=="" || $scope.parcelles[i].formdata==undefined){
          boolParcelles = false;
          msgParcelles+= $scope.parcelles[i].numero+" ,";
            ionicToast.show(' Veuillez remplir le questionnaire de la parcelle: '+$scope.parcelles[i].numero, 'middle', false, 2500);
        return;
        }

        var dataP = {
               id: $scope.parcelles[i].id,
               numero: $scope.parcelles[i].numero,
               bloc: $scope.parcelles[i].bloc,
               id_exploitation: $scope.parcelles[i].id_exploitation,
               shape: $scope.parcelles[i].shape,
               gjson: JSON.parse($scope.parcelles[i].gjson),
               superficie: $scope.parcelles[i].superficie,
               date_creation: $scope.parcelles[i].date_creation,
               // agent: $scope.parcelles[i].agent,
               formdata: $scope.parcelles[i].formdata
        };

        parcelles.push(dataP);
        area_total_parcelle += $scope.parcelles[i].superficie;
     }

     //==========================================//
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              $scope.latGPS  = position.coords.latitude;
              $scope.lngGPS = position.coords.longitude;
      }, function(err) {
             // console.info(err);
             console.info(err.message);
      });
        console.info("//=========================================================//");
        console.info($scope.latGPS+" - "+$scope.lngGPS);
        console.info("//=========================================================//");
     //==========================================//

     var dateExp = $scope.formattedDate();
     var expData={
        // id_exploitation: $scope.numeroExploitation,
        superficieTotale: area_total_bloc,
        lat: $scope.latGPS,
        lng: $scope.lngGPS,
        date_creation: dateExp,
        form: $scope.idFieldsFormExploitation,
        formname: $scope.nameFieldsFormExploitation,
        formdata: $scope.exploitationData
     };
     console.info(JSON.stringify(expData));
     exploitationData.push(expData);
    

     exploitation.push({
          "projet": $scope.selectedProject,
          'id_exploitation': $scope.numeroExploitation,
          "exploitation": exploitationData,
          "superficie": area_total_bloc,
          "blocs":bloc,
          "collecte": {"type": "polygone", "form": $scope.idFieldsFormParcelle, "formname": $scope.nameFieldsFormParcelle, "data":parcelles}
     });
       
     dataParcelles = {"type": "polygone", "form": $scope.idFieldsFormParcelle, "formname": $scope.nameFieldsFormParcelle, "data":parcelles};
     console.info("area_total_bloc = "+area_total_bloc);
     console.info("area_total_parcelle = "+area_total_parcelle);

     console.info("-------------------------------------------------------------------");
     console.info($scope.selectedProject);
     console.info($scope.numeroExploitation);
     console.info(JSON.stringify(exploitationData));
     console.info(JSON.stringify(bloc));
     console.info(JSON.stringify(dataParcelles));
     console.info("-------------------------------------------------------------------");

     if($stateParams.mode=="n"){
             enregisterDonneesExploitationBD($scope.numeroExploitation, area_total_bloc, $scope.latGPS, $scope.lngGPS, JSON.stringify(exploitationData), JSON.stringify(bloc), JSON.stringify(dataParcelles));
     }
     if($stateParams.mode=="m"){
             updateDonneesExploitationBD($stateParams.id, area_total_bloc, JSON.stringify(exploitationData), JSON.stringify(bloc), JSON.stringify(dataParcelles));
     }


        // Raffrichir la Carte après enregistrement des éléments déssinés dans la BD :
          // $timeout(function() {
          //         $ionicHistory.clearCache([$state.current.name]).then(function() {
          //                 $state.reload();
          //         });
          // });
}

        // var sqlDeleteExploitation= "DELETE FROM rna WHERE id_r=2 ";
        // var sqlDeleteExploitation= "UPDATE  rna set sync=1";
        //  $cordovaSQLite.execute(db, sqlDeleteExploitation);


 function enregisterDonneesExploitationBD(id_exp, superficie, lat, lng, exploitation, bloc, parcelles){

        var sqlInsertExploitation= "INSERT INTO rna (id_exp, superficie, lat, lng, exploitation, bloc, parcelles, sync) VALUES(?,?,?,?,?,?,?,?)";
        console.info(sqlInsertExploitation);
        $cordovaSQLite.execute(db, sqlInsertExploitation,[id_exp, superficie, lat, lng, exploitation, bloc, parcelles, 0]).then(function(res) {
         }, function (err) {
            console.log('ERR SQL sqlInsertExploitation');
         }); 
 }

 function updateDonneesExploitationBD(id, superficie, exploitation, bloc, parcelles){

        var sqlUpdateExploitation= "UPDATE rna  SET superficie=?,  exploitation=?,  bloc=?, parcelles=? WHERE id_r='"+id+"' ";
        console.info(sqlUpdateExploitation);
        $cordovaSQLite.execute(db, sqlUpdateExploitation,[superficie, exploitation, bloc, parcelles]).then(function(res) {
          console.info(JSON.stringify(res));
         }, function (err) {
            console.log('ERR SQL sqlUpdateExploitation');
            console.log(err);
         }); 
 }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadBlocsFromBD(blocs, sync, id_exp){
    

       for(var i = 0; i< blocs.length; i++) {
                var idBloc;
                 L.geoJson(blocs[i].gjson, { onEachFeature: function (feature, lay) {    
                        if(sync==1){
                             lay.setStyle(StyleBlocSync);                                           
                             drawnItemsBloc.addLayer(lay); 
                             idBloc = lay._leaflet_id;
                             addMarkerLabelBlocSync(lay,idBloc, id_exp);    
                         }else{
                              lay.setStyle(StyleBlocBD);                                           
                             $scope.guideLayers.push(lay);                             
                             drawnItems.addLayer(lay); 
                             idBloc = lay._leaflet_id;
                             addMarkerLabelBlocBD(lay,idBloc, blocs[i].numero);    
                        }                                         
                                                 
                     }
                 });
               var bloc = {
                       id: idBloc,
                       numero: blocs[i].numero,
                       id_exploitation: blocs[i].id_exploitation,
                       shape: blocs[i].shape,
                       gjson: JSON.stringify(blocs[i].gjson),
                       superficie: blocs[i].superficie,
                       date_creation: blocs[i].date_creation
                };
                $scope.polygons.push(bloc);
                console.info("bloc");
                console.info(bloc);
        }   
}

function loadParcellesFromBD(collecte){

        var form = collecte.form;    
        var Parcelles = collecte.data;    
        console.info(JSON.stringify(collecte));
        console.info(form);
        console.info(Parcelles);
  
       for(var i = 0; i< Parcelles.length; i++) {
                 var idPlle;
                 // drawParcelleFromDB(Parcelles[i].gjson, Parcelles[i].numero);
                 L.geoJson(Parcelles[i].gjson, { onEachFeature: function (feature, layy) {                                             
                       layy.setStyle(StyleParcelles);                               
                       layerClick(layy);   
                       drawnItemsParcelles.addLayer(layy);    
                       idPlle = layy._leaflet_id;           
                       addMarkerLabelParcelleBD(layy, idPlle, Parcelles[i].numero);  
                        // BlocBDEdit(layy);
                     }
                 });

                   var plle = {
                       id: idPlle,
                       numero: Parcelles[i].numero,
                       bloc: Parcelles[i].bloc,
                       id_exploitation: Parcelles[i].id_exploitation,                                  
                       shape: Parcelles[i].shape,
                       gjson: JSON.stringify(Parcelles[i].gjson),
                       superficie: Parcelles[i].superficie,
                       date_creation: Parcelles[i].date_creation,
                       formdata: Parcelles[i].formdata
                };
                $scope.parcelles.push(plle);
                console.info("plle");
                console.info(plle);
                        
        }
}

function loadDonneesExploitationBD(id){

        // var queryDelete = " DELETE FROM rna";
        // $cordovaSQLite.execute(db, queryDelete);

        // var querySel = " SELECT id_r, id_exp, exploitation, bloc, parcelles, sync FROM rna where id_r = '"+id+"' AND sync=1";
        var querySel = " SELECT id_r, id_exp, exploitation, bloc, parcelles, sync FROM rna where id_r = '"+id+"' ";
       $cordovaSQLite.execute(db, querySel).then(function(res) {
                if(res.rows.length > 0) {
                      // for (var i = 0; i < res.rows.length ; i++) {                                                             
                              var formdataExp = JSON.parse(res.rows.item(0).exploitation)[0].formdata;                  
                              var sync = res.rows.item(0).sync;                                   
                              var id_exp = res.rows.item(0).id_exp;                                   
                              console.info(formdataExp);                                   
                              // $scope.parcelleData = JSON.stringify(formdataExp);
                              $scope.exploitationData = JSON.stringify(formdataExp);

                              $scope.numeroExploitation = res.rows.item(0).id_exp;
                              console.info(JSON.parse(res.rows.item(0).exploitation));                              
                              // console.info(res.rows.item(i).bloc);                              
                              // console.info(res.rows.item(i).parcelles);                              
                              loadBlocsFromBD(JSON.parse(res.rows.item(0).bloc), sync, id_exp);
                              if(sync==0){ loadParcellesFromBD(JSON.parse(res.rows.item(0).parcelles)); }
                              
                      // }
                }else{
                    // BD des exploitations est vide !!
                } 

        }, function (err) {
            console.info("err => "+err+ " "+querySel);
        });   
}

// loadDonneesExploitationBD();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// Fonction de  chargement des différents entités enregistrées sur la BD locale ///////////////////////

// définition des styles de Markers: 
var LeafIcon = L.Icon.extend({
    options: {
    iconSize: [16, 16],
    iconAnchor: [8, 17],
    popupAnchor: [8, 0]
    }
   });

var greenIcon = new LeafIcon({
    iconUrl: 'img/Carto/green.png'
   });

 var boolPV=false;


function ParamParcelleNew(lyr) {
    this.layerParcelle = lyr;
    this.idParcelle = lyr._leaflet_id;
    this.latllngParcelle = lyr.getLatLngs();

    var bnds =  this.layerParcelle.getBounds();
    var centroidPlle = bnds.getCenter();

    this.CentroidParcelle = centroidPlle;

    var featureGroup = new L.FeatureGroup();
    var point = {
        "type": "FeatureCollection",
        "features": [
         {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Point",
              "coordinates": [centroidPlle.lng, centroidPlle.lat]
            }
          }
        ]
      };
    
        douar.eachLayer(function(lyr) {
           featureGroup.clearLayers();
           featureGroup.addLayer(lyr);
           var isInside = turf.within(point, featureGroup.toGeoJSON());

           if(isInside.features.length >0){
            this.DouarIntersectFRParcelle=lyr.feature.properties.nom_Fr;
            this.DouarIntersectARParcelle=lyr.feature.properties.nom_Ar;
           }
        });

       mappess.eachLayer(function(lyr) {
           featureGroup.clearLayers();
           featureGroup.addLayer(lyr);
           var isInside = turf.within(point, featureGroup.toGeoJSON());

        if(isInside.features.length >0){
          this.MappeIntersectParcelle=lyr.feature.properties.Text;
        }
      });

         Secteurs.eachLayer(function(lyr) {
           featureGroup.clearLayers();
           featureGroup.addLayer(lyr);
           var isInside = turf.within(point, featureGroup.toGeoJSON());
            if(isInside.features.length >0){
            this.SecteurIntersectParcelle=lyr.feature.properties.numero;
          }
        });


        this.numeroParcelle = "Plle"+$scope.maxIdParcelle;

      for (var i = 0; i < $scope.polygons.length; i++) {
           if ($scope.polygons[i].id == this.idParcelle) {
             this.complementParcelle =$scope.polygons[i].complement;                 
           }
      }
}

// loadGeojsonFromDB();
// loadPointGeojsonFromDB();
// loadPolylineGeojsonFromDB();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


retablirShpGjsonLimites = function(){
  // alert("retablir");
  drawnItems.eachLayer(function (lyr){      

      var shp;
      var bngcoords;
      var X;
      var Y;
      var json = JSON.stringify(lyr.toGeoJSON());

     if (lyr instanceof L.Marker) {       
            bngcoords = proj4(Projection26191, [lyr._latlng.lng, lyr._latlng.lat]);
              X = bngcoords[0];
              Y = bngcoords[1];
             shp = "("+X+","+Y+")";

             for (var i = 0; i < $scope.points.length; i++) {      
                if ($scope.points[i].id == lyr._leaflet_id) {
                    $scope.points[i].shape=shp;
                    $scope.points[i].gjson=json;
               } 
            }
     }                  

     if ((lyr instanceof L.Polyline) && ! (lyr instanceof L.Polygon))  {

            latlngs = lyr.getLatLngs();

            shp = "[";
            for (var i = 0; i < latlngs.length-1; i++) {
              bngcoords= proj4(Projection26191, [latlngs[i].lng, latlngs[i].lat]);
              X = bngcoords[0];
              Y = bngcoords[1];
              shp+="("+X+","+Y+"),";
            }
            bngcoords= proj4(Projection26191, [latlngs[latlngs.length-1].lng, latlngs[latlngs.length-1].lat]);
            X = bngcoords[0];
            Y = bngcoords[1];  
            shp+="("+X+","+Y+")]";

            for (var i = 0; i < $scope.polylines.length; i++) {      
                if ($scope.polylines[i].id == lyr._leaflet_id) {
                    $scope.polylines[i].shape=shp;
                    $scope.polylines[i].gjson=json;
               } 
            }

             for (var i = 0; i < $scope.rectilignes.length; i++) {      
                if ($scope.rectilignes[i].id == lyr._leaflet_id) {
                    $scope.rectilignes[i].shape=shp;
                    $scope.rectilignes[i].gjson=json;
               } 
            }

      }

   });
}

 /*
 * Déclaration des Entités de la Carte. 
 */ 

var editStylePolygon= {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.3,
    fillColor: '#ff0000'
 };

var StyleParcelles = {
    weight: 2,
    opacity: 1,
    color: 'blue',
    dashArray: '3',
    fillOpacity: 0.05,
    fillColor: 'blue'
 };

var StyleBloc = {
    weight: 2,
    opacity: 1,
    color: 'red',
    dashArray: '3',
    fillOpacity: 0.05,
    fillColor: 'red'
 };

var StyleBlocBD = {
    weight: 2,
    opacity: 1,
    color: '#990000',
    dashArray: '3',
    fillOpacity: 0.05,
    fillColor: '#990000'
 };

var StyleBlocSync = {
    weight: 2,
    opacity: 1,
    color: '#000',
    dashArray: '3',
    fillOpacity: 0.1,
    fillColor: '#990000'
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


             var posOptions = {timeout: 10000, enableHighAccuracy: false};
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

///////////////////////////////////////////////////////////////////////////////////////
// Control d'enregistrement sur les entités déssinées. 

$scope.showPopup = function() {
    $scope.data = {}
    // Custom popup
    var myPopup = $ionicPopup.show({
       subTitle: '<span style="font-size:2.3em;"><b>Voulez vous enregistrer les entitées déssinées ? </b></span>',
       scope: $scope,
       buttons: [
          { text: 'Annuler',type:'button-positive' }, {
             text: '<b>Enregistrer</b>',
             type: 'button-balanced',
                onTap: function(e) {

                 if (!$scope.data.model) {                 
                        // Setup the loader
                        $ionicLoading.show({
                              content: 'Loading',
                              animation: 'fade-in',
                              showBackdrop: true,
                              maxWidth: 200,
                              showDelay: 0
                        });                                       
                        $timeout(function () {
                              $scope.SaveParcelleJsonData();
                              $scope.SavePointJsonData();
                              drawnItems.clearLayers();
                              $scope.guideLayers = [];
                              loadGeojsonFromDB();
                              $ionicLoading.hide();
                            }, 1000);
                        
                        //don't allow the user to close unless he enters model...
                        e.preventDefault();
                     }else {
                      return $scope.data.model;
                     }
                }
          }
       ]
     });
    };


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

            // showFormByGeometryType();

           leafletData.getMap().then(function(map) {  
            if (sidebarBool==false){

              showDrawingDataInSidebar();
              // setTimeout(function () {
                sidebarBool = true;
                  // sidebar.show();
                  $("#sidebarRNA").css( "display", "initial");
                  sidebar.open('home');
              // }, 200);
              

            }else{
              // setTimeout(function () {
                 sidebarBool = false;
                  // sidebar.hide();
                  sidebar.close();
                  $("#sidebarRNA").css( "display", "none");
              // }, 200);
             
            }
              
          });   

          }
          return container;
        }
      });

var saveCtrl = new saveControl();

function showDrawingDataInSidebar(){

    var polygonDiv = document.getElementById('polygonsTabRNA');
    var htmlParcelle = "";
    console.info("$scope.parcelles.length = "+$scope.parcelles.length);
    for (var i = 0; i < $scope.parcelles.length; i++) {
       htmlParcelle+="<span onclick=ShowParcelleFormulaire('"+$scope.parcelles[i].id+"','"+$scope.parcelles[i].numero+"')><img src='img/parcelleNew.png' id='geomDataElements' width='35px' height='35px'>&nbsp; "+$scope.parcelles[i].numero+"</span></br>";
    } 
    console.info("htmlParcelle = "+htmlParcelle);
    polygonDiv.innerHTML = htmlParcelle;

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
  
  var arrNamesPoint = [];
  var arrNamesPolyline = [];
  var arrNamesPolygon = [];

$scope.enregistrerFormPointData=function(){
        
      var boolRequiredPass = true;

      for( i = 0; i< arrNamesPoint.length; i++){
          
          var nameProperty = arrNamesPoint[i];
          var valueProperty;
          var attr;
        
          if (nameProperty.toLowerCase().indexOf("textarea") >= 0){  
                valueProperty = $("textarea[name="+nameProperty+"]").val();
                attr = $("textarea[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("select") >= 0){  
                valueProperty = $("select[name="+nameProperty+"]").val(); 
                attr = $("select[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("date") >= 0){  
                 valueProperty = $("#"+nameProperty ).val(); 
                 attr = $("#"+nameProperty).filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else if(nameProperty.toLowerCase().indexOf("radio") >= 0){  
                 valueProperty = $("input[name="+nameProperty+"]:checked").val(); 
                 attr = $("input[name="+nameProperty+"]:checked").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else{
                 valueProperty = $("input[name="+nameProperty+"]").val();
                  attr = $("input[name="+nameProperty+"]").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
          }

          console.info(nameProperty); 
          console.info(valueProperty); 
      }
           console.info("boolRequiredPass => "+boolRequiredPass);   
        if(boolRequiredPass){
            $scope.modalRender.hide();    
        }   
  }

$scope.enregistrerFormPolylineData=function(){
        
      var boolRequiredPass = true;

      for( i = 0; i< arrNamesPolyline.length; i++){
          
          var nameProperty = arrNamesPolyline[i];
          var valueProperty;
          var attr;
        
          if (nameProperty.toLowerCase().indexOf("textarea") >= 0){  
                valueProperty = $("textarea[name="+nameProperty+"]").val();
                attr = $("textarea[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("select") >= 0){  
                valueProperty = $("select[name="+nameProperty+"]").val(); 
                attr = $("select[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("date") >= 0){  
                 valueProperty = $("#"+nameProperty ).val(); 
                 attr = $("#"+nameProperty).filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else if(nameProperty.toLowerCase().indexOf("radio") >= 0){  
                 valueProperty = $("input[name="+nameProperty+"]:checked").val(); 
                 attr = $("input[name="+nameProperty+"]:checked").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else{
                 valueProperty = $("input[name="+nameProperty+"]").val();
                  attr = $("input[name="+nameProperty+"]").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
          }

          console.info(nameProperty); 
          console.info(valueProperty); 
      }
           console.info("boolRequiredPass => "+boolRequiredPass);   
        if(boolRequiredPass){
            $scope.modalRender.hide();    
        }   
  }

$scope.enregistrerFormPolygonData=function(){
        
      var boolRequiredPass = true;

      for( i = 0; i< arrNamesPolygon.length; i++){
          
          var nameProperty = arrNamesPolygon[i];
          var valueProperty;
          var attr;
        
          if (nameProperty.toLowerCase().indexOf("textarea") >= 0){  
                valueProperty = $("textarea[name="+nameProperty+"]").val();
                attr = $("textarea[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("select") >= 0){  
                valueProperty = $("select[name="+nameProperty+"]").val(); 
                attr = $("select[name="+nameProperty+"]").filter('[required]:visible');
                if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                }
            }
            else if(nameProperty.toLowerCase().indexOf("date") >= 0){  
                 valueProperty = $("#"+nameProperty ).val(); 
                 attr = $("#"+nameProperty).filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else if(nameProperty.toLowerCase().indexOf("radio") >= 0){  
                 valueProperty = $("input[name="+nameProperty+"]:checked").val(); 
                 attr = $("input[name="+nameProperty+"]:checked").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
            }
            else{
                 valueProperty = $("input[name="+nameProperty+"]").val();
                  attr = $("input[name="+nameProperty+"]").filter('[required]:visible');
                 if(attr.length>0 && valueProperty ==""){
                    boolRequiredPass = false;
                 }
          }

          console.info(nameProperty); 
          console.info(valueProperty); 
      }
           console.info("boolRequiredPass => "+boolRequiredPass);   
        if(boolRequiredPass){
            $scope.modalRender.hide();    
        }   
  }


//------------------- DEBUT ::: Functions de Gestion des Evénement sur les parcelles (Click & Edit)  --------------------
layerClick=function(layer){

  leafletData.getMap().then(function(map) {  

    layer.on('click', function(e){

              $("div.leaflet-popup").remove();

              var mergePolygons = [];
              if(boolMerge==true){
                console.info($scope.polygons.length);
                 console.info(" layer._leaflet_id = "+layer._leaflet_id);
                   for (var i = 0; i < $scope.polygons.length; i++) {      
                   
                    console.info(" $scope.polygons[i].id = "+$scope.polygons[i].id);
                            if ($scope.polygons[i].id == layer._leaflet_id) {
                               layer.setStyle({color:'black'});
                            }                    
                         }
              }

              if(boolSelect==true){
                   if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                       if(layer.options.color=='#00FFFF'){
                         for (var i = 0; i < $scope.polylines.length; i++) {      
                            if ($scope.polylines[i].id == layer._leaflet_id) {
                               layer.setStyle({color:'green'});
                            }                    
                         }

                           for (var i = 0; i < segmentsArray.length; i++) {
                              if (segmentsArray[i]._leaflet_id == layer._leaflet_id) {
                                  segmentsArray.splice(i, 1);           
                              }                   
                            }

                            for (var i = 0; i <  $scope.limites.length; i++) {
                              if ( $scope.limites[i].id == layer._leaflet_id) {
                                   $scope.limites.splice(i, 1);           
                              }                   
                            }

                      }else{
                        segmentsArray.push(layer);
                        layer.setStyle(JoinStylePolyline);
                          var brnD;
                          var brnA;
                       for (var i = 0; i < $scope.polylines.length; i++) {      
                          if ($scope.polylines[i].id == layer._leaflet_id) {
                                 brnD = $scope.polylines[i].borneD;
                                 brnA = $scope.polylines[i].borneA;
                            }    
                         }
                     
                       $scope.limites.push({
                              id:  layer._leaflet_id,                        
                              borneD: brnD,
                              borneA: brnA
                        });

                      }

                   }
               }

              if (boolEdit==true){
                      if(selectedFeature){
                       
                        if (selectedFeature instanceof L.Marker) {

                        }else{  

                            selectedFeature.snapediting.disable();
                              if ((selectedFeature instanceof L.Polyline) && ! (selectedFeature instanceof L.Polygon)) {
                                }
                                if (selectedFeature instanceof L.Polygon) {

                                }

                         }
                      }

                      ///////////////////////////////////////////////////////////////////////////
                          
                          selectedFeature = e.target;
                          e.target.options.editing || (e.target.options.editing = {});

                         if (layer instanceof L.Marker) {
                             
                          }else{
                              e.target.snapediting = new L.Handler.PolylineSnap(map, e.target);
                              e.target.snapediting.addGuideLayer(drawnItems);
                              e.target.snapediting.enable();

                              LayerToLatlng = [];
                              leafletID="";
                              leafletID = layer._leaflet_id;
                              console.info("leafletID = "+layer._leaflet_id)
                              layerEdit(e);
                              latlngs = e.target.getLatLngs();

                              for(var i = 0;i < latlngs.length; i++) {
                                   LayerToLatlng[i]=latlngs[i].lat+","+latlngs[i].lng;
                              }

                              for(var i = 0;i < LayerToLatlng.length; i++) {
                                   console.info(LayerToLatlng[i]);
                              }
                          }
                        ///////////////////////////////////////////////////////////////////////////                  

                          if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon))  {         
 
                           }

                           if (layer instanceof L.Polygon) {
                              // e.target.setStyle(editStylePolygon);
                          }
               }
                   
              if (boolInfo==true && ! (layer instanceof L.Polygon) ){

                    console.info("_leaflet_id => "+e.target._leaflet_id);
                    if ((layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                        var param = new ParamPolylineNew(layer);

                         leafletData.getMap().then(function(map) {  
                              var bnds = param.layerNaturelMN.getBounds();
                              var center = bnds.getCenter();

                               var html ='<button  ng-click=openFormPolylineNNew("'+param.idNaturelMN+'","'+param.riverainNaturelMN+'","'
                                +param.natureNaturelMN+'","'+param.longeurNaturelMN+'","'+param.nbrSommetsNaturelMN+'","'
                                +param.numPNaturelMN+'","'+param.pointDNaturelMN+'","'+param.pointANaturelMN+'")>'+
                                '<img width="20px" height="20px" src="img/limiteNatNew.png">Limite '+param.riverainNaturelMN+'</button>',
                                linkFunction = $compile(angular.element(html)),
                                newScope = $scope.$new();

                               var popup = L.popup({closeOnClick: false,autoPan:false})
                                .setLatLng(center)
                                .setContent(linkFunction(newScope)[0])
                                .addTo(map);       
                            });  
                    }

                    if (layer instanceof L.Marker) {

                       var param = new ParamPointNew(layer);

                       leafletData.getMap().then(function(map) {  

                            var center = param.latllngPoint;

                             var html ='<button  ng-click=openFormPointNew("'+param.idPoint+'","'+param.numeroPoint+'","'
                              +param.naturePoint+'","'+param.typePoint+'","'+param.XPoint+'","'+param.YPoint+'")>'+
                                  '<img width="20px" height="20px" src="img/PointNew.png">Point '+param.numeroPoint+'</button>',
                              linkFunction = $compile(angular.element(html)),
                              newScope = $scope.$new();

                             var popup = L.popup({closeOnClick: false,autoPan:false})
                              .setLatLng(center)
                              .setContent(linkFunction(newScope)[0])
                              .addTo(map);       
                          });  
                     }
              }

        });

  });
};

layerEdit=function(e){
      e.target.on('edit', function (e) {

         for (var i = 0; i < $scope.polygons.length; i++) {
            console.info("bloc.id= "+$scope.polygons[i].id+"bloc.numero= "+$scope.polygons[i].numero);
         }
            
               console.log("edited Parcelle");
               var gjson = e.target.toGeoJSON();
               // console.info(Gjson); onsole.info(JSON.stringify(Gjson));
               // var isPolygon = false;    
               var bloc;
               var id_bloc;
               var id_p;

                // Parcourir les points de parcelles :
               for (var i = 0; i < $scope.parcelles.length; i++) {
                  if ($scope.parcelles[i].id == e.target._leaflet_id) {   
                    console.log(" Parcelle trouve & iddd :"+e.target._leaflet_id);         
                    latlngs = e.target.getLatLngs();             
                     var bngcoords;
                     bloc = $scope.parcelles[i].bloc;
                     id_p = $scope.parcelles[i].id;
                      console.log(" Parcelle trouve & bloc :"+bloc);     
                    shape = getShapeOfGeometry(latlngs,"POLYGON");
                    $scope.parcelles[i].shape = shape;
                    $scope.parcelles[i].gjson = JSON.stringify(gjson.geometry);
                    deleteMarkerLabel(id_p);
                    deplaceMarkerLabel(e.target, id_p, $scope.parcelles[i].numero);
                  }           
               }
              
              //Collectionner les parcelles formant le bloc dont une de ces parcelles vient d'être modifiée ;)
              arrayParcelleAModifier = [];
               arrayParcelleAModifier.push({gjson: JSON.stringify(gjson.geometry)});
              var couchePlle = gjson.geometry;
              for (var i = 0; i < $scope.parcelles.length; i++) {
                  if ($scope.parcelles[i].bloc==bloc){   
                    // arrayParcelleAModifier.push({Gjson: $scope.parcelles[i].Gjson});
                      if($scope.parcelles[i].id!=id_p){
                           arrayParcelleAModifier.push({gjson: $scope.parcelles[i].gjson});  
                          var id_courant = $scope.parcelles[i].id;
                          var clipping_geojson  = JSON.parse($scope.parcelles[i].gjson);
                          var intersect = turf.intersect(couchePlle, clipping_geojson);
                          if(intersect!=null){
                                  var difference = turf.difference(couchePlle, clipping_geojson);
                                  var g = L.geoJson(difference, { onEachFeature: function (feature, laye) {       
                                             // $scope.parcelles[i].Gjson = JSON.stringify(laye.toGeoJSON());
                                             console.info(JSON.stringify(laye.toGeoJSON()));                                       
                                             // drawnItemsParcelles.removeLayer(id_courant);
                                             // drawnItemsParcelles.addLayer(laye);
                                             // laye._leaflet_id = id_courant;
                                        }
                                     });                           
                          }
                    }
                  }
              }

              // Supprimer Le bloc Contenant la parcelle modifiée : 
              for (var i = 0; i < $scope.polygons.length; i++) {
                    if($scope.polygons[i].numero==bloc){
                          id_bloc = $scope.polygons[i].id;
                          console.info("rrrrrrr $scope.polygons[i].numero "+$scope.polygons[i].numero);
                          console.info("rrrrrrr bloc "+bloc+" rrrrrrrrrrr id_bloc"+id_bloc);
                         // drawnItems.removeLayer(id_bloc);
                     }
              }


              if(arrayParcelleAModifier.length==1){
                      var poly = JSON.parse('{"type": "Feature", "properties": {}, "geometry": '+ arrayParcelleAModifier[0].gjson+'  }');
                      var g = L.geoJson(poly, { onEachFeature: function (feature, couche) {
                                     drawnItems.removeLayer(id_bloc);
                                     couche.setStyle(editStylePolygon);  
                                     couche._leaflet_id = id_bloc;     
                                     console.info(id_bloc);
                                     drawnItems.addLayer(couche);      
                                     
                                
                                     for (var i = 0; i < $scope.polygons.length; i++) {
                                          if ($scope.polygons[i].id == id_bloc) {  
                                              $scope.polygons[i].gjson =  JSON.stringify(couche.toGeoJSON().geometry);
                                              deleteMarkerLabelBloc(id_bloc);
                                              deplaceMarkerLabelBloc(couche, id_bloc, $scope.polygons[i].numero);
                                          }
                                     }           
                          }
                      });

              }else{

                       // console.info( arrayParcelleAModifier[0].Gjson);  console.info( arrayParcelleAModifier[1].Gjson);
                       var poly1 = JSON.parse('{"type": "Feature", "properties": {}, "geometry": '+ arrayParcelleAModifier[0].gjson+'  }');
                       var poly2 = JSON.parse(' {"type": "Feature", "properties": {}, "geometry": '+ arrayParcelleAModifier[1].gjson+'  }');
                       // console.log(poly1); console.log(poly2);

                       var union = turf.union(poly1, poly2);
                       console.log(union);

                       for (var i = 2; i <arrayParcelleAModifier.length; i++) {                    
                          var polyg = JSON.parse('{"type": "Feature", "properties": {}, "geometry": '+ arrayParcelleAModifier[i].gjson+'  }');
                            union = turf.union(union, polyg);
                       }
                                     
                       var g = L.geoJson(union, { onEachFeature: function (feature, couche) {
                                     drawnItems.removeLayer(id_bloc);
                                     couche.setStyle(editStylePolygon);  
                                     couche._leaflet_id = id_bloc;     
                                     console.info(id_bloc);
                                     drawnItems.addLayer(couche);                              
                                     for (var i = 0; i < $scope.polygons.length; i++) {
                                          if ($scope.polygons[i].id == id_bloc) {  
                                              $scope.polygons[i].gjson =  JSON.stringify(couche.toGeoJSON().geometry);
                                              deleteMarkerLabelBloc(id_bloc);
                                              deplaceMarkerLabelBloc(couche, id_bloc, $scope.polygons[i].numero);
                                          }
                                     }           
                          }
                      });

              }
    
        });   
};

//-------------------FIN ::: Functions de Gestion des Evénement sur les parcelles (Click & Edit)  --------------------

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

$scope.ShowExploitation = function(){


    if($scope.modeEdit){

        formName = "Exploitation N°"+$scope.numeroExploitation;
        $scope.formOpened = "Exploitation";

         var ortho = "15"; 
         var bloc=0;
         var area=0;
          for(var i=0; i< $scope.polygons.length; i++){
              bloc++;
              area+= $scope.polygons[i].superficie;
        }

        $scope.formExploitation = JSON.parse($scope.fieldsFormExploitation);
        console.info($scope.fieldsFormExploitation);
        console.info($scope.formExploitation);

        let  html =`<ion-modal-view id="ayoub" style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
        html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down" ng-click="scrollToBottom()"></button></h1>`;
        html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
        html+=  ` </ion-header-bar>`;
        html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;

        html+=  ` <div class="item row">`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">N° Exploitation</span>`;
        html+=  ` <input ng-model="exp" type="text" disabled ng-init=exp=`+$scope.numeroExploitation+` ></label> </div>`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">Nombre de Blocs</span>`;
        html+=  ` <input ng-model="bloc" type="text" disabled ng-init=bloc=`+bloc+`></label></div></div>`;
        html+=  ` <div class="item row">`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">N° Ortho</span>`;
        html+=  ` <input ng-model="ortho" type="text" disabled ng-init=ortho=`+ortho+`></label> </div>`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">Superficie Totale</span>`;
        html+=  ` <input ng-model="area" type="text" disabled ng-init=area=`+area+`></label></div></div>`;

        html+=  `  <formio form="formExploitation" submission="parcelleData"></formio>`;

        html+= ` <button class="button button-full button-balanced" ng-click="hideModalRender()">Annuler</button>`;
        html+= `</ion-content></ion-modal-view>`;

 
       $scope.modalRender  = new $ionicModal.fromTemplate(html, {
          scope: $scope,
          focusFirstInput:true,
          backdropClickToClose:false,
          hardwareBackButtonClose:false
         });

        $scope.modalRender.show();
    }    
}

ShowParcelleFormulaire = function(id_parcelle,numero){

        formName = "Parcelle N°"+numero;
        $scope.formOpened = "Parcelle";

        var bloc;
        var area;
       for(var i=0; i< $scope.parcelles.length; i++){
          if($scope.parcelles[i].id==id_parcelle){
              bloc= $scope.parcelles[i].bloc;
              area= $scope.parcelles[i].superficie;
          }
        }

        $scope.formParcelle = JSON.parse($scope.fieldsFormParcelle);
        // $scope.formParcelle = {"_id":"59f0baecb7a6be296a364f15","form":"_vvnypgwux","display":"form","components":[{"properties":{"":""},"tags":[],"type":"textfield","conditional":{"eq":"","when":null,"show":""},"validate":{"customPrivate":false,"custom":"","pattern":"","maxLength":"","minLength":"","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"unique":false,"protected":false,"defaultValue":"","multiple":false,"suffix":"","prefix":"","placeholder":"","key":"undefinedNom","label":"nom","inputMask":"","inputType":"text","tableView":true,"input":true},{"type":"button","theme":"primary","disableOnInvalid":false,"action":"submit","block":false,"rightIcon":"","leftIcon":"","size":"md","key":"submit","tableView":false,"label":"Submit","input":true}],"__v":0};
        console.info($scope.fieldsFormParcelle);
        console.info($scope.formParcelle);
        
        // $scope.formParcelle = {"_id":"59ca32a3e2d6771ea078f54b","form":"_07knpaqy5","display":"form","components":[{"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"breadcrumb":"default","tableView":true,"theme":"primary","clearOnHide":false,"key":"page1","input":false,"components":[{"clearOnHide":false,"input":false,"tableView":true,"key":"page1Columns","columns":[{"components":[{"isNew":false,"lockKey":true,"input":true,"tableView":true,"inputType":"number","label":"N° de la parcelle","key":"Parcelle000numero","placeholder":"","prefix":"","suffix":"","defaultValue":"","protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false,"min":1,"max":"","step":"any","integer":"","multiple":"","custom":""},"type":"number","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"disabled":true},{"input":true,"tableView":true,"inputType":"number","label":"N° Exploitation où se trouve  la parcelle","key":"page1ColumnsNdelaparcelle3","placeholder":"","prefix":"","suffix":"","defaultValue":"","protected":false,"persistent":true,"hidden":true,"clearOnHide":true,"validate":{"required":false,"min":1,"max":"","step":"any","integer":"","multiple":"","custom":""},"type":"number","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"disabled":true},{"properties":{"":""},"tags":[],"type":"textfield","conditional":{"eq":"","when":null,"show":""},"validate":{"customPrivate":false,"custom":"","pattern":"","maxLength":"","minLength":"","required":false},"clearOnHide":true,"hidden":true,"persistent":true,"unique":false,"protected":false,"defaultValue":"","multiple":false,"suffix":"","prefix":"","placeholder":"","key":"page1ColumnsTextField","label":"N° Ortho où se trouve  la parcelle","inputMask":"","inputType":"text","tableView":true,"input":true},{"isNew":false,"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"number","validate":{"custom":"","multiple":"","integer":"","step":"any","max":"","min":0,"required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"0","suffix":"","prefix":"","placeholder":"","key":"Parcelle000superficiePar","label":"Superficie de la parcelle en Ha  (Déclarée)","inputType":"number","tableView":true,"input":true},{"isNew":false,"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"number","validate":{"custom":"","multiple":"","integer":"","step":"any","max":"","min":0,"required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"","suffix":"","prefix":"","placeholder":"","key":"Parcelle000superficieParCalc","label":"Superficie de la parcelle en Ha  (Calculée)","inputType":"number","tableView":true,"input":true,"disabled":true},{"lockKey":true,"input":true,"tableView":true,"inputType":"radio","label":"Mode de faire valoir","key":"Parcelle000modeFaireV","values":[{"value":"1","label":"Direct"},{"value":"2","label":"Location en espèce"},{"value":"3","label":"Prise en association"},{"value":"4","label":"Mogharassa"},{"value":"5","label":"Autre-Indirect"}],"defaultValue":"","protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false,"custom":"","customPrivate":false},"type":"radio","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""}},{"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"radio","validate":{"customPrivate":false,"custom":"","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"","values":[{"label":"Melk titré","value":"1"},{"label":"Melk avec Molkia","value":"2"},{"label":"Melk sans Molkia","value":"3"},{"label":"Collectif","value":"4"},{"label":"Habous","value":"6"},{"label":"Domaine de l'Etat","value":"5"},{"label":"Guiche","value":"8"},{"label":"Reforme agraire","value":"9"},{"label":"Domaine forestier","value":"7"}],"key":"Parcelle000statusJuri","label":"Statut juridique","inputType":"radio","tableView":true,"input":true},{"lockKey":true,"conditional":{"eq":"","when":null,"show":""},"type":"selectboxes","validate":{"required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"inline":false,"values":[{"label":"Achat","value":"1"},{"label":"Héritage","value":"2"},{"label":"Partage Collectif","value":"3"},{"label":"Don","value":"4"},{"label":"Autre","value":"5"}],"key":"Parcelle000accessTerre","label":"Mode d'acces à la terre","tableView":true,"input":true},{"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"radio","validate":{"customPrivate":false,"custom":"","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"","values":[{"label":"Oui","value":"oui"},{"label":"Non","value":"non"}],"key":"Parcelle000indivision","label":"Indivision","inputType":"radio","tableView":true,"input":true},{"customError":"erreur de sélection","lockKey":true,"conditional":{"eq":"","when":null,"show":""},"type":"selectboxes","validate":{"custom":"valid = (\n           (\n             data.Parcelle000miseValeur[1]===true \n            &&(\n                (data.Parcelle000miseValeur[2]===false)\n                 &&\n                (data.Parcelle000miseValeur[3]===false)\n                 &&\n                (data.Parcelle000miseValeur[4]===false)\n                 &&\n                (data.Parcelle000miseValeur[5]===false)\n\t\t\t\t&&\n                (data.Parcelle000miseValeur[6]===false)\n               )\n            )\n                     ||\n           (\n              data.Parcelle000miseValeur[1]===false \n             &&(\n                (data.Parcelle000miseValeur[2]===true)\n                 ||\n               (data.Parcelle000miseValeur[3]===true)\n                 ||\n               (data.Parcelle000miseValeur[4]===true)\n                 ||\n               (data.Parcelle000miseValeur[5]===true)\n\t\t\t     ||\n                (data.Parcelle000miseValeur[6]===true)\n               )  \n            )\n\t\t\t\n\t\t)?true:'erreur de sélection';","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"inline":false,"values":[{"label":"Bour","value":"1"},{"label":"Irrigable Grande Hydraulique","value":"2"},{"label":"Irrigable PMH","value":"3"},{"label":"Irrigable Privé","value":"4"},{"label":"Eau de cru","value":"5"},{"label":"Irrigable autres","value":"6"}],"key":"Parcelle000miseValeur","label":"Mise en valeur","tableView":true,"input":true}],"width":6,"offset":0,"push":0,"pull":0},{"components":[{"properties":{"":""},"conditional":{"eq":"1","when":"Parcelle000miseValeur","show":"false"},"tags":[],"type":"well","tableView":true,"components":[{"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"radio","validate":{"customPrivate":false,"custom":"","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"","values":[{"label":"Oui","value":"oui"},{"label":"Non","value":"non"}],"key":"Parcelle000irriguee","label":"Irriguée","inputType":"radio","tableView":true,"input":true},{"lockKey":true,"conditional":{"eq":"","when":null,"show":""},"type":"selectboxes","validate":{"required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"inline":false,"values":[{"label":"Puits ou forage","value":"1"},{"label":"Barrage","value":"2"},{"label":"Oued","value":"3"},{"label":"Source","value":"4"},{"label":"Khettara","value":"5"},{"label":"Épandage eau de cru","value":"6"},{"label":"Eaux usées","value":"7"},{"label":"Dessalement","value":"8"}],"key":"Parcelle000sourceIrrigation","label":"Source d'irrigation","tableView":true,"input":true},{"lockKey":true,"conditional":{"eq":"","when":null,"show":""},"type":"selectboxes","validate":{"required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"inline":false,"values":[{"label":"Gravitaire","value":"1"},{"label":"Aspersion","value":"2"},{"label":"Localisée","value":"3"},{"label":"Pivot","value":"4"}],"key":"Parcelle000modeIrrigation","label":"Mode d'irrigation","tableView":true,"input":true},{"customError":"erreur de sélection","lockKey":true,"input":true,"tableView":true,"label":"Type d’énergie utilisée pour le pompage","key":"Parcelle000typeEnergie","values":[{"value":"1","label":"Gasoil"},{"label":"Gaz butane","value":"2"},{"label":"Réseau électricité","value":"3"},{"label":"Solaire","value":"4"},{"label":"Éolienne","value":"5"},{"label":"Energie animale","value":"6"},{"label":"Pas de pompage","value":"7"}],"inline":false,"protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"custom":"valid = (\n           (\n             data.Parcelle000typeEnergie[7]===true \n            &&(\n                (data.Parcelle000typeEnergie[1]===false)\n                 &&\n                (data.Parcelle000typeEnergie[2]===false)\n                 &&\n                (data.Parcelle000typeEnergie[3]===false)\n                 &&\n                (data.Parcelle000typeEnergie[4]===false)\n                 &&\n                (data.Parcelle000typeEnergie[5]===false)\n\t\t\t\t&&\n                (data.Parcelle000typeEnergie[6]===false)\n               )\n            )\n                     ||\n           (\n              data.Parcelle000typeEnergie[7]===false \n             &&(\n                (data.Parcelle000typeEnergie[1]===true)\n                 ||\n                (data.Parcelle000typeEnergie[2]===true)\n                 ||\n               (data.Parcelle000typeEnergie[3]===true)\n                 ||\n               (data.Parcelle000typeEnergie[4]===true)\n                 ||\n               (data.Parcelle000typeEnergie[5]===true)\n\t\t\t     ||\n                (data.Parcelle000typeEnergie[6]===true)\n               )  \n            )\n\t\t\t\n\t\t)?true:'erreur de sélection';","required":false},"type":"selectboxes","conditional":{"show":"","when":null,"eq":""}}],"input":false,"key":"page1ColumnsWell","clearOnHide":false,"customConditional":""},{"lockKey":true,"properties":{"":""},"conditional":{"eq":"","when":null,"show":""},"tags":[],"type":"radio","validate":{"customPrivate":false,"custom":"","required":false},"clearOnHide":true,"hidden":false,"persistent":true,"protected":false,"defaultValue":"","values":[{"label":"Non","value":"1"},{"label":"Canarienne","value":"2"},{"label":"Multi-chapelle","value":"3"},{"label":"Grande tunnel","value":"4"},{"label":"Petit tunnel","value":"5"},{"label":"Autre serre","value":"6"}],"key":"Parcelle000serre","label":"Sous abris Serre","inputType":"radio","tableView":true,"input":true},{"condensed":true,"hover":true,"bordered":false,"input":true,"tree":true,"components":[{"clearOnHide":false,"key":"page1ColumnsWell2","input":false,"components":[{"input":true,"tableView":true,"label":"Cultures ou Utilisation","key":"Culture000nomCulture","placeholder":"","data":{"values":[{"value":"bleDur","label":"Blé dur"},{"value":"olivier","label":"Olivier"},{"value":"betteraveASucre","label":"Betterave a sucre"}],"json":"","url":"","resource":"","custom":""},"dataSrc":"values","valueProperty":"","defaultValue":"","refreshOn":"","filter":"","authenticate":false,"template":"<span>{{ item.label }}</span>","multiple":false,"protected":false,"unique":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false},"type":"select","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"lockKey":true},{"input":true,"tableView":true,"label":"Irriguée","key":"ParcelleCulture000irriguee","placeholder":"","data":{"values":[{"value":"oui","label":"Oui"},{"value":"non","label":"Non"}],"json":"","url":"","resource":"","custom":""},"dataSrc":"values","valueProperty":"","defaultValue":"","refreshOn":"","filter":"","authenticate":false,"template":"<span>{{ item.label }}</span>","multiple":false,"protected":false,"unique":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false},"type":"select","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"lockKey":true},{"input":true,"tableView":true,"inputType":"number","label":"Superficie du champ en Ha","key":"ParcelleCulture000superficie","placeholder":"","prefix":"","suffix":"","defaultValue":"","protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":true,"min":0,"max":"","step":"any","integer":"","multiple":"","custom":""},"type":"number","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"lockKey":true},{"input":true,"tableView":true,"label":"Mode de production","key":"ParcelleCulture000modeProduction","placeholder":"","data":{"values":[{"value":"1","label":"Culture principale"},{"value":"2","label":"Sous étage"},{"value":"3","label":"En succession"},{"value":"4","label":"En association"},{"value":"5","label":"Arbre intercalaire"},{"value":"6","label":"Plantation dispersée"},{"value":"7","label":"Arbre sans terre"}],"json":"","url":"","resource":"","custom":""},"dataSrc":"values","valueProperty":"","defaultValue":"","refreshOn":"","filter":"","authenticate":false,"template":"<span>{{ item.label }}</span>","multiple":false,"protected":false,"unique":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false},"type":"select","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"description":"(1=Culture principale ; 2=Sous étage ; 3=En succession ; 4=En association ; 5=Arbre intercalaire ; 6=Plantation dispersée ; 7=Arbre sans terre)","lockKey":true},{"input":true,"tableView":true,"inputType":"number","label":"Nombre de pieds","key":"ParcelleCulture000nbrPied","placeholder":"","prefix":"","suffix":"","defaultValue":"","protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"validate":{"required":false,"min":0,"max":"","step":"any","integer":"","multiple":"","custom":""},"type":"number","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"lockKey":true}],"tableView":true,"type":"well","hideLabel":true,"tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""}}],"tableView":true,"label":"","key":"page1ColumnsAjoutezunecultureouutilisation","protected":false,"persistent":true,"hidden":false,"clearOnHide":true,"type":"datagrid","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""},"addAnother":"Ajoutez une culture ou utilisation","striped":false}],"width":6,"offset":0,"push":0,"pull":0}],"type":"columns","tags":[],"conditional":{"show":"","when":null,"eq":""},"properties":{"":""}}],"title":"Parcelle","type":"panel"},{"type":"button","theme":"primary","disableOnInvalid":false,"action":"submit","block":false,"rightIcon":"","leftIcon":"","size":"md","key":"submit","tableView":false,"label":"Submit","input":true}],"__v":0};



        let  html =`<ion-modal-view id="ayoub" style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
        html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
        html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
        html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down" ng-click="scrollToBottom()"></button></h1>`;
        html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
        html+=  ` </ion-header-bar>`;
        html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;

        html+=  ` <div class="item row">`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">N° Exploitation</span>`;
        html+=  ` <input ng-model="exp" type="text" disabled ng-init=exp=`+$scope.numeroExploitation+` ></label> </div>`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">N° Bloc</span>`;
        html+=  ` <input ng-model="bloc" type="text" disabled ng-init=bloc=`+bloc+`></label></div></div>`;
        html+=  ` <div class="item row">`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">N° Parcelle</span>`;
        html+=  ` <input ng-model="plle" type="text" disabled ng-init=plle=`+numero+`></label> </div>`;
        html+=  ` <div class="col"><label class="item item-input"><span class="input-label">Superficie</span>`;
        html+=  ` <input ng-model="area" type="text" disabled ng-init=area=`+area+`></label></div></div>`;

        html+=  `  <input type="hidden" id="idDrawned" ng-model="idDrawned" />`;
        html+=  `  <formio form="formParcelle" submission="parcelleData"></formio>`;

        html+= ` <button class="button button-full button-balanced" ng-click="hideModalRender()">Annuler</button>`;
        html+= `</ion-content></ion-modal-view>`;

       $scope.modalRender  = new $ionicModal.fromTemplate(html, {
          scope: $scope,
          focusFirstInput:true,
          backdropClickToClose:false,
          hardwareBackButtonClose:false
         });

        $scope.modalRender.show();

        $scope.idDrawned = id_parcelle;

        sidebar.close();

        sidebar.on('closing', function(e) {
          $("#sidebarRNA").css( "display", "none");
        })
}

//------------------- FormBuilder Submit  --------------------

// $scope.$on('prevPage', function(data) {
//       console.info("prev");
// });
// $scope.$on('nextPage', function(data) {
//       console.info("next");
// });

$scope.$on('formLoad', function() { 

            console.info("$scope.idDrawned = "+$scope.idDrawned);
            console.info("$scope.formOpened = "+$scope.formOpened);
            $scope.scrollToTop();

            if($scope.formOpened=="Parcelle"){ 
                       for (var i = 0; i < $scope.parcelles.length; i++) {
                              if ($scope.parcelles[i].id == $scope.idDrawned) {  
                                      if($scope.parcelles[i].formdata!=undefined){ 
                                          $scope.parcelleData =  JSON.parse($scope.parcelles[i].formdata);
                                          console.info($scope.parcelleData);
                                          // $scope.parcelleData.data.page1ColumnsNdelaparcelle3=$scope.numeroExploitation;
                                          // $scope.parcelleData.data.Parcelle-numero=id_parcelle;
                                          
                                       }
                              }
                        }
              }else{

                if($scope.exploitationData!=undefined){ 
                     $scope.parcelleData = JSON.parse($scope.exploitationData);
                }
              }
 });

$scope.$on('formSubmit', function(err, submission) { 

      console.info("$scope.formOpened = "+$scope.formOpened);
      console.info("$scope.idDrawned = "+$scope.idDrawned);
      console.info(submission);  console.info(JSON.stringify(submission.data));

      if($scope.formOpened=="Parcelle"){ 
              for (var i = 0; i < $scope.parcelles.length; i++) {
                    if ($scope.parcelles[i].id == $scope.idDrawned) {  
                        $scope.parcelles[i].formdata =JSON.stringify(submission);
                    }
              }
      }else{
        $scope.exploitationData = JSON.stringify(submission);
      }

      $scope.hideModalRender();
 });


showFormByGeometryType=function(geomType, id){
   
   sidebar.close();
   $("#sidebarRNA").css( "display", "none");

    var formDataJson="";
    var formName="";
    var formDataJsonArray;
    
    if(geomType=="POINT"){
          formName = $localStorage.formForPointName;
          formDataJsonArray = JSON.parse($localStorage.formForPointBlocs);
          formDataJson = formDataJsonArray[0].fields;
         // fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
          $scope.dataViewer = {
            numViewableSlides : 0,
            slideIndex : 0
          };
       
          let  html =`<ion-modal-view style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
          html+=  `<ion-header-bar class="bar bar-header bar-positive">`;
          html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
          html+=  `<h1 class="title">`+formName+`</h1>`;
          html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;

          html+=  ` </ion-header-bar><ion-pane>`;
          html+=  ` <ion-content class="padding"  has-header="true"><ion-slide-box on-slide-changed="slideChanged(index)">`;

          $scope.dataViewer.numViewableSlides = formDataJsonArray.length;

          for( i = 0; i< formDataJsonArray.length; i++){
            
                var blocDataJson= formDataJsonArray[i].fields;
                var fieldData = JSON.parse(blocDataJson);
                  for( k = 0; k< fieldData.length; k++){
                          var dataF = fieldData[k];
                          var val =dataF.name;
                          if(val != undefined){ arrNamesPoint.push(val); }
                   } 
           
                let formRenderOpts = {
                  dataType: 'json',
                  formData :blocDataJson
                };

                let $renderContainer = $('<form/>');
                $renderContainer.formRender(formRenderOpts);

                html+=  ` <ion-slide>${$renderContainer.html()}</ion-slide>`;
          }

          html+=  ` </ion-slide-box>`;
          html+= ` <button class="button button-full button-positive" ng-click="enregistrerFormPointData()">Enregistrer</button>`;
          html+= ` <button class="button button-full button-positive" ng-click="hideModalRender()">Annuler</button>`;
          html+=  ` </ion-content></ion-pane>`;
          html+= `</ion-content></ion-modal-view>`;

          console.info(arrNamesPoint);//prints ["someone1", "someone2"]


          // fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
          $ionicSlideBoxDelegate.slide(0);
          $ionicSlideBoxDelegate.update();

          $scope.modalRender  = $ionicModal.fromTemplate(html, {
            scope: $scope,
            focusFirstInput:true,
            backdropClickToClose:false,
            hardwareBackButtonClose:false
           });

           $scope.modalRender.show();
      }

    if(geomType=="POLYLINE"){
          formName = $localStorage.formForPolylineName;
          formDataJsonArray = JSON.parse($localStorage.formForPolylineBlocs);
          formDataJson = formDataJsonArray[0].fields;
          // console.info(formDataJson);

         // fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

          $scope.dataViewer = {
            numViewableSlides : 0,
            slideIndex : 0
          };
       
          let  html =`<ion-modal-view style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
          html+=  `<ion-header-bar class="bar bar-header bar-assertive">`;
          html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
          html+=  `<h1 class="title">`+formName+`</h1>`;
          html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;

          html+=  ` </ion-header-bar><ion-pane>`;
          html+=  ` <ion-content class="padding"  has-header="true"><ion-slide-box on-slide-changed="slideChanged(index)">`;

          $scope.dataViewer.numViewableSlides = formDataJsonArray.length;

          for( i = 0; i< formDataJsonArray.length; i++){
            
                var blocDataJson= formDataJsonArray[i].fields;
                var fieldData = JSON.parse(blocDataJson);
                  for( k = 0; k< fieldData.length; k++){
                          var dataF = fieldData[k];
                          var val =dataF.name;
                          if(val != undefined){ arrNamesPolyline.push(val); }
                   } 
           
                let formRenderOpts = {
                  dataType: 'json',
                  formData :blocDataJson
                };

                let $renderContainer = $('<form/>');
                $renderContainer.formRender(formRenderOpts);

                html+=  ` <ion-slide>${$renderContainer.html()}</ion-slide>`;
          }

          html+=  ` </ion-slide-box>`;
          html+= ` <button class="button button-full button-assertive" ng-click="enregistrerFormPolylineData()">Enregistrer</button>`;
          html+= ` <button class="button button-full button-assertive" ng-click="hideModalRender()">Annuler</button>`;
          html+=  ` </ion-content></ion-pane>`;
          html+= `</ion-content></ion-modal-view>`;

          console.info(arrNamesPolyline);//prints ["someone1", "someone2"]


          // fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
          $ionicSlideBoxDelegate.slide(0);
          $ionicSlideBoxDelegate.update();

          $scope.modalRender  = $ionicModal.fromTemplate(html, {
            scope: $scope,
            focusFirstInput:true,
            backdropClickToClose:false,
            hardwareBackButtonClose:false
           });

           $scope.modalRender.show();
      }
     
    if(geomType=="POLYGONE"){

          formName = $localStorage.formForPolygonName;
          formDataJsonArray = JSON.parse($localStorage.formForPolygonBlocs);


          let  html =`<ion-modal-view style="width: 90%; height: 90%; top: 5%; left: 5%; right: 5%; bottom: 5%;">`;
          html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
          html+=  ` <button class="button button-clear icon ion-chevron-left" ng-click="previous()" ng-if="dataViewer.slideIndex > 0"></button>`;
          html+=  `<h1 class="title"><button class="button button-clear icon ion-chevron-up" ng-click="scrollToTop()"></button>`+formName+`<button class="button button-clear icon ion-chevron-down" ng-click="scrollToBottom()"></button></h1>`;
          html+=  ` <button class="button button-clear icon ion-chevron-right" ng-click="next()" ng-if="dataViewer.slideIndex < dataViewer.numViewableSlides - 1"></button>`;
          html+=  ` </ion-header-bar><ion-pane>`;
          html+=  ` <ion-content class="padding"  has-header="true" on-scroll="getScrollPosition()">`;

          html+=  `  <div id="formio"></div>`;
          // html+=  ` </ion-slide-box>`;
          // html+= ` <button class="button button-full button-balanced" ng-click="enregistrerFormPolygonData()">Enregistrer</button>`;
          html+= ` <button class="button button-full button-balanced" ng-click="hideModalRender()">Retour</button>`;
          html+=  ` </ion-content></ion-pane>`;
          html+= `</ion-content></ion-modal-view>`;

          // console.info(arrNamesPolygon);//prints ["someone1", "someone2"]



          // fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
          // $ionicSlideBoxDelegate.slide(0);
          // $ionicSlideBoxDelegate.update();

          $scope.modalRender  = new $ionicModal.fromTemplate(html, {
            scope: $scope,
            focusFirstInput:true,
            backdropClickToClose:false,
            hardwareBackButtonClose:false
           });

           $scope.modalRender.show();

                      $scope.formio =   Formio.createForm(document.getElementById('formio'),  formDataJsonArray);
                      // $scope.formio.render();
        //  $scope.formio.then(function(form) {
        //     // Log the form schema.
        //     console.info(form.data);
        //     // form.data.lastName = "benyassin";

        // });

    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////

 var polygonDrawSpliter;
 leafletData.getMap().then(function(map) {  
       polygonDrawSpliter = new L.Draw.Polyline(map);                      
 });   

 var polygonDrawHole;
 leafletData.getMap().then(function(map) {  
       polygonDrawHole = new L.Draw.Polygon(map);                      
 });   


// Control de création de - Holes -  sur les polygones dessinés. 
var holeControl = L.Control.extend({
      options: {
        position: 'bottomright' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },

        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom holeGeometrie');

          container.style.backgroundColor = 'white';
          container.style.width = '36px';
          container.style.height = '36px';
          container.style.backgroundImage = "url(img/nohole.png)";
          container.style.backgroundRepeat="no-repeat";
          container.style.backgroundSize = "36px 36px";

          container.onclick = function(){

               if(boolHole){
                  container.style.backgroundImage = "url(img/nohole.png)";
                  boolHole = false;
                  // polygonDrawHole.disable();
               }else{
                  container.style.backgroundImage = "url(img/hole.png)";
                  boolHole = true;
                  // polygonDrawHole.enable();
               }


          }
          return container;
        }
      });
var holeCtrl = new holeControl();


// Control d'édition des entités enregistrées et non synchronisées. 
var editLocalControl = L.Control.extend({
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
            $scope.showPopup();
            console.log('buttonClicked');
          }
          return container;
        }
      });
var editLocalCtrl = new editLocalControl();


// Control d'édition des entités déssinées. ²
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

              polygonDrawSpliter.disable();
              $( ".splitGeometrie" ).css( "backgroundImage", "url(img/nosplit.png)" ); 
                boolSplit = false;  
              for (var toolbarId in drawControl._toolbars) {
                drawControl._toolbars[toolbarId].disable();
            }
              $("div.leaflet-popup").remove();

              if (boolEdit){
                  
                if(selectedFeature!=null){
                    console.log(selectedFeature);
                    if (selectedFeature instanceof L.Marker) {
                            selectedFeature.snapediting.disable();                                
                    }else{   
                            selectedFeature.snapediting.disable();    
                    }
                }   

                 container.style.backgroundImage = "url(img/noedit.png)";
                 boolEdit = false;

                retablirShpGjsonLimites();

              }else{
                 container.style.backgroundImage = "url(img/edit.png)";
                 boolEdit = true;

                 boolInfo=false;
                $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noinfo.png)" );

                  drawnItems.eachLayer(function (layer) {

                       if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                        if(layer.options.color=='#00FFFF'){
                            
                             for (var i = 0; i < $scope.polylines.length; i++) {  

                                  if ($scope.polylines[i].id == layer._leaflet_id) {                                    
                                     layer.setStyle({color:'green'});
                                  }else{
                                       layer.setStyle({color:'red'});
                                  }    

                             }

                          }
                       }
                  });

                boolSelect = false;
                $( ".selectGeometrie" ).css( "backgroundImage", "url(img/noSelect.png)" );
               
                boolPV = false;
                $( ".pvGeometrie" ).css( "backgroundImage", "url(img/no_pv.png)" );

              }    
        }
    return container;
  }
});
var editCtrl = new editControl();

// Control de drag des différents entitées déssinées : 
var dragControl =  L.Control.extend({
      options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },

        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom dragCtrl');

          container.style.backgroundColor = '#fff';
          container.style.width = '28px';
          container.style.height = '28px';
           container.style.borderRadius="4px";
          container.style.backgroundImage = "url(img/nodrag.png)";
          container.style.backgroundRepeat="no-repeat";
          container.style.backgroundPosition= "center";
          container.style.backgroundSize = "28px 28px";

          container.onclick = function(){
      
              polygonDrawSpliter.disable();
              $( ".splitGeometrie" ).css( "backgroundImage", "url(img/nosplit.png)" ); 
                boolSplit = false;  
              for (var toolbarId in drawControl._toolbars) {
                drawControl._toolbars[toolbarId].disable();
            }
              $("div.leaflet-popup").remove();

              if (boolDrag){
                  
                if(selectedFeature!=null){
                      console.log(selectedFeature);
                      selectedFeature.dragging.disable();                                
                }   
                 container.style.backgroundImage = "url(img/nodrag.png)";
                 boolDrag = false;

                retablirShpGjsonLimites();

              }else{
                 container.style.backgroundImage = "url(img/drag.png)";
                 boolDrag = true;

                 boolInfo=false;
                $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noinfo.png)" );

                boolSelect = false;
                $( ".selectGeometrie" ).css( "backgroundImage", "url(img/noSelect.png)" );
               
                boolPV = false;
                $( ".pvGeometrie" ).css( "backgroundImage", "url(img/no_pv.png)" );

              }    

          }

          return container;
        }
      });

var dragCtrl = new dragControl();


// Control d'information sur les entités déssinées. 
var InformationControl =  L.Control.extend({
  options: {
    position: 'topleft'
  },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom infoGeometrie');
         L.DomEvent.addListener(container, 'mouseover', function (container) {
            this.style.cursor='pointer';
          });
         L.DomEvent.addListener(container, 'mouseout', function () {
               this.style.cursor='auto';
          });
        container.style.backgroundColor = 'white';     
        // container.style.backgroundImage = "url(img/noform.png)";
        container.style.backgroundImage = "url(img/noinfo.png)";
        container.style.backgroundSize = "28px 28px";
        container.style.width = '28px';
        container.style.height = '28px';
        container.onclick = function(){

           // $scope.popover.show($event);
           // $scope.openPopover();
              polygonDrawSpliter.disable();
              $( ".splitGeometrie" ).css( "backgroundImage", "url(img/nosplit.png)" ); 
                boolSplit = false;  
              for (var toolbarId in drawControl._toolbars) {
                drawControl._toolbars[toolbarId].disable();
              }
              $("div.leaflet-popup").remove();
              // alert(boolInfo);  
              if(boolInfo){
                // container.style.backgroundImage = "url(img/noform.png)";
                container.style.backgroundImage = "url(img/noinfo.png)";
                boolInfo = false;
              }else{
                // container.style.backgroundImage = "url(img/form.png)";
                container.style.backgroundImage = "url(img/info.png)";
                boolInfo = true;

                    if (boolEdit){
                      if(selectedFeature!=null){                    
                        // for (var m in selectedFeature.snapediting._verticesHandlers[0]._markerGroup._layers) {
                        //       selectedFeature.snapediting._verticesHandlers[0]._markerGroup.clearLayers();
                        //   }
                        selectedFeature.snapediting.disable();    
                      } 

                          retablirShpGjsonLimites();
                          $( ".editionGeometrie" ).css( "backgroundImage", "url(img/noedit.png)" );
                          boolEdit = false;
                    }
                    
                    $( ".selectGeometrie" ).css( "backgroundImage", "url(img/noSelect.png)" );
                    boolSelect = false;

                    $( ".pvGeometrie" ).css( "backgroundImage", "url(img/no_pv.png)" );
                    boolPV = false;

                      // if(boolSelect==true){
                        drawnItems.eachLayer(function (layer) {
                          // layer = drawnItems[i];
                             if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                              if(layer.options.color=='#00FFFF'){
                                  
                                   for (var i = 0; i < $scope.polylines.length; i++) {  
                                      if ($scope.polylines[i].id == layer._leaflet_id) {
                                         layer.setStyle({color:'green'});
                                      }else{
                                           layer.setStyle({color:'red'});
                                      }                   
                                   }

                                }
                             }
                        });
                    // }  
     
              }
              console.log('InformationControl Clicked');
        }
    return container;
  }
});
var infoCtrl = new InformationControl();


// Control d'information sur les entités déssinées. 
var JoinSelectControl =  L.Control.extend({
  options: {
    position: 'topleft'
  },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom selectGeometrie');
         L.DomEvent.addListener(container, 'mouseover', function (container) {
            this.style.cursor='pointer';
          });
         L.DomEvent.addListener(container, 'mouseout', function () {
               this.style.cursor='auto';
          });
        container.style.backgroundColor = 'white';     
        container.style.backgroundImage = "url(img/noSelect.png)";
        container.style.backgroundSize = "36px 36px";
        container.style.width = '36px';
        container.style.height = '36px';
        container.onclick = function(){

              polygonDrawSpliter.disable();
               $( ".splitGeometrie" ).css( "backgroundImage", "url(img/nosplit.png)" ); 
                boolSplit = false;  
               for (var toolbarId in drawControl._toolbars) {
                 drawControl._toolbars[toolbarId].disable();
              }
              $("div.leaflet-popup").remove();
              // alert(boolInfo);  
              if(boolSelect){
                container.style.backgroundImage = "url(img/noSelect.png)";
                boolSelect = false;

                 drawnItems.eachLayer(function (layer) {
                // layer = drawnItems[i];
                   if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                    if(layer.options.color=='#00FFFF'){
                        
                         for (var i = 0; i < $scope.polylines.length; i++) {  
                            if ($scope.polylines[i].id == layer._leaflet_id) {
                               layer.setStyle({color:'green'});
                            }else{
                                 layer.setStyle({color:'red'});
                            }                   
                         }

                      }
                   }
              });

              }else{

                if(drawnItems.length!=0){

                      container.style.backgroundImage = "url(img/select.png)";
                      boolSelect = true;
                      segmentsArray=[];
                      $scope.limites = []; 

                          if (boolEdit){
                              if(selectedFeature!=null){ 
                                // for (var m in selectedFeature.snapediting._verticesHandlers[0]._markerGroup._layers) {
                                //       selectedFeature.snapediting._verticesHandlers[0]._markerGroup.clearLayers();
                                //   }
                                selectedFeature.snapediting.disable();    
                              }   

                              retablirShpGjsonLimites();
                               boolEdit = false;
                               $( ".editionGeometrie" ).css( "backgroundImage", "url(img/noedit.png)" );                   
                          }

                          boolInfo=false;
                           // $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noform.png)" );       
                           $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noinfo.png)" );       

                           boolPV=false;
                           $( ".pvGeometrie" ).css( "backgroundImage", "url(img/no_pv.png)" );       

                  }else{
                           ionicToast.show(' Aucun élément n est déssiné ! ', 'middle', false, 2500);
                  }
              }

              ////////////
              console.log('InformationControl Clicked');
        }
    return container;
  }
});
var JoinCtrl = new JoinSelectControl();


// Control d'information sur les entités déssinées. 
var PVControl =   L.Control.extend({
  options: {
    position: 'topleft'
  },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom pvGeometrie');
         L.DomEvent.addListener(container, 'mouseover', function (container) {
            this.style.cursor='pointer';
          });
         L.DomEvent.addListener(container, 'mouseout', function () {
               this.style.cursor='auto';
          });
        container.style.backgroundColor = 'white';     
        container.style.backgroundImage = "url(img/no_pv.png)";
        container.style.backgroundSize = "36px 36px";
        container.style.width = '36px';
        container.style.height = '36px';
        container.onclick = function(){
                polygonDrawSpliter.disable();
               $( ".splitGeometrie" ).css( "backgroundImage", "url(img/nosplit.png)" ); 
                boolSplit = false;                
               for (var toolbarId in drawControl._toolbars) {
                 drawControl._toolbars[toolbarId].disable();
              }
              $("div.leaflet-popup").remove();
              if(boolPV){
                    container.style.backgroundImage = "url(img/no_pv.png)";
                    boolPV = false;

              }else{

                if(drawnItems.length!=0){

                      container.style.backgroundImage = "url(img/pv.png)";


                      boolPV = true;
                      segmentsArray=[];
                      $scope.limites = []; 

                          if (boolEdit){
                              if(selectedFeature!=null){ 
                              
                                selectedFeature.snapediting.disable();    
                              }   

                              retablirShpGjsonLimites();
                               boolEdit = false;
                               $( ".editionGeometrie" ).css( "backgroundImage", "url(img/noedit.png)" );                   
                          }

                          boolInfo=false;
                           $( ".infoGeometrie" ).css( "backgroundImage", "url(img/noinfo.png)" );       

                  }else{
                           ionicToast.show(' Aucun élément n est déssiné ! ', 'middle', false, 2500);
                  }
              }

              ////////////
              console.log('InformationControl Clicked');
        }
    return container;
  }
});
var PVCtrl = new PVControl();

////////////////////////////////////////////////////////////////////////////////////////////////////////
// déclaration et définition des couches et paramètres de la carte 'map'.
angular.extend($scope, {
      london: {
            // lat: 31.599, //   347411.951141
            // lng: -7.713, //  347411.951141
            // zoom: 12
        },
        // tiles: tilesDict.xyz,
      defaults: {
            zoomControl :false,
            minZoom:7,
            tap:false,       // cette ligne est très importante => pour permettre l'utilisation du Pen Tablet.
            // tapTolerance:55,
            scrollWheelZoom:true,
            //   crs: crr,
            // continuousWorld: true
        },
      controls: {
        // scale: true
            // custom: [zoomHome]         
        },
      layers: {
          baselayers: {
              googleHybrid: $scope.definedLayers.googleHybrid
              // xyz: $scope.definedLayers.xyz
          },
          overlays: {
              tileLayerUTM: $scope.definedOverlays.tileLayerUTM,
              // tileLayerSecteur: $scope.definedOverlays.tileLayerSecteur,
              //  tileLayerMappe: $scope.definedOverlays.tileLayerMappe,
              // tileLayerDouar: $scope.definedOverlays.tileLayerDouar,
              // tileLayer: $scope.definedOverlays.tileLayer,
              draw: $scope.definedOverlays.draw
          }
      }
});

// Paramètrage des options du controleur de dessin : Draw Control;
var optionsDraw = {
    position:'topleft',
         edit: {
              featureGroup: drawnItems,
              polygon : {
                allowIntersection : false
              },
              remove:true,
              edit:false
            },
         draw: {
             rectangle: false,
             circle: false,
             circle: false,
              txt: false,
             polygon: true,
             polyline: false,
             marker: true,
            polygon: {
            allowIntersection: false, // Restricts shapes to simple polygons
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
            },
                shapeOptions: {
                    weight: 2,
                    opacity: 0.4,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor: 'red'
                },
                 // guideLayers: $scope.guideLayers
              },
            }
};

// Paramètrage des options du controleur de dessin des parcelles ;
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
            circle: false, // Turns off this drawing tool
            rectangle: false,
            marker: false
        },
        edit: {
            featureGroup: drawnItemsParcelles, //REQUIRED!!
            remove: true,
            edit:false
        }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
//  Functions globales de gestion des Dessins 

function addMarkerLabel(layer, id){
 var length = $scope.parcelles.length;

  // var num;
  // for(var i=0; i< $scope.parcelles.length; i++){
  //   if($scope.parcelles[i].id==id){
  //     num = $scope.parcelles[i].numero;
  //   }
  // }

 var center = turf.centerOfMass(layer.toGeoJSON());
 var lat = center.geometry.coordinates[1];
 var lng =center.geometry.coordinates[0];
    // var labelNew = L.marker(layer.getBounds().getCenter(), {
    var labelNew = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPlle',
          html: ++length,
          // html: num,
          iconSize: [100, 40]
          })
    });

    markersObjectNew[id] = labelNew;
    markerPlleNew.addLayer(markersObjectNew[id]);
}
function addMarkerLabelBloc(layer, id){
    var length = $scope.polygons.length;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1]+0.2;
    var lng =center.geometry.coordinates[0];
    // var labelNew = L.marker(layer.getBounds().getCenter(), {
    var labelNew = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelBloc',
          html: ++length,
          iconSize: [100, 40]
          })
    });

    markersObjectBlocNew[id] = labelNew;
    markerBlocNew.addLayer(markersObjectBlocNew[id]);
}


function deleteMarkerLabel(id){  
      // Suppression du label lié à la parcelle supprimée
       for (var m in markersObjectNew){
              if (markersObjectNew.hasOwnProperty(m) && (m==id) ) {
                      delete markersObjectNew[m]; 
              }
       }                  
       markerPlleNew.clearLayers();
       for (var m in markersObjectNew){
              markerPlleNew.addLayer(markersObjectNew[m]);
       } 
}
function deleteMarkerLabelBloc(id){  
      // Suppression du label lié à la parcelle supprimée
       for (var m in markersObjectBlocNew){
              if (markersObjectBlocNew.hasOwnProperty(m) && (m==id) ) {
                      delete markersObjectBlocNew[m]; 
              }
       }                  
       markerBlocNew.clearLayers();
       for (var m in markersObjectBlocNew){
              markerBlocNew.addLayer(markersObjectBlocNew[m]);
       } 
}

function deplaceMarkerLabel(layer, id, num){
 var center = turf.centerOfMass(layer.toGeoJSON());
 var lat = center.geometry.coordinates[1];
 var lng =center.geometry.coordinates[0];
    var labelNew = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPlle',
          html: num,
          iconSize: [100, 40]
          })
    });

    markersObjectNew[id] = labelNew;
    markerPlleNew.addLayer(markersObjectNew[id]);
}
function deplaceMarkerLabelBloc(layer, id, num){

    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1]+0.2;
    var lng =center.geometry.coordinates[0];
    // var labelNew = L.marker(layer.getBounds().getCenter(), {
    var labelNew = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelBloc',
          html: num,
          iconSize: [100, 40]
          })
    });

    markersObjectBlocNew[id] = labelNew;
    markerBlocNew.addLayer(markersObjectBlocNew[id]);
}


function addMarkerLabelBlocBD(layer, id, label){
    // var length = $scope.polygonsBD.length;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1]+0.2;
    var lng =center.geometry.coordinates[0];
    // var labelNew = L.marker(layer.getBounds().getCenter(), {
    var labelBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelBloc',
          html: label,
          iconSize: [100, 40]
          })
    });

    markersObjectBlocNew[id] = labelBD;
    markerBlocNew.addLayer(markersObjectBlocNew[id]);
}
function addMarkerLabelParcelleBD(layer, id, label){

    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1]+0.2;
    var lng =center.geometry.coordinates[0];
    var labelBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelPlle',
          html: label,
          iconSize: [100, 40]
          })
    });

    markersObjectNew[id] = labelBD;
    markerPlleNew.addLayer(markersObjectNew[id]);
}

function addMarkerLabelBlocSync(layer, id, label){
    // var length = $scope.polygonsBD.length;
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1]+0.2;
    var lng =center.geometry.coordinates[0];
    // var labelNew = L.marker(layer.getBounds().getCenter(), {
    var labelBD = L.marker([lat, lng], {
    icon: L.divIcon({
          className: 'labelBlocBD',
          html: label,
          iconSize: [100, 40]
          })
    });

    markersObjectBlocNew[id] = labelBD;
    markerBlocNew.addLayer(markersObjectBlocNew[id]);
}


function getShapeOfGeometry(Projection26191,latlngs, type){
  
  var bngcoords, X, Y, shape;
  
  if(type == "POINT"){
        bngcoords = proj4(Projection26191, [latlngs._latlng.lng, latlngs._latlng.lat]);
        X = bngcoords[0];
        Y = bngcoords[1];
        shape = "POINT("+X+" "+Y+")";
  } 
  
  if(type == "LINESTRING"){
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
  
  if(type == "POLYGON"){
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

    //Ah! To split it and find out if it is self intersecting use buffer(0)
    var jstsPolygon = geomFactory.createPolygon(linearRing).buffer(0);
    console.log(jstsPolygon.getGeometryType());

    // turns out you can just ask if it is simple... i.e. does not have any self intersections.
    console.log(linearRing.isSimple()); //so this is false   
    //  false = the polygon is in a irregular shape (there is an intersection)
    //  true = the polygon is in a normal shape
    return linearRing.isSimple();
}    

function setNumeroForParcelle(id, num){

  for (var b = 0; b < $scope.parcelles.length; b++) {
          if ($scope.parcelles[b].id == id) {
              $scope.parcelles[b].numero =num;
          }  
  }
}

function getUTMProjection(layer){

    var featureGroup = new L.FeatureGroup();
    var bnds =  layer.getBounds();
    var centroidPlle = bnds.getCenter();
    
    var center = turf.centerOfMass(layer.toGeoJSON());
    var lat = center.geometry.coordinates[1];
    var lng =center.geometry.coordinates[0];
    
    var point = {
        "type": "FeatureCollection",
        "features": [
         {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Point",
              // "coordinates": [centroidPlle.lng, centroidPlle.lat]
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
              // map.fitBounds(secteur.getBounds());
              var extent = bbox(mappes);
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

    //  Création du DrawToolbar et son ProtoType :
     var optionsDrawToolbar={};
     optionsDrawToolbar.marker={};
     optionsDrawToolbar.polyline={};
     optionsDrawToolbar.polygon={};

     L.DrawToolbar.prototype.options=optionsDrawToolbar;

    L.DrawToolbar.prototype.getModeHandlers= function (map) {
          return [
               {
                  enabled: this.options.marker,
                  handler: new L.Draw.Marker(map, this.options.marker),
                  title: L.drawLocal.draw.toolbar.buttons.marker
              },
              {
                  enabled: this.options.polyline,
                  handler: new L.Draw.Polyline(map, this.options.polyline),
                  title: L.drawLocal.draw.toolbar.buttons.polyline
              },
              {
                  enabled: this.options.polygon,
                  handler: new L.Draw.Polygon(map, this.options.polygon),
                  title: L.drawLocal.draw.toolbar.buttons.polygon
              },
          ];
      };

        // Création des DrawControls  'Controlleurs de dessins ::
        drawControl =  new L.Control.Draw(optionsDraw);

        drawControlParcelles =  new L.Control.Draw(optionsDrawParcelles);

        // Création du SideBar ::
        sidebar = L.control.sidebar('sidebarRNA', { position: 'right'  }).addTo(map);

        sidebar.on('closing', function(e) {
          $("#sidebarRNA").css( "display", "none");
        })

        // map.addControl(saveCtrl);
        map.doubleClickZoom.disable(); 
        drawnItems.addTo(map);
        drawnItemsBloc.addTo(map);
        drawnItemsParcelles.addTo(map);

        leafletData.getLayers().then(function(baselayers) {

        map.on("overlayremove",function(e){

                if(e.name=="Sous Secteur"){
                   map.removeLayer(tileLayerSecteur);
                   map.removeLayer(markersSecteur);
                } 
            
               if(e.name=="UTM"){
                   map.removeLayer(tileLayerUTM);
                   map.removeLayer(markersUTM);
                } 

                if(e.name=="Douar"){
                   map.removeLayer(tileLayerDouar);
                   map.removeLayer(markersDouars);
                } 
                if(e.name=="Mappe"){
                   map.removeLayer(tileLayerMappe);
                   map.removeLayer(markersMappes);
                } 
                 if(e.name=="T/R"){
                   map.removeLayer(tileLayer);
                   // map.removeLayer(markersTR);
                } 
        });

        map.on("overlayadd",function(e){  

                if(e.name=="Sous Secteur"){
                    tileLayerSecteur.addTo(map);
                    markersSecteur.addTo(map);
                }
                if(e.name=="UTM"){
                    tileLayerUTM.addTo(map);
                    markersUTM.addTo(map);
                }
                 if(e.name=="Douar"){
                    tileLayerDouar.addTo(map);
                    markersDouars.addTo(map);
                }
                if(e.name=="Mappe"){
                    tileLayerMappe.addTo(map);
                    markersMappes.addTo(map);
                }
                 if(e.name=="T/R"){
                    tileLayer.addTo(map);
                    // markersTR.addTo(map);
                }
        });
          
       map.on('zoomend', function () {       
              console.info("zoom= "+map.getZoom());
        });  

        var vertexLatLng;
        var borneDep;
        var borneArr;
        var idlayerToRemove;
        var layerToRemove;
        nbrVertex = 0;
        drawStart=false;
        var layerTypeDraw;

        // Close the sidebar panel when clicking on the map & th sidebar is opened :
        /////////////////////////////////////////////////////////////////////////
        map.on('click', function (e) {  
               if (sidebarBool){
                      // setTimeout(function () {
                          sidebar.close();
                          $("#sidebarRNA").css( "display", "none");
                      // }, 500);
                      sidebarBool = false;
               }
         });

        // Disable Other Leaflet Controllers when start drawing or start deleting : 
        /////////////////////////////////////////////////////////////////////////

        map.on('draw:drawstart', function (e) {


               sidebar.close();

               sidebar.on('closing', function(e) {
                  $("#sidebarRNA").css( "display", "none");
               })


               $scope.desableMapControllers();

               idlayerToRemove=-1;

               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible') ){
                    layerTypeDraw = e.layerType;
                    console.info(layerTypeDraw);
                    drawStart = true;
                    nbrVertex = 0;
                    // $('ul li a:contains("Terminer")').css('visibility','hidden');
                    console.info(drawControl);
                    console.info(drawControl.options.edit.remove);
                    for (var toolbarId in drawControlParcelles._toolbars) {
                            drawControlParcelles._toolbars[toolbarId].disable();
                        }         
               }else{
                  for (var toolbarId in drawControl._toolbars) {
                            drawControl._toolbars[toolbarId].disable();
                        }
               }   
        });

        map.on('draw:drawstop', function (e) {
               $scope.desableMapControllers();
               
               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible') ){
                     drawStart=false;
                     nbrVertex = 0;
               }  
        });

        map.on('draw:deletestart', function (e) {

               sidebar.close();

               sidebar.on('closing', function(e) {
                  $("#sidebarRNA").css( "display", "none");
               })

               console.info("delete started");
               $scope.desableMapControllers();
        });

        map.on('draw:deletestop', function (e) {

               if($scope.points.length==0 || $scope.polygons.length==0){
                 redrawLeafletDrawer("delete");
               }
             
        });
        /////////////////////////////////////////////////////////////////////////

        var showPop = true;
        var clipping_geojson;

        function redrawLeafletDrawer(optAenlever){

               if(optAenlever=="marker"){
                      // Sans Marker :
                      var optionsDraw = {
                             position:'topleft',
                               edit: {
                                    featureGroup: drawnItems,
                                    polygon : {
                                      allowIntersection : false
                                    },
                                    remove:true,
                                    edit:false
                                  },
                               draw: {
                                   rectangle: false,
                                   circle: false,
                                   circle: false,
                                    txt: false,
                                   polygon: false,
                                   polyline: false,
                                   marker: false,
                                  }
                       };
               }
               if(optAenlever=="polygon"){
                       //Sans Polygon : 
                      var optionsDraw = {
                             position:'topleft',
                               edit: {
                                    featureGroup: drawnItems,
                                    polygon : {
                                      allowIntersection : false
                                    },
                                    remove:true,
                                    edit:false
                                  },
                               draw: {
                                   rectangle: false,
                                   circle: false,
                                   circle: false,
                                    txt: false,
                                   polygon: true,
                                   polyline: false,
                                   marker: false,
                                  polygon: {
                                  allowIntersection: false, // Restricts shapes to simple polygons
                                  drawError: {
                                      color: '#e1e100', // Color the shape will turn when intersects
                                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                                  },
                                      shapeOptions: {
                                          weight: 2,
                                          opacity: 0.4,
                                          color: 'white',
                                          dashArray: '3',
                                          fillOpacity: 0.3,
                                          fillColor: 'red'
                                      },
                                       guideLayers: $scope.guideLayers
                                    },
                                  }
                       };
               }
               if(optAenlever=="delete"){
                      var optionsDraw = {
                             position:'topleft',
                               edit: {
                                    featureGroup: drawnItems,
                                    polygon : {
                                      allowIntersection : false
                                    },
                                    remove:true,
                                    edit:false
                                  },
                               draw: {
                                   rectangle: false,
                                   circle: false,
                                   circle: false,
                                    txt: false,
                                   polygon: true,
                                   polyline: false,
                                   marker: true,
                                  polygon: {
                                  allowIntersection: false, // Restricts shapes to simple polygons
                                  drawError: {
                                      color: '#e1e100', // Color the shape will turn when intersects
                                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                                  },
                                      shapeOptions: {
                                          weight: 2,
                                          opacity: 0.4,
                                          color: 'white',
                                          dashArray: '3',
                                          fillOpacity: 0.3,
                                          fillColor: 'red'
                                      },
                                       guideLayers: $scope.guideLayers
                                    },
                                  }
                       };
               } 

               map.removeControl(drawControl);
               map.removeControl(drawControlParcelles);
               map.removeControl(editCtrl);
               // map.removeControl(infoCtrl);

               drawControl =  new L.Control.Draw(optionsDraw);

               map.addControl(drawControl);
               map.addControl(drawControlParcelles);
               map.addControl(editCtrl);
               // map.addControl(infoCtrl);
       }



        //  Leaflet draw & delete events for all draw types (point , polylines , polygons ): 
        /////////////////////////////////////////////////////////////////////////
        map.on('draw:created', function (e) {     

               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true ){
               
                       var layer = e.layer;
                       var id =layer._leaflet_id;
                       var shape = "";
                       var gjson = layer.toGeoJSON();
                       var latlngs;
                       showPop = true;
                       layerToRemove  = e.layer;

                       //---------------------------------------------------------
                       // Edition de chaque entité déssinée
                       e.layer.on('edit', function (e) {
                             
                               console.log("Edition");

                               var gjson = e.target.toGeoJSON();
                               var isPolygon = false;    

                               // Parcourir les points de polylines (au cas où il s'agit d'une limite naturelle) : 
                               for (var i = 0; i < $scope.polygons.length; i++) {
                                      console.log("iddd :"+e.target._leaflet_id);
                                      if ($scope.polygons[i].id == e.target._leaflet_id) {   
                                        console.log(" polylines trouve ");         
                                        latlngs = e.target.getLatLngs();
                                        console.log("latlngs =>"+latlngs);  
                                    
                                         var bngcoords;

                                        shape = getShapeOfGeometry(latlngs,"POLYGON");
                                        console.log("polygons edited : "+shape);
                                        $scope.polygons[i].shape = shape;
                                      }           
                               }

                       });   

                      if ( (e.layerType == 'marker') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true) ){
                               
                               // redrawLeafletDrawer("marker");

                               $(".leaflet-left").find(".leaflet-draw-draw-marker").hide();
                               $(".leaflet-left").find(".leaflet-draw-draw-polygon").hide();
                               $(".leaflet-bottom.leaflet-right").hide();

                               drawnItems.addLayer(layer);
                               id =layer._leaflet_id;

                               shape = getShapeOfGeometry(layer,"POINT");

                               $scope.points.push({
                                    id: id,
                                    shape: shape,
                                    gjson: JSON.stringify(gjson)
                               });    
                      }

                        //---------------------------------------------------------  
                       // Lancement du formulaire sur chaque entité déssinée
                
                       if( (e.layerType == 'polygon') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==true) ) {
                              
                               $(".leaflet-left").find(".leaflet-draw-draw-marker").hide();

                               var polygonLayer=e.layer;
                               // redrawLeafletDrawer("polygon");
                               //-------------------------------------------------------------------------
                               //  Verification si le Bloc(Parcelle) dessiné est une forme irrégulière !! : 
                                var coordinatesOfGeometry = [];
                                coordinatesOfGeometry =polygonLayer.toGeoJSON().geometry.coordinates;
                                coordinatesOfGeometry = coordinatesOfGeometry[0];

                                var polygonSelfInterct = selfIntersect(coordinatesOfGeometry);
                                console.info("polygonSelfInterct====="+polygonSelfInterct);
                                if(polygonSelfInterct==false){
                                  ionicToast.show('Forme polygonale irrégulière ! ', 'middle', false, 2500);
                                  return;
                                }

                               //-------------------------------------------------------------------------
                               //  Intersection du Bloc(Parcelle) déssiné avec d'autre Blocs !! : 
                               var boolAddPolygonTodrawnItems = true;
                               var difference = gjson.geometry;

                               var clipping_geojson;
                               for (var i = 0; i < $scope.polygons.length; i++) {
                                
                                      clipping_geojson  = JSON.parse($scope.polygons[i].gjson);

                                      var intersect = turf.intersect(difference, clipping_geojson);
                                      console.log("intersectttt = "+JSON.stringify(intersect));
                                                             
                                      if(intersect != null){

                                             ionicToast.show('2 blocs en chevauchement ! ', 'middle', false, 2500);
                                             return;

                                              console.log("intersectttt = "+JSON.stringify(intersect.geometry.type));
                                              var area_intersect = turf.area(intersect);
                                              var area_clipping = turf.area(clipping_geojson);
                                              var area_input = turf.area(difference);

                                              console.log("area_intersect "+area_intersect); console.log("area_input "+area_input);
                                              console.log("area_clipping "+area_clipping); console.log("intersect "+intersect);
                                              console.info("area_intersect/area_clipping "+area_intersect/area_clipping);
                                              console.info("area_intersect/area_input "+area_intersect/area_input);

                                              if( ((area_intersect/area_clipping) > 0.35) && ((area_intersect/area_input) > 0.35) ){    
                                                 boolAddPolygonTodrawnItems =false;         
                                              }else{
                                               difference = turf.difference(difference, clipping_geojson);
                                                var area_difference = turf.area(difference);
                                                console.log("difference");console.log(difference);
                                                console.log("area_difference"); console.log(area_difference);
                                                boolAddPolygonTodrawnItems =false;             
                                              }
                                      }                          
                               }

                               //---------------------------------------------------------------------------------------------//                                    
                               console.info("boolAddPolygonTodrawnItems = "+boolAddPolygonTodrawnItems);

                                var projection = getUTMProjection(layer);
                               if(projection==""){                     
                                      ionicToast.show('Zone de dessin non permise !','middle', false, 2500);
                                      return;
                               }
                               console.info("projection ===== "+projection);
                 
                               var gjsonBlocParcelle;
                               var idBloc;
                               var idParcelle;
                               if(boolAddPolygonTodrawnItems==true){
                  
                                  polygonLayer.setStyle(StyleBloc);
                                  drawnItems.addLayer(polygonLayer);
                                  addMarkerLabelBloc(polygonLayer,polygonLayer._leaflet_id);
                                  $scope.guideLayers.push(polygonLayer); 

                                 var GjsonParcelle = polygonLayer.toGeoJSON();
                                 L.geoJson(GjsonParcelle, { onEachFeature: function (feature, lay) {       
                                       lay.setStyle(StyleParcelles);
                                       drawnItemsParcelles.addLayer(lay); 
                                       console.info("geocoding lay.toGeoJSON() = "+JSON.stringify(lay.toGeoJSON()));
                                       idParcelle= lay._leaflet_id;
                                       addMarkerLabel(lay, idParcelle);
                                        layerClick(lay);
                                        // layerEdit(lay);
                                    }
                                 }); 

                                 idBloc =polygonLayer._leaflet_id;
                                 gjsonBlocParcelle = polygonLayer.toGeoJSON();      
                                 console.info("gjsonBlocParcelle = "+JSON.stringify(gjsonBlocParcelle));
                               }
                               else{
                                    var diff = L.geoJson(difference, { onEachFeature: function (feature, lay) {       
                                 
                                             lay.setStyle(StyleBloc);
                                             drawnItems.addLayer(lay);
                                             addMarkerLabelBloc(lay,lay._leaflet_id);
                                             $scope.guideLayers.push(lay); 

                                             var GjsonParcelle = lay.toGeoJSON();
                                             L.geoJson(GjsonParcelle, { onEachFeature: function (feature, laye) {       
                                                   laye.setStyle(StyleParcelles);
                                                   drawnItemsParcelles.addLayer(laye); 
                                                   idParcelle= laye._leaflet_id;
                                                   addMarkerLabel(laye, idParcelle);
                                                }
                                             });  
                                            
                                             layerClick(lay);
                                             // layerEdit(lay);
                                             idBloc = lay._leaflet_id;
                                             gjsonBlocParcelle =lay.toGeoJSON();       
                                      }
                                    }); 
                               }

                              
                               latlngs = layer.getLatLngs();                   
                               shape = getShapeOfGeometry(projection,latlngs,"POLYGON");             
                               var area = turf.area(gjsonBlocParcelle.geometry);
                               var ha = parseInt(area/10000);
                               var lengthB = $scope.polygons.length;
                               lengthB++;

                               var dataB = {
                                      id: idBloc,
                                      numero: lengthB,
                                      id_exploitation: $scope.numeroExploitation,                                    
                                      shape: shape,
                                      gjson: JSON.stringify(gjsonBlocParcelle.geometry),
                                      superficie: ha,
                                      date_creation: $scope.formattedDate(),
                                      agent: loginGlob
                               };

                               $scope.polygons.push(dataB); 

                               var lengthP = $scope.parcelles.length; 
                               lengthP=lengthP+1;
                               var date = $scope.formattedDate();
                               var dataP = {
                                      id: idParcelle,
                                      numero: lengthP,
                                      bloc: lengthB,
                                      id_exploitation: $scope.numeroExploitation,                                     
                                      shape: shape,
                                      gjson: JSON.stringify(gjsonBlocParcelle.geometry),
                                      superficie: ha,
                                      date_creation: date,
                                      agent: loginGlob
                               };
                               $scope.parcelles.push(dataP);
                               console.info("xxxxxx "+$scope.parcelles.length);

                       }



                       //---------------------------------------------------------  
                       // Click sur l'élément déssiné

                      layer.on('click', function(e){

                             $("div.leaflet-popup").remove();
                             var mergePolygons = [];

                             if(boolMerge==true){
                                 console.info($scope.polygons.length);
                                 console.info(" layer._leaflet_id = "+layer._leaflet_id);
                                   for (var i = 0; i < $scope.polygons.length; i++) {      
                                   
                                    console.info(" $scope.polygons[i].id = "+$scope.polygons[i].id);
                                            if ($scope.polygons[i].id == layer._leaflet_id) {
                                               layer.setStyle({color:'black'});
                                            }                    
                                         }
                               }

                             if(boolSelect==true){
                                   if ( (layer instanceof L.Polyline) &&  ! (layer instanceof L.Polygon) ) {

                                       console.info("segmentsArray.length");
                                       console.info(segmentsArray.length);

                                       if(layer.options.color=='#00FFFF'){
                                         for (var i = 0; i < $scope.polylines.length; i++) {      
                                            if ($scope.polylines[i].id == layer._leaflet_id) {
                                               layer.setStyle({color:'green'});
                                            }                    
                                         }

                                           for (var i = 0; i < segmentsArray.length; i++) {
                                              if (segmentsArray[i]._leaflet_id == layer._leaflet_id) {
                                                  segmentsArray.splice(i, 1);           
                                              }                   
                                            }

                                            for (var i = 0; i <  $scope.limites.length; i++) {
                                              if ( $scope.limites[i].id == layer._leaflet_id) {
                                                   $scope.limites.splice(i, 1);           
                                              }                   
                                            }

                                      }else{
                                        segmentsArray.push(layer);
                                        layer.setStyle(JoinStylePolyline);
                                          var brnD;
                                          var brnA;
                                       for (var i = 0; i < $scope.polylines.length; i++) {      
                                          if ($scope.polylines[i].id == layer._leaflet_id) {
                                                 brnD = $scope.polylines[i].borneD;
                                                 brnA = $scope.polylines[i].borneA;
                                            }    
                                         }
                                     
                                       $scope.limites.push({
                                              id:  layer._leaflet_id,                        
                                              borneD: brnD,
                                              borneA: brnA
                                        });

                                      }

                                   }
                               }
                                   
                             if (boolInfo==true){

                                    console.info("_leaflet_id => "+e.target._leaflet_id);

                                     if (boolInfo==true && (layer instanceof L.Polygon) ){

                                        var param = new ParamParcelleNew(layer);

                                        leafletData.getMap().then(function(map) {  
                                            var bnds = param.layerParcelle.getBounds();
                                            var center = bnds.getCenter();
                                            
                                            // var popup = L.popup({keepInView:true, closeOnClick: false });
                                            var popup = L.popup({closeOnClick: false,autoPan:false});
                                            popup.setLatLng(center);
                                   
                                             var html ='<button  ng-click=openFormPlleNew("'+param.idParcelle+'")>'+
                                                  '<img width="20px" height="20px" src="img/parcelleNew.png">'+param.numeroParcelle+' '+param.complementParcelle+'</button>',
                                              linkFunction = $compile(angular.element(html)),
                                              newScope = $scope.$new();
                                              popup.setContent(linkFunction(newScope)[0]);  
                                              popup.addTo(map);       
                                          });      
                                     }
                               }

                      });
                          
                       console.log(JSON.stringify(layer.toGeoJSON()));


               }else{
               
                       var layer = e.layer;
                       var id = layer._leaflet_id;
                       var shape = "";
                       var bngcoords;
                       var gjson = layer.toGeoJSON();
                       var latlngs;

                       if (e.layerType == 'polyline'){
                                  
                                     var featureGrp = new L.FeatureGroup();
                                     var reader = new jsts.io.WKTReader();
                                     
                                     var parser = new jsts.io.GeoJSONParser();
                                     var jsonReader = new jsts.io.GeoJSONReader();
                                      
                                     var line = jsonReader.read(gjson.geometry);
                                     var linePol = jsonReader.read(gjson);
                                     var splitedPolygon = [];
                                     var idBloc;
                                     var numero_bloc;
                                      var idParcelleAsupprimer;  

                                      //-------------------------------------------------------------------------
                                      // Détection des parcelles dont la ligne de Split passe par :

                                     for (var k = 0; k<$scope.parcelles.length; k++) {
                                      
                                             var count = 0;
                                             var polygonizer = new jsts.operation.polygonize.Polygonizer();
                                             var jjson = JSON.parse($scope.parcelles[k].gjson);
                                             var intersect = turf.intersect(jjson, gjson);
                                             console.info("intersect = "+intersect);                                     
                                         
                                             if(intersect !=null){
                                                    // idBloc = $scope.parcelles[k].id_bloc;
                                                    bloc = $scope.parcelles[k].bloc;
                                                    console.info("intersect = "+JSON.stringify(intersect.geometry.type));
                                                    var polyg =  jsonReader.read(jjson);
                                                    var union = polyg.getExteriorRing().union(line);
                                                    polygonizer.add(union);
                                                    var polygs = polygonizer.getPolygons();

                                                    for (var m = polygs.iterator(); m.hasNext();) {
                                                            var polygonDiv = m.next();
                                                            var divGJSON = JSON.stringify(parser.write(polygonDiv));
                                                            var primeJSON = JSON.stringify(jjson.geometry); 
                                                            count++;
                                                               
                                                            if(divGJSON != primeJSON){
                                                               splitedPolygon.push({
                                                                   gjson: JSON.stringify(parser.write(polygonDiv)),
                                                                   // id_bloc: idBloc,
                                                                   bloc: bloc
                                                               });
                                                            }    
                                                    }

                                                    console.info('count :: '+count);
                                                    if(count==2){
                                                      idParcelleAsupprimer = $scope.parcelles[k].id;
                                                      drawnItemsParcelles.removeLayer(idParcelleAsupprimer);
                                                    }
                                             }
                                      }

                                      // Suppression de la parcelle de base splité par la ligne : 
                                      for (var b = 0; b < $scope.parcelles.length; b++) {
                                            if ($scope.parcelles[b].id == idParcelleAsupprimer) {
                                              $scope.parcelles.splice(b, 1);  
                                            }  
                                      }

                                      // Suppression du label de la parcelle de base supprimée : 
                                      for (var k in markersObjectNew){
                                          if (markersObjectNew.hasOwnProperty(k) && (k==idParcelleAsupprimer) ) {
                                               delete markersObjectNew[k]; 
                                          }
                                      }

                                      // Ajouter les parcelles résultat du Split par la ligne :       
                                      for (var m = 0; m<splitedPolygon.length; m++) {
                                          
                                             var gjsonPol = JSON.parse(splitedPolygon[m].gjson);
                                             // var idBloc = splitedPolygon[m].id_bloc;
                                             var bloc = splitedPolygon[m].bloc;

                                             var idParcelle;
                                             var g = L.geoJson(gjsonPol, { onEachFeature: function (feature, couche) {       
                                                    couche.setStyle(StyleParcelles);      
                                                    drawnItemsParcelles.addLayer(couche);
                                                    layerClick(couche);                     
                                                    idParcelle = couche._leaflet_id;

                                                    var projection = getUTMProjection(couche);
                                                    console.info("projection ===== "+projection);
                                                    var latlngs = couche.getLatLngs();                   
                                                    var shape = getShapeOfGeometry(projection,latlngs,"POLYGON");             
                                                    console.info("shape ====="+shape);
                                                    var area = turf.area(gjsonPol);
                                                    var ha = parseInt(area/10000);
                                                    var lengthP = $scope.parcelles.length;
                                                   var data = {
                                                         id: idParcelle,
                                                         numero:++lengthP,
                                                         bloc: bloc,
                                                         exp: $scope.numeroExploitation,                                                     
                                                         shape: shape,
                                                         gjson: splitedPolygon[m].gjson,
                                                         superficie: ha,
                                                         date_creation: $scope.formattedDate(),
                                                         agent: loginGlob
                                                     };

                                                     console.info("Data parcelle = "+JSON.stringify(data));
                                                   $scope.parcelles.push(data);

                                                   addMarkerLabel(couche, idParcelle);
                                             }
                                            });
                                      }

                                      // Réaffectation des labels (Numéros) de parcelles après avoir splité par la ligne :       
                                      markerPlleNew.clearLayers();
                                      var nbr=1;
                                      for (var k in markersObjectNew){
                                             var labelNew =L.divIcon({
                                                   className: 'labelPlle',
                                                   html: ""+nbr,
                                                   iconSize: [100, 40]
                                             });
                                             console.info('gggggggggggg '+k+' , '+nbr);
                                             setNumeroForParcelle(k, nbr);
                                             nbr++;
                                             markersObjectNew[k].setIcon(labelNew);
                                             markerPlleNew.addLayer(markersObjectNew[k]);
                                      } 

                                      // Génération des informations sur la ligne de Split : 
                                      var id = layer._leaflet_id;
                                      var latlngs= layer.getLatLngs();
                                      var shape = getShapeOfGeometry(latlngs, "LINESTRING")

                              }   
                       }

                       //--------------------------------------------------------------------------------------------------------
                       // Création de Holes sur les parcelles 

                       if( (e.layerType == 'polygon') && ($('div.leaflet-top ul.leaflet-draw-actions').is(':visible')==false) ) {

                              var id = layer._leaflet_id;
                              var latlngs = layer.getLatLngs();                   
                              var shape = getShapeOfGeometry(latlngs,"POLYGON");
                              var gjson =  layer.toGeoJSON();
                              var input = gjson.geometry;

                              // Détéction des parcelles intersectées par le Hole crée (polygon de hole) : 
                             for (var i = 0; i < $scope.parcelles.length; i++) {   
                         
                                     var clipping_geojson  = JSON.parse($scope.parcelles[i].gjson);
                                     var id = $scope.parcelles[i].id;
                                     var intersect = turf.intersect(clipping_geojson, input);
                                     console.log("intersectttt = "+JSON.stringify(intersect));   

                                     if(intersect != null){                                                 
                                            var difference = turf.difference(clipping_geojson, input);
                                            drawnItemsParcelles.removeLayer(id);

                                            L.geoJson(difference, { onEachFeature: function (feature, laye) {       
                                                   laye.setStyle(StyleParcelles);
                                                   drawnItemsParcelles.addLayer(laye); 
                                                    $scope.parcelles.push({
                                                           id: laye._leaflet_id,
                                                           id_bloc: $scope.parcelles[i].id_bloc,
                                                           couche: $scope.parcelles[i].couche,
                                                           shape: getShapeOfGeometry(laye.getLatLngs(),"POLYGON"),
                                                           gjson: JSON.stringify(laye.toGeoJSON().geometry)
                                                    });

                                                }
                                            });  

                                            $scope.parcelles.splice(i, 1); 
                                     }
                              }

                              console.info(" console.info($scope.parcelles.length); = "+$scope.parcelles.length);    

                       }                          
        });

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////

        map.on('draw:deleted', function (e) {
               if($('div.leaflet-top ul.leaflet-draw-actions').is(':visible') ){        

                      var layers = e.layers;
                      var IsMarker = true;
                      layers.eachLayer(function (layer) {

                              drawnItems.removeLayer(layer);

                              // Parcourir le JSON des Polygons pour supprimer le Bloc et les Parcelles associées :
                              for (var i = 0; i < $scope.polygons.length; i++) {                              
                                     if ($scope.polygons[i].id == layer._leaflet_id) {

                                             IsMarker = false;
                                             var parcellesASupprimer = [];
                                             var numero_bloc = $scope.polygons[i].numero;
                                             // Collecter les parcelles à supprimer en se basant sur le numero du bloc supprimé 
                                             for (var k = 0; k < $scope.parcelles.length; k++) {
                                                        // if($scope.parcelles[k].id_bloc ==layer._leaflet_id){   
                                                        if($scope.parcelles[k].bloc==numero_bloc){            
                                                                 drawnItemsParcelles.removeLayer($scope.parcelles[k].id);
                                                                 parcellesASupprimer.push({position: k});

                                                                 // Suppression des labels liés à l'entité supprimée
                                                                 for (var m in markersObjectNew){
                                                                    if (markersObjectNew.hasOwnProperty(m) && (m==$scope.parcelles[k].id) ) {
                                                                         delete markersObjectNew[m]; 
                                                                    }
                                                                 }                  
                                                                 markerPlleNew.clearLayers();
                                                                 for (var m in markersObjectNew){
                                                                   markerPlleNew.addLayer(markersObjectNew[m]);
                                                                 } 
                                                        }

                                             }

                                             // Suppression des parcelles du Json des parcelles 
                                             for(var b=0; b< parcellesASupprimer.length; b++){
                                                var pos = parcellesASupprimer[b].position;
                                                $scope.parcelles.splice(pos, 1);  
                                             }

                                             // Suppression du bloc du Json des polygons
                                             $scope.polygons.splice(i, 1); 

                                             if($scope.polygons.length==0){
                                                  $(".leaflet-left").find(".leaflet-draw-draw-marker").show();
                                                  // $(".leaflet-left").find(".leaflet-draw-draw-polygon").show();
                                             }

                                             // Suppression du label lié au bloc supprimé
                                             for (var m in markersObjectBlocNew){
                                                    if (markersObjectBlocNew.hasOwnProperty(m) && (m==layer._leaflet_id) ) {
                                                            delete markersObjectBlocNew[m]; 
                                                    }
                                             }                  
                                             markerBlocNew.clearLayers();
                                             for (var m in markersObjectBlocNew){
                                                    markerBlocNew.addLayer(markersObjectBlocNew[m]);
                                             } 
 
                                     }  
                              }

                              // Annulation du Bloc supprimé du tableau des GuideLayers : 
                              for (var i = 0; i < $scope.guideLayers.length; i++) {
                                     if ($scope.guideLayers[i]._leaflet_id == layer._leaflet_id) {
                                             console.log("guideLayers del : OK "+$scope.guideLayers.length);
                                             $scope.guideLayers.splice(i, 1);
                                     } 
                              }   

                               // Parcourir le JSON des Points pour supprimer le Point déssiné: 
                              for (var i = 0; i < $scope.points.length; i++) {
                                     if ($scope.points[i].id == layer._leaflet_id) {
                                             console.log("points del : OK "+$scope.points.length);
                                             $scope.points.splice(i, 1);
                                          
                                             $(".leaflet-left").find(".leaflet-draw-draw-marker").show();
                                             $(".leaflet-left").find(".leaflet-draw-draw-polygon").show();
                                             $(".leaflet-bottom.leaflet-right").show();
                                     } 
                              }            

                       });
                
               }else{
                      var layers = e.layers;
                      layers.eachLayer(function (layer) {
                              drawnItemsParcelles.removeLayer(layer);

                              for (var i = 0; i < $scope.parcelles.length; i++) {
                                      if($scope.parcelles[i].id ==layer._leaflet_id){      
                                           $scope.parcelles.splice(i, 1);  
                                      }
                              }     

                              // Suppression des labels liés à l'entité supprimée
                              for (var m in markersObjectNew){
                                     if (markersObjectNew.hasOwnProperty(m) && (m==layer._leaflet_id) ) {
                                             delete markersObjectNew[m]; 
                                     }
                              }                  
                              markerPlleNew.clearLayers();
                              for (var m in markersObjectNew){
                                     markerPlleNew.addLayer(markersObjectNew[m]);
                              } 

                      });
               }  
        });       

        /////////////////////////////////////////////////////////////////////////

  });

 });


});