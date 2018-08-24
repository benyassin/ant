// Ionic Starter App

// Variable global de la BD, pour qu'elle soit accessible partout dans le code :
var db = null;
var loginGlob;
var RoleUser;
var access;



// var tuileChoisie="";
// var formData = {"fond":{"Bing":false,"Google":true,"OSM":false}};

// var app = angular.module('starter', ['ionic','ngCordova','ngResource','ionic-toast','ngMessages','leaflet-directive','pdf', 'ngStorage','ionicScroller']);
// var app = angular.module('starter', ['ionic','ngCordova','ngResource','ionic-toast','ngMessages','leaflet-directive','pdf', 'ngStorage','ionicScroller', 'formio', 'chart.js']);
var app = angular.module('starter', ['ionic','ngCordova','ngResource','ionic-toast','ngMessages','leaflet-directive','pdf', 'ngStorage','ionicScroller', 'chart.js']);


//----------------------------------------------------------------//


//----------------------------------------------------------------//

app.factory('UserService', function() {
     this.login = 'anonymous';
     this.loghide = false;
     return {
        login : 'anonymous',
        loghide:  false
     };
});

app.factory('expres', function($resource){
    return $resource('http://localhost:3002/api/polygon/:param');
});


app.run(function($ionicPlatform,$cordovaSQLite, $rootScope, $localStorage) {

  $rootScope.formData = {"fond":{"Bing":false,"Google":true,"OSM":false,"Tuile":false}};

  // $rootScope.tuileChoisie ="";
  $localStorage.tuileChoisie ="";

  // $localStorage.URLDSS = "https://geoapiserver.herokuapp.com"; // serveur de test 1 
  // $localStorage.URLDSS = "http://enquetes.agriculture.gov.ma"; // DSS
  // $localStorage.URLDSS = "http://163.172.166.97"; // Serveur de test 2 maroune

  $localStorage.URLDSS = "http://105.159.251.103:1115"; // Serveur de test 2 maroune
  // $localStorage.URLDSS = "http://192.168.1.180"; // Serveur de test 2 maroune

  $ionicPlatform.ready(function() {

       if (window.cordova) {
               db = $cordovaSQLite.openDB({"name" :"DSS.db","location" : "default"}); //device
             
         }else{
               db = window.openDatabase("DSS.db", '1', 'rna', 1024 * 1024 * 100); // browser
                // window.sqlitePlugin.deleteDatabase("IFE.db");
        }

        // console.log( window.device.uuid );

        if(window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                // cordova.plugins.Keyboard.disableScroll(true);
        }

        if(window.StatusBar) {
          StatusBar.styleDefault();
        }

        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardHideHandler);

        function keyboardShowHandler(e){ 
        setTimeout(function() { 
          var originalHeight =  window.innerHeight-90; 
          var newHeight = originalHeight - e.keyboardHeight;
            $('ion-modal-view ion-content').css("height", newHeight); 
        }, 0);
          }

      function keyboardHideHandler(e){ 
        setTimeout(function() { 
          var newHeight = '100%';
            $('ion-modal-view ion-content').css("height", newHeight); 
        }, 0);
       }
      
        // if (window.cordova) {
        //        db = $cordovaSQLite.openDB({"name" :"rna30.db","location" : "default"}); //device
        //  }else{
        //        db = window.openDatabase("rna30.db", '1', 'rna', 1024 * 1024 * 100); // browser
        //         // window.sqlitePlugin.deleteDatabase("IFE.db");
        // }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////// Création des tables de la BD locale SQLITE ( points ; polylines ;  polygons ) //////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //////////////////////////////////////        Table de stockage des utlilisateurs         /////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // sqlUsers = "CREATE TABLE IF NOT EXISTS users (id_u integer primary key, login text, motdepasse text, role text, id_region text, region text, )";
        var sqlUsers = "CREATE TABLE IF NOT EXISTS users (id integer primary key, login text, motdepasse text, token text, email text, role text, ";
          sqlUsers+= "nom text, prenom text, telephone text, userId integer, region integer, province integer)";
        $cordovaSQLite.execute(db, sqlUsers).then(function(res) {
            console.info("OKK CREATE sqlUsers");
           }, function (err) {
            // alert(err);
            // alert('err sql CREATE sqlUsers');
         });

        ///////////////////////////////        Tables de paramétrage : projets et formulaires         ////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
       
        var sqlForms = "CREATE TABLE IF NOT EXISTS formulaires (id_f integer primary key, _id text, id_project text, name text, theme text, geometry text, id_fields text, fields text, userId integer)";
        $cordovaSQLite.execute(db, sqlForms);

        // var sqlProjects = "CREATE TABLE IF NOT EXISTS projets (id_p integer primary key, _id text, name text, theme text, supportSpatial integer, supportAttrib integer, checkd integer)";
        var sqlProjects = "CREATE TABLE IF NOT EXISTS projets (id_p integer primary key, _id text, name text, theme text, support text, checkd integer, userId integer)";
         $cordovaSQLite.execute(db, sqlProjects).then(function(res) {
              console.info("projets : "+res);
         }, function (err) {
            console.log(err);
            console.log('err sql CREATE sqlProjects');
         });

        /////////////////////////////////        Stockage de données RNA | SynamicData         ///////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var sqlRNA = "CREATE TABLE IF NOT EXISTS rna (id_r  integer primary key, id_exp integer, superficie text,  lat text, lng text, exploitation text, bloc text, parcelles text, sync integer)";
        $cordovaSQLite.execute(db, sqlRNA);

        // var sqlDynamicData = "CREATE TABLE IF NOT EXISTS dynamicData (id integer primary key, id_projet text, id_exp integer, superficie text, lat text, lng text, data text, geo text, sync integer)";
        // var sqlDynamicData = "CREATE TABLE IF NOT EXISTS dynamicData (id integer primary key, id_projet text, id_segment integer, data text, geo text, sync integer)";
        var sqlDynamicData = "CREATE TABLE IF NOT EXISTS dynamicData (id integer primary key, id_projet text, numero integer, userId integer,  superficie real, exploitation text, ";
        sqlDynamicData+= "data text, id_region integer, id_province integer, id_commune integer, lat text, lng text, geo text, sync integer, id_collecte integer)";
        $cordovaSQLite.execute(db, sqlDynamicData);

        //////////////////////////////////////              Découpages géographiques           ///////////////////////////////////////////////


          var sqlCommunes = "CREATE TABLE IF NOT EXISTS communes (id_c integer primary key, id_region integer,  id_province integer,  id_commune integer, name text, id_projet text, geometry text, checkd integer, userId integer)";
        $cordovaSQLite.execute(db, sqlCommunes).then(function(res) {
         }, function (err) {
            console.log('err sql CREATE sqlCommunes');
         });
      
          // var sqlSegments = "CREATE TABLE IF NOT EXISTS supports (id_s integer primary key, cid text, id text, id_commune integer, support text)";
          var sqlSegments = "CREATE TABLE IF NOT EXISTS supports (id_s integer primary key, cid text, id text, id_projet text, id_commune integer, support text, userId integer)";
        $cordovaSQLite.execute(db, sqlSegments).then(function(res) {
         }, function (err) {
            console.log('err sql CREATE sqlSegments');
         });  
   
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////      
        // Table des données temporaires ::
          var sqlTempData = "CREATE TABLE IF NOT EXISTS tempData (increment integer primary key, id text, numCollecte integer, numero integer, mode text, type text, data text, formdata text)";
        $cordovaSQLite.execute(db, sqlTempData).then(function(res) {
          console.log("OKK CREATE sqlTempData");
         }, function (err) {
            console.log(err);
            console.log('err sql CREATE sqlTempData');
         });       


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////      
           // Creation automatique du dossier qui va héberger les données de tuillage : 
               window.resolveLocalFileSystemURL("file:///storage/emulated/0/", function(dir) {
                       dir.getDirectory("SayGIS", {create: true}); // c'est celui ci qu'on va utliser ==> (dans la carte : localstorage.tuillage = beGIS)
               });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////      

  });
    
});


// app.config(function($ionicConfigProvider) {
//       $ionicConfigProvider.scrolling.jsScrolling(false);
// });

app.config(function($stateProvider, $urlRouterProvider,$httpProvider, $ionicConfigProvider) {
  
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;";


  $ionicConfigProvider.views.maxCache(0);

  // For any unmatched url, redirect to /state1
  // $urlRouterProvider.otherwise("/dashboard");
  $urlRouterProvider.otherwise("/login");
  // $urlRouterProvider.otherwise("/menu");
  
   $stateProvider

  // Page 1 :
    .state('dashboard',{
     url:'/dashboard',
     templateUrl:'templates/dashboard.html'
     // controller:'DashCtrl'
    })  

  // Page 2 :
    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: "LoginCtrl"
    })

  // Page 3 :
  $stateProvider
    .state('menu', {
      url: "/menu",
      templateUrl: "templates/menu.html",
      controller: "menuCtrl"
    })


    // Page 3 :
    .state('carte',{
       // cache: false,
     url:'/carte',
     cache: false,
      params: {"id": null, "id_exploitation":null, "mode":null},
     templateUrl:'templates/carte.html',
     controller:'CarteCtrl'
    })  

    //-------------------------------------------------------------//
     .state('tab', {
     url: "/tab",
     abstract: true,
     templateUrl: "templates/tabs.html"
     })

     // Each tab has its own nav history stack:

     .state('tab.collecte', {
     url: '/collecte',
     params: {"numCollecte":null, "mode":null},
     views: {
     'tab-collecte': {
     templateUrl: 'templates/collecte.html',
     controller: 'CollCtrl'
     }
     }
     })

     .state('tab.questionnaire', {
     url: '/questionnaire',
      params: {"idCollecte":null, "numCollecte":null, "numero":null, "mode":null, "questionnaire" : null, "data":null, "type":null},
     views: {
     'tab-questionnaire': {
     templateUrl: 'templates/questionnaire.html',
     controller: 'QuestCtrl'
     }
     }
     })
    //-------------------------------------------------------------//


      // Page 3 :
    // .state('collecteee',{
    //  url:'/collecteee',
    //  params: {"numCollecte":null, "mode":null},
    //  templateUrl:'templates/collecteee.html',
    //  controller:'CollllCtrl'
    // })  

    .state('parametrage',{
       cache: false,
     url:'/parametrage',
     templateUrl:'templates/parametrage.html',
     controller:'ParametrageCtrl'
    })  

      .state('sansgeometrie',{
       cache: false,
     url:'/sansgeometrie',
     params: {"numCollecte":null, "mode":null},
     // params:      ['numCollecte', 'mode'],
     templateUrl:'templates/sansgeometrie.html',
     controller:'sansgeometrie'
    })  


});

app.factory('nonGeomtricData', function () {
  var dataToUpdate;
  var idToUpdate;
  var numero;
  var idProjet;
  var idForm;
  var formData;
  var capture;
  return {
    getIdToUpdate: function () {return idToUpdate;},
    setIdToUpdate: function (id) { idToUpdate = id; },
    getDataToUpdate: function () {return dataToUpdate;},
    setDataToUpdate: function (data) { dataToUpdate = data; },

    // getCaptureToUpdate: function () {return capture;},
    // setCaptureToUpdate: function (img) { capture = img; },

    getNumero: function () {return numero;},
    setNumero: function (num) { numero = num; },

    getIdForm: function () {return idForm; },
    setIdForm: function (idf) { idForm = idf; },

    getIdProjet: function () { return idProjet; },
    setIdProjet: function (idp) { idProjet = idp; },

    getFormData: function () { return formData; },
    setFormData: function (data) { formData = data; }
};
});

app.factory("$fileFactory", function($q) {

    var File = function() { };

    File.prototype = {

      getParentDirectory: function(path) {
            var deferred = $q.defer();
            // window.resolveLocalFileSystemURI(path, function(fileSystem) {
            window.resolveLocalFileSystemURL(path, function(fileSystem) {
                fileSystem.getParent(function(result) {
                    deferred.resolve(result);
                }, function(error) {
                    deferred.reject(error);
                    alert("getParentDirectory error 1: "+error);
                });
            }, function(error) {
                deferred.reject(error);
                alert("getParentDirectory  error 2: "+error);
            });
            return deferred.promise;
        },

      getEntriesAtRoot: function() {

            var deferred = $q.defer();

            // alert(LocalFileSystem.PERSISTENT);
            // alert(LocalFileSystem.PERSISTENT+"/TuileIFE/");
                // window.requestFileSystem(LocalFileSystem.PERSISTENT+"/TuileIFE/", 0, function(fileSystem) {
            // window.requestFileSystem(LocalFileSystem.PERSISTENT+"/Ringtones/", 0, function(fileSystem) {
            // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            // window.requestFileSystem(LocalFileSystem.PERSISTENT+"/Ringtones/", 0, function(fileSystem) {
              // window.resolveLocalFileSystemURI("file:///storage/emulated/0/TuileIFE",  function(fileSystem) {
              // window.resolveLocalFileSystemURI("file:///storage/emulated/0/TuileIFE",  function(fileSystem) {
                window.resolveLocalFileSystemURL('file:///storage/emulated/0/DCIM/',function(fileSystem) {
                  // window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory,  function(fileSystem) {

                var directoryReader = fileSystem.root.createReader();
                directoryReader.readEntries(function(entries) {
                    deferred.resolve(entries);
                    // alert(" entries.length => "+entries.length);
                }, function(error) {
                  alert("1 "+error);
                    deferred.reject(error);
                });
            }, function(error) {
                alert("2 "+error);
                deferred.reject(error);
            });
            return deferred.promise;
        },

      getEntries: function(path) {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURI(path, function(fileSystem) {
            // window.resolveLocalFileSystemURL(path, function(fileSystem) {
                var directoryReader = fileSystem.createReader();
                directoryReader.readEntries(function(entries) {
                    // alert("entries");
                    // alert(entries);
                    deferred.resolve(entries);
                }, function(error) {
                    deferred.reject(error);
                     alert("getEntries error 1: "+error);
                });
            }, function(error) {
                deferred.reject(error);
                 alert("getEntries error 2: "+error);
            });
            return deferred.promise;
        }

    };

    return File;

});

app.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){
 
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();   
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();   
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){
 
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            console.log("went online");
          });
 
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("went offline");
          });
 
        }
        else {
 
          window.addEventListener("online", function(e) {
            console.log("went online");
          }, false);   
 
          window.addEventListener("offline", function(e) {
            console.log("went offline");
          }, false); 
        }      
    }
  }
});

