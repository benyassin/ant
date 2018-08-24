// Login Controller : 
app.controller("LoginCtrl", function($scope,$ionicPlatform, $q, $cordovaSQLite, $ionicLoading, $state, ionicToast, UserService, $localStorage,  $http, $timeout) {

          $scope.goDashboard= function(){
              $state.go('dashboard', {}, {reload: true});
          };  

          $scope.goInscription= function(){
                $state.go('inscription', {}, {reload: true});
          };

              
          $scope.login = function(log,mdp){
                // alert(log+" - "+mdp);

                $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> <br/> Connexion en cours ...',
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                });       
              
               var query = "SELECT login, motdepasse, token FROM users WHERE login = ? AND motdepasse = ? ";
                   $cordovaSQLite.execute(db, query, [log,mdp]).then(function(res) {
                          console.info("res.rows.length= "+res.rows.length);
                          if(res.rows.length > 0) {
                            // alert("kayn f la BD - SELECTED -> " +res.rows.length);
                            loginGlob=log;
                            var token = res.rows.item(0).token;

                            $localStorage.loginParam = log;
                            $localStorage.pwdParam = mdp;
                            $localStorage.tokenParam = token;
                            console.info($localStorage.loginParam+" - "+$localStorage.pwdParam+" - "+$localStorage.token);

                             $timeout(function () {
                                      $ionicLoading.hide();
                                      $state.go('menu');
                              }, 300);
                            
                            
                            }else{
                              alert('nexiste pas dans la base');
                              HttpPostUser(log, mdp).then(function(){
                                alert('connexion serveur');
                                  $ionicLoading.hide();
                              });
                            }

                  }, function (err) {
                    $ionicLoading.hide();
                      console.info("err");
                      console.info(err);
                  });
          
            }

          function HttpPostUser(log, mdp){
                console.info("on est dans HttpPostUser");
                var deferred = $q.defer();

                var urlPostUser = "https://geoapiserver.herokuapp.com/api/auth/login";

                $http({
                    method: 'POST',
                    url: urlPostUser,
                    headers: {'Content-Type': 'application/json'},
                    data: {'login': log, 'password': mdp}
                }).then(function successCallback(response) {
                    console.info("response= "+response);
                    $ionicLoading.hide();
                    if (response.data) {
                                var error  = response.data.error;                
                                var token  = response.data.token;
                                var user  = response.data.user; 
                                var role = user.role;                   
                                console.info("error > "+error+", token > "+token+", role > "+role+", user > "+JSON.stringify(user));

                              if(error==false){
                                    if(role=="agent"){
                                        addUserToDB(log, mdp, token, user);
                                        $ionicLoading.hide();
                                    }else{
                                       ionicToast.show(' Vous n\'êtes pas un agent de collecte !', 'middle', false, 2500);
                                       $ionicLoading.hide();
                                       return;
                                    }                              
                                }else{
                                   ionicToast.show(' Combinaison {Login - Password} erronée !', 'middle', false, 2500);
                                   $ionicLoading.hide();
                                   return;
                                }
                                
                    }else{
                       $ionicLoading.hide();
                    }
                    deferred.resolve();

                }, function errorCallback(response) {
                    console.info(response);
                    $ionicLoading.hide();
                    if(response.status==401){
                        ionicToast.show(' Combinaison {Login - Password} erronée !', 'middle', false, 2500);
                        $ionicLoading.hide();
                        return;
                    }else{
                        ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                        $ionicLoading.hide();
                        return;
                    }
                   deferred.resolve();
                });         
                
                 return deferred.promise;    
          }

          function addUserToDB(log, mdp, token, user){
                  var login = user.login;
                  var email = user.email;
                  var role = user.role;
                  var nom = user.nom;
                  var prenom = user.prenom;
                  var telephone = user.telephone;
                  var dpa = user.perimetre.dpa;
                  var office = user.perimetre.office;
                  var province = user.perimetre.province;
                  var region = user.perimetre.region;
                  console.info(log+" , "+mdp+" , "+token+" , "+email+" , "+role+" , "+nom+" , "+prenom+" , "+telephone+" , "+dpa+" , "+office+" , "+province+" , "+region);
                 var sqlInsertUser= "INSERT INTO users (login,motdepasse,token,email,role,nom,prenom,telephone,dpa,office,province,region)";
                 sqlInsertUser+= " VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(db, sqlInsertUser,[log,mdp,token,email,role,nom,prenom,telephone,dpa,office,province,region]);

                  $localStorage.loginParam = log;
                  $localStorage.pwdParam = mdp;
                  $localStorage.tokenParam = token;
                  $ionicLoading.hide();
                  $state.go('menu');
          }
});



// app.controller("ParametrageCtrl", function($scope, $ionicPlatform, $cordovaSQLite, $fileFactory,$q) {
app.controller("ParametrageCtrl",function($location,$scope, $ionicModal, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q,$ionicHistory,$state,$window, $localStorage){

        console.info($localStorage.loginParam);
        $scope.loginG= $localStorage.loginParam;   

        $scope.tuile = $localStorage.tuileChoisie;
             
        $scope.tuileAAfficher = function(tuile){
                $localStorage.tuileChoisie  = tuile;
                alert("tuile parametrage "+$localStorage.tuileChoisie);
                // alert($rootScope.tuileChoisie);
                // alert(tuile);
        } 


       $scope.goParametrage = function(){
            $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
        };

       $scope.goDashboard = function(){
           $state.go('dashboard', {}, {reload: true});
        };

        //-------------- Test de Progress Bar -------------//
        $scope.progressPercent = 0;  
       $scope.simulateLoad = function() {
            var interval = setInterval(function() {
              // Increment the value by 1
              $scope.progressPercent++
                if ($scope.progressPercent == 100) {
                  clearInterval(interval);
                  // $scope.addUser()
                  $scope.progressPercent = 0
                }
              $scope.$apply()
            }, 20);
        }
        //-------------- Test de Progress Bar -------------//

         ////////////////////////////////////////////////////////////////////////////////////////////////////
         /////////////////   Reload Project and forms  and communes from database     //////////////////

        function loadParametreageData(){
               $scope.projects=[];
               var idProject="";
               $scope.selectedProject="";
               $localStorage.selectedProject="";

               // var querySelectProjects = " SELECT  _id, name, theme, check FROM projects";
               var querySelectProjets = " SELECT _id, name, theme, checkd FROM projets";
     
               $cordovaSQLite.execute(db, querySelectProjets).then(function(res) {

                  console.info(" load projets res.rows.length = "+res.rows.length);

                 if(res.rows.length > 0) {

                        for (var i = 0; i < res.rows.length ; i++) {
                           
                                if( res.rows.item(i).checkd == 1){
                                        idProject = res.rows.item(i)._id;
                                        $scope.selectedProject =  res.rows.item(i)._id;
                                        $localStorage.selectedProject=res.rows.item(i)._id;
                                        console.info($localStorage.selectedProject);
                                        console.info(idProject);
                                        console.info(res.rows.item(i).checkd);
                                        $scope.projects.push({id: res.rows.item(i)._id, name: res.rows.item(i).name, theme: res.rows.item(i).theme, checked:true});
                                 }else{
                                        $scope.projects.push({id: res.rows.item(i)._id, name: res.rows.item(i).name, theme: res.rows.item(i).theme, checked:false});
                                 }                  
                                                  
                        }
                          loadFormsByProjects(idProject);
                          loadCommunesByProjects(idProject);

                 }else{
                      // Table des Forms est vide !!
                 } 

               }, function (err) {
                  console.info(err);
                  console.info("err => "+err+ " "+querySelectProjets);
               });     
        }

        function loadFormsByProjects(idProject){
                  $scope.forms=[];
                  var querySelectForms = " SELECT _id, name, theme, geometry, fields FROM formulaires WHERE id_project = '"+idProject+"'";
               
                 $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                      if(res.rows.length > 0) {
                    
                    console.info("res.rows.item(i).fields");
                    console.info(res.rows.item(i).name);
                    console.info(res.rows.item(i).fields);
                        for (var i = 0; i < res.rows.length ; i++) { 
                                $scope.forms.push(
                                      {id: res.rows.item(i)._id, name: res.rows.item(i).name, theme: res.rows.item(i).theme, geometry: res.rows.item(i).geometry, fields: res.rows.item(i).fields, checked:true}
                                  );                      
                        }

                      }else{
                          // Table des Forms est vide !!
                      } 

                    }, function (err) {
                        console.info("err => "+err+ " "+querySelectForms);
                    });    
        }
        
        function loadCommunesByProjects(idProject){
                  $scope.communes=[];
                  var queryCommune = " SELECT id_commune, name, checkd FROM communes WHERE id_projet ='"+idProject+"'";
               
                 $cordovaSQLite.execute(db, queryCommune).then(function(res) {
                            if(res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length ; i++) { 
                                        console.info("res.rows.item(i) FROM communes");
                                        console.info(res.rows.item(i).name);
                                        console.info(res.rows.item(i).id_commune);
                                        console.info(res.rows.item(i).checkd);

                            
                                       if( res.rows.item(i).checkd == 1){
                                                $scope.selectedCommune=res.rows.item(i).id_commune;
                                                $scope.communes.push({id: res.rows.item(i).id_commune, name: res.rows.item(i).name, checked:true});           
                                       }else{
                                                $scope.communes.push({id: res.rows.item(i).id_commune, name: res.rows.item(i).name, checked:false});           
                                       }                                       
                              }

                            }else{
                                // Table des Forms est vide !!
                            } 

                    }, function (err) {
                        console.info("err => "+err+ " "+queryCommune);
                    });    
        }


        $scope.selectedProject="";
        $localStorage.selectedProject="";
        $scope.selectedCommune="";
        $ionicPlatform.ready(function() {
                loadParametreageData();
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////
      
           function addProjectToDB(_id, name, theme){
                  var sqlInsertProjects= "INSERT INTO projets (_id, name, theme, checkd) VALUES(?,?,?,?)";
                  $cordovaSQLite.execute(db, sqlInsertProjects,[_id, name, theme,0]);
              }        
           function addFormToDB(_idF, id_project, nameF, themeF, geometryF, id_fieldsF, fieldsF){
                  
                  var sqlInsertForm= "INSERT INTO formulaires (_id, id_project, name, theme, geometry, id_fields, fields) VALUES(?,?,?,?,?,?,?)";
                  console.info(sqlInsertForm);
                  $cordovaSQLite.execute(db, sqlInsertForm,[_idF, id_project, nameF, themeF, geometryF, id_fieldsF, fieldsF]).then(function(res) {
                            // console.info("--------------");
                            // console.info(res);
                            // console.info("--------------");
                       }, function (err) {
                          console.info(err);
                          console.info("err | sqlInsertForm => "+sqlInsertForm);
                   });   
              }

              function addCommuneToDB(id, name, id_projet){
                console.info("----------- "+id+" -------------");
                  var sqlInsertCommunes= "INSERT INTO communes (id_commune, name, id_projet, checkd) VALUES(?,?,?,?)";
                  $cordovaSQLite.execute(db, sqlInsertCommunes,[id, name, id_projet,0]).then(function(res) {
                      // console.info("res");
                      // console.info(res);
                  });
              }   

            function loadProjectAndFormsData(res){


                   for(var i = 0; i<res.data.length; i++){
                          var _id  = res.data[i].projet._id;
                          var name  = res.data[i].projet.name;
                          var theme  = res.data[i].projet.theme;
                          var forms  = res.data[i].projet.forms;

                          var coms = res.data[i].communes;
                          console.info(theme);
                          console.info(coms);

                          for(var h = 0; h<coms.length; h++){
                                console.info(coms[h]);
                                var idcom = coms[h].id_commune;
                                var nameCom = coms[h].name;
                                addCommuneToDB(idcom, nameCom, _id);                 
                          }
                            
                          for(var k = 0; k<forms.length; k++){

                                 var _idF  = forms[k]._id;
                                 var nameF  = forms[k].name;
                                 var themeF  = forms[k].theme;
                                 var geometryF  = forms[k].geometry;
                                 var id_fieldsF  = forms[k].id_fields;
                                 var fieldsF  = forms[k].fields;
                                 fieldsF  = JSON.stringify(fieldsF[0]);

                                  // console.log("_idF > "+_idF+", nameF > "+nameF+", themeF > "+themeF+", id_fieldsF > "+id_fieldsF+", geometryF > "+geometryF+", fieldsF > "+fieldsF);
                                  addFormToDB(_idF, _id, nameF, themeF, geometryF, id_fieldsF, fieldsF);                                       
                           }

                          addProjectToDB(_id, name, theme);

                          $scope.projects.push({
                                  id: _id,
                                  name: name,
                                  theme: theme,
                                  checked:false
                          });
                             
                          // console.log("_id > "+_id+", name > "+name+", theme > "+theme+", forms > ");
                   }
            }
            $scope.DownloadProjects=function(){

                var urlProjet = "https://geoapiserver.herokuapp.com/mobile/projets";
                console.info(urlProjet);
                console.info($localStorage.tokenParam);

                $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> <br/> Téléversement  des enquêtes statistiques en cours ...',
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                 });             
              
                $http.get(urlProjet, {
                    headers: {  Authorization: $localStorage.tokenParam }
                }).then(function (res){

                          // console.info(JSON.stringify(res.data));
                          // console.info(res.data.length);

                           $scope.selectedProject="";
                           $scope.selectedCommune="";
                           $localStorage.selectedProject="";
                          $scope.communes = [];
                          $scope.projects = [];
                          $scope.forms = [];

                          var sqlDeleteForms= "delete FROM formulaires";
                          $cordovaSQLite.execute(db, sqlDeleteForms).then(function(ressource) {
                                  console.log("Nombre de formulaires apres delete : "+ressource.rows.length);
                           });

                          var sqlDeleteCommunes= "delete FROM communes";
                          $cordovaSQLite.execute(db, sqlDeleteCommunes).then(function(ressource) {
                                  console.log("Nombre de communes apres delete : "+ressource.rows.length);
                           });
                       
                          var sqlDeleteProjects= "delete FROM projets";
                          $cordovaSQLite.execute(db, sqlDeleteProjects).then(function(ressource) {
                                 console.log("Nombre de projets apres delete : "+ressource.rows.length);
                          });

                          // console.info(res.data[1].communes);
                          // console.info(res.data.projets);
                          // console.info(res.data.communes);
                                  loadProjectAndFormsData(res);
                                  $timeout(function() {
                                         $ionicLoading.hide();
                                      }, 2000);

                   }, 
                    function(response) { 
                            console.info(response);
                            ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                   });
             }


        $scope.checkProjectAcollecter=function(id, name, theme,check){

               console.info(id+" , "+ name+" , "+ theme+" , "+check);

               $localStorage.selectedProject=id;

               sqlUpdateProject = " UPDATE projets SET checkd =1 WHERE _id='"+id+"'";
               // console.info(sqlUpdateProject);
               $cordovaSQLite.execute(db, sqlUpdateProject);

               sqlUpdateProject2 = " UPDATE projets SET checkd =0 WHERE _id !='"+id+"'";
               // console.info(sqlUpdateProject2);
               $cordovaSQLite.execute(db, sqlUpdateProject2);

               var queryForm = " SELECT _id, name, theme, geometry, fields FROM formulaires WHERE id_project ='"+id+"'";
               // console.info(queryForm);

               $cordovaSQLite.execute(db, queryForm).then(function(res) {
                    $scope.forms = [];        
                      if(res.rows.length > 0) {
                              
                              for (var i = 0; i < res.rows.length ; i++) {
                                console.info("---------------------------------------------");
                                // console.info(res.rows.item(i).fields);
                                console.info(res.rows.item(i).name);
                                console.info("---------------------------------------------");
                                     $scope.forms.push(
                                            {id: res.rows.item(i)._id, name: res.rows.item(i).name, type: res.rows.item(i).type, geometry: res.rows.item(i).geometry, fields: res.rows.item(i).fields, checked:true}
                                      );                                                                                                                                      
                              }

                       }else{
                               // Table des Forms est vide !!
                       } 

               }, function (err) {
                      console.info(err);
                      console.info("err => "+queryForm);
               });          

               ////////////////////////////////////////////////////////////////////////////////////////////////////////
                var queryCommune = " SELECT id_commune, name, checkd FROM communes WHERE id_projet ='"+id+"'";

               // console.info(queryCommune);

               $cordovaSQLite.execute(db, queryCommune).then(function(res) {
                    $scope.communes = [];        
                      if(res.rows.length > 0) {
                              
                              for (var i = 0; i < res.rows.length ; i++) {
                                console.info("---------------------------------------------");
                                console.info(res.rows.item(i).name);
                                console.info(res.rows.item(i).checkd);
                                console.info("---------------------------------------------");
                                     // $scope.communes.push({id: res.rows.item(i).id_commune, name: res.rows.item(i).name,  checked:res.rows.item(i).checkd});    

                                       if( res.rows.item(i).checkd == 1){
                                                $scope.selectedCommune=res.rows.item(i).id_commune;
                                                $scope.communes.push({id: res.rows.item(i).id_commune, name: res.rows.item(i).name, checked:true});           
                                       }else{
                                                $scope.communes.push({id: res.rows.item(i).id_commune, name: res.rows.item(i).name, checked:false});           
                                       }                                                                                                                                             
                              }

                       }else{
                               // Table des Forms est vide !!
                       } 

               }, function (err) {
                      console.info(err);
                      console.info("err => "+queryCommune);
               });          
               ////////////////////////////////////////////////////////////////////////////////////////////////////////

        }

       $scope.checkCommuneAcollecter=function(id, name,check){

               console.info(id+" , "+ name+" , "+check);
               $scope.selectedCommune = id;
               console.info($scope.selectedProject);
               console.info($scope.selectedCommune);

               sqlUpdateCommune = " UPDATE communes SET checkd =1 WHERE id_commune='"+id+"' AND id_projet='"+$scope.selectedProject+"' ";
               console.info(sqlUpdateCommune);
               $cordovaSQLite.execute(db, sqlUpdateCommune);

               sqlUpdateCommune2 = " UPDATE communes SET checkd =0 WHERE id_commune !='"+id+"' AND id_projet='"+$scope.selectedProject+"' ";
               console.info(sqlUpdateCommune2);
               $cordovaSQLite.execute(db, sqlUpdateCommune2);
      
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////// Download Découpages Statistiques ////////////////////////////////////   
        
        function addSegmentToDB(id_seg, id_com, geom){
          
               console.info("------------------------------ "+id_seg+", "+ id_com+", "+ geom);
               var sqlCheckSegment = "SELECT id_segment, id_commune, geometry FROM segments WHERE id_segment ="+id_seg;
               $cordovaSQLite.execute(db, sqlCheckSegment).then(function(res) {
                      if(res.rows.length==0){
                              var sqlInsertSegment= "INSERT INTO segments (id_segment, id_commune, geometry) VALUES(?,?,?)";
                              $cordovaSQLite.execute(db, sqlInsertSegment,[id_seg, id_com, geom]);
                      }else{
                        console.info(id_seg +" id_seg existe");
                      }

               });          
        }    

        function addParcelleToDB(id_plle, id_seg, id_com, geom){
               console.info("************************ "+id_plle+", "+ id_seg+", "+ id_com+", "+ geom);
              

               var sqlCheckParcelle = "SELECT id_parcelle, id_segment, id_commune, geometry FROM parcelles WHERE id_parcelle ="+id_plle;
               $cordovaSQLite.execute(db, sqlCheckParcelle).then(function(res) {
                      if(res.rows.length==0){
                               var sqlInsertParcelle= "INSERT INTO parcelles (id_parcelle, id_segment, id_commune, geometry) VALUES(?,?,?,?)";
               $cordovaSQLite.execute(db, sqlInsertParcelle,[id_plle, id_seg, id_com, geom]);
                      }else{
                        console.info(id_plle +" id_plle existe");
                      }

               });     
        } 

        function updateGeometrieCommune(id_com, geom){
               var sqlUpdateCommune= "UPDATE communes SET geometry= '"+geom+"' WHERE id_commune="+id_com;
               console.info("sqlUpdateCommune= "+sqlUpdateCommune);
               $cordovaSQLite.execute(db, sqlUpdateCommune);
        }


        function loadSegmentsAndParcellesData(res){

               var deferred = $q.defer();

               for(var i = 0; i<res.length; i++){
                       var id  = res[i].id;
                       var id_commune  = res[i].id_commune;
                       var geometry  = JSON.stringify(res[i].geometry);
                       var parcelles  = res[i].parcelles;

                      for(var k = 0; k<parcelles.length; k++){
                              var idP  = parcelles[k].id;
                              var id_segmentP  = parcelles[k].id_segment;
                              var id_communeP  = parcelles[k].id_commune;
                              var geometryP  = JSON.stringify(parcelles[k].geometry);
                              addParcelleToDB(idP, id_segmentP, id_communeP, geometryP);                                       
                      }

                       addSegmentToDB(id, id_commune, geometry);
               }
               deferred.resolve();
               return deferred.promise;
        }

        $scope.DownloadZoneAction=function(){           
               if($scope.selectedCommune==""){
                       ionicToast.show(' Veuillez séléctionner une commune ! ', 'middle', false, 2500);
               }else{
                       var urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/segment/?id="+$scope.selectedCommune;
                       // var urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/segment/?id=6445";
                       console.info(urlDecoupage);
                       console.info($localStorage.tokenParam);

                      $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner> <br/> Téléversement des découpages statistiques en cours ...',
                                content: 'Loading',
                                animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0
                       });             
                      
                       $http.get(urlDecoupage, {
                            headers: {  Authorization: $localStorage.tokenParam }
                       }).then(function (res){

                              console.info(res.data);            
                              if(res.data.commune.length>0){
                                     var id_com = res.data.commune[0].id_commune;
                                     var geometry = JSON.stringify(res.data.commune[0].geometry);
                                     updateGeometrieCommune(id_com, geometry);
                                     console.info("woow updateGeometrieCommune");
                              }

                              if(res.data.segments.length>0){
                                     loadSegmentsAndParcellesData(res.data.segments).then(function() {
                                            console.info("woow loadSegmentsAndParcellesData");
                                            $ionicLoading.hide();
                                     });
                              }
                              
                                
                       }, 
                       function(response) { 
                               console.info(response);
                               ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                       });      
                       }
        }

     
        //////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////// Décommenter pour utilisation tablette //////////////////////

               //   var fs = new $fileFactory();

               // $ionicPlatform.ready(function() {
               //          // fs.getEntries("file:///storage/emulated/0/TuileIFE/").then(function(result) {
               //          fs.getEntries("file:///storage/emulated/0/Ortho/").then(function(result) {
               //              $scope.files = result;
               //             }, function(error) {
               //             console.info("fs error : "+error);
               //           }
               //         );
               //  });
        //////////////////////////////////////////////////////////////////////////////////////////
        
});


app.controller("InscriptionCtrl", function($scope, $cordovaSQLite,$state, ionicToast) {

  $scope.goDashboard= function(){
        $state.go('dashboard', {}, {reload: true});
   };  

  $scope.goConnexion= function(){
      $state.go('login', {}, {reload: true});
   };  

   $scope.data = {};
  $scope.createUser = function(signupForm){
      if (signupForm.$valid) {
          var nom = $scope.data.nom;
          var prenom = $scope.data.prenom;
          var email = $scope.data.email;
          var tel = $scope.data.tel;
          var login = $scope.data.login;
          var motdepasse = $scope.data.motdepasse;
          console.log(nom+" , "+prenom+" , "+tel+" , "+email+" , "+login+" , "+motdepasse);
   
          // AuthService.signupEmail(newEmail, newPassword, newFullName, selectedPlan);

        var sqlInsertUsers= "INSERT INTO users (nom,prenom,tel,email,login, motdepasse) VALUES(?,?,?,?,?,?)";
        $cordovaSQLite.execute(db, sqlInsertUsers,[nom,prenom,tel,email,login,motdepasse]).then(function(res) {
             console.log('goood sql insert users');
           }, function (err) {
              console.log('err sql insert users');
              console.log(err);
           });

          ionicToast.show(' Utilisateur enregsitré avec succès ', 'middle', false, 2500);
          $state.go('login', {}, {reload: true});

           var sqli = "SELECT * FROM users";
           $cordovaSQLite.execute(db, sqli).then(function(res) {

            if(res.rows.length > 0) {
              for (var i = 0; i < (res.rows.length-1) ; i++) {
              }

            } else {
              console.log('err sqli :=> res.rows.length = 0');
            }
           }, function (err) {
              console.log('err sql select users');
           });
  

      };
  };

  $scope.inscription= function(nom,prenom,tel,email,username,password){
         console.log(nom+" , "+prenom+" , "+tel+" , "+email+" , "+username+" , "+password);
          var sqlInsertUsers= "INSERT INTO users (nom,prenom,tel,email,login, motdepasse) VALUES(?,?,?,?,?,?)";
          $cordovaSQLite.execute(db, sqlInsertUsers,[nom,prenom,tel,email,username,password]).then(function(res) {
               console.log('goood sql insert users');
             }, function (err) {
                console.log('err sql insert users');
                console.log(err);
             });
          // $state.go('login', {}, {reload: true});

             var sqli = "SELECT * FROM users";
             $cordovaSQLite.execute(db, sqli).then(function(res) {

              if(res.rows.length > 0) {
                for (var i = 0; i < (res.rows.length-1) ; i++) {
                }

              } else {
                console.log('err sqli :=> res.rows.length = 0');
              }
             }, function (err) {
                console.log('err sql select users');
             });
     };
});

app.controller("modalCtrlModif",function($scope, $cordovaSQLite,$state){


  $scope.textNatureFR = "";
  $scope.textNatureAR = "";
  // $scope.compParcDataMPlle.representant='Propriétaire';
 

  $scope.NaturesFR = [
        { id: 1, name: 'Metfia' },
        { id: 2, name: 'Metfia non utilisée' },
        { id: 3, name: 'Arganier' },
        { id: 4, name: 'Olivier' },
        { id: 5, name: 'Amendier' },
        { id: 6, name: 'Eucaliptuse' },
        { id: 7, name: 'Chaâbat' },
        { id: 8, name: 'Capres' },
        { id: 9, name: 'Puits' },
        { id: 10, name: 'Cactus' },
        { id: 11, name: 'Caroubier' },
        { id: 12, name: 'Bassin' },
        { id: 13, name: 'Château' },
        { id: 14, name: 'Chemin de culture' },
        { id: 15, name: 'Piste de 1m' },
        { id: 16, name: 'Mejleb' },
        { id: 17, name: 'Mur en pierres sèches' },
        { id: 18, name: 'Canal ONEP' },
        { id: 19, name: 'Poteau électrique' },
        { id: 20, name: 'LEHT' },
        { id: 21, name: 'LEBT' },
        { id: 22, name: 'LEMT' },
        { id: 23, name: 'Const' },
        { id: 24, name: 'Ruine' },
        { id: 25, name: 'Vignes' },
        { id: 26, name: 'RDC' },
        { id: 27, name: 'RDC+1' },
        { id: 28, name: 'RDC+2' },
        { id: 29, name: 'RDC+3' }
         ];
  
  $scope.NaturesAR = [
         { id: 1, name: 'مطفية' },
         { id: 2, name: 'مطفية غير صالحة' },
         { id: 3, name: 'شجر أركان' },
         { id: 4, name: 'أشجار الزيتون' },
         { id: 5, name: 'أشجار اللوز' },
         { id: 6, name: 'شجر الكاليبتوس' },
         { id: 7, name: 'شعبة' },
         { id: 8, name: 'كبار' },
         { id: 9, name: 'بئر' },
         { id: 10, name: 'الصبار' },
         { id: 11, name: 'الخروب' },
         { id: 12, name: 'حوض' },
         { id: 13, name: 'خزان للماء' },
         { id: 14, name: 'ممر' },
         { id: 15, name: 'ممر عرضه 1 م' },
         { id: 16, name: 'مجلب' },
         { id: 17, name: 'جدار الحجر الجاف' },
         { id: 18, name: 'قناة التزويد بالماء' },
         { id: 19, name: 'عمود كهربائي' },
         { id: 20, name: 'خط كهربائي عالي التوثر' },
         { id: 21, name: 'خط كهربائي منخفض التوثر' },
         { id: 22, name: 'خط كهربائي متوسط التوثر' },
         { id: 23, name: 'بناية' },
         { id: 24, name: 'خربة' },
         { id: 25, name: 'عنب' },
         { id: 26, name: 'طابق أرضي' },
         { id: 27, name: 'طابق أرضي+1' },
         { id: 28, name: 'طابق أرضي+2' },
         { id: 29, name: 'طابق أرضي+3' }
         ];

  $scope.compParcDataMPlle.autresNatureFR = $scope.NaturesFR[0].id;  
  $scope.compParcDataMPlle.autresNatureAR = $scope.NaturesAR[0].id;  

   $scope.changeFR = function(item) {
       $scope.compParcDataMPlle.autresNatureAR = item.id;
       };
   $scope.changeAR = function(item) {
       $scope.compParcDataMPlle.autresNatureFR = item.id;
       };

   $scope.viderAutre=function(){
      $scope.compParcDataMPlle.nomAutre="";
      $scope.compParcDataMPlle.prenomAutre="";
      $scope.compParcDataMPlle.cinAutre="";
    };

    $scope.AjouterAutresNatures =function(NFR, NAR, NBR){
      console.info(parseInt(NBR));
      nb = parseInt(NBR);
      console.info(isNaN(nb));
      // console.info(NAR);
      // if (parseInt(NBR) != NaN && NFR !=undefined && NAR !=undefined){
      if ( isNaN(nb) != true && NBR !="" && NFR !=undefined && NAR !=undefined){
      // if (parseInt(NBR) != ""){
        $scope.compParcDataMPlle.textNatureFR += NBR+" "+NFR+" ; \n";
        $scope.compParcDataMPlle.textNatureAR += NBR+" "+NAR+" ; \n";

        $scope.compParcDataMPlle.autresNatureFR = $scope.NaturesFR[0].id;  
        $scope.compParcDataMPlle.autresNatureAR = $scope.NaturesAR[0].id;  
        $scope.compParcDataMPlle.nombreAutresNatures = "";
      }
      };
});

app.controller("modalCtrl",function($scope, $cordovaSQLite,$state){


  $scope.textNatureFR = "";
  $scope.textNatureAR = "";
  if( ($scope.parcData.uhc!="Heritiers") && ($scope.parcData.uhc!="Consorts") ){
    $scope.parcData.uhc='Unique';
  }
  $scope.parcData.representant='Propriétaire';
   $scope.parcData.nature='Plle';

  $scope.NaturesFR = [
            { id: 1, name: 'Metfia' },
            { id: 2, name: 'Metfia non utilisée' },
            { id: 3, name: 'Arganier' },
            { id: 4, name: 'Olivier' },
            { id: 5, name: 'Amendier' },
            { id: 6, name: 'Eucaliptuse' },
            { id: 7, name: 'Chaâbat' },
            { id: 8, name: 'Capres' },
            { id: 9, name: 'Puits' },
            { id: 10, name: 'Cactus' },
            { id: 11, name: 'Caroubier' },
            { id: 12, name: 'Bassin' },
            { id: 13, name: 'Château' },
            { id: 14, name: 'Chemin de culture' },
            { id: 15, name: 'Piste de 1m' },
            { id: 16, name: 'Mejleb' },
            { id: 17, name: 'Mur en pierres sèches' },
            { id: 18, name: 'Canal ONEP' },
            { id: 19, name: 'Poteau électrique' },
            { id: 20, name: 'LEHT' },
            { id: 21, name: 'LEBT' },
            { id: 22, name: 'LEMT' },
            { id: 23, name: 'Const' },
            { id: 24, name: 'Ruine' },
            { id: 25, name: 'Vignes' },
            { id: 26, name: 'RDC' },
            { id: 27, name: 'RDC+1' },
            { id: 28, name: 'RDC+2' },
            { id: 29, name: 'RDC+3' },
            { id: 30, name: 'Cimetière' },
            { id: 31, name: 'Daya' },
            { id: 32, name: 'Orangier' },
            { id: 33, name: 'Grenadier' },
            { id: 34, name: 'Figuier' },
            { id: 35, name: 'Arbres fruitiers' },
            { id: 36, name: 'Jujubier' },
            { id: 37, name: 'Palmier' },
            { id: 38, name: 'Sapin' },
            { id: 39, name: 'Sentier' },
            { id: 40, name: 'Dépression' },
            { id: 41, name: 'Ravin' },
            { id: 42, name: 'Clôture en fil barbelé' },
            { id: 43, name: 'Talus' },
            { id: 44, name: 'Mur Apparent' },
            { id: 45, name: 'Mur non Apparent' }
         ];
  
  $scope.NaturesAR = [
              { id: 1, name: 'مطفية' },
              { id: 2, name: 'مطفية غير صالحة' },
              { id: 3, name: 'شجر أركان' },
              { id: 4, name: 'أشجار الزيتون' },
              { id: 5, name: 'أشجار اللوز' },
              { id: 6, name: 'شجر الكاليبتوس' },
              { id: 7, name: 'شعبة' },
              { id: 8, name: 'كبار' },
              { id: 9, name: 'بئر' },
              { id: 10, name: 'الصبار' },
              { id: 11, name: 'الخروب' },
              { id: 12, name: 'حوض' },
              { id: 13, name: 'خزان للماء' },
              { id: 14, name: 'ممر' },
              { id: 15, name: 'ممر عرضه 1 م' },
              { id: 16, name: 'مجلب' },
              { id: 17, name: 'جدار الحجر الجاف' },
              { id: 18, name: 'قناة التزويد بالماء' },
              { id: 19, name: 'عمود كهربائي' },
              { id: 20, name: 'خط كهربائي عالي التوثر' },
              { id: 21, name: 'خط كهربائي منخفض التوثر' },
              { id: 22, name: 'خط كهربائي متوسط التوثر' },
              { id: 23, name: 'بناية' },
              { id: 24, name: 'خربة' },
              { id: 25, name: 'عنب' },
              { id: 26, name: 'طابق أرضي' },
              { id: 27, name: 'طابق أرضي+1' },
              { id: 28, name: 'طابق أرضي+2' },
              { id: 29, name: 'طابق أرضي+3' },
              { id: 30, name: 'مقبرة' },
              { id: 31, name: 'بركة مائية' },
              { id: 32, name: 'شجار البرتقال ' },
              { id: 33, name: 'أشجار الرمان' },
              { id: 34, name: 'أشجار التين' },
              { id: 35, name: 'أشجار مثمرة' },
              { id: 36, name: 'عناب' },
              { id: 37, name: 'أشجار النخيل' },
              { id: 38, name: 'أشجار الصنوبر' },
              { id: 39, name: 'مسلك' },
              { id: 40, name: 'منخفض' },
              { id: 41, name: 'خندق' },
              { id: 42, name: 'أسلاك شائكة' },
              { id: 43, name: 'مصرف' },
              { id: 44, name: 'جدار ظاهر' },
              { id: 45, name: 'جدار غير ظاهر' }
         ];

  $scope.parcData.autresNatureFR = $scope.NaturesFR[0].id;  
  $scope.parcData.autresNatureAR = $scope.NaturesAR[0].id;  

   $scope.changeFR = function(item) {
       $scope.parcData.autresNatureAR = item.id;
       };
   $scope.changeAR = function(item) {
       $scope.parcData.autresNatureFR = item.id;
       };

   $scope.viderAutre=function(){
      $scope.parcData.nomAutre="";
      $scope.parcData.prenomAutre="";
      $scope.parcData.cinAutre="";
    };

    $scope.AjouterAutresNatures =function(NFR, NAR, NBR){
        $scope.parcData.textNatureFR += NBR+" "+NFR+" ; \n";
        $scope.parcData.textNatureAR += NBR+" "+NAR+" ; \n";

        $scope.parcData.autresNatureFR = $scope.NaturesFR[0].id;  
        $scope.parcData.autresNatureAR = $scope.NaturesAR[0].id;  
        $scope.parcData.nombreAutresNatures = "";
      };
});

app.controller("modalCompCtrl",function($scope, $cordovaSQLite,$state){


  $scope.textNatureFR = "";
  $scope.textNatureAR = "";
  // $scope.parcData.representant='Propriétaire';

  $scope.NaturesFR = [
            { id: 1, name: 'Metfia' },
            { id: 2, name: 'Metfia non utilisée' },
            { id: 3, name: 'Arganier' },
            { id: 4, name: 'Olivier' },
            { id: 5, name: 'Amendier' },
            { id: 6, name: 'Eucaliptuse' },
            { id: 7, name: 'Chaâbat' },
            { id: 8, name: 'Capres' },
            { id: 9, name: 'Puits' },
            { id: 10, name: 'Cactus' },
            { id: 11, name: 'Caroubier' },
            { id: 12, name: 'Bassin' },
            { id: 13, name: 'Château' },
            { id: 14, name: 'Chemin de culture' },
            { id: 15, name: 'Piste de 1m' },
            { id: 16, name: 'Mejleb' },
            { id: 17, name: 'Mur en pierres sèches' },
            { id: 18, name: 'Canal ONEP' },
            { id: 19, name: 'Poteau électrique' },
            { id: 20, name: 'LEHT' },
            { id: 21, name: 'LEBT' },
            { id: 22, name: 'LEMT' },
            { id: 23, name: 'Const' },
            { id: 24, name: 'Ruine' },
            { id: 25, name: 'Vignes' },
            { id: 26, name: 'RDC' },
            { id: 27, name: 'RDC+1' },
            { id: 28, name: 'RDC+2' },
            { id: 29, name: 'RDC+3' },
            { id: 30, name: 'Cimetière' },
            { id: 31, name: 'Daya' },
            { id: 32, name: 'Orangier' },
            { id: 33, name: 'Grenadier' },
            { id: 34, name: 'Figuier' },
            { id: 35, name: 'Arbres fruitiers' },
            { id: 36, name: 'Jujubier' },
            { id: 37, name: 'Palmier' },
            { id: 38, name: 'Sapin' },
            { id: 39, name: 'Sentier' },
            { id: 40, name: 'Dépression' },
            { id: 41, name: 'Ravin' },
            { id: 42, name: 'Clôture en fil barbelé' },
            { id: 43, name: 'Talus' },
            { id: 44, name: 'Mur Apparent' },
            { id: 45, name: 'Mur non Apparent' }
         ];
  
  $scope.NaturesAR = [
              { id: 1, name: 'مطفية' },
              { id: 2, name: 'مطفية غير صالحة' },
              { id: 3, name: 'شجر أركان' },
              { id: 4, name: 'أشجار الزيتون' },
              { id: 5, name: 'أشجار اللوز' },
              { id: 6, name: 'شجر الكاليبتوس' },
              { id: 7, name: 'شعبة' },
              { id: 8, name: 'كبار' },
              { id: 9, name: 'بئر' },
              { id: 10, name: 'الصبار' },
              { id: 11, name: 'الخروب' },
              { id: 12, name: 'حوض' },
              { id: 13, name: 'خزان للماء' },
              { id: 14, name: 'ممر' },
              { id: 15, name: 'ممر عرضه 1 م' },
              { id: 16, name: 'مجلب' },
              { id: 17, name: 'جدار الحجر الجاف' },
              { id: 18, name: 'قناة التزويد بالماء' },
              { id: 19, name: 'عمود كهربائي' },
              { id: 20, name: 'خط كهربائي عالي التوثر' },
              { id: 21, name: 'خط كهربائي منخفض التوثر' },
              { id: 22, name: 'خط كهربائي متوسط التوثر' },
              { id: 23, name: 'بناية' },
              { id: 24, name: 'خربة' },
              { id: 25, name: 'عنب' },
              { id: 26, name: 'طابق أرضي' },
              { id: 27, name: 'طابق أرضي+1' },
              { id: 28, name: 'طابق أرضي+2' },
              { id: 29, name: 'طابق أرضي+3' },
              { id: 30, name: 'مقبرة' },
              { id: 31, name: 'بركة مائية' },
              { id: 32, name: 'شجار البرتقال ' },
              { id: 33, name: 'أشجار الرمان' },
              { id: 34, name: 'أشجار التين' },
              { id: 35, name: 'أشجار مثمرة' },
              { id: 36, name: 'عناب' },
              { id: 37, name: 'أشجار النخيل' },
              { id: 38, name: 'أشجار الصنوبر' },
              { id: 39, name: 'مسلك' },
              { id: 40, name: 'منخفض' },
              { id: 41, name: 'خندق' },
              { id: 42, name: 'أسلاك شائكة' },
              { id: 43, name: 'مصرف' },
              { id: 44, name: 'جدار ظاهر' },
              { id: 45, name: 'جدار غير ظاهر' }
         ];
  $scope.compParcData.autresNatureFR = $scope.NaturesFR[0].id;  
  $scope.compParcData.autresNatureAR = $scope.NaturesAR[0].id;  

   $scope.changeFR = function(item) {
       $scope.compParcData.autresNatureAR = item.id;
       };
   $scope.changeAR = function(item) {
       $scope.compParcData.autresNatureFR = item.id;
       };

   // $scope.viderAutre=function(){
   //    $scope.parcData.nomAutre="";
   //    $scope.parcData.prenomAutre="";
   //    $scope.parcData.cinAutre="";
   //  };

    $scope.AjouterAutresNatures =function(NFR, NAR, NBR){
      console.info(parseInt(NBR));
      nb = parseInt(NBR);
      console.info(isNaN(nb));
      // console.info(NAR);
      // if (parseInt(NBR) != NaN && NFR !=undefined && NAR !=undefined){
      if ( isNaN(nb) != true && NBR !="" && NFR !=undefined && NAR !=undefined){
      // if (parseInt(NBR) != ""){
        $scope.compParcData.textNatureFR += NBR+" "+NFR+" ; \n";
        $scope.compParcData.textNatureAR += NBR+" "+NAR+" ; \n";

        $scope.compParcData.autresNatureFR = $scope.NaturesFR[0].id;  
        $scope.compParcData.autresNatureAR = $scope.NaturesAR[0].id;  
        $scope.compParcData.nombreAutresNatures = "";
      }
      };
});

// app.controller("menuCtrl",function($scope, $cordovaSQLite, $http, ionicToast, $ionicPlatform, $fileFactory){
app.controller("CarteFootCtrl",function($scope, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q, ionicToast,$ionicHistory,$state){
    
    // alert("www"+phaseLevee);
    if (phaseLevee =="Levee"){
          $scope.showFooter = false;
    }else{
        $scope.showFooter = true;
    }
 }); 



app.controller("CollecteCtrl",function($scope, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q, ionicToast,$ionicHistory,$state){
 }); 

app.controller("menuCtrl",function($location,$scope, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, nonGeomtricData, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q, ionicToast,$ionicHistory,$state,$window, $localStorage, $ionicModal){

                $scope.loginG= $localStorage.loginParam;
                console.info($localStorage.loginParam); 
                // console.info($localStorage.selectedProject); 

                $scope.tuile = $localStorage.tuileChoisie;
          
                urlget = "http://geocoding1.duckdns.org:1111/api.php/Users";
                // urlget = "http://192.168.1.89/api.php/Users";

                url = 'http://geocoding1.duckdns.org:1111/apipost.php';
                ReUrl = 'http://geocoding1.duckdns.org:1111/apipostresync.php';

                var urlForms="https://powerful-plateau-71414.herokuapp.com/api/forms";

            
               // var sqlInsertData= "DELETE FROM dynamicData ";
               //      $cordovaSQLite.execute(db, sqlInsertData);

                ////////////////////// Décommenter pour utilisation tablette ////////////////////////

               //   var fs = new $fileFactory();

               // $ionicPlatform.ready(function() {
               //          // fs.getEntries("file:///storage/emulated/0/TuileIFE/").then(function(result) {
               //          fs.getEntries("file:///storage/emulated/0/Ortho/").then(function(result) {
               //              $scope.files = result;
               //             }, function(error) {
               //             console.info("fs error : "+error);
               //           }
               //         );
               //  });

               // /////////////////////////////////////////////////////////////////////////////////////

               // /////////////////////////////////////////////////////////////////////////////////////

                    isDlog = true;
                    //$GPRMC,161814.00,A,5205.61906,S,00506.07095,E,1.311,,081214,,,A*75
                    // data = "$GPRMC,161814.00,A,505.61906,N,00506.07095,E,1.311,,081214,,,A*75";
                    data = "$GPRMC,220516,A,5133.82,N,00042.24,W,173.8,231.8,130694,004.2,W*70";

                    $scope.parseGPS = function(){
                              latlon = getLatLng(data);
                              alert(latlon[0] + "  > " + latlon[1]);
                    }

                    function getLatLng(d) {
                        nmea = d.split(",");
                         
                        // LAT: North South 
                        coordNS = nmea[3];
                        dlog(" " + coordNS);
                        direction = nmea[4];
                        days = coordNS.substring(0, 2);
                        minutes = coordNS.substring(2, 10);
                        dlog("*** days: " + days + " minutes: " + minutes + " direction: " + direction +" ***");
                        lat = toDD(days,minutes, direction);
                        dlog("lat: " + lat);
                        
                        // East West
                        coordEW = nmea[5];
                        dlog(coordEW);  // Coord
                        direction = nmea[6];
                        days = coordEW.substring(0, 3);
                        minutes = coordEW.substring(3, 11);
                        dlog("*** days: " + days + " minutes: " + minutes + " direction: " + direction +" ***");
                        lon = toDD(days, minutes, direction);
                        return [lat, lon];
                    }

                    // TODO: Direction
                    function toDD(degrees, minutes, direction) {
                       out = parseInt(degrees) + (parseFloat(minutes) / 60);
                       if(direction == "S" || direction == "W") {
                          out = out * -1.0;
                       }
                       return out;
                    }

                    function dlog(msg) {
                        if(isDlog)
                            console.log(msg);
                    }
               // /////////////////////////////////////////////////////////////////////////////////////

               $scope.goDashboard= function(){
                    $state.go('dashboard', {}, {reload: true});
                };

               $scope.tuileAAfficher = function(tuile){
                    $localStorage.tuileChoisie  = tuile;
                    // alert("tuile menu "+$localStorage.tuileChoisie);
                    // alert(tuile);
                } 

               //--------------------------------------------------------------------------//
               $scope.goCollecte = function(){
                       // $state.go('carte', {}, {reload: true, inherit: false, notify: true});
                       $state.go('collecte');
                };

               $scope.goCarte = function(){
                       // $state.go('carte', {}, {reload: true, inherit: false, notify: true});
                       $state.go('carte');
                };

              $scope.AccesCollecte=function(){
                      var selPrj;
                       var querySelectedProject = " SELECT _id, name, theme FROM projets WHERE checkd =1";  
                       $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                           if(res.rows.length > 0) {     
                                selPrj  = res.rows.item(0)._id;
                                console.info(res.rows.item(0)._id);
                                console.info(res.rows.item(0).name);
                                $scope.nomProjetEncours = res.rows.item(0).name;
                                $scope.idProjetEncours = res.rows.item(0)._id;
                                console.info(res.rows.item(0).theme);
                                if(res.rows.item(0).theme=="rna"){
                                    // $state.go('carte');
                                    $scope.goRNACarte();
                                }else{
                                    var sqlDetectProjectType = "SELECT DISTINCT geometry FROM formulaires WHERE id_project = '"+selPrj+"'";
                                    $cordovaSQLite.execute(db, sqlDetectProjectType).then(function(res) {
                                            var typeCollecte="geometric";
                                            console.info(res.rows.length);
                                            for(var i =0; i<res.rows.length; i++){
                                                  if(res.rows.item(i).geometry=="none"){
                                                    console.info(res.rows.item(i).geometry);
                                                      typeCollecte="none";
                                                  }
                                            }

                                            if(typeCollecte=="none"){
                                                $scope.goAlphanumerique();
                                            }
                                            if(typeCollecte=="geometric"){
                                              // $state.go('collecte');
                                              $scope.goGeometricCarte();
                                            }

                                     }, function (err) {
                                            console.info(err);
                                            console.info("err => "+sqlDetectProjectType);
                                     });   
                                }
                             }else{
                                 ionicToast.show(' Aucune enquête sélectionnée !', 'middle', false, 2500);
                             } 
                        }, function (err) {
                              console.info(err);
                              console.info("err => "+querySelectedProject);
                       });   
                }

               //--------------------------------------------------------------------------//
               //--------------------------------------------------------------------------//
               //----------------- Synchronization Of Dynamic Data --------------------//
                $scope.projets=[];
                $scope.collecte=[];
                $scope.count = 0;
                $scope.idDynamicDataToFlag=[];
                $scope.dataToSync=[];

                // 2 :: Load all project info form (projets) Table where there is a non synchronized data ;)
              loadProjectToSynchronize=function(){         
                      var deferred = $q.defer();
                      var querySelectedProject = " SELECT _id, name FROM projets WHERE _id IN (SELECT DISTINCT id_projet FROM dynamicData WHERE sync=0)";  
                             $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                                    if(res.rows.length > 0) {               
                                     $scope.projets=[];             
                                            for (var i = 0; i < res.rows.length ; i++) {
                                                   var name  = res.rows.item(i).name;         
                                                   $scope.projets.push(
                                                          {_id: res.rows.item(i)._id, name: res.rows.item(i).name, checked:false}
                                                    );     
                                                    // $scope.projets.push(
                                                    //       {_id: res.rows.item(i)._id+"2", name: res.rows.item(i).name+"2", checked:false}
                                                    // );     
                                            }
                                            
                                     }else{
                                             // Table des projets est vide !!
                                     } 
                                     deferred.resolve();
                             }, function (err) {
                                    console.info(err);
                                    console.info("err => "+querySelectedProject);
                             });    
                      
                       return deferred.promise;
               }

                // 1
                $scope.PopupSynchronize = function() {

                       var html='<div ng-repeat="prj in projets">';
                       html+=' <ion-checkbox name="prj"  ng-model="prj.checked" ng-value="prj.checked" >{{prj.name}}</ion-checkbox>';
                       html+=' </div>';

                       loadProjectToSynchronize().then(function(){
                            console.info($scope.projets);
                            if($scope.projets.length==0){
                                   ionicToast.show(' Aucune données à synchroniser ', 'middle', false, 2500);
                            }else{
                            
                            //------------------------------------------------------------------------------------------------------//
                             $ionicPopup.show({
                                    title: 'Veuillez choisir les projets à synchroniser',
                                    content: html,
                                    // cssClass: 'PopupSyncheonize',
                                    scope: $scope,
                                    buttons: [
                                      {text: 'Retour'},
                                      {
                                        text: '<b>Synchroniser</b>',
                                        type: 'button-balanced',
                                        onTap: function(e) { return e; }
                                      }
                                    ]
                                  })
                              .then(function(res) {
                                console.info(res);
                                    if (res){
                                      
                                             $ionicLoading.show({ 
                                                      template: '<ion-spinner></ion-spinner> <br/> Synchronisation en cours ...',
                                                      content: 'Loading',
                                                      animation: 'fade-in',
                                                      showBackdrop: true,
                                                      maxWidth: 200,
                                                      showDelay: 0
                                             });                 

                                            for(var i=0; i<$scope.projets.length; i++){
                                                    console.info($scope.projets[i].checked);
                                                    if($scope.projets[i].checked==true){

                                                            SynchronizeDynamicData($scope.projets[i]._id).then(function(){
                                                                   $timeout(function () {
                                                                              $ionicLoading.hide();
                                                                              // $state.go($state.current, $stateParams, {reload: true, inherit: false});  
                                                                    }, 1000);
                                                            });
                                                    }
                                                          
                                             }
                                   
                                    }
                                  });
                              }
                            //------------------------------------------------------------------------------------------------------//

                       });
                };


               // 4
                function initializeDataObjectToSync(id_projet){
                       var deferred = $q.defer();

                        // var sqlForm= "SELECT  id, id_projet, id_exp, superficie, lat, lng, geo, data FROM dynamicData WHERE id_projet='"+id_projet+"' AND sync = 0";
                        var sqlForm= "SELECT  id, id_projet, geo, data FROM dynamicData WHERE id_projet='"+id_projet+"' AND sync = 0";
                        console.log(sqlForm);
                      
                        $cordovaSQLite.execute(db, sqlForm).then(function(res) {     
                              if(res.rows.length > 0) {
                                      $scope.idDynamicDataToFlag = [];
                                     for (var i = 0; i < res.rows.length ; i++) {
                                             $scope.idDynamicDataToFlag.push(res.rows.item(i).id);  
                                             // var collecte =[];
                                             // collecte.push(JSON.parse(res.rows.item(i).data)); 
                                             console.info(res.rows.item(i));                       
                                              obj = {
                                                      projet: id_projet,
                                                      id_exploitation: res.rows.item(i).id_exp,
                                                      // superficie: res.rows.item(i).superficie,        
                                                      // lat: res.rows.item(i).lat,        
                                                      // lng: res.rows.item(i).lng,        
                                                      geo: res.rows.item(i).geo,        
                                                      collecte: JSON.parse(res.rows.item(i).data)
                                              };
                                              // $scope.allDataToSync.push(obj);                               
                                              $scope.dataToSync.push(obj);                                                                  
                                     }
                              } 

                               deferred.resolve();
                       }, function (err) {
                             console.log(err);
                             console.log('ERR SQL sqlForm= '+sqlForm);
                       }); 
                       
                       return deferred.promise;    
                }
          
                // 7
              function dynamicDataToServer(i){

                      var data = $scope.dataToSync[i];
                      console.info(data);
                      console.info(JSON.stringify(data));
                       $scope.count++;     

                       var deferred = $q.defer();
                       $http({
                              method: 'POST',
                              url: "https://geoapiserver.herokuapp.com/api/collectes/",
                              data: data,
                              headers: { Authorization: $localStorage.tokenParam, 'Content-Type': 'application/json'}
                       }).then(function (res){
                              console.info("server res => "+JSON.stringify(res));
                              deferred.resolve();
                        }, 
                        function(response) { 
                         console.info("response "+JSON.stringify(response));
                         ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                       });

                       return deferred.promise;
                }

                // 6
                function setElementSyncById(id){

                       var deferred = $q.defer();

                       console.info("idididid "+id);
                       var sqlSync= "UPDATE dynamicData SET sync= 1 WHERE id ='"+id+"' "; 
                       console.info(sqlSync);
                       // $cordovaSQLite.execute(db, sqlSync).then(function(res) {

                        deferred.resolve();
                       // }, function (err) {
                       //      console.log('ERR SQL sqlSync= '+sqlSync);
                       // });

                       return deferred.promise;
                }

                // 3
                function SynchronizeDynamicData(id_projet){
                       var deferred = $q.defer();
                       $scope.dataToSync = [];
                       initializeDataObjectToSync(id_projet).then(function(){

                              var chain = $q.when();                            
                              for (var k = 0; k < $scope.dataToSync.length ; k++) {   
                                      chain = chain.then(function() {
                                            return  dynamicDataToServer($scope.count);                                 
                                      });                       
                               }

                              chain.finally(function(){
                                     deferred.resolve();
                                     console.info("finish !!")
                                     $scope.dataToSync = [];
                                     $scope.count =0;
                                     var promises = [];
                                     console.info($scope.idDynamicDataToFlag.length);

                                     for(var i = 0; i < $scope.idDynamicDataToFlag.length; i++) {
                                             console.info("$scope.idDynamicDataToFlag= "+$scope.idDynamicDataToFlag[i]);
                                             var promise = setElementSyncById($scope.idDynamicDataToFlag[i]); 
                                             promises.push(promise);
                                     }
                                     $q.all(promises).then();

                              });
                        
                       }); 
                                 
                       return deferred.promise;
                }

               //--------------------------------------------------------------------------//
               //--------------------------------------------------------------------------//
               //-------------------------      Génération de la BD   ----------------------//
              
               // 2 :: Load all project info form (projets) Table where there is a non synchronized data ;)
               loadProjectToExportDB=function(){         
                       var deferred = $q.defer();
                       var querySelectedProject = " SELECT _id, name FROM projets WHERE _id IN (SELECT DISTINCT id_projet FROM dynamicData WHERE sync=0)";  
                             $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                                    if(res.rows.length > 0) {               
                                     $scope.projets=[];             
                                            for (var i = 0; i < res.rows.length ; i++) {
                                                   var name  = res.rows.item(i).name;         
                                                   $scope.projets.push(
                                                          {_id: res.rows.item(i)._id, name: res.rows.item(i).name, checked:false}
                                                    );     
                                                    // $scope.projets.push(
                                                    //       {_id: res.rows.item(i)._id+"2", name: res.rows.item(i).name+"2", checked:false}
                                                    // );     
                                            }
                                            
                                     }else{
                                             // Table des projets est vide !!
                                     } 
                                     deferred.resolve();
                             }, function (err) {
                                    console.info(err);
                                    console.info("err => "+querySelectedProject);
                             });    
                      
                       return deferred.promise;
               }

                // 1
                $scope.PopupExportDB = function() {

                       var html='<div ng-repeat="prj in projets">';
                       html+=' <ion-checkbox name="prj"  ng-model="prj.checked" ng-value="prj.checked" >{{prj.name}}</ion-checkbox>';
                       html+=' </div>';

                       loadProjectToExportDB().then(function(){
                            console.info($scope.projets);
                            if($scope.projets.length==0){
                                   ionicToast.show(' Aucune données à exporter ', 'middle', false, 2500);
                            }else{
                            
                            //------------------------------------------------------------------------------------------------------//
                             $ionicPopup.show({
                                    title: 'Veuillez choisir les projets à exporter',
                                    content: html,
                                    // cssClass: 'PopupSyncheonize',
                                    scope: $scope,
                                    buttons: [
                                      {text: 'Retour'},
                                      {
                                        text: '<b>Exporter</b>',
                                        type: 'button-balanced',
                                        onTap: function(e) { return e; }
                                      }
                                    ]
                                  })
                              .then(function(res) {
                                console.info(res);
                                    if (res){
                                      
                                             $ionicLoading.show({ 
                                                      template: '<ion-spinner></ion-spinner> <br/> Exportation en cours ...',
                                                      content: 'Loading',
                                                      animation: 'fade-in',
                                                      showBackdrop: true,
                                                      maxWidth: 200,
                                                      showDelay: 0
                                             });                 

                                            for(var i=0; i<$scope.projets.length; i++){
                                                    console.info($scope.projets[i].checked);
                                                    if($scope.projets[i].checked==true){

                                                            GenerateDBDynamicData($scope.projets[i]._id).then(function(){
                                                                   $timeout(function () {
                                                                              $ionicLoading.hide();
                                                                              // $state.go($state.current, $stateParams, {reload: true, inherit: false});  
                                                                    }, 1000);
                                                            });
                                                    }
                                                          
                                             }
                                   
                                    }
                                  });
                              }
                            //------------------------------------------------------------------------------------------------------//

                       });
                };

                  // 3
                function GenerateDBDynamicData(id_projet){
                       var deferred = $q.defer();
                       $scope.dataToSync = [];
                       initializeDataObjectToExport(id_projet).then(function(){

                              var chain = $q.when();                            
                              for (var k = 0; k < $scope.dataToSync.length ; k++) {   
                                      chain = chain.then(function() {
                                            return  dynamicDataToLocaleFile($scope.count);                                 
                                      });                       
                               }          

                              chain.finally(function(){
                                     deferred.resolve();
                                     $scope.dataToSync = [];
                                     $scope.count =0;
                               });              
                       });                                 
                       return deferred.promise;
                }

                 // 4
                function initializeDataObjectToExport(id_projet){
                       var deferred = $q.defer();

                        var sqlForm= "SELECT  id, id_projet, geo, data FROM dynamicData WHERE id_projet='"+id_projet+"' AND sync = 0";
                        console.log(sqlForm);
                      
                        $cordovaSQLite.execute(db, sqlForm).then(function(res) {     
                              if(res.rows.length > 0) {
                                      $scope.idDynamicDataToFlag = [];
                                     for (var i = 0; i < res.rows.length ; i++) {
                                             $scope.idDynamicDataToFlag.push(res.rows.item(i).id);  
                                           
                                             console.info(res.rows.item(i));                       
                                              obj = {
                                                      projet: id_projet, 
                                                      geo: res.rows.item(i).geo,        
                                                      collecte: JSON.parse(res.rows.item(i).data)
                                              };
                                              $scope.dataToSync.push(obj);                                                                  
                                     }
                              } 

                               deferred.resolve();
                       }, function (err) {
                             console.log(err);
                             console.log('ERR SQL sqlForm= '+sqlForm);
                       }); 
                       
                       return deferred.promise;    
                }
           

                   // 5
              function dynamicDataToLocaleFile(i){

                       var data = $scope.dataToSync[i];
                       console.info(data);
                       alert("data "+i+"= "+JSON.stringify(data));
                       $scope.count++;     
                       var deferred = $q.defer();
                       var boolFileGotData = false;
                        $ionicPlatform.ready(function() {
                              // window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                              window.resolveLocalFileSystemURL("file:///storage/emulated/0/beGIS/", function(dir) {

                                     var localeFile = "Export"+$scope.formattedDate()+".txt";

                                     dir.getFile(localeFile, {create:true}, function(file) {
                                            var logOb = file;        

                                            logOb.file(function(file){
                                                  var reader = new FileReader();
                                                  reader.onloadend = function (evt) {
                                                     if(evt.target.result!=""){
                                                            boolFileGotData = true;
                                                     }
                                                  };
                                                  reader.readAsText(file);

                                              }, function(error){
                                                  alert("Error: " + error.code);
                                              });
                                            
                                              logOb.createWriter(function(fileWriter) {
                                                  fileWriter.truncate(0);
                                                  // fileWriter.seek(fileWriter.length);
                                                  var blob = new Blob([JSON.stringify(data)], {type:'text/plain'});
                                                  fileWriter.write(blob);
                                                  deferred.resolve();
                                              }, function(e){alert("error fileWriter");alert(e);});
                                     
                                     });
                               });
                       });

                       return deferred.promise;
                }

               Number.prototype.padLeft = function(base,chr){
                       var  len = (String(base || 10).length - String(this).length)+1;
                       return len > 0? new Array(len).join(chr || '0')+this : this;
               }
                 
              $scope.formattedDate=function() {
                      var d = new Date,
                        dformat = [ d.getFullYear(),(d.getMonth()+1).padLeft(),
                                    d.getDate().padLeft() ].join('-');

                        return dformat;
               }

                //////////////////////////////////////////////////////////////////////////////////////

               $scope.ExportDB = function() {
                       var confirmPopup = $ionicPopup.confirm({
                              title: 'Export de données',
                              template: 'Voulez-vous vraiment exporter les données de la base locale?'
                       });

                       confirmPopup.then(function(res) {
                               if(res) {
                                 console.log('You are sure :)');
                                   generateDBFile();

                               } else {
                                 console.log('You are not :( ');
                               }
                       });
               };

               function generateDBFile(){

                       // var queryGenerateDB = " SELECT id, id_projet, id_segment, data, geo, sync FROM dynamicData WHERE sync=0";  
                       var queryGenerateDB = " SELECT id, id_projet, id_segment, data, geo, sync FROM dynamicData";  
                       $cordovaSQLite.execute(db, queryGenerateDB).then(function(res) {
                              if(res.rows.length > 0) {    
                                    var entry ="";
                                     for (var i = 0; i < res.rows.length ; i++) { 
                                          console.info("id: "+res.rows.item(i).id);
                                          console.info("id_projet: "+res.rows.item(i).id_projet);
                                          console.info("id_segment: "+res.rows.item(i).id_segment);
                                          console.info("data: "+res.rows.item(i).data);
                                          console.info("geo: "+res.rows.item(i).geo);
                                          console.info("sync: "+res.rows.item(i).sync);
                                          // var obj = {
                                          //           res.rows.item(i).id,
                                          //           res.rows.item(i).id_projet,
                                          //           res.rows.item(i).id_segment,
                                          //           res.rows.item(i).data,
                                          //           res.rows.item(i).geo
                                          // }
                                     }
                                     exportDBToFile(entry);
                              }else{
                                      ionicToast.show(' Aucune donnée à générer', 'middle', false, 2500);
                              }         

                       });
               }

               function exportDBToFile(entry){
                       $ionicPlatform.ready(function() {
                              window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                                     dir.getFile("log.txt", {create:true}, function(file) {
                                              var logOb = file;        
                                              var log = ":: TEST LOG ::" + " [" + (new Date()) + "]\n";
                                              logOb.createWriter(function(fileWriter) {
                                                  fileWriter.seek(fileWriter.length);
                                                  var blob = new Blob([log], {type:'text/plain'});
                                                  fileWriter.write(blob);
                                              }, function(e){console.error(e);});
                                     });
                               });
                       });
               }
                //--------------------------------------------------------------------------//
                //----------------- Synchronization Of RNA Data --------------------//
                $scope.existDesDonnesRNAaSync=false;
                $scope.donneRNA = [];
                $scope.countRNA = 0;
               
                // 2
              loadRNAToSynchronize=function(){         
                      var deferred = $q.defer();
                      var querySelectedRNA = " SELECT id_r, id_exp, superficie, lat, lng, exploitation, bloc, parcelles, sync FROM rna WHERE sync=0 ";  
                             $cordovaSQLite.execute(db, querySelectedRNA).then(function(res) {
                                    if(res.rows.length > 0) {               
                                            $scope.existDesDonnesRNAaSync = true;
                                            for (var i = 0; i < res.rows.length ; i++) { 
                                                    var obj = {
                                                           projet: "59df49bcd874ec0e24757717",
                                                           id_exploitation: res.rows.item(i).id_exp,
                                                           superficie: res.rows.item(i).id_exp,
                                                           lat: res.rows.item(i).lat,
                                                           lng: res.rows.item(i).lng,
                                                           exploitation: JSON.parse(res.rows.item(i).exploitation)[0],
                                                           blocs:JSON.parse(res.rows.item(i).bloc),
                                                           collecte: JSON.parse(res.rows.item(i).parcelles)
                                                   };
                                                   console.info(JSON.stringify(obj));
                                                   $scope.donneRNA.push({id: res.rows.item(i).id_r, data: JSON.stringify(obj)});
                                            }

                                     }else{
                                              $scope.existDesDonnesRNAaSync = false;
                                     } 
                                     deferred.resolve();
                             }, function (err) {
                                    console.info(err);
                                    console.info("err => "+querySelectedRNA);
                             });    
                      
                       return deferred.promise;
                }
               
                // 1
             $scope.PopupSynchronizeRNA = function() {

                      console.info($scope.existDesDonnesRNAaSync);
                      loadRNAToSynchronize().then(function(){

                              console.info($scope.existDesDonnesRNAaSync);
                              
                              if($scope.existDesDonnesRNAaSync){

                                     var confirmPopup = $ionicPopup.confirm({
                                             title: 'Synchronisation RNA',
                                             template: 'Voulez-vous synchroniser les données RNA?'
                                      });

                                      confirmPopup.then(function(res) {
                                           if(res) {
                                              console.log('Oui !');
                                              
                                              var chain = $q.when();
                                              var promises = [];
                                              for (var k = 0; k < $scope.donneRNA.length ; k++) {   
                                                      console.info($scope.donneRNA[k].data);
                                                      console.info($scope.donneRNA[k]);
                                                      chain = chain.then(function() {
                                                            console.info($scope.donneRNA[$scope.countRNA]);
                                                            return  RNADataToServer($scope.countRNA, $scope.donneRNA[$scope.countRNA].data);    
                                                             var promise = setElementRNASyncById($scope.donneRNA[$scope.countRNA].id); 
                                                             promises.push(promise);                             
                                                      });                       
                                               }

                                              chain.finally(function(){
                                                $q.all(promises).then();
                                              });


                                           } else {
                                              console.log('Non !');
                                           }
                                      });

                              }else{
                                     ionicToast.show(' Aucune données à synchroniser ', 'middle', false, 2500);
                              }
                              
                      });  
                };

              function RNADataToServer(cnt, data){
                       var deferred = $q.defer();
                       $http({
                              method: 'POST',
                              url: "https://geoapiserver.herokuapp.com/api/collectes/",
                              // data: $.param(data),
                              data: JSON.parse(data),
                              headers: { Authorization: $localStorage.tokenParam, 'Content-Type': 'application/json'}
                       }).then(function (res){
                              // console.info("server res => "+res);
                              console.info("server res => "+JSON.stringify(res));
                              console.info("server $scope.countRNA => "+$scope.countRNA);
                              $scope.countRNA++;
                              deferred.resolve();
                        }, 
                        function(response) { 
                         console.info("response "+JSON.stringify(response));
                         ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                       });

                       return deferred.promise;
                }

              function setElementRNASyncById(id){

                       var deferred = $q.defer();

                       console.info("idididid "+id);
                       var sqlSync= "UPDATE rna SET sync= 0 WHERE id_r ='"+id+"' "; 
                       console.info(sqlSync);
                       // $cordovaSQLite.execute(db, sqlSync).then(function(res) {

                       //  deferred.resolve();
                       // }, function (err) {
                       //      console.log('ERR SQL sqlSync= '+sqlSync);
                       // });

                       return deferred.promise;
                }
              
                //-------------------------------------------------------------------------//
               //-------------------- Gestion des questionnaire RNA --------------------//

               $scope.GeomRNAData = [];
               loadRNAData=function(){
                       var deferred = $q.defer();
                       var querySelectData = " SELECT id_r, id_exp FROM rna";  

                       $cordovaSQLite.execute(db, querySelectData).then(function(res) {

                             $scope.GeomRNAData = [];
                             for(var i = 0; i<res.rows.length; i++){
                                    var id_exp = res.rows.item(i).id_exp;
                                    var id = res.rows.item(i).id_r;                                                           
                                    $scope.GeomRNAData.push({id: id, id_exp: id_exp});
                             }
                              console.info($scope.GeomRNAData);
                          
                              deferred.resolve();
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+err+ " "+querySelectData);
                       });    

                        return deferred.promise;
               }
               $scope.goToCollecteRNAByParam=function(id, id_exp){
                        $scope.modalRender.remove();
                        $state.go('carte', { id: id, id_exploitation: id_exp, mode: "m" });
               }
               $scope.goToCollecteRNANew=function(id){
                        $scope.modalRender.remove();
                        $state.go('carte', { id: null, id_exploitation: null, mode: "n" });
               }
               $scope.goRNACarte=function(){
                      
                       // loadNonGeometricProjetForm().then(function(){
                            loadRNAData().then(function(){
                                console.info($scope.GeomRNAData);
                                 
                                 let  html =`<ion-modal-view id="ayoub" style="width: 40%; height: 50%; top: 25%; left: 25%; right: 30%; bottom: 30%;">`;
                                 html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
                                 html+=  ` <h1 class = "title">RNA</h1>`;
                                 html+=  ` </ion-header-bar>`;
                                 html+=  ` <ion-content class="padding"  has-header="true">`;
                                 html+=  `<ion-list>`;
                                 html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in GeomRNAData" type="item-text-wrap" ng-click="goToCollecteRNAByParam(ngd.id, ngd.id_exp)">`;
                                 html+=  `Exploitation N° {{ngd.id_exp}}`;
                                 html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                 html+=  ` </ion-item>`;
                                 html+=  ` </ion-list>`;
                                 html+= `<div class = "button-bar"><a class = "button button-dark" ng-click="hideModalRender()">Retour</a>`;
                                 html+= `<a class = "button button-balanced" ng-click="goToCollecteRNANew()">Nouveau</a></div> `;
                                 html+= `</ion-content></ion-modal-view>`;

                                 $scope.modalRender  = new $ionicModal.fromTemplate(html, {
                                        scope: $scope,
                                        focusFirstInput:true,
                                        backdropClickToClose:false,
                                        hardwareBackButtonClose:false
                                 });

                                 $scope.modalRender.show();

                            });
                       // });
               }

               //-------------------------------------------------------------------------//
               //------------- Gestion des questionnaire avec géométrie ---------------//

               $scope.GeomData = [];
                loadGeometricData=function(){

                       var deferred = $q.defer();
                       // var num = 0;

                       // var querySelectData = " SELECT id, id_segment, data FROM dynamicData WHERE id_projet='"+$scope.idProjetEncours+"' ";  
                       var querySelectData = " SELECT DISTINCT id_segment FROM dynamicData WHERE id_projet='"+$scope.idProjetEncours+"' ";  

                       $cordovaSQLite.execute(db, querySelectData).then(function(res) {

                             $scope.GeomData = [];                        
                             for(var i = 0; i<res.rows.length; i++){
                                    var id_segment = res.rows.item(i).id_segment;                               
                                    // console.info( JSON.parse(res.rows.item(i).data));
                                    // var input = JSON.parse(res.rows.item(i).data)[0].data;
                                    // var data = input[0];
                                    // var numero = data.numero;
                                    // if(numero>=num){
                                    //        num = numero;
                                    // }                                   
                                    // $scope.GeomData.push({id: id, id_segment: id_segment, numero: numero});
                                    $scope.GeomData.push({id_segment: id_segment});
                             }
                              console.info($scope.GeomData);
                             // if(num==0){
                             //      num++;
                             //      nonGeomtricData.setNumero(num); 
                             //  }else{
                             //      num++;
                             //      nonGeomtricData.setNumero(num); 
                             //  }
                              deferred.resolve();
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+err+ " "+querySelectData);
                       });    

                        return deferred.promise;
                }
                $scope.goToCollecteByParam=function(id_segment){
                        $scope.modalRender.remove();
                        console.info("zzzzzzzzzzzz= "+ id_segment);
                        $state.go('collecte', { id_segment: id_segment, mode: "m" });
                }
                $scope.goToCollecteNew=function(id){
                        $scope.modalRender.remove();
                        $state.go('collecte', { id_segment: null, mode: "n" });
                }
                $scope.goGeometricCarte=function(){
                      
                       // loadNonGeometricProjetForm().then(function(){
                            loadGeometricData().then(function(){
                                console.info($scope.GeomData);
                                 
                                 let  html =`<ion-modal-view id="ayoub" style="width: 40%; height: 50%; top: 25%; left: 25%; right: 30%; bottom: 30%;">`;
                                 html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
                                 html+=  ` <h1 class = "title">{{nomProjetEncours}}</h1>`;
                                 html+=  ` </ion-header-bar>`;
                                 html+=  ` <ion-content class="padding"  has-header="true">`;
                                 html+=  `<ion-list>`;
                                 html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in GeomData" type="item-text-wrap" ng-click="goToCollecteByParam(ngd.id_segment)">`;
                                 html+=  `Segment N° {{ngd.id_segment}}`;
                                 html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                 html+=  ` </ion-item>`;
                                 html+=  ` </ion-list>`;
                                 html+= `<div class = "button-bar"><a class = "button button-dark" ng-click="hideModalRender()">Retour</a>`;
                                 html+= `<a class = "button button-balanced" ng-click="goToCollecteNew()">Nouveau</a></div> `;
                                 html+= `</ion-content></ion-modal-view>`;

                                 $scope.modalRender  = new $ionicModal.fromTemplate(html, {
                                        scope: $scope,
                                        focusFirstInput:true,
                                        backdropClickToClose:false,
                                        hardwareBackButtonClose:false
                                 });

                                 $scope.modalRender.show();

                            });
                       // });
                }


                //-------------------------------------------------------------------------//
                //------------- Gestion des questionnaire sans géométrie ---------------//

              loadNonGeometricProjetForm=function(){

                      var deferred = $q.defer();
                        // var querySelectedP = "DELETE FROM dynamicData";  
                        //  $cordovaSQLite.execute(db, querySelectedP);

                        var querySelectedProject = " SELECT _id FROM projets WHERE checkd =1 ";  

                                 $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                       
                                        if(res.rows.length > 0) {                            
                                                for (var i = 0; i < res.rows.length ; i++) {
                                                       $scope.selectedProject = res.rows.item(i)._id;
                                                        var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+$scope.selectedProject+"'";
   
                                                        $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                                                               console.info(res.rows.length);
                                                               console.info("res.rows.item(0).geometry");
                                                               console.info(res.rows.item(0).geometry);
                                                               if( (res.rows.length > 0) && (res.rows.item(0).geometry=="none") ){
                                                                // $scope.formNonGeomData = res.rows.item(0).fields;
                                                                nonGeomtricData.setIdProjet($scope.selectedProject);
                                                                nonGeomtricData.setIdForm(res.rows.item(0).id_fields);
                                                                nonGeomtricData.setFormData(res.rows.item(0).fields);
                                                                deferred.resolve();
                                                               }else{
                                                                  // Table des Forms est vide !!
                                                               } 

                                                       }, function (err) {
                                                              console.info("err => "+err+ " "+querySelectForms);
                                                       });    
                                                        //----------------------------------------------------------------------------------------------------//                                                                                                                                                                                                  
                                                }

                                         }else{
                                                 // Table des Projets est vide !!
                                         } 

                                 }, function (err) {
                                        console.info(err);
                                        console.info("err => "+querySelectedProject);
                                 });    
                       return deferred.promise;
                }
                $scope.nonGeomData = [];
              loadNonGeometricData=function(){
                      var idProjet = nonGeomtricData.getIdProjet();
                      var idForm = nonGeomtricData.getIdForm();
                       var deferred = $q.defer();
                       var num = 0;

                       // var querySelectData = " DELETE FROM dynamicData WHERE id_projet='"+idProjet+"' ";  
                       // $cordovaSQLite.execute(db, querySelectData);

                       // var querySelectData = " SELECT id, data FROM dynamicData WHERE id_projet='"+idProjet+"'  AND id_form='"+idForm+"' ";  
                       var querySelectData = " SELECT id, data FROM dynamicData WHERE id_projet='"+idProjet+"' ";  

                       $cordovaSQLite.execute(db, querySelectData).then(function(res) {

                             $scope.nonGeomData = [];
                             for(var i = 0; i<res.rows.length; i++){
                                    var id = res.rows.item(i).id;
                                    console.info(res.rows.item(i).id);
                                    console.info(res.rows.item(i).data);
                                    console.info( JSON.parse(res.rows.item(i).data));
                                    var input = JSON.parse(res.rows.item(i).data)[0].data;
                                    console.info(input[0]);
                                    var data = input[0];
                                    var numero = data.numero;
                                    console.info(numero);
                                    if(numero>=num){
                                           num = numero;
                                    }
                                    
                                    $scope.nonGeomData.push({id: id, numero: numero});
                             }
                              console.info($scope.nonGeomData);
                             if(num==0){
                                  num++;
                                  nonGeomtricData.setNumero(num); 
                              }else{
                                  num++;
                                  nonGeomtricData.setNumero(num); 
                              }
                              deferred.resolve();
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+err+ " "+querySelectData);
                       });    

                        return deferred.promise;
                }

               $scope.goAlphanumerique=function(){
                      
                       loadNonGeometricProjetForm().then(function(){
                            loadNonGeometricData().then(function(){
                                console.info($scope.nonGeomData);
                                 
                                 let  html =`<ion-modal-view id="ayoub" style="width: 40%; height: 50%; top: 25%; left: 25%; right: 30%; bottom: 30%;">`;
                                 html+=  `<ion-header-bar class="bar bar-header bar-balanced">`;
                                 html+=  ` <h1 class = "title">{{nomProjetEncours}}</h1>`;
                                 html+=  ` </ion-header-bar>`;
                                 html+=  ` <ion-content class="padding"  has-header="true">`;
                                 html+=  `<ion-list>`;
                                 html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in nonGeomData" type="item-text-wrap" ng-click="updateFormById(ngd.id, ngd.numero)">`;
                                 html+=  `Exploitation N° {{ngd.numero}}`;
                                 html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                 html+=  ` </ion-item>`;
                                 html+=  ` </ion-list>`;
                                 html+= `<div class = "button-bar"><a class = "button button-dark" ng-click="hideModalRender()">Retour</a>`;
                                 html+= `<a class = "button button-balanced" ng-click="OpenNewNonGeometricForm()">Nouveau</a></div> `;
                                 html+= `</ion-content></ion-modal-view>`;

                                 $scope.modalRender  = new $ionicModal.fromTemplate(html, {
                                        scope: $scope,
                                        focusFirstInput:true,
                                        backdropClickToClose:false,
                                        hardwareBackButtonClose:false
                                 });

                                 $scope.modalRender.show();

                            });
                       });
                }

                $scope.hideModalRender=function(){
                       $scope.modalRender.remove();
                }

              loadNonGeometricForm=function(){

                      var deferred = $q.defer();
                        var querySelectedProject = " SELECT _id FROM projets WHERE checkd =1 ";  

                                 $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                       
                                        if(res.rows.length > 0) {                            
                                                for (var i = 0; i < res.rows.length ; i++) {
                                                       $scope.selectedProject = res.rows.item(i)._id;
                                                        var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+$scope.selectedProject+"'";
   
                                                        $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                                                               console.info(res.rows.length);
                                                               console.info("res.rows.item(0).geometry");
                                                               console.info(res.rows.item(0).geometry);
                                                               if( (res.rows.length > 0) && (res.rows.item(0).geometry=="none") ){
                                                                // $scope.formNonGeomData = res.rows.item(0).fields;
                                                                nonGeomtricData.setIdProjet($scope.selectedProject);
                                                                nonGeomtricData.setIdForm(res.rows.item(0).id_fields);
                                                                nonGeomtricData.setFormData(res.rows.item(0).fields);
                                                                deferred.resolve();
                                                               }else{
                                                                  // Table des Forms est vide !!
                                                               } 

                                                       }, function (err) {
                                                              console.info("err => "+err+ " "+querySelectForms);
                                                       });    
                                                        //----------------------------------------------------------------------------------------------------//                                                                                                                                                                                                  
                                                }

                                         }else{
                                                 // Table des Projets est vide !!
                                         } 

                                 }, function (err) {
                                        console.info(err);
                                        console.info("err => "+querySelectedProject);
                                 });    
                       return deferred.promise;
                }
                             
              $scope.OpenNewNonGeometricForm=function(){
                      $scope.modalRender.remove();
                       nonGeomtricData.setIdToUpdate(undefined);
                       nonGeomtricData.setDataToUpdate({});
                       $state.go('sansgeometrie', {}, {reload: true});                    
                }

              getNonGeometricDataById=function(id, num){
                      var deferred = $q.defer();
                      var sql = "SELECT data FROM dynamicData WHERE id ='"+id+"' ";
                      $cordovaSQLite.execute(db, sql).then(function(res) {
                      
                         var input = JSON.parse(res.rows.item(0).data)[0].data;
                         var numero = input[0].numero;
                         var data;
                         var capture;
                         if(numero == num){
                              data = input[0].formdata;
                              nonGeomtricData.setDataToUpdate(data);
                              console.info(nonGeomtricData.getDataToUpdate());
                              deferred.resolve();
                         }
                                                    
                       }, function (err) {
                          console.log('ERR SQL sqlInsertData= '+sqlInsertData);
                      });       

                      return deferred.promise;    
                }

              $scope.updateFormById=function(id, numero){
                      $scope.modalRender.remove();
                     nonGeomtricData.setIdToUpdate(id);
                     nonGeomtricData.setNumero(numero);
                     getNonGeometricDataById(id, nonGeomtricData.getNumero()).then(function(){
                          $state.go('sansgeometrie', {}, {reload: true});
                     });                 
                }

               //------------------------------------------------------------------------//

               //------------------------------------------------------------------------//

                /////////////////////////////////////////////////////////////////////////////////////////////////////

});



app.controller("sansgeometrie",function($scope, $cordovaSQLite, $localStorage, $http, $state,$q , $cordovaGeolocation, $cordovaCamera, $ionicLoading, nonGeomtricData, $timeout, UserService, $cordovaNetwork,  $ionicPlatform, ionicToast, $ionicPopup, $rootScope){

       $scope.goParametrage = function(){
              $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
        };

        Number.prototype.padLeft = function(base,chr){
                 var  len = (String(base || 10).length - String(this).length)+1;
                 return len > 0? new Array(len).join(chr || '0')+this : this;
        }
         
        $scope.formattedDate=function() {
               var d = new Date;
               var dformat = [ d.getFullYear(),(d.getMonth()+1).padLeft(),d.getDate().padLeft() ].join('-')+' ' +[d.getHours().padLeft(),d.getMinutes().padLeft(),d.getSeconds().padLeft()].join(':');
               return dformat;
        }
    
        $scope.loginG=$localStorage.loginParam;

        $scope.IdToUpdate=nonGeomtricData.getIdToUpdate();
        $scope.formdata=nonGeomtricData.getDataToUpdate();

        $scope.numero=nonGeomtricData.getNumero();
        $scope.idProject=nonGeomtricData.getIdProjet();
        $scope.idForm=nonGeomtricData.getIdForm();
        $scope.formNonGeomData=JSON.parse(nonGeomtricData.getFormData());

        console.info(nonGeomtricData.getFormData());
        // alert($scope.numero);

         var sqlGetFormName= " SELECT name FROM formulaires WHERE id_fields='"+$scope.idForm+"' ";
         console.info(sqlGetFormName);
         $cordovaSQLite.execute(db, sqlGetFormName).then(function(res) {
               console.info(res);
               if(res.rows.length>0){$scope.formname = res.rows.item(0).name;}
            
          }, function (err) {
            console.log(err);
            console.log('ERR SQL sqlGetFormName= '+sqlGetFormName);
         }); 

    
        //===================================================================//
       
        $scope.$on('formSubmit', function(err, submission) { 
   
                console.info(JSON.stringify(submission.data));
                var obj = {
                    numero: $scope.numero, 
                    date_creation: $scope.formattedDate(), 
                    formdata : submission
                };
                var object = [];
                var collecte = [];
                object.push(obj);
                  var data = {"type": "none", "form": $scope.idForm, "formname": $scope.formname, "data":object};
                  collecte.push(data);


                if($scope.IdToUpdate!=undefined){
                      updateNonGeometricData($scope.IdToUpdate, JSON.stringify(collecte)).then(function(){
                        ionicToast.hide();
                             $state.go('menu', {}, {reload: true});
                      });
                }else{
                      registerNonGeometricData($scope.idProject, JSON.stringify(collecte)).then(function(){
                              ionicToast.hide();
                              $state.go('menu', {}, {reload: true});
                      });
                }
             
        });

        //===================================================================//

        function registerNonGeometricData(id_projet, data){
                var deferred = $q.defer();
                var sqlInsertData= "INSERT INTO dynamicData (id_projet, data, geo, sync) VALUES(?,?,?,?)";
                $cordovaSQLite.execute(db, sqlInsertData,[id_projet, id_exp, superficie, lat, lng, data, "false",  0]).then(function(res) {
                  deferred.resolve();
                 }, function (err) {
                    console.log(err);
                    console.log('ERR SQL sqlInsertData= '+sqlInsertData);
                 }); 
                return deferred.promise;
         }

        function updateNonGeometricData(id, data){
                var deferred = $q.defer();
                var sqlUpdateData= " UPDATE dynamicData SET data='"+data+"' WHERE id='"+id+"' ";
                console.info(sqlUpdateData);

                $cordovaSQLite.execute(db, sqlUpdateData).then(function(res) {
                      console.info("Update avec succès");
                     deferred.resolve();
                 }, function (err) {
                    console.log('ERR SQL sqlUpdateData= '+sqlUpdateData);
                }); 

                return deferred.promise;
        }
       
});

app.controller("dashboardCtrl",function($scope, $cordovaSQLite, $localStorage, $cordovaCamera, $http, $state, $ionicLoading, $timeout, UserService, $cordovaNetwork,  $ionicPlatform, ionicToast, $ionicPopup, $rootScope){

    //===================================================================//
              $scope.captureImage = function() {
                      // alert("wii camera");
                      var options = {
                          quality: 20,
                          destinationType: Camera.DestinationType.DATA_URL,
                          sourceType: Camera.PictureSourceType.CAMERA,
                          targetWidth: 512,
                          targetHeight: 512,
                          // allowEdit: false,
                          encodingType: Camera.EncodingType.JPEG,
                          popoverOptions: CameraPopoverOptions,
                          saveToPhotoAlbum: false,
                          allowEdit: true
                      };
                    

                      $cordovaCamera.getPicture(options).then(function(imageData) {
                          $scope.imgURI = "data:image/jpeg;base64," + imageData;
                          // alert($scope.imgURI);
                      }, function(err) {
                          // alert("An error Occured");
                          // alert(err);
                      });

                }
    //===================================================================//


    $scope.formdd ={
        "_id": {
            "$oid": "59ca32a3e2d6771ea078f54b"
        },
        "form": "_5v50okhd2",
        "display": "form",
        "components": [
            {
                "properties": {
                    "": ""
                },
                "conditional": {
                    "eq": "",
                    "when": null,
                    "show": ""
                },
                "tags": [],
                "breadcrumb": "default",
                "tableView": true,
                "theme": "primary",
                "clearOnHide": false,
                "key": "page1",
                "input": false,
                "components": [
                    {
                        "clearOnHide": false,
                        "input": false,
                        "tableView": true,
                        "key": "page1Columns",
                        "columns": [
                            {
                                "components": [
                                    {
                                        "isNew": false,
                                        "lockKey": true,
                                        "input": true,
                                        "tableView": true,
                                        "inputType": "number",
                                        "label": "N° de la parcelle",
                                        "key": "Parcelle-numero",
                                        "placeholder": "",
                                        "prefix": "",
                                        "suffix": "",
                                        "defaultValue": "",
                                        "protected": false,
                                        "persistent": true,
                                        "hidden": false,
                                        "clearOnHide": true,
                                        "validate": {
                                            "required": false,
                                            "min": 1,
                                            "max": "",
                                            "step": "any",
                                            "integer": "",
                                            "multiple": "",
                                            "custom": ""
                                        },
                                        "type": "number",
                                        "tags": [],
                                        "conditional": {
                                            "show": "",
                                            "when": null,
                                            "eq": ""
                                        },
                                        "properties": {
                                            "": ""
                                        },
                                        "disabled": true
                                    },
                                    {
                                        "input": true,
                                        "tableView": true,
                                        "inputType": "number",
                                        "label": "N° Exploitation où se trouve  la parcelle",
                                        "key": "page1ColumnsNdelaparcelle3",
                                        "placeholder": "",
                                        "prefix": "",
                                        "suffix": "",
                                        "defaultValue": "",
                                        "protected": false,
                                        "persistent": true,
                                        "hidden": false,
                                        "clearOnHide": true,
                                        "validate": {
                                            "required": false,
                                            "min": 1,
                                            "max": "",
                                            "step": "any",
                                            "integer": "",
                                            "multiple": "",
                                            "custom": ""
                                        },
                                        "type": "number",
                                        "tags": [],
                                        "conditional": {
                                            "show": "",
                                            "when": null,
                                            "eq": ""
                                        },
                                        "properties": {
                                            "": ""
                                        },
                                        "disabled": true
                                    },
                                    {
                                        "properties": {
                                            "": ""
                                        },
                                        "tags": [],
                                        "type": "textfield",
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "validate": {
                                            "customPrivate": false,
                                            "custom": "",
                                            "pattern": "",
                                            "maxLength": "",
                                            "minLength": "",
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "unique": false,
                                        "protected": false,
                                        "defaultValue": "",
                                        "multiple": false,
                                        "suffix": "",
                                        "prefix": "",
                                        "placeholder": "",
                                        "key": "page1ColumnsTextField",
                                        "label": "N° Ortho où se trouve  la parcelle",
                                        "inputMask": "",
                                        "inputType": "text",
                                        "tableView": true,
                                        "input": true
                                    },
                                    {
                                        "lockKey": true,
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "tags": [],
                                        "type": "number",
                                        "validate": {
                                            "custom": "",
                                            "multiple": "",
                                            "integer": "",
                                            "step": "any",
                                            "max": "",
                                            "min": 0,
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "defaultValue": "0",
                                        "suffix": "",
                                        "prefix": "",
                                        "placeholder": "",
                                        "key": "Parcelle-superficiePar",
                                        "label": "Superficie de la parcelle en Ha  (Déclarée)",
                                        "inputType": "number",
                                        "tableView": true,
                                        "input": true
                                    },
                                    {
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "tags": [],
                                        "type": "number",
                                        "validate": {
                                            "custom": "",
                                            "multiple": "",
                                            "integer": "",
                                            "step": "any",
                                            "max": "",
                                            "min": 0,
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "defaultValue": "",
                                        "suffix": "",
                                        "prefix": "",
                                        "placeholder": "",
                                        "key": "page1SuperficiedelaparcelleenHaDclare2",
                                        "label": "Superficie de la parcelle en Ha  (Calculée)",
                                        "inputType": "number",
                                        "tableView": true,
                                        "input": true,
                                        "disabled": true
                                    },
                                    {
                                        "lockKey": true,
                                        "input": true,
                                        "tableView": true,
                                        "inputType": "radio",
                                        "label": "Mode de faire valoir",
                                        "key": "Parcelle-modeFaireV",
                                        "values": [
                                            {
                                                "value": "1",
                                                "label": "Direct"
                                            },
                                            {
                                                "value": "2",
                                                "label": "Location en espèce"
                                            },
                                            {
                                                "value": "3",
                                                "label": "Prise en association"
                                            },
                                            {
                                                "value": "4",
                                                "label": "Mogharassa"
                                            },
                                            {
                                                "value": "5",
                                                "label": "Autre-Indirect"
                                            }
                                        ],
                                        "defaultValue": "",
                                        "protected": false,
                                        "persistent": true,
                                        "hidden": false,
                                        "clearOnHide": true,
                                        "validate": {
                                            "required": false,
                                            "custom": "",
                                            "customPrivate": false
                                        },
                                        "type": "radio",
                                        "tags": [],
                                        "conditional": {
                                            "show": "",
                                            "when": null,
                                            "eq": ""
                                        },
                                        "properties": {
                                            "": ""
                                        }
                                    },
                                    {
                                        "lockKey": true,
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "tags": [],
                                        "type": "radio",
                                        "validate": {
                                            "customPrivate": false,
                                            "custom": "",
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "defaultValue": "",
                                        "values": [
                                            {
                                                "label": "Melk titré",
                                                "value": "1"
                                            },
                                            {
                                                "label": "Melk avec Molkia",
                                                "value": "2"
                                            },
                                            {
                                                "label": "Melk sans Molkia",
                                                "value": "3"
                                            },
                                            {
                                                "label": "Collectif",
                                                "value": "4"
                                            },
                                            {
                                                "label": "Habous",
                                                "value": "6"
                                            },
                                            {
                                                "label": "Domaine de l'Etat",
                                                "value": "5"
                                            },
                                            {
                                                "label": "Guiche",
                                                "value": "8"
                                            },
                                            {
                                                "label": "Reforme agraire",
                                                "value": "9"
                                            },
                                            {
                                                "label": "Domaine forestier",
                                                "value": "7"
                                            }
                                        ],
                                        "key": "Parcelle-statusJuri",
                                        "label": "Statut juridique",
                                        "inputType": "radio",
                                        "tableView": true,
                                        "input": true
                                    },
                                    {
                                        "lockKey": true,
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "type": "selectboxes",
                                        "validate": {
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "inline": false,
                                        "values": [
                                            {
                                                "label": "Achat",
                                                "value": "1"
                                            },
                                            {
                                                "label": "Héritage",
                                                "value": "2"
                                            },
                                            {
                                                "label": "Partage Collectif",
                                                "value": "3"
                                            },
                                            {
                                                "label": "Don",
                                                "value": "4"
                                            },
                                            {
                                                "label": "Autre",
                                                "value": "5"
                                            }
                                        ],
                                        "key": "Parcelle-accessTerre",
                                        "label": "Mode d'acces à la terre",
                                        "tableView": true,
                                        "input": true
                                    },
                                    {
                                        "lockKey": true,
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "tags": [],
                                        "type": "radio",
                                        "validate": {
                                            "customPrivate": false,
                                            "custom": "",
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "defaultValue": "",
                                        "values": [
                                            {
                                                "label": "Oui",
                                                "value": "oui"
                                            },
                                            {
                                                "label": "Non",
                                                "value": "non"
                                            }
                                        ],
                                        "key": "Parcelle-indivision",
                                        "label": "Indivision",
                                        "inputType": "radio",
                                        "tableView": true,
                                        "input": true,
                                        "isNew": false
                                    },
                                    {
                                        "customError": "erreur de sélection",
                                        "lockKey": true,
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "type": "selectboxes",
                                        "validate": {
                                            "custom": "valid = (\n           (\n             data.Parcelle000miseValeur[1]===true \n            &&(\n                (data.Parcelle000miseValeur[2]===false)\n                 &&\n                (data.Parcelle000miseValeur[3]===false)\n                 &&\n                (data.Parcelle000miseValeur[4]===false)\n                 &&\n                (data.Parcelle000miseValeur[5]===false)\n\t\t\t\t&&\n                (data.Parcelle000miseValeur[6]===false)\n               )\n            )\n                     ||\n           (\n              data.Parcelle000miseValeur[1]===false \n             &&(\n                (data.Parcelle000miseValeur[2]===true)\n                 ||\n               (data.Parcelle000miseValeur[3]===true)\n                 ||\n               (data.Parcelle000miseValeur[4]===true)\n                 ||\n               (data.Parcelle000miseValeur[5]===true)\n\t\t\t     ||\n                (data.Parcelle000miseValeur[6]===true)\n               )  \n            )\n\t\t\t\n\t\t)?true:'erreur de sélection';",
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "inline": false,
                                        "values": [
                                            {
                                                "label": "Bour",
                                                "value": "1"
                                            },
                                            {
                                                "label": "Irrigable Grande Hydraulique",
                                                "value": "2"
                                            },
                                            {
                                                "label": "Irrigable PMH",
                                                "value": "3"
                                            },
                                            {
                                                "label": "Irrigable Privé",
                                                "value": "4"
                                            },
                                            {
                                                "label": "Eau de cru",
                                                "value": "5"
                                            },
                                            {
                                                "label": "Irrigable autres",
                                                "value": "6"
                                            }
                                        ],
                                        "key": "Parcelle000miseValeur",
                                        "label": "Mise en valeur",
                                        "tableView": true,
                                        "input": true
                                    }
                                ],
                                "width": 6,
                                "offset": 0,
                                "push": 0,
                                "pull": 0
                            },
                            {
                                "components": [
                                    {
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "1",
                                            "when": "Parcelle000miseValeur",
                                            "show": "false"
                                        },
                                        "tags": [],
                                        "type": "well",
                                        "tableView": true,
                                        "components": [
                                            {
                                                "lockKey": true,
                                                "properties": {
                                                    "": ""
                                                },
                                                "conditional": {
                                                    "eq": "",
                                                    "when": null,
                                                    "show": ""
                                                },
                                                "tags": [],
                                                "type": "radio",
                                                "validate": {
                                                    "customPrivate": false,
                                                    "custom": "",
                                                    "required": false
                                                },
                                                "clearOnHide": true,
                                                "hidden": false,
                                                "persistent": true,
                                                "protected": false,
                                                "defaultValue": "",
                                                "values": [
                                                    {
                                                        "label": "Oui",
                                                        "value": "oui"
                                                    },
                                                    {
                                                        "label": "Non",
                                                        "value": "non"
                                                    }
                                                ],
                                                "key": "Parcelle-irriguee",
                                                "label": "Irriguée",
                                                "inputType": "radio",
                                                "tableView": true,
                                                "input": true
                                            },
                                            {
                                                "lockKey": true,
                                                "conditional": {
                                                    "eq": "",
                                                    "when": null,
                                                    "show": ""
                                                },
                                                "type": "selectboxes",
                                                "validate": {
                                                    "required": false
                                                },
                                                "clearOnHide": true,
                                                "hidden": false,
                                                "persistent": true,
                                                "protected": false,
                                                "inline": false,
                                                "values": [
                                                    {
                                                        "label": "Puits ou forage",
                                                        "value": "1"
                                                    },
                                                    {
                                                        "label": "Barrage",
                                                        "value": "2"
                                                    },
                                                    {
                                                        "label": "Oued",
                                                        "value": "3"
                                                    },
                                                    {
                                                        "label": "Source",
                                                        "value": "4"
                                                    },
                                                    {
                                                        "label": "Khettara",
                                                        "value": "5"
                                                    },
                                                    {
                                                        "label": "Épandage eau de cru",
                                                        "value": "6"
                                                    },
                                                    {
                                                        "label": "Eaux usées",
                                                        "value": "7"
                                                    },
                                                    {
                                                        "label": "Dessalement",
                                                        "value": "8"
                                                    }
                                                ],
                                                "key": "Parcelle-sourceIrrigation",
                                                "label": "Source d'irrigation",
                                                "tableView": true,
                                                "input": true
                                            },
                                            {
                                                "lockKey": true,
                                                "conditional": {
                                                    "eq": "",
                                                    "when": null,
                                                    "show": ""
                                                },
                                                "type": "selectboxes",
                                                "validate": {
                                                    "required": false
                                                },
                                                "clearOnHide": true,
                                                "hidden": false,
                                                "persistent": true,
                                                "protected": false,
                                                "inline": false,
                                                "values": [
                                                    {
                                                        "label": "Gravitaire",
                                                        "value": "1"
                                                    },
                                                    {
                                                        "label": "Aspersion",
                                                        "value": "2"
                                                    },
                                                    {
                                                        "label": "Localisée",
                                                        "value": "3"
                                                    },
                                                    {
                                                        "label": "Pivot",
                                                        "value": "4"
                                                    }
                                                ],
                                                "key": "Parcelle-modeIrrigation",
                                                "label": "Mode d'irrigation",
                                                "tableView": true,
                                                "input": true
                                            },
                                            {
                                                "customError": "erreur de sélection",
                                                "lockKey": true,
                                                "input": true,
                                                "tableView": true,
                                                "label": "Type d\u2019énergie utilisée pour le pompage",
                                                "key": "Parcelle000typeEnergie",
                                                "values": [
                                                    {
                                                        "value": "1",
                                                        "label": "Gasoil"
                                                    },
                                                    {
                                                        "label": "Gaz butane",
                                                        "value": "2"
                                                    },
                                                    {
                                                        "label": "Réseau électricité",
                                                        "value": "3"
                                                    },
                                                    {
                                                        "label": "Solaire",
                                                        "value": "4"
                                                    },
                                                    {
                                                        "label": "Éolienne",
                                                        "value": "5"
                                                    },
                                                    {
                                                        "label": "Energie animale",
                                                        "value": "6"
                                                    },
                                                    {
                                                        "label": "Pas de pompage",
                                                        "value": "7"
                                                    }
                                                ],
                                                "inline": false,
                                                "protected": false,
                                                "persistent": true,
                                                "hidden": false,
                                                "clearOnHide": true,
                                                "validate": {
                                                    "custom": "valid = (\n           (\n             data.Parcelle000typeEnergie[7]===true \n            &&(\n                (data.Parcelle000typeEnergie[1]===false)\n                 &&\n                (data.Parcelle000typeEnergie[2]===false)\n                 &&\n                (data.Parcelle000typeEnergie[3]===false)\n                 &&\n                (data.Parcelle000typeEnergie[4]===false)\n                 &&\n                (data.Parcelle000typeEnergie[5]===false)\n\t\t\t\t&&\n                (data.Parcelle000typeEnergie[6]===false)\n               )\n            )\n                     ||\n           (\n              data.Parcelle000typeEnergie[7]===false \n             &&(\n                (data.Parcelle000typeEnergie[1]===true)\n                 ||\n                (data.Parcelle000typeEnergie[2]===true)\n                 ||\n               (data.Parcelle000typeEnergie[3]===true)\n                 ||\n               (data.Parcelle000typeEnergie[4]===true)\n                 ||\n               (data.Parcelle000typeEnergie[5]===true)\n\t\t\t     ||\n                (data.Parcelle000typeEnergie[6]===true)\n               )  \n            )\n\t\t\t\n\t\t)?true:'erreur de sélection';",
                                                    "required": false
                                                },
                                                "type": "selectboxes",
                                                "conditional": {
                                                    "show": "",
                                                    "when": null,
                                                    "eq": ""
                                                }
                                            }
                                        ],
                                        "input": false,
                                        "key": "page1ColumnsWell",
                                        "clearOnHide": false,
                                        "customConditional": ""
                                    },
                                    {
                                        "lockKey": true,
                                        "properties": {
                                            "": ""
                                        },
                                        "conditional": {
                                            "eq": "",
                                            "when": null,
                                            "show": ""
                                        },
                                        "tags": [],
                                        "type": "radio",
                                        "validate": {
                                            "customPrivate": false,
                                            "custom": "",
                                            "required": false
                                        },
                                        "clearOnHide": true,
                                        "hidden": false,
                                        "persistent": true,
                                        "protected": false,
                                        "defaultValue": "",
                                        "values": [
                                            {
                                                "label": "Non",
                                                "value": "1"
                                            },
                                            {
                                                "label": "Canarienne",
                                                "value": "2"
                                            },
                                            {
                                                "label": "Multi-chapelle",
                                                "value": "3"
                                            },
                                            {
                                                "label": "Grande tunnel",
                                                "value": "4"
                                            },
                                            {
                                                "label": "Petit tunnel",
                                                "value": "5"
                                            },
                                            {
                                                "label": "Autre serre",
                                                "value": "6"
                                            }
                                        ],
                                        "key": "Parcelle-serre",
                                        "label": "Sous abris Serre",
                                        "inputType": "radio",
                                        "tableView": true,
                                        "input": true,
                                        "isNew": false
                                    },
                                    {
                                        "condensed": true,
                                        "hover": true,
                                        "bordered": false,
                                        "input": true,
                                        "tree": true,
                                        "components": [
                                            {
                                                "clearOnHide": false,
                                                "key": "page1ColumnsWell2",
                                                "input": false,
                                                "components": [
                                                    {
                                                        "input": true,
                                                        "tableView": true,
                                                        "label": "Cultures ou Utilisation",
                                                        "key": "Culture-nomCulture",
                                                        "placeholder": "",
                                                        "data": {
                                                            "values": [
                                                                {
                                                                    "value": "bleDur",
                                                                    "label": "Blé dur"
                                                                },
                                                                {
                                                                    "value": "olivier",
                                                                    "label": "Olivier"
                                                                },
                                                                {
                                                                    "value": "betteraveASucre",
                                                                    "label": "Betterave a sucre"
                                                                }
                                                            ],
                                                            "json": "",
                                                            "url": "",
                                                            "resource": "",
                                                            "custom": ""
                                                        },
                                                        "dataSrc": "values",
                                                        "valueProperty": "",
                                                        "defaultValue": "",
                                                        "refreshOn": "",
                                                        "filter": "",
                                                        "authenticate": false,
                                                        "template": "<span>{{ item.label }}<\/span>",
                                                        "multiple": false,
                                                        "protected": false,
                                                        "unique": false,
                                                        "persistent": true,
                                                        "hidden": false,
                                                        "clearOnHide": true,
                                                        "validate": {
                                                            "required": false
                                                        },
                                                        "type": "select",
                                                        "tags": [],
                                                        "conditional": {
                                                            "show": "",
                                                            "when": null,
                                                            "eq": ""
                                                        },
                                                        "properties": {
                                                            "": ""
                                                        },
                                                        "lockKey": true,
                                                        "isNew": false
                                                    },
                                                    {
                                                        "input": true,
                                                        "tableView": true,
                                                        "label": "Irriguée",
                                                        "key": "ParcelleCulture-irriguee",
                                                        "placeholder": "",
                                                        "data": {
                                                            "values": [
                                                                {
                                                                    "value": "oui",
                                                                    "label": "Oui"
                                                                },
                                                                {
                                                                    "value": "non",
                                                                    "label": "Non"
                                                                }
                                                            ],
                                                            "json": "",
                                                            "url": "",
                                                            "resource": "",
                                                            "custom": ""
                                                        },
                                                        "dataSrc": "values",
                                                        "valueProperty": "",
                                                        "defaultValue": "",
                                                        "refreshOn": "",
                                                        "filter": "",
                                                        "authenticate": false,
                                                        "template": "<span>{{ item.label }}<\/span>",
                                                        "multiple": false,
                                                        "protected": false,
                                                        "unique": false,
                                                        "persistent": true,
                                                        "hidden": false,
                                                        "clearOnHide": true,
                                                        "validate": {
                                                            "required": false
                                                        },
                                                        "type": "select",
                                                        "tags": [],
                                                        "conditional": {
                                                            "show": "",
                                                            "when": null,
                                                            "eq": ""
                                                        },
                                                        "properties": {
                                                            "": ""
                                                        },
                                                        "lockKey": true
                                                    },
                                                    {
                                                        "input": true,
                                                        "tableView": true,
                                                        "inputType": "number",
                                                        "label": "Superficie du champ en Ha",
                                                        "key": "ParcelleCulture-superficie",
                                                        "placeholder": "",
                                                        "prefix": "",
                                                        "suffix": "",
                                                        "defaultValue": "",
                                                        "protected": false,
                                                        "persistent": true,
                                                        "hidden": false,
                                                        "clearOnHide": true,
                                                        "validate": {
                                                            "required": false,
                                                            "min": 0,
                                                            "max": "",
                                                            "step": "any",
                                                            "integer": "",
                                                            "multiple": "",
                                                            "custom": ""
                                                        },
                                                        "type": "number",
                                                        "tags": [],
                                                        "conditional": {
                                                            "show": "",
                                                            "when": null,
                                                            "eq": ""
                                                        },
                                                        "properties": {
                                                            "": ""
                                                        },
                                                        "lockKey": true
                                                    },
                                                    {
                                                        "input": true,
                                                        "tableView": true,
                                                        "label": "Mode de production",
                                                        "key": "ParcelleCulture-modeProduction",
                                                        "placeholder": "",
                                                        "data": {
                                                            "values": [
                                                                {
                                                                    "value": "1",
                                                                    "label": "Culture principale"
                                                                },
                                                                {
                                                                    "value": "2",
                                                                    "label": "Sous étage"
                                                                },
                                                                {
                                                                    "value": "3",
                                                                    "label": "En succession"
                                                                },
                                                                {
                                                                    "value": "4",
                                                                    "label": "En association"
                                                                },
                                                                {
                                                                    "value": "5",
                                                                    "label": "Arbre intercalaire"
                                                                },
                                                                {
                                                                    "value": "6",
                                                                    "label": "Plantation dispersée"
                                                                },
                                                                {
                                                                    "value": "7",
                                                                    "label": "Arbre sans terre"
                                                                }
                                                            ],
                                                            "json": "",
                                                            "url": "",
                                                            "resource": "",
                                                            "custom": ""
                                                        },
                                                        "dataSrc": "values",
                                                        "valueProperty": "",
                                                        "defaultValue": "",
                                                        "refreshOn": "",
                                                        "filter": "",
                                                        "authenticate": false,
                                                        "template": "<span>{{ item.label }}<\/span>",
                                                        "multiple": false,
                                                        "protected": false,
                                                        "unique": false,
                                                        "persistent": true,
                                                        "hidden": false,
                                                        "clearOnHide": true,
                                                        "validate": {
                                                            "required": false
                                                        },
                                                        "type": "select",
                                                        "tags": [],
                                                        "conditional": {
                                                            "show": "",
                                                            "when": null,
                                                            "eq": ""
                                                        },
                                                        "properties": {
                                                            "": ""
                                                        },
                                                        "description": "(1=Culture principale ; 2=Sous étage ; 3=En succession ; 4=En association ; 5=Arbre intercalaire ; 6=Plantation dispersée ; 7=Arbre sans terre)",
                                                        "lockKey": true,
                                                        "isNew": false
                                                    },
                                                    {
                                                        "input": true,
                                                        "tableView": true,
                                                        "inputType": "number",
                                                        "label": "Nombre de pieds",
                                                        "key": "ParcelleCulture-nbrPied",
                                                        "placeholder": "",
                                                        "prefix": "",
                                                        "suffix": "",
                                                        "defaultValue": "",
                                                        "protected": false,
                                                        "persistent": true,
                                                        "hidden": false,
                                                        "clearOnHide": true,
                                                        "validate": {
                                                            "required": false,
                                                            "min": 0,
                                                            "max": "",
                                                            "step": "any",
                                                            "integer": "",
                                                            "multiple": "",
                                                            "custom": ""
                                                        },
                                                        "type": "number",
                                                        "tags": [],
                                                        "conditional": {
                                                            "show": "",
                                                            "when": null,
                                                            "eq": ""
                                                        },
                                                        "properties": {
                                                            "": ""
                                                        },
                                                        "lockKey": true
                                                    }
                                                ],
                                                "tableView": true,
                                                "type": "well",
                                                "hideLabel": true,
                                                "tags": [],
                                                "conditional": {
                                                    "show": "",
                                                    "when": null,
                                                    "eq": ""
                                                },
                                                "properties": {
                                                    "": ""
                                                }
                                            }
                                        ],
                                        "tableView": true,
                                        "label": "",
                                        "key": "page1ColumnsAjoutezunecultureouutilisation",
                                        "protected": false,
                                        "persistent": true,
                                        "hidden": false,
                                        "clearOnHide": true,
                                        "type": "datagrid",
                                        "tags": [],
                                        "conditional": {
                                            "show": "",
                                            "when": null,
                                            "eq": ""
                                        },
                                        "properties": {
                                            "": ""
                                        },
                                        "addAnother": "Ajoutez une culture ou utilisation",
                                        "striped": false
                                    }
                                ],
                                "width": 6,
                                "offset": 0,
                                "push": 0,
                                "pull": 0
                            }
                        ],
                        "type": "columns",
                        "tags": [],
                        "conditional": {
                            "show": "",
                            "when": null,
                            "eq": ""
                        },
                        "properties": {
                            "": ""
                        }
                    }
                ],
                "title": "Parcelle",
                "type": "panel"
            },
            {
                "type": "button",
                "theme": "primary",
                "disableOnInvalid": false,
                "action": "submit",
                "block": false,
                "rightIcon": "",
                "leftIcon": "",
                "size": "md",
                "key": "submit",
                "tableView": false,
                "label": "Submit",
                "input": true
            }
        ],
        "__v": 0
    };

    $scope.formCreator = function(){


          var formio = new  Formio.createForm(document.getElementById('formio'),  $scope.dataF);

           // var formio = new Formio('https://examples.form.io/example');
           // formio.loadForm().then(function(form) {
           formio.then(function(form) {

             // Log the form schema.
             console.log(form.data);
             form.data.lastName = "benyassin";
          });

          //   Formio.createForm(document.getElementById('formio'), {
          //   components: [
          //     {
          //       type: 'textfield',
          //       key: 'firstName',
          //       label: 'First Name',
          //       placeholder: 'Enter your first name.',
          //       input: true
          //     },
          //     {
          //       type: 'textfield',
          //       key: 'lastName',
          //       label: 'Last Name',
          //       placeholder: 'Enter your last name',
          //       input: true
          //     },
          //     {
          //       type: 'button',
          //       action: 'submit',
          //       label: 'Submit',
          //       theme: 'primary'
          //     }
          //   ]
          // }).then(function(form) {
          //   form.on('submit', function(submission) {
          //     console.info(submission);
          //   });
          // });
    }


    $scope.viderUsers = function(){
            var sqlDeleteUsers= " DELETE FROM users";
            $cordovaSQLite.execute(db, sqlDeleteUsers);
            console.info("ok");
    }


    // &&&&&&&&&&&&&&& - Fichiers de bases -  Régions & Provinces  &&&&&&&&&&&&&&& //

    var urlgetRegions = "https://geoapiserver.herokuapp.com/api/perimetre/region";
    var urlgetProvinces = " https://geoapiserver.herokuapp.com/api/perimetre/province/id_region";
    var urlgetAllProvinces = " https://geoapiserver.herokuapp.com/api/perimetre/province";
    var urlgetCommunes = " https://geoapiserver.herokuapp.com/api/perimetre/commune/id_province";


    $scope.uploaderFichiersDeBase=function(){
       $scope.showConfirmUploaderFichiersDeBase();
    }

    $scope.showConfirmUploaderFichiersDeBase=function(){

            var confirmPopup = $ionicPopup.confirm({
               title: 'Téléchargement du découpage géographique',
               template: 'Voulez-vous Télécharger les périmètres géographiques?'
            });
      
           confirmPopup.then(function(res) {
             if(res) {
               console.log('périmètres géographiques OK :)');
                 HttpGetFichierDeBaseRegion(urlgetRegions);
                 HttpGetFichierDeBaseProvince(urlgetAllProvinces);


             }else{
               console.log('périmètres géographiques KO :( ');
             }
           });
    }

    function HttpGetFichierDeBaseRegion(url){

          $http.get(url, {
              headers: {}
          }).then(function (res){
             console.info(res.data);

              var sqlDeleteRegions= "DELETE FROM regions";
              $cordovaSQLite.execute(db, sqlDeleteRegions).then(function(ressource) {
                  console.log("Nombre de regions apres delete : "+ressource.rows.length);
                   $scope.regions=[];
                  for(var i = 0; i<res.data.length; i++){
                        var _id  = res.data[i]._id;                
                        var id_region  = parseInt(res.data[i].id_region);
                        var name  = res.data[i].name;
                        addRegionToDB(_id, id_region, name);
                        $scope.regions.push({
                            _id: _id,
                            id_region: id_region,
                            name: name
                        });
                        console.log("_id > "+_id+", name > "+name+", id_region > "+id_region);
                   }

                   $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> <br/> Téléversement en cours ...',
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                  });                                       
         
                 $timeout(function () {
                   $ionicLoading.hide();
                   ionicToast.show(' Téléversement terminée', 'middle', false, 2500);
                  }, 1000);

               });

           }, 
            function(response) { 
             console.info(response);
             ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
           });
    }

    function HttpGetFichierDeBaseProvince(url){

          $http.get(url, {
              headers: {}
          }).then(function (res){
             console.info(res.data);

              var sqlDeleteProvinces= "DELETE FROM provinces";
              $cordovaSQLite.execute(db, sqlDeleteProvinces).then(function(ressource) {
                  console.log("Nombre de provinces apres delete : "+ressource.rows.length);
                  
                  for(var i = 0; i<res.data.length; i++){
                        var _id  = res.data[i]._id;                
                        var id_region  = parseInt(res.data[i].id_region);
                        var id_province  = parseInt(res.data[i].id_province);
                        var name  = res.data[i].name;
                        addProvinceToDB(_id, id_region, id_province, name);

                        console.log("_id > "+_id+", name > "+name+", id_region > "+id_region+", id_province > "+id_province);
                   }

                   $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> <br/> Téléversement en cours ...',
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                  });                                       
         
                 $timeout(function () {
                   $ionicLoading.hide();
                   ionicToast.show(' Téléversement terminée', 'middle', false, 2500);
                  }, 1000);

               });

           }, 
            function(response) { 
             console.info(response);
             ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
           });
    }

    function addRegionToDB(_id, id_region, name){

              var sqlInsertRegion= "INSERT INTO regions (_id, id_region, name) VALUES(?,?,?)";
                $cordovaSQLite.execute(db, sqlInsertRegion,[_id, id_region, name]);
    }

    function addProvinceToDB(_id, id_region, id_province, name){

              var sqlInsertProvince= "INSERT INTO provinces (_id, id_region, id_province,name) VALUES(?,?,?,?)";
                $cordovaSQLite.execute(db, sqlInsertProvince,[_id, id_region,id_province, name]);
    }

    function loadAllRegions(){
           var querySelectRegions = " SELECT  _id, id_region, name FROM regions";
       
           $cordovaSQLite.execute(db, querySelectRegions).then(function(res) {
              if(res.rows.length > 0) {

                for (var i = 0; i < res.rows.length ; i++) {
                         $scope.regions.push({
                              _id: res.rows.item(i)._id,
                              id_region: res.rows.item(i).id_region,
                              name: res.rows.item(i).name,
                          });
                }

              }else{
                  // Table des Forms est vide !!
              } 

            }, function (err) {
                console.info("err => "+err+ " "+querySelectRegions);
            });     
    }

    $scope.loadChangeProvinces=function(item){
            $localStorage.perimetreProvince=item;
            $scope.perimetreProvince =  $localStorage.perimetreProvince;
    }  

    $scope.loadProvincesByRegion=function(item){

            $localStorage.perimetreRegion=item;
            $scope.perimetreRegion =  $localStorage.perimetreRegion;
            $localStorage.perimetreProvince = "";

            $scope.provinces=[];
           console.info(parseInt(item.id_region));
           var querySelectProvinceByRegion = " SELECT  _id, id_province, name FROM provinces WHERE id_region='"+item.id_region+"'";
           // var querySelectProvinceByRegion = " SELECT  _id, id_province, name FROM provinces WHERE id_region=44.0 ";
           console.info(querySelectProvinceByRegion);
           $cordovaSQLite.execute(db, querySelectProvinceByRegion).then(function(res) {
            console.info("res.rows.length = "+res.rows.length);
              if(res.rows.length > 0) {

                for (var i = 0; i < res.rows.length ; i++) {
                         $scope.provinces.push({
                              _id: res.rows.item(i)._id,
                              id_province: res.rows.item(i).id_province,
                              name: res.rows.item(i).name,
                          });
                }

              }else{
                  // Table des Forms est vide !!
              } 

            }, function (err) {
                console.info("err => "+err+ " "+querySelectProvinceByRegion);
            });     
    }

    // loadAllRegions();

    // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& //

    $scope.goCarte= function(){
      $state.go('carte', {}, {reload: true});
     };   

      urlget = "http://geocoding1.duckdns.org:1111/api.php/Users";
      // urlget = "http://192.168.1.89/api.php/Users";

     url = 'http://geocoding1.duckdns.org:1111/apipost.php';
     // url = 'http://192.168.1.89/apipost.php';

     $scope.deconnecter=function(){
        UserService.login = 'anonymous';
        UserService.loghide = false;
        $state.go('dashboard', {}, {reload: true});
     }

     function HttpGetUsers(urlget){

          console.info(" fct HttpGetUsers ");

            $http.get(urlget).then(function (res){

              console.info(" fct HttpGetUsers then ");
             
             $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner> <br/> Synchronisation en cours ...',
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
             });                                       
         
             $timeout(function () {

               var sqlDeleteUsers= "DELETE FROM users";
               $cordovaSQLite.execute(db, sqlDeleteUsers).then(function(res) {
                  console.log("Nombre users apres delete : "+res.rows.length);
                 });

                for(i = 0; i<res.data.Users.records.length; i++){
                  var login  = res.data.Users.records[i][1];
                   var mdp  = res.data.Users.records[i][2];
                   console.log("log > "+login+", mdp > "+mdp);
                   addUser(login,mdp);
                }

               $ionicLoading.hide();
               ionicToast.show(' Synchronisation terminée', 'middle', false, 2500);
              // }, 1000);
              });
               
            }, 
            function(response) { 
             console.info(response);
             ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
           });          
     }

     function addUser(log,mdp){
        var sqlInsertUsers= "INSERT INTO users (login, motdepasse) VALUES(?,?)";
        console.log(log);
        console.log(mdp);
        $cordovaSQLite.execute(db, sqlInsertUsers,[log,mdp]);
     }

      function checkConnection() {
            
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';

            console.info('Connection type: ' + states[networkState]);
      }

      $scope.showConfirm = function() {
                 var confirmPopup = $ionicPopup.confirm({
                   title: 'Import Utilisateurs',
                   template: 'Voulez-vous vraiment synchroniser les utilisateurs du serveur?'
                 });

                 confirmPopup.then(function(res) {
                   if(res) {
                     console.log('You are sure :)');
                       HttpGetUsers(urlget);

                   } else {
                     console.log('You are not :( ');
                   }
                 });
      };


      $scope.synchroniserUsers=function(){
            
             // var sqlDeleteUsers= "DELETE FROM users";
             // $cordovaSQLite.execute(db, sqlDeleteUsers).then(function(res) {
             //    console.log("Nombre users apres delete : "+res.rows.length);
             //   });
              // A confirm dialog
             
               $scope.showConfirm();               

             // HttpGetUsers(urlget);
        }
});  

