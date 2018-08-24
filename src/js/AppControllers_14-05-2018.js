// Login Controller :
app.controller("LoginCtrl", function($scope,$ionicPlatform, $q, $cordovaSQLite, $ionicLoading, $state, ionicToast, UserService, $localStorage,  $ionicPopup, $http, $timeout, ConnectivityMonitor) {

        $scope.goDashboard= function(){

               $state.go('dashboard', {}, {reload: true});
        };

        $scope.goInscription= function(){
                $state.go('inscription', {}, {reload: true});
        };

        $scope.login = function(log,mdp){
                console.info(log);
                console.info(mdp);
                if(log=="" || log==undefined  || mdp=="" || mdp==undefined){
                         ionicToast.show(' Veuillez saisir le login et le mot de passe !', 'middle', false, 2500);
                  return;
                }

                  $ionicLoading.show({
                          template: '<ion-spinner></ion-spinner> <br/> Connexion en cours ...',
                          content: 'Loading',
                          animation: 'fade-in',
                          showBackdrop: true,
                          maxWidth: 200,
                          showDelay: 0
                  });

               var query = "SELECT login, motdepasse, token, userId FROM users WHERE login = '"+log+"' AND motdepasse =  '"+mdp+"' ";
               console.info(query);
               // $cordovaSQLite.execute(db, query, [log,mdp]).then(function(res) {
               $cordovaSQLite.execute(db, query).then(function(res) {
                       console.info("res.rows.length= "+res.rows.length);
                       if(res.rows.length > 0) {
                                     // alert("kayn f la BD - SELECTED -> " +res.rows.length);
                                     loginGlob=log;
                                     var token = res.rows.item(0).token;
                                     var userId = res.rows.item(0).userId;

                                     $localStorage.loginParam = log;
                                     $localStorage.pwdParam = mdp;
                                     $localStorage.tokenParam = token;
                                     $localStorage.userIdParam = userId;
                                     console.info($localStorage.loginParam+" - "+$localStorage.pwdParam+" - "+$localStorage.tokenParam+" - "+$localStorage.userIdParam);
                                     $timeout(function () {
                                             $ionicLoading.hide();
                                             $state.go('menu');
                                     }, 300);

                       }else{

                              if(!ConnectivityMonitor.isOnline()) {
                                     console.info('nexiste pas dans la base et pas dinternet');
                                     ionicToast.show(' Agent de collecte non existant dans la base de données... et vous n\'êtes pas connecté à Internet !', 'middle', false, 2500);
                                     $ionicLoading.hide();
                              }else{
                                      console.info('nexiste pas dans la base et ya de linternet');
                                      HttpPostUser(log, mdp).then(function(){
                                        console.info('connexion serveur');
                                          $ionicLoading.hide();
                                      });
                              }

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

                // var urlPostUser = "https://geoapiserver.herokuapp.com/api/auth/login";
                var urlPostUser = $localStorage.URLDSS+"/api/auth/login";

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
                var userId = user.userId;
                var email = user.email;
                var role = user.role;
                var nom = user.nom;
                var prenom = user.prenom;
                var telephone = user.telephone;
                var province = user.perimetre.province;
                var region = user.perimetre.region;
               console.info(userId+" , "+log+" , "+mdp+" , "+token+" , "+email+" , "+role+" , "+nom+" , "+prenom+" , "+telephone+" , "+province+" , "+region);
               var sqlInsertUser= "INSERT INTO users (userId, login,motdepasse,token,email,role,nom,prenom,telephone, province,region) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
               $cordovaSQLite.execute(db, sqlInsertUser,[userId,log,mdp,token,email,role,nom,prenom,telephone, JSON.stringify(province) ,JSON.stringify(region)]).then(function(res) {
                       console.info("ééééééééééééééééééééééééééééééééééééééééééééé");
                       $localStorage.loginParam = log;
                       $localStorage.pwdParam = mdp;
                       $localStorage.tokenParam = token;
                       $localStorage.userIdParam = userId;
                       var sqREQ = "SELECT * FROM dynamicData WHERE userId ="+userId;
                      $cordovaSQLite.execute(db, sqREQ).then(function(result) {
                               console.info(sqREQ);
                                if(result.rows.length==0){
                                      getDynamicDataFromServer(userId, token).then(function(){
                                              $ionicLoading.hide();
                                              $state.go('menu');
                                              console.info("finish");
                                      });
                                }else{
                                     // $ionicLoading.hide();
                                     $state.go('menu');
                                }
                       });
                       
               });
        }

        
        function addDataToDynamicData(i){

                var data = $scope.dynamicData[i];
                $scope.count++;

                console.info(data);
                var id_projet = "";
                var numero = "";
                var userId = "";
                var exp = "";
                var dataCollecte = "";
                var geo = "";
                var area = "";
                var id_reg = "";
                var id_prov = "";
                var id_com = "";
                var id_collecte = "";
                var id_projet = data.projet;
                
                console.info(data.numero);
                if(data.numero != undefined){
                     numero = data.numero.split("-")[1];
                     userId = data.numero.split("-")[0];
                }
                
                 exp = JSON.stringify(data.exploitation);
                 dataCollecte = JSON.stringify(data.collecte);
                 geo = data.geo;
                 area = data.superficie;
                 id_reg = data.region;
                 id_prov = data.province;
                 id_com= data.commune;
                 id_collecte = data.id_collecte;

                console.info(id_projet+" , "+ numero+" , "+ userId+" , "+ area+" , "+ exp+" , "+ data+" , "+ id_reg+" , "+ id_prov+" , "+ id_com+" , "+ geo+" , "+ 1+" , "+ id_collecte);

               var deferred = $q.defer();
               var sqlInsertData= "INSERT INTO dynamicData (id_projet, numero, userId, superficie, exploitation, data, id_region, id_province, id_commune, geo, sync, id_collecte) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
                          $cordovaSQLite.execute(db, sqlInsertData,[id_projet, numero, userId, area, exp, dataCollecte, id_reg, id_prov, id_com, geo, 1, id_collecte]).then(function(ressss) {
                                console.info(i);
                               deferred.resolve();
                          });
               return deferred.promise;
        }

        $scope.dynamicData= [];
        $scope.count = 0;
        function getDynamicDataFromServer(userId, token){
                console.info("on est dans getDynamicDataFromServer");
                var deferred = $q.defer();
                // var URL_DATA = $localStorage.URLDSS+"/api/auth/login";
                var URL_DATA = $localStorage.URLDSS+"/mobile/collectes";

               $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner> <br/> Téléchargement en cours ...',
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
               });

                $scope.dynamicData= [];
                $scope.count = 0;

               $http.get(URL_DATA, {
                      headers: {  Authorization: token }
               }).then(function (res){
                    console.info(res.data);
                     if(res.data.length==0){
                             deferred.resolve();
                    }else{
                       $scope.dynamicData = res.data;
                       console.info(res.data.length);
                    }

                    var chain = $q.when();
                    for(var i=0; i<res.data.length; i++){
                          // var id_projet = res.data[i].projet;
                          // var numero = res.data[i].numero.split("-")[1];
                          // var exp = JSON.stringify(res.data[i].exploitation);
                          // var data = JSON.stringify(res.data[i].collecte);
                          // var geo = res.data[i].geo;
                          // var area = res.data[i].superficie;
                          // var id_reg = res.data[i].region;
                          // var id_prov = res.data[i].province;
                          // var id_com= res.data[i].commune;
                          // var id_collecte = res.data[i].id_collecte;
                          // var sqlInsertData= "INSERT INTO dynamicData (id_projet, numero, userId, superficie, exploitation, data, id_region, id_province, id_commune, geo, sync, id_collecte) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
                          // $cordovaSQLite.execute(db, sqlInsertData,[id_projet, numero, userId, area, exp, data, id_reg, id_prov, id_com, geo, 1, id_collecte]).then(function(ressss) {
                          //       console.info(i);
                          //       if(i==res.data.length-1){
                          //           deferred.resolve();
                          //       }
                          // });
                           chain = chain.then(function() {
                                  return  addDataToDynamicData($scope.count);
                            });    
                    }               
                    
                    chain.finally(function(){
                          $scope.dynamicData= [];
                          $scope.count = 0;
                          deferred.resolve();
                     });
               },
               function(response) {
                      console.info(response);
                      deferred.resolve();
                      ionicToast.show(' Problème de connexion ! ', 'bottom', false, 2500);
                      // $ionicLoading.hide();
               });
               return deferred.promise;
        }

         $scope.emptyUsersTable=function(){
               $ionicPopup.show({
                      title: 'Voullez-vous vraiment <b>vider</b> la liste des utilisateurs ?',
                      // content: html,
                      scope: $scope,
                      buttons: [
                        {text: 'Annuler'},
                        {
                          text: '<b>Vider</b>',
                          type: 'button-positive',
                          onTap: function(e) { return e; }
                        }
                      ]
                    })
                .then(function(result) {
                      if(result){
                               $cordovaSQLite.execute(db, "DELETE FROM users").then(function(res) {

                               });
                      }
                });
        }

});


app.controller("ParametrageCtrl",function($location,$scope, $ionicModal, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q,$ionicHistory,$state,$window, $localStorage, ConnectivityMonitor){

               console.info(  $localStorage.userIdParam);
               console.info($localStorage.loginParam);
               $scope.loginG= $localStorage.loginParam;
               $scope.userId = $localStorage.userIdParam;
               console.info($scope.userId);

               // $scope.$on('$ionicView.enter', function () {
               //         $localStorage.tabActive = "menu";
               // });

            
               $scope.tuile = $localStorage.tuileChoisie;
               $scope.showSpatialParameters= true; // Boolean to enable showing hidding all spatial components in setting page.
               $scope.hasSupportData= false; // Boolean to enable showing hidding all spatial components in setting page.

               // $scope.apiSupports = "https://geoapiserver.herokuapp.com/mobile/support?";
               $scope.apiSupports = $localStorage.URLDSS+"/mobile/support?";

               $scope.switchShowSpatialParameters = function(){
                       $scope.showSpatialParameters = !$scope.showSpatialParameters;
               }

               $scope.tuileAAfficher = function(tuile){
                       $localStorage.tuileChoisie  = tuile;
                       console.info("tuile parametrage "+$localStorage.tuileChoisie);
               }

               $scope.goParametrage = function(){
                       $state.go('menu', {}, {reload: true,  inherit: false, notify: true});
               };

               $scope.goDashboard = function(){
                       $state.go('login', {}, {reload: true});
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
               ///////////////////     Load Project, forms and communes from database     /////////////////////

               function loadParametreageData(){
                       var deferred =  $q.defer();
                       $scope.projects=[];
                       $scope.selectedProject="";
                       $scope.cidSupport="";
                       var querySelectProjets = " SELECT _id, name, theme, support, checkd FROM projets WHERE userId ="+$scope.userId;
                       console.info("querySelectProjets= "+querySelectProjets);
                       $cordovaSQLite.execute(db, querySelectProjets).then(function(res) {
                              console.info(" load projets res.rows.length = "+res.rows.length);
                              if(res.rows.length > 0) {
                                     for (var i = 0; i < res.rows.length ; i++) {
                                             if( res.rows.item(i).checkd == 1){
                                                    $scope.selectedProject =  res.rows.item(i)._id;
                                                    $scope.hasSupportData =   (res.rows.item(i).support =="")? false : true;
                                                    if($scope.hasSupportData){
                                                           $scope.cidSupport = JSON.parse(res.rows.item(i).support).id;
                                                   }
                                                    $scope.projects.push({id: res.rows.item(i)._id, name: res.rows.item(i).name, theme: res.rows.item(i).theme, support: res.rows.item(i).support, checked:true});
                                             }else{
                                                    $scope.projects.push({id: res.rows.item(i)._id, name: res.rows.item(i).name, theme: res.rows.item(i).theme, support: res.rows.item(i).support, checked:false});
                                             }
                                     }
                                     // loadFormsByProjects($scope.selectedProject);
                                     // loadCommunesByProjects($scope.selectedProject);
                              }else{
                                     // Table des Forms est vide !!
                              }
                              deferred.resolve();
                       }, function (err) {
                              console.info(err);
                              console.info("err => "+err+ " "+querySelectProjets);
                       });

                       return deferred.promise;
               }

               function loadFormsByProjects(idProject){
                          $scope.forms=[];
                          var querySelectForms = " SELECT _id, name, theme, geometry, fields FROM formulaires WHERE id_project = '"+idProject+"' AND userId ="+$scope.userId;

                         $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                              if(res.rows.length > 0) {
                                     for (var i = 0; i < res.rows.length ; i++) {
                                            if(res.rows.item(i).geometry =="none"){
                                                  if(res.rows.length>1){
                                                   $scope.showSpatialParameters= true;
                                                 }else{
                                                    $scope.showSpatialParameters= false;
                                                 }
                                            }else{
                                                   $scope.showSpatialParameters= true;
                                            }
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
                          var queryCommune = " SELECT id_commune, name, checkd FROM communes WHERE id_projet ='"+idProject+"' AND userId="+$scope.userId;
                          console.info("queryCommune= "+queryCommune);
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
               $scope.hasSegment="";
               $scope.selectedCommune="";
               $ionicPlatform.ready(function() {
                       loadParametreageData().then(function(){
                               loadFormsByProjects($scope.selectedProject);
                               loadCommunesByProjects($scope.selectedProject);
                       });
               });
               ////////////////////////////////////////////////////////////////////////////////////////////////////

               function addProjectToDB(_id, name, theme, support, userId){
                       var sqlInsertProjects= "INSERT INTO projets (_id, name, theme, support, checkd, userId) VALUES(?,?,?,?,?,?)";
                       $cordovaSQLite.execute(db, sqlInsertProjects,[_id, name, theme, support, 0, userId]);
               }
               function addFormToDB(_idF, id_project, nameF, themeF, geometryF, id_fieldsF, fieldsF, userId){
                       var sqlInsertForm= "INSERT INTO formulaires (_id, id_project, name, theme, geometry, id_fields, fields, userId) VALUES(?,?,?,?,?,?,?,?)";
                       console.info(sqlInsertForm);
                       $cordovaSQLite.execute(db, sqlInsertForm,[_idF, id_project, nameF, themeF, geometryF, id_fieldsF, fieldsF, userId]).then(function(res) {
                       }, function (err) {
                              console.info(err);
                              console.info("err | sqlInsertForm => "+sqlInsertForm);
                       });
               }
               function addCommuneToDB(id, name, id_projet, userId){
                       console.info("----------- "+id+" -------------");
                       console.info("----------- "+name+" -------------");
                       console.info("----------- "+id_projet+" -------------");
                       var sqlInsertCommunes= "INSERT INTO communes (id_commune, name, id_projet, checkd, userId) VALUES(?,?,?,?,?)";
                       $cordovaSQLite.execute(db, sqlInsertCommunes,[id, name, id_projet,0, userId]).then(function(res) {
                              // console.info("res");
                              // console.info(res);
                       });
               }

               function loadProjectAndFormsData(res){
                       var deferred = $q.defer();
                       var compt=0;
                       if(res.data.length==0){
                              $ionicLoading.hide();
                              ionicToast.show(' Aucune enquête ne vous a été attribuée !', 'middle', false, 2500);
                              deferred.resolve();
                       }else{
                              console.info(res.data.length);

                             for(var i = 0; i<res.data.length; i++){
                                     if((res.data[i].projet!=null) && (res.data[i].communes!=null)){
                                             var _id  = res.data[i].projet._id;
                                             var name  = res.data[i].projet.name;
                                             var theme  = res.data[i].projet.theme;
                                             var forms  = res.data[i].projet.forms;
                                             var coms = res.data[i].communes;
                                             var support  = (res.data[i].projet.cid==null)? "":JSON.stringify(res.data[i].projet.cid);

                                             for(var h = 0; h<coms.length; h++){
                                                    var idcom = coms[h].id_commune;
                                                    var nameCom = coms[h].name;
                                                    addCommuneToDB(idcom, nameCom, _id, $scope.userId);
                                             }

                                             for(var k = 0; k<forms.length; k++){
                                                     var _idF  = forms[k]._id;
                                                     var nameF  = forms[k].name;
                                                     var themeF  = forms[k].theme;
                                                     var geometryF  = forms[k].geometry;
                                                     var id_fieldsF  = forms[k].id_fields;
                                                     var fieldsF  = forms[k].fields;
                                                     fieldsF  = JSON.stringify(fieldsF[0]);
                                                     addFormToDB(_idF, _id, nameF, themeF, geometryF, id_fieldsF, fieldsF, $scope.userId);
                                             }

                                             if(forms.length>0){
                                                    addProjectToDB(_id, name, theme, support, $scope.userId);
                                                    $scope.projects.push({
                                                            id: _id,
                                                            name: name,
                                                            theme: theme,
                                                            support: support,
                                                            checked:false
                                                    });
                                             }
                                             compt++;
                                     }
                                     if(i==res.data.length-1){ deferred.resolve(); }

                                     console.log("_id > "+_id+", name > "+name+", theme > "+theme+",  support > "+support);
                              }
                             if(compt==0){
                                     ionicToast.show(' Aucune enquête ne vous a été attribuée !', 'middle', false, 2500);
                                     deferred.resolve();
                             }
                       }
                       return deferred.promise;
               }
               $scope.DownloadProjects=function(){

                       if(!ConnectivityMonitor.isOnline()) {
                              ionicToast.show('Vous n\'êtes connecté pas à Internet !', 'middle', false, 2500);
                              return;
                       }

                       // var urlProjet = "https://geoapiserver.herokuapp.com/mobile/projets";
                       var urlProjet = $localStorage.URLDSS+"/mobile/projets";
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
                             $scope.selectedProject="";
                             $scope.selectedCommune="";
                             $scope.communes = [];
                             $scope.projects = [];
                             $scope.forms = [];

                              var sqlDeleteForms= "delete FROM formulaires WHERE userId="+$scope.userId;
                              $cordovaSQLite.execute(db, sqlDeleteForms).then(function(ressource) {
                                     console.log("Nombre de formulaires apres delete : "+ressource.rows.length);
                              });

                              var sqlDeleteCommunes= "delete FROM communes WHERE userId="+$scope.userId;
                              $cordovaSQLite.execute(db, sqlDeleteCommunes).then(function(ressource) {
                                     console.log("Nombre de communes apres delete : "+ressource.rows.length);
                              });

                              var sqlDeleteProjects= "delete FROM projets WHERE userId="+$scope.userId;
                              $cordovaSQLite.execute(db, sqlDeleteProjects).then(function(ressource) {
                                     console.log("Nombre de projets apres delete : "+ressource.rows.length);
                              });

                               var sqlDeleteSupports= "delete FROM supports  WHERE userId="+$scope.userId;
                              $cordovaSQLite.execute(db, sqlDeleteSupports).then(function(ressource) {
                                     console.log("Nombre de supports apres delete : "+ressource.rows.length);
                              });

                              loadProjectAndFormsData(res).then(function() {
                                  $ionicLoading.hide();
                               });
                              // $timeout(function() {
                              //        $ionicLoading.hide();
                              // }, 2000);

                       },
                       function(response) {
                              console.info(response);
                              // Il faut voir le message que ramène la variable "response" et si == "Unauthorized",
                              // il faudra spcifier que cet enqueteur n'est pas autorisé a téléverser des projets ;)
                              ionicToast.show(' Problème de connexion ! ', 'bottom', false, 2500);
                              $ionicLoading.hide();
                       });
               }

               $scope.checkProjectAcollecter=function(id, name, theme, support, check){
                       console.info(id+" , "+ name+" , "+ theme+" , "+check+" , "+support);

                       $scope.selectedProject=id;
                       $scope.hasSupportData = (support=="")? false: true;
                       if($scope.hasSupportData){
                              $scope.cidSupport = JSON.parse(support).id;
                       }else{
                              $scope.cidSupport = "";
                       }
                       console.info($scope.hasSupportData);
                       console.info($scope.cidSupport);

                       var sqlUpdateProject = " UPDATE projets SET checkd =1 WHERE _id='"+id+"' AND userId ="+$scope.userId;
                       console.info(sqlUpdateProject);
                       $cordovaSQLite.execute(db, sqlUpdateProject);

                       var sqlUpdateProject2 = " UPDATE projets SET checkd =0 WHERE _id !='"+id+"' AND userId ="+$scope.userId;
                       console.info(sqlUpdateProject2);
                       $cordovaSQLite.execute(db, sqlUpdateProject2);

                       var queryForm = " SELECT _id, name, theme, geometry, fields FROM formulaires WHERE id_project ='"+id+"' AND userId ="+$scope.userId;
                       $cordovaSQLite.execute(db, queryForm).then(function(res) {
                              $scope.forms = [];
                              if(res.rows.length > 0) {
                                      for (var i = 0; i < res.rows.length ; i++) {
                                             // Afficher \ Masquer les composantes spatiales selon la géométrie des questionnaires à enquêter:
                                             if(res.rows.item(i).geometry =="none"){
                                                  if(res.rows.length>1){
                                                   $scope.showSpatialParameters= true;
                                                 }else{
                                                    $scope.showSpatialParameters= false;
                                                 }
                                            }else{
                                                   $scope.showSpatialParameters= true;
                                            }
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
                       var queryCommune = " SELECT id_commune, name, checkd FROM communes WHERE id_projet ='"+id+"' AND userId ="+$scope.userId;
                       $cordovaSQLite.execute(db, queryCommune).then(function(res) {
                              $scope.communes = [];
                              if(res.rows.length > 0) {
                                      for (var i = 0; i < res.rows.length ; i++) {
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

                       // sqlUpdateCommune2 = " UPDATE communes SET checkd =0 WHERE id_commune !='"+id+"' AND id_projet='"+$scope.selectedProject+"' ";
                       sqlUpdateCommune2 = " UPDATE communes SET checkd =0 WHERE id_commune !='"+id+"' AND userId ="+$scope.userId;
                       $cordovaSQLite.execute(db, sqlUpdateCommune2).then(function(res) {
                              sqlUpdateCommune = " UPDATE communes SET checkd =1 WHERE id_commune='"+id+"' AND id_projet='"+$scope.selectedProject+"' AND userId ="+$scope.userId;
                              $cordovaSQLite.execute(db, sqlUpdateCommune);
                       });
               }

               /////////////////////////////////////////////////////////////////////////////////////////////////////////////
               ////////////////////////////////// Download Découpages Statistiques ////////////////////////////////////

               function addSupportToDB(cid, id , id_com, support, id_projet, userId){

                       // console.info("------------------------------ "+cid+", "+id+", "+ id_com+", "+ JSON.stringify(support));
                       // console.info("------------------------------ "+cid+", "+id+", "+ id_com+", "+support);
                       // console.info("support= "+JSON.stringify(support));
                       var sqlCheckSegment = "SELECT cid, id, id_commune, support FROM supports WHERE id ='"+id+"' AND userId="+userId;
                       console.info(sqlCheckSegment);
                       $cordovaSQLite.execute(db, sqlCheckSegment).then(function(res) {
                        console.info(res);
                            if(res.rows.length==0){
                                console.info("------------------------------ "+cid+", "+id+", "+ id_com+", "+support+" , "+id_projet);
                                    var sqlInsertSupport= "INSERT INTO supports (cid, id, id_projet, id_commune, support, userId) VALUES(?,?,?,?,?,?)";
                                    $cordovaSQLite.execute(db, sqlInsertSupport,[cid, id , id_projet, id_com, JSON.stringify(support), userId]).then(function(res) {
                                          console.info(res);
                                    });
                            }else{
                              console.info(id +" id support existe");
                            }

                       });
               }

               function updateGeometrieCommune(id_com, id_reg, id_prov, geom){
                       var sqlUpdateCommune= "UPDATE communes SET geometry= '"+geom+"' , id_region= "+id_reg+" , id_province= "+id_prov+"  WHERE id_commune="+id_com;
                       console.info("sqlUpdateCommune= "+sqlUpdateCommune);
                       $cordovaSQLite.execute(db, sqlUpdateCommune);
               }

               function loadSupportsData(id_com, res, id_projet){
                       var deferred = $q.defer();
                       for(var i = 0; i<res.length; i++){
                              var cid  = res[i].cid;
                              var id  = res[i].id;
                              var id_commune  = id_com;
                              console.info(res[i].geometry);
                              console.info(res[i]);
                              console.info(typeof(res[i]));
                              console.info(res[i].id_echantillon);
                               var support={};
                              if(res[i].geometry!=undefined){
                                     support = {
                                             "type": res[i].type,
                                             "geometry": res[i].geometry,
                                             "properties": res[i].properties
                                     }
                              }else{
                                    support =  res[i];
                              }

                              console.info(support);
                              addSupportToDB(cid, id, id_commune, support, id_projet, $scope.userId);
                       }
                       deferred.resolve();
                       return deferred.promise;
               }

               $scope.DownloadZoneActionOld=function(){
                       if($scope.selectedProject==""){
                               ionicToast.show(' Veuillez séléctionner une enquête ! ', 'bottom', false, 2500);
                               return;
                       }
                       if($scope.selectedCommune==""){
                               ionicToast.show(' Veuillez séléctionner une commune ! ', 'bottom', false, 2500);
                               return;
                       }
                               // var urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/segment/?id="+$scope.selectedCommune;
                               // var urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/support?id=6918&cid=5a78e7bf017a0c1438992ded";
                               var urlDecoupage;
                               if($scope.hasSupportData){
                                      // urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/support?id="+$scope.selectedCommune+"&cid="+$scope.cidSupport;
                                      urlDecoupage = $localStorage.URLDSS+"/mobile/support?id="+$scope.selectedCommune+"&cid="+$scope.cidSupport;
                               }else{
                                    // urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/support?id="+$scope.selectedCommune;
                                    urlDecoupage = $localStorage.URLDSS+"/mobile/support?id="+$scope.selectedCommune;
                               }

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
                                             var id_reg = res.data.commune[0].id_region;
                                             var id_prov = res.data.commune[0].id_province;
                                             var geometry = JSON.stringify(res.data.commune[0].geometry);
                                             updateGeometrieCommune(id_com,id_reg, id_prov, geometry);
                                      }else{

                                      }

                                     console.info(res.data.supports);
                                     console.info(res.data.supports.length);
                                     if(res.data.supports.length>0){
                                            loadSupportsData(id_com, res.data.supports, $scope.selectedProject).then(function() {
                                                    console.info("woow loadSupportsData");
                                                    $ionicLoading.hide();
                                            });
                                     }else{
                                            $ionicLoading.hide();
                                     }


                               },
                               function(response) {
                                       console.info(response);
                                       ionicToast.show(' Problème de connexion ! ', 'bottom', false, 2500);
                                       $ionicLoading.hide();
                               });
               }

               //--------------------------------------------------//
                $scope.countCom = 0;
               $scope.DownloadZoneAction=function(){
                       if($scope.selectedProject==""){
                               ionicToast.show(' Veuillez séléctionner une enquête ! ', 'bottom', false, 2500);
                               return;
                       }

                       if(!ConnectivityMonitor.isOnline()) {
                              ionicToast.show('Vous n\'êtes connecté pas à Internet !', 'middle', false, 2500);
                              return;
                       }

                       $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner> <br/> Téléversement des découpages statistiques en cours ...',
                                content: 'Loading',
                                animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0
                       });

                       var chain = $q.when();
                       for (var k = 0; k < $scope.communes.length ; k++) {
                              chain = chain.then(function() {
                                    return  loadCommuneSupportServer($scope.countCom);
                              });
                       }

                        chain.finally(function(){
                              console.info("finish loadCommuneSupportServer !!");
                              $scope.countCom =0;
                               $ionicLoading.hide();
                       });
               }

               function loadCommuneSupportServer(i){

                       var selectedCom =  $scope.communes[i].id;
                       var deferred = $q.defer();

                       var urlDecoupage;
                       if($scope.hasSupportData){
                              // urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/support?id="+selectedCom+"&cid="+$scope.cidSupport;
                              urlDecoupage = $localStorage.URLDSS+"/mobile/support?id="+selectedCom+"&cid="+$scope.cidSupport;
                       }else{
                            // urlDecoupage = "https://geoapiserver.herokuapp.com/mobile/support?id="+selectedCom;
                            urlDecoupage = $localStorage.URLDSS+"/mobile/support?id="+selectedCom;
                       }

                       console.info("$scope.hasSupportData= "+$scope.hasSupportData);
                       console.info("$scope.cidSupport= "+$scope.cidSupport);
                       console.info(urlDecoupage);
                       console.info($localStorage.tokenParam);

                       $http.get(urlDecoupage, {
                              headers: {  Authorization: $localStorage.tokenParam }
                       }).then(function (res){
                              console.info(res.data);
                              if(res.data.commune.length>0){
                                      var id_com = res.data.commune[0].id_commune;
                                      var id_reg = res.data.commune[0].id_region;
                                      var id_prov = res.data.commune[0].id_province;
                                      var geometry = JSON.stringify(res.data.commune[0].geometry);
                                      updateGeometrieCommune(id_com,id_reg, id_prov, geometry);
                              }

                              console.info(res.data.supports);
                              if(res.data.supports!=undefined){
                                      console.info(res.data.supports.length);
                                      if(res.data.supports.length>0){
                                             loadSupportsData(id_com, res.data.supports, $scope.selectedProject).then(function() {
                                                     console.info("woow loadSupportsData");
                                                     // $ionicLoading.hide();
                                             });
                                      }else{
                                             // $ionicLoading.hide();
                                     }
                             }
                             $scope.countCom++;
                              deferred.resolve();
                       },
                       function(response) {
                              console.info(response);
                              ionicToast.show(' Problème de connexion ! ', 'bottom', false, 2500);
                              $ionicLoading.hide();
                       });

                       return deferred.promise;
                }

                //////////////////////////////////////////////////////////////////////////////////////////
                /////////////////////// Décommenter pour utilisation tablette //////////////////////

                         var fs = new $fileFactory();
                       $ionicPlatform.ready(function() {
                                // fs.getEntries("file:///storage/emulated/0/TuileIFE/").then(function(result) {
                                fs.getEntries("file:///storage/emulated/0/EnqAgri/").then(function(result) {
                                  // alert(result);
                                    $scope.files = result;
                                   }, function(error) {
                                    alert("Tuillage error : "+error);
                                 }
                               );
                        });
                //////////////////////////////////////////////////////////////////////////////////////////
});


app.controller("menuCtrl",function($location,$scope, $cordovaSQLite, $http, ionicToast, $state, $ionicPlatform, nonGeomtricData, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q, ionicToast,$ionicHistory,$state,$window, $localStorage, $ionicModal, ConnectivityMonitor){

               //     var sqlInsertProjects= "UPDATE dynamicData set sync = 1 where id = 2";
               // $cordovaSQLite.execute(db, sqlInsertProjects);


                // location.reload();
                // $window.location.reload(true);
                $ionicHistory.clearCache();
                // $ionicHistory.clearCache([$state.current.name]).then(function() {
                  // $state.reload();
                // });
                $localStorage.tabActive = "menu";
                console.info( $localStorage.tabActive);

               $scope.loginG= $localStorage.loginParam;
               $scope.userId = $localStorage.userIdParam;
               console.info($scope.loginG);
               console.info($scope.userId);
               $scope.tuile = $localStorage.tuileChoisie;


               $scope.formattedDate=function() {
                        var d = new Date,
                       dformat = [ d.getFullYear(),(d.getMonth()+1).padLeft(),
                                   d.getDate().padLeft() ].join('-')+
                                  ' ' +
                                [ d.getHours().padLeft(),
                                  d.getMinutes().padLeft(),
                                  d.getSeconds().padLeft()].join(':');

                      // return dformat;
                      console.info(dformat);
                }



                      //////////////////////////////////////////////////////////////////////////////////////////
                         var sqlselect= "DELETE  FROM tempData ";
                         $cordovaSQLite.execute(db, "DELETE  FROM tempData ").then(function(reso) {
                            console.info(reso);
                          });

                          $cordovaSQLite.execute(db, "SELECT *  FROM tempData ").then(function(reso) {
                            console.info(reso);
                            console.info(reso.rows.length);

                          });
                      //////////////////////////////////////////////////////////////////////////////////////////
                      // $cordovaSQLite.execute(db, "UPDATE dynamicData SET sync = 0 ").then(function(reso) {
                      //       console.info(reso);
                      //       console.info(reso.rows.length);

                      //     });

                /////////////////////// Décommenter pour utilisation tablette //////////////////////

                       //   var fs = new $fileFactory();

                       // $ionicPlatform.ready(function() {
                       //          // fs.getEntries("file:///storage/emulated/0/TuileIFE/").then(function(result) {
                       //          fs.getEntries("file:///storage/emulated/0/beGIS/").then(function(result) {
                       //              // alert(result);
                       //              $scope.files = result;

                       //             }, function(error) {
                       //              alert("Tuillage error : "+error);
                       //           }
                       //         );
                       //  });
                //////////////////////////////////////////////////////////////////////////////////////////


               urlget = "http://geocoding1.duckdns.org:1111/api.php/Users";
               // urlget = "http://192.168.1.89/api.php/Users";
               url = 'http://geocoding1.duckdns.org:1111/apipost.php';
               ReUrl = 'http://geocoding1.duckdns.org:1111/apipostresync.php';
                var urlForms="https://powerful-plateau-71414.herokuapp.com/api/forms";

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
                       $localStorage.loginParam = "";
                       $localStorage.pwdParam = "";
                       $localStorage.tokenParam = "";
                       $localStorage.userIdParam = "";
                        var sqlUpdateProject = " UPDATE projets SET checkd =0 ";
                       console.info(sqlUpdateProject);
                       $cordovaSQLite.execute(db, sqlUpdateProject);

                       var sqlUpdateCom = " UPDATE communes SET checkd =0 ";
                       console.info(sqlUpdateCom);
                       $cordovaSQLite.execute(db, sqlUpdateCom);


                       $state.go('login', {}, {reload: true});
               };

               $scope.tuileAAfficher = function(tuile){
                       $localStorage.tuileChoisie  = tuile;
                       // alert("tuile menu "+$localStorage.tuileChoisie);
                       // alert(tuile);
               }

               $scope.goCollecte = function(){
                       // $state.go('carte', {}, {reload: true, inherit: false, notify: true});
                       $state.go('collecte');
                };

               $scope.goCarte = function(){
                       // $state.go('carte', {}, {reload: true, inherit: false, notify: true});
                       $state.go('carte');
                };

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
               /////////////////////////////////////////////////////////////////////////////////
               /////////////////     Statistiques des enquêtes => Pie Chart      /////////////////
               $scope.pieLabels = ["Synchronisées", "Non Synchronisées"];
               $scope.pieData = [300, 500];
               $scope.pieColors = ["#F7464A", "#46BFBD"];
               // $scope.pieColors = ["#FDB45C","#949FB1","#4D5360"];

               $scope.changePieCharts=function(){
                       // cette fonction doit opérer au moment de sélection d'un autre projet au lieu du projet en cours
                       // et donc les informations du Pie Chart doivent changer ;)
                        $scope.pieData = [100, 900];
                        // $scope.pieData = [0, 0];
               }

               $scope.showStats=false;
               $scope.toggleStats=function(){
                       if($scope.showStats){
                              $scope.showStats = false;
                       }else{
                              $scope.showStats = true;
                       }
               }
               /////////////////////////////////////////////////////////////////////////////////
                // Fonction de séléction de la page de collecte selon le type de l'enquête sélectionnée
                // dans la page du paramétrage : RNA | Geometric | Non Geometric.
               $scope.AccesCollecte=function(){
                       var querySelectedProject = " SELECT _id, name, theme FROM projets WHERE checkd =1 AND userId ="+$scope.userId;
                       $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                              if(res.rows.length > 0) {
                                     $scope.nomProjetEncours = res.rows.item(0).name;
                                     console.info($scope.nomProjetEncours);
                                     $scope.idProjetEncours = res.rows.item(0)._id;
                                     // if(res.rows.item(0).theme=="rna"){
                                     //         $scope.goRNACarte();
                                     // }else{
                                             var sqlDetectProjectType = "SELECT DISTINCT geometry FROM formulaires WHERE id_project = '"+res.rows.item(0)._id+"'";
                                             $cordovaSQLite.execute(db, sqlDetectProjectType).then(function(result) {
                                                    console.info(result.rows.length);

                                                    if( (result.rows.length==1) && (result.rows.item(0).geometry=="none") ){
                                                           typeCollecte="none";
                                                            $scope.goAlphanumerique(res.rows.item(0)._id);
                                                    }
                                                    else{
                                                           typeCollecte="geometric";
                                                            $scope.goGeometricCarte();
                                                    }

                                             }, function (err) {
                                                    console.info(err);
                                                    console.info("err => "+sqlDetectProjectType);
                                             });
                                    //}
                              }else{
                                     ionicToast.show(' Aucune enquête sélectionnée !', 'middle', false, 2500);
                              }
                        }, function (err) {
                              console.info(err);
                              console.info("err => "+querySelectedProject);
                       });
                }

                // var querySelectData = " DELETE FROM dynamicData";
                // $cordovaSQLite.execute(db, querySelectData);
                //-------------------------------------------------------------------------//
                //------------- Gestion des questionnaire sans géométrie ---------------//

               loadNonGeometricProjetForm=function(idProjet){
                       var deferred = $q.defer();
                       $scope.selectedProject = idProjet;
                       var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+idProjet+"'  AND userId="+$scope.userId;
                       $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                                     console.info(res.rows.length);
                                     nonGeomtricData.setIdForm(res.rows.item(0).id_fields);
                                     nonGeomtricData.setFormData(res.rows.item(0).fields);
                                     deferred.resolve();
                       }, function (err) {
                              console.info("err => "+err+ " "+querySelectForms);
                              deferred.resolve();
                       });
                       return deferred.promise;
                }

               $scope.nonGeomData = [];
               loadNonGeometricData=function(idProjet){
                       var deferred = $q.defer();
                       var querySelectData = " SELECT DISTINCT numero, userId FROM dynamicData WHERE id_projet='"+$scope.idProjetEncours+"'  AND userId="+$scope.userId+" AND sync=0 AND id_commune IN ";
                       querySelectData+= " (SELECT id_commune FROM communes WHERE id_projet ='"+$scope.idProjetEncours+"' AND checkd= 1  AND userId="+$scope.userId+" )";

                       $cordovaSQLite.execute(db, querySelectData).then(function(res) {

                              $scope.nonGeomData = [];
                              for(var i = 0; i<res.rows.length; i++){
                                      var numeroCollecte = res.rows.item(i).numero;
                                      var userId = res.rows.item(i).userId;
                                      $scope.nonGeomData.push({id_projet: $scope.idProjetEncours, numCollecte: userId+"-"+numeroCollecte, num: numeroCollecte });
                              }
                              console.info($scope.GeomData);
                              deferred.resolve();

                       }, function (err) {
                            console.info(err);
                            console.info("err => "+err+ " "+querySelectData);
                       });

                       return deferred.promise;
                }

               function deleteNoneCollecte(num, id_projet){
                       var queryDeleteData = " DELETE FROM dynamicData WHERE id_projet='"+id_projet+"' AND numero='"+num+"'  AND sync=0  AND userId="+$scope.userId;
                       $cordovaSQLite.execute(db, queryDeleteData).then(function(res) {
                              $scope.modalRender.remove();
                              console.info("deleted "+num);
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+queryDeleteData);
                       });
               }
               $scope.deleteNoneCollecteByNum=function(num, id_projet){
                       console.info(num+' | '+id_projet);
                       var confirmPopup = $ionicPopup.confirm({
                              title: 'Suppression',
                              template: 'Voulez-vous vraiment supprimer la collecte sélectionnée ?'
                       });

                       confirmPopup.then(function(res) {
                               if(res) {
                                 console.log('You are sure  to delete :)');
                                   deleteNoneCollecte(num, id_projet);

                               } else {
                                 console.log('You are not gonna delete :( ');
                               }
                       });
                }

               $scope.check_if_project_none_support=function(){
                       var deferred = $q.defer();
                       $scope.existe=0;
                       var querySelectProj = " SELECT _id, support FROM projets WHERE _id='"+$scope.idProjetEncours+"'  AND checkd=1 AND userId="+$scope.userId;
                       console.info(querySelectProj);
                       $cordovaSQLite.execute(db, querySelectProj).then(function(res) {
                              console.info(res.rows.length);
                              console.info(res.rows.item(0));

                             if((res.rows.length>0) && (res.rows.item(0).support!="")){
                                     var querySelectData = " SELECT id_commune FROM communes WHERE id_projet='"+$scope.idProjetEncours+"'   AND userId="+$scope.userId+" AND id_commune IN ";
                                     querySelectData+= " (SELECT id_commune FROM supports WHERE  id_projet='"+$scope.idProjetEncours+"'  AND userId="+$scope.userId+" )";
                                     console.info(querySelectData);
                                     $cordovaSQLite.execute(db, querySelectData).then(function(result) {
                                            console.info(result.rows.length);
                                             if(result.rows.length>0){
                                                  $scope.existe = 1;
                                             }else{
                                                  $scope.existe = -1;
                                             }
                                             deferred.resolve();

                                     }, function (err) {
                                             console.info(err);
                                             console.info("err => "+querySelectData);
                                     });
                              }else{
                                     deferred.resolve();
                                     $scope.existe = 1;
                              }
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+querySelectProj);
                       });
                        return deferred.promise;
               }
               $scope.goToNoneCollecteByParam=function(num){
                        $scope.modalRender.remove();
                        $scope.check_if_project_none_support().then(function(){
                              if($scope.existe==1){
                                     getNonGeometricDataByNumero(num).then(function(){
                                             console.info("goToCollecteByParam => numCollecte= "+ num);
                                             $state.go('sansgeometrie', { numCollecte: num, mode: "m"});
                                     });

                              }else{
                                     ionicToast.show("La zone d'action choisie ne contients aucune données de support",'middle', false, 2500);
                              }
                        });

                }
               function getNonGeometricDataByNumero(num){
                       var deferred = $q.defer();
                       var sql = "SELECT id, data, numero FROM dynamicData WHERE numero ='"+num+"' AND id_projet ='"+$scope.selectedProject+"'  AND userId="+$scope.userId;
                       console.info(sql);
                       $cordovaSQLite.execute(db, sql).then(function(res) {
                              console.info(res.rows.length);
                              var input = JSON.parse(res.rows.item(0).data)[0].data;
                              var data = input[0].formdata;
                              console.info(input);
                              console.info(data);
                              nonGeomtricData.setDataToUpdate(data);
                              // console.info(nonGeomtricData.getDataToUpdate());
                              nonGeomtricData.setIdToUpdate(res.rows.item(0).id);
                              nonGeomtricData.setNumero(num);
                              console.info(nonGeomtricData.getDataToUpdate());
                              console.info(JSON.stringify(nonGeomtricData.getDataToUpdate()));
                              console.info(nonGeomtricData.getIdToUpdate());
                              deferred.resolve();
                       }, function (err) {
                              console.log('ERR SQL sqlInsertData= '+sqlInsertData);
                       });

                       return deferred.promise;
               }

               $scope.check_if_zoneAction_selectedNonGeom=function(idProjet){
                       var deferred = $q.defer();
                       $scope.existeZoneActionNonGeom=0;
                       var querySelectData = " SELECT id_commune, geometry FROM communes WHERE id_projet='"+idProjet+"'  AND checkd = 1 AND userId="+$scope.userId;
                       console.info(querySelectData);
                       $cordovaSQLite.execute(db, querySelectData).then(function(result) {
                              console.info(result.rows.length);
                               if(result.rows.length>0){
                                      console.info(result.rows.item(0).geometry);
                                     if(result.rows.item(0).geometry!=null){
                                             $scope.existeZoneActionNonGeom = 1;
                                     }else{
                                            $scope.existeZoneActionNonGeom = -1;
                                     }

                               }else{
                                    $scope.existeZoneActionNonGeom = -1;
                               }
                               deferred.resolve();

                       }, function (err) {
                               console.info(err);
                               console.info("err => "+querySelectData);
                       });

                        return deferred.promise;
                }

               $scope.goAlphanumerique=function(idProjet){

                       $scope.check_if_zoneAction_selectedNonGeom(idProjet).then(function(){
                       if($scope.existeZoneActionNonGeom==1){
                       loadNonGeometricProjetForm(idProjet).then(function(){
                            loadNonGeometricData(idProjet).then(function(){
                                console.info($scope.nonGeomData);

                                 let  html =`<ion-modal-view id="ayoub" style="width: 40%; height: 50%; top: 25%; left: 25%; right: 30%; bottom: 30%;">`;
                                 html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
                                 html+=  ` <h1 class = "title">{{nomProjetEncours}}</h1>`;
                                 html+=  ` </ion-header-bar>`;
                                 html+=  ` <ion-content class="padding"  has-header="true">`;
                                 html+=  `<ion-list>`;
                                 // html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in nonGeomData" type="item-text-wrap" ng-click="updateFormById(ngd.id, ngd.numero)">`;
                                 html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in nonGeomData" type="item-text-wrap">`;
                                 html+=  `Collecte N° {{ngd.numCollecte}}`;
                                 // html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                 html+=  `<ion-option-button class="button-assertive" ng-click="deleteNoneCollecteByNum(ngd.num, ngd.id_projet)"><i class="icon ion-ios-trash-outline"></i></ion-option-button>`;
                                 html+=  `<ion-option-button class="button-positive" ng-click="goToNoneCollecteByParam(ngd.num)"><i class="icon ion-edit"></i></ion-option-button>`;
                                 html+=  ` </ion-item>`;
                                 html+=  ` </ion-list>`;
                                 html+= `<div class = "button-bar"><a class = "button button-block button-grisClair" ng-click="hideModalRender()">Retour</a>`;
                                 html+= `<a class = "button button-block button-bleuClair" ng-click="OpenNewNonGeometricForm()">Nouveau</a></div> `;
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
                      }else{
                              ionicToast.show("Veuillez téléverser / sélectionner une zone d'action avant d'entamer la collecte",'bottom', false, 2500);
                      }
                       });
                }

               $scope.hideModalRender=function(){
                       $scope.modalRender.remove();
               }

               loadNonGeometricForm=function(){

                       var deferred = $q.defer();
                        var querySelectedProject = " SELECT _id FROM projets WHERE checkd =1  AND userId="+$scope.userId;

                                 $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {

                                        if(res.rows.length > 0) {
                                                for (var i = 0; i < res.rows.length ; i++) {
                                                       $scope.selectedProject = res.rows.item(i)._id;
                                                        var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+$scope.selectedProject+"'  AND userId="+$scope.userId;

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
                       $scope.check_if_project_none_support().then(function(){
                              console.info($scope.existe);
                              if($scope.existe==1){
                                     $state.go('sansgeometrie', { numCollecte: null, mode: "n" });
                              }else{
                                     ionicToast.show("La zone d'action choisie ne contients aucune données de support",'middle', false, 2500);
                              }
                        });
                }

               getNonGeometricDataById=function(id, num){
                       var deferred = $q.defer();
                       var sql = "SELECT data FROM dynamicData WHERE id ='"+id+"'  AND userId="+$scope.userId;
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

                //-------------------------------------------------------------------------//
                //------------- Gestion des questionnaire avec géométrie ---------------//

               $scope.GeomData = [];
               loadGeometricData=function(){
                       var deferred = $q.defer();

                       var querySelectData = " SELECT DISTINCT numero, userId FROM dynamicData WHERE id_projet='"+$scope.idProjetEncours+"'  AND userId="+$scope.userId+" AND sync=0 AND id_commune IN ";
                       querySelectData+= " (SELECT id_commune FROM communes WHERE id_projet ='"+$scope.idProjetEncours+"' AND checkd= 1  AND userId="+$scope.userId+" )";
                       $cordovaSQLite.execute(db, querySelectData).then(function(res) {
                              $scope.GeomData = [];
                              for(var i = 0; i<res.rows.length; i++){
                                      var numeroCollecte = res.rows.item(i).numero;
                                      var userId = res.rows.item(i).userId;
                                      $scope.GeomData.push({id_projet: $scope.idProjetEncours, numCollecte: userId+"-"+numeroCollecte, num: numeroCollecte });

                              }
                              console.info($scope.GeomData);
                              deferred.resolve();
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+querySelectData);
                       });

                        return deferred.promise;
               }
               $scope.check_if_project_support=function(){
                       var deferred = $q.defer();
                       $scope.existe=0;
                       var querySelectProj = " SELECT _id, support FROM projets WHERE _id='"+$scope.idProjetEncours+"'  AND checkd=1 AND userId="+$scope.userId;
                       console.info(querySelectProj);
                       $cordovaSQLite.execute(db, querySelectProj).then(function(res) {
                              console.info(res.rows.length);
                              console.info(res.rows.item(0));

                             if((res.rows.length>0) && (res.rows.item(0).support!="")){
                                     var querySelectData = " SELECT id_commune FROM communes WHERE id_projet='"+$scope.idProjetEncours+"'  AND checkd=1  AND userId="+$scope.userId+" AND id_commune IN ";
                                     querySelectData+= " (SELECT id_commune FROM supports WHERE  id_projet='"+$scope.idProjetEncours+"'  AND userId="+$scope.userId+" )";
                                     console.info(querySelectData);
                                     $cordovaSQLite.execute(db, querySelectData).then(function(result) {
                                            console.info(result.rows.length);
                                             if(result.rows.length>0){
                                                  $scope.existe = 1;
                                             }else{
                                                  $scope.existe = -1;
                                             }
                                             deferred.resolve();

                                     }, function (err) {
                                             console.info(err);
                                             console.info("err => "+querySelectData);
                                     });
                              }else{
                                     deferred.resolve();
                                     $scope.existe = 1;
                              }
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+querySelectProj);
                       });
                        return deferred.promise;
               }

               $scope.check_if_zoneAction_selected=function(){
                       var deferred = $q.defer();
                       $scope.existeZoneAction=0;
                       var querySelectData = " SELECT id_commune, geometry FROM communes WHERE id_projet='"+$scope.idProjetEncours+"'  AND checkd = 1 AND userId="+$scope.userId;
                       console.info(querySelectData);
                       $cordovaSQLite.execute(db, querySelectData).then(function(result) {
                              console.info(result.rows.length);
                               if(result.rows.length>0){
                                      console.info(result.rows.item(0).geometry);
                                     if(result.rows.item(0).geometry!=null){
                                             $scope.existeZoneAction = 1;
                                     }else{
                                            $scope.existeZoneAction = -1;
                                     }

                               }else{
                                    $scope.existeZoneAction = -1;
                               }
                               deferred.resolve();

                       }, function (err) {
                               console.info(err);
                               console.info("err => "+querySelectData);
                       });

                        return deferred.promise;
               }

               function deleteCollecte(num, id_projet){
                       var queryDeleteData = " DELETE FROM dynamicData WHERE id_projet='"+id_projet+"' AND numero='"+num+"'  AND sync=0  AND userId="+$scope.userId;
                       $cordovaSQLite.execute(db, queryDeleteData).then(function(res) {
                              $scope.modalRender.remove();
                              console.info("deleted "+num);
                       }, function (err) {
                            console.info(err);
                            console.info("err => "+queryDeleteData);
                       });
               }

               $scope.deleteCollecteByNum=function(num, id_projet){
                       console.info(num+' | '+id_projet);
                       var confirmPopup = $ionicPopup.confirm({
                              title: 'Suppression',
                              template: 'Voulez-vous vraiment supprimer la collecte sélectionnée ?'
                       });

                       confirmPopup.then(function(res) {
                               if(res) {
                                 console.log('You are sure  to delete :)');
                                   deleteCollecte(num, id_projet);

                               } else {
                                 console.log('You are not gonna delete :( ');
                               }
                       });
                }
               $scope.goToCollecteByParam=function(num){
                        $scope.modalRender.remove();
                        $scope.check_if_project_support().then(function(){
                              if($scope.existe==1){
                                     console.info("goToCollecteByParam => numCollecte= "+ num);
                                     // $state.go('collecte', { numCollecte: num, mode: "m" });
                                     $state.go('tab.collecte', { numCollecte: num, mode: "m" });
                              }else{
                                     ionicToast.show("La zone d'action choisie ne contients aucune données de support",'middle', false, 2500);
                              }
                        });

                }
               $scope.goToCollecteNew=function(){
                        $scope.modalRender.remove();
                         $scope.check_if_project_support().then(function(){
                          console.info($scope.existe);
                              if($scope.existe==1){
                                     $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                                     // $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                              }else{
                                     ionicToast.show("La zone d'action choisie ne contients aucune donnée de support",'middle', false, 2500);
                              }

                        });
                }

               $scope.goGeometricCarte=function(){

                       $scope.check_if_zoneAction_selected().then(function(){
                              if($scope.existeZoneAction==1){
                                             loadGeometricData().then(function(){
                                                    console.info($scope.GeomData);
                                                    let  html =`<ion-modal-view id="ayoub" style="width: 60%; height: 60%; top: 20%; left: 20%; right: 20%; bottom: 20%;">`;
                                                    html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
                                                    html+=  ` <h1 class = "title">{{nomProjetEncours}}</h1>`;
                                                    html+=  ` </ion-header-bar>`;
                                                    html+=  ` <ion-content class="" has-header="true">`;
                                                    html+=  `<ion-list show-delete="false">`;
                                                    html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in GeomData" type="item-text-wrap"  can-swipe="true" >`;
                                                    html+=  `Collecte N° {{ngd.numCollecte}}`;
                                                    // html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                                    html+=  `<ion-option-button class="button-assertive" ng-click="deleteCollecteByNum(ngd.num, ngd.id_projet)"><i class="icon ion-ios-trash-outline"></i></ion-option-button>`;
                                                    html+=  `<ion-option-button class="button-positive" ng-click="goToCollecteByParam(ngd.num)"><i class="icon ion-edit"></i></ion-option-button>`;
                                                    html+=  ` </ion-item>`;
                                                    html+=  ` </ion-list>`;
                                                    // html+= `<div class = "button-bar"><a class = "button button-block button-grisClair" ng-click="hideModalRender()">Retour</a>`;
                                                    // html+= `<a class = "button button-block button-bleuClair" ng-click="goToCollecteNew()">Nouveau</a></div> `;
                                                    html+= `</ion-content>`;
                                                    html+= `<ion-footer-bar class="">`;
                                                    html+= `<div class = "button-bar nopadding"><a class = "button button-block button-grisClair" ng-click="hideModalRender()" style="margin:0;">Retour</a>`;
                                                    html+= `<a class = "button button-block button-bleuClair" ng-click="goToCollecteNew()" style="margin:0;">Nouveau</a></div> `;
                                                    html+= `</ion-footer-bar>`;
                                                     // html+= `</hr>`;
                                                    html+= `</ion-modal-view>`;

                                                     $scope.modalRender  = new $ionicModal.fromTemplate(html, {
                                                            scope: $scope,
                                                            focusFirstInput:true,
                                                            backdropClickToClose:false,
                                                            hardwareBackButtonClose:false
                                                     });
                                                    $scope.modalRender.show();
                                             });
                               }else{
                                     ionicToast.show("Veuillez téléverser / sélectionner une zone d'action avant d'entamer la collecte",'bottom', false, 2500);
                              }
                       });
               }

               //--------------------------------------------------------------------------//
               //----------------- Synchronization Of Dynamic Data --------------------//
                $scope.projets=[];
                $scope.collecte=[];
                $scope.count = 0;

                $scope.idDynamicDataToFlag=[];
                $scope.idCollecteToFlag=[];

                $scope.dataToSync=[];
                $scope.selectedProjectToSync =null;

                // 2 :: Load all project info form (projets) Table where there is a non synchronized data ;)
               loadProjectToSynchronize=function(){
                       var deferred = $q.defer();
                       $scope.selectedProjectToSync =null;
                       var querySelectedProject = " SELECT DISTINCT _id, name FROM projets WHERE _id IN (SELECT DISTINCT id_projet FROM dynamicData WHERE sync=0 AND userId="+$scope.userId+" )";
                             $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                                    console.info("nbr projet à synchroniser: "+res.rows.length);
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

               $scope.projectSelectedToSync = false;
               $scope.getSelectedProjectToSync=function(id_projet){
                       $scope.selectedProjectToSync = id_projet;
                       console.info($scope.selectedProjectToSync);
                       $scope.projectSelectedToSync = true;
               }
                // 1
               $scope.PopupSynchronize = function() {

                       var html='<div ng-repeat="prj in projets">';
                       // html+=' <ion-radio name="prj"  ng-model="prj.checked" ng-value="prj.checked" ng-click="getSelectedProjectToSync(prj._id)">{{prj.name}}</ion-radio>';
                       html+=' <ion-radio name="prj"  ng-value="prj.checked" ng-click="getSelectedProjectToSync(prj._id)">{{prj.name}}</ion-radio>';
                       html+=' </div>';

                       loadProjectToSynchronize().then(function(){
                            console.info($scope.projets);
                            console.info($scope.projets.checkd);
                            if($scope.projets.length==0){
                                   ionicToast.show(' Aucune données à synchroniser ', 'middle', false, 2500);
                            }else{
                                console.info("nbr projet à synchroniser 2: "+$scope.projets.length);
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
                              .then(function(resul) {
                                    console.info(resul);
                                    console.info($scope.selectedProjectToSync);
                                    if($scope.selectedProjectToSync==null){
                                             ionicToast.show(' Vous n\'avez sélectionné aucune enquête !', 'middle', false, 2500);
                                             return;
                                    }
                                    if (resul){
                                             console.info(resul);
                                             if(!ConnectivityMonitor.isOnline()) {
                                                    console.info('pas dinternet');
                                                    ionicToast.show(' Vous n\'êtes connecté à Internet !', 'middle', false, 2500);
                                                    return;
                                             }else{
                                                    $ionicLoading.show({
                                                            template: '<ion-spinner></ion-spinner> <br/> Synchronisation en cours ...',
                                                            content: 'Loading',
                                                            animation: 'fade-in',
                                                            showBackdrop: true,
                                                            maxWidth: 200,
                                                            showDelay: 0
                                                    });

                                                    SynchronizeDynamicData($scope.selectedProjectToSync).then(function(){
                                                           $timeout(function () {
                                                                   $scope.selectedProjectToSync = null;
                                                                   $scope.projectSelectedToSync = false;
                                                           }, 1000);
                                                    });
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
                        var sqlForm= "SELECT  id, id_projet, numero, userId, superficie, exploitation, data, id_region, id_province, id_commune, geo FROM dynamicData WHERE id_projet='"+id_projet+"' AND sync = 0  AND userId="+$scope.userId;
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
                                                      region: res.rows.item(i).id_region,
                                                      province: res.rows.item(i).id_province,
                                                      commune: res.rows.item(i).id_commune,
                                                      numero: res.rows.item(i).userId+"-"+res.rows.item(i).numero,
                                                      superficie: res.rows.item(i).superficie,
                                                      exploitation: JSON.parse(res.rows.item(i).exploitation),
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
                              // url: "https://geoapiserver.herokuapp.com/api/collectes/",
                              url: $localStorage.URLDSS+"/api/collectes/",
                              data: data,
                              headers: { Authorization: $localStorage.tokenParam, 'Content-Type': 'application/json'}
                       }).then(function (res){
                          console.info("server res => ");
                          console.info(res);
                          console.info(res.status);
                          if(res.status==200){
                                console.info(res.data.id_collecte);
                                $scope.idCollecteToFlag.push(res.data.id_collecte);
                          }else{ //erreur
                                  $scope.idDynamicDataToFlag.splice(i,1);
                          }

                          console.info(JSON.stringify(res));
                          // if res.statut ==200 && res.id_collecte != ""   ===> la fonction de "sync=1" doit être éxécuté.

                              deferred.resolve();
                        },
                        function(response) {
                         console.info("response "+JSON.stringify(response));
                         ionicToast.show(' Problème de connexion ! ', 'middle', false, 2500);
                         $scope.idDynamicDataToFlag = [];
                         $ionicLoading.hide();
                       });

                       return deferred.promise;
                }
                // 6
               function setElementSyncById(id, id_collecte){

                       var deferred = $q.defer();

                       console.info("idididid "+id);
                       var sqlSync= "UPDATE dynamicData SET sync= 1, id_collecte ="+id_collecte+" WHERE id ='"+id+"' AND userId="+$scope.userId;
                       console.info(sqlSync);
                       $cordovaSQLite.execute(db, sqlSync).then(function(res) {

                        deferred.resolve();
                       }, function (err) {
                            console.log(err);
                            console.log('ERR SQL sqlSync= '+sqlSync);
                       });

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
                                     console.info("finish !!");
                                     $scope.dataToSync = [];
                                     $scope.count =0;
                                     var promises = [];
                                     console.info("$scope.idDynamicDataToFlag.length> "+$scope.idDynamicDataToFlag.length);
                                     console.info("$scope.idCollecteToFlag.length> "+$scope.idCollecteToFlag.length);

                                     for(var i = 0; i < $scope.idDynamicDataToFlag.length; i++) {
                                             console.info("$scope.idDynamicDataToFlag= "+$scope.idDynamicDataToFlag[i]);
                                             var promise = setElementSyncById($scope.idDynamicDataToFlag[i], $scope.idCollecteToFlag[i]);
                                             promises.push(promise);
                                             $scope.projets=[];
                                     }
                                     $q.all(promises).then(function(){
                                             deferred.resolve();
                                             $ionicLoading.hide();
                                            if( $scope.projectSelectedToSync==true){
                                                    ionicToast.show(' Synchronisation terminée avec succès ! ', 'middle', false, 2500);
                                           }else{
                                                   ionicToast.show(' Auncune enquête sélectionnée ! ', 'middle', false, 2500);
                                           }
                                     });

                              });

                       });

                       return deferred.promise;
                }

                $scope.Synchro=function(){
                       var sqlSync= "UPDATE dynamicData SET sync= 0 ";
                       console.info(sqlSync);
                       $cordovaSQLite.execute(db, sqlSync).then(function(res) {

                       }, function (err) {
                            console.log('ERR SQL sqlSync= '+sqlSync);
                       });
                }
                $scope.deleteDynamicData=function(){
                       var sqlSync= "DELETE FROM dynamicData";
                       console.info(sqlSync);
                       $cordovaSQLite.execute(db, sqlSync).then(function(res) {

                       }, function (err) {
                            console.log('ERR SQL sqlSync= '+sqlSync);
                       });
                }
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

                ///////////////////////////////////////
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

                //----------------------------------------------------------------------//
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
                              // url: "https://geoapiserver.herokuapp.com/api/collectes/",
                              url: $localStorage.URLDSS+"/api/collectes/",
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
                                 html+=  `<ion-header-bar class="bar bar-header bar-bleuFonce">`;
                                 html+=  ` <h1 class = "title">RNA</h1>`;
                                 html+=  ` </ion-header-bar>`;
                                 html+=  ` <ion-content class="padding"  has-header="true">`;
                                 html+=  `<ion-list>`;
                                 html+=  `<ion-item class="item-avatar item-icon-right" ng-repeat="ngd in GeomRNAData" type="item-text-wrap" ng-click="goToCollecteRNAByParam(ngd.id, ngd.id_exp)">`;
                                 html+=  `Exploitation N° {{ngd.id_exp}}`;
                                 html+=  ` <i class="icon ion-chevron-right icon-accessory"></i>`;
                                 html+=  ` </ion-item>`;
                                 html+=  ` </ion-list>`;
                                 html+= `<div class = "button-bar"><a class = "button button-block button-grisClair" ng-click="hideModalRender()">Retour</a>`;
                                 html+= `<a class = "button button-block button-bleuClair" ng-click="goToCollecteRNANew()">Nouveau</a></div> `;
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
                /////////////////////////////////////////////////////////////////////////////////////////////////////

});


app.controller("sansgeometrie",function($scope, $cordovaSQLite, $localStorage, $http, $state,$q , $cordovaGeolocation, $cordovaCamera, $stateParams, $ionicLoading, nonGeomtricData, $timeout, UserService, $cordovaNetwork,  $ionicPlatform, ionicToast, $ionicPopup, $rootScope){

        $scope.names = ["Emil", "Tobias", "Linus"];

        $scope.loginG=$localStorage.loginParam;
        $scope.userId = $localStorage.userIdParam;
         console.info($scope.userId);
         console.info("$stateParams.numCollecte");  console.info($stateParams.numCollecte);
         console.info("$stateParams.mode");  console.info($stateParams.mode);

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

        $scope.updateData = function(){
                $scope.NonGeomData=nonGeomtricData.getDataToUpdate();
                 console.info("$scope.NonGeomData= "+JSON.stringify($scope.NonGeomData));
        }

         $scope.updateDataVide = function(){
                $scope.NonGeomData = {};
               $scope.NonGeomData.data = {dssnumberdraw:  $scope.numero};
        }


        $scope.formNonGeomData=JSON.parse(nonGeomtricData.getFormData());

        $scope.IdToUpdate=nonGeomtricData.getIdToUpdate();


        // $scope.formdata=nonGeomtricData.getDataToUpdate();

        // if($stateParams.mode=="m"){

        //        $scope.NonGeomData=nonGeomtricData.getDataToUpdate();
        //        $ionicLoading.show({
        //                template: '<ion-spinner></ion-spinner> <br/> Chargement ...',
        //                content: 'Loading',
        //                animation: 'fade-in',
        //                showBackdrop: true,
        //                maxWidth: 200,
        //                showDelay: 0
        //        });

        //         $scope.IdToUpdate=nonGeomtricData.getIdToUpdate();
        //         // $scope.formdata=nonGeomtricData.getDataToUpdate();

        //         // Add a  timeout of 1 second to assign data to update to the formio form... thats the only way that worked.
        //         $timeout(function () {
        //                $ionicLoading.hide();
        //                $scope.updateData();
        //         }, 300);
        // }

        // if($stateParams.mode=="n"){

        //        $scope.NonGeomData = {};
        //        $scope.NonGeomData.data = {dssnumberdraw:  $scope.numero};

        //         $ionicLoading.show({
        //                template: '<ion-spinner></ion-spinner> <br/> Chargement ...',
        //                content: 'Loading',
        //                animation: 'fade-in',
        //                showBackdrop: true,
        //                maxWidth: 200,
        //                showDelay: 0
        //        });

        //        $timeout(function () {
        //                $ionicLoading.hide();
        //                $scope.updateDataVide();
        //         }, 300);
        // }

        // $scope.numero=nonGeomtricData.getNumero();
        // $scope.idProject=nonGeomtricData.getIdProjet();
        // $scope.idForm=nonGeomtricData.getIdForm();
        // console.info(nonGeomtricData.getFormData());

        function loadProject(){
               var deferred = $q.defer();
               $scope.selectedProject="";
                var querySelectedProject = " SELECT _id, name FROM projets WHERE checkd =1 AND userId="+$scope.userId;
               console.info(querySelectedProject);
               $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                console.info(res.rows.length);
                     if(res.rows.length > 0) {
                              $scope.selectedProject = res.rows.item(0)._id;
                              console.info($scope.selectedProject);
                     }
                      deferred.resolve();
               });

               return deferred.promise;
        }

        function getNewNumeroToCollecte(id_projet){
                  console.info("id_projet="+id_projet);
                  var deferred = $q.defer();
                  $scope.numero=0;
                  var querySelectNumeroCollecte = " SELECT MAX(numero) as max FROM dynamicData WHERE id_projet ='"+id_projet+"' AND userId="+$scope.userId;
                  console.info(querySelectNumeroCollecte);
                  $cordovaSQLite.execute(db, querySelectNumeroCollecte).then(function(res) {
                         console.info(res.rows.length);
                         if(res.rows.length > 0) {
                                if(res.rows.item(0).max==null){
                                        $scope.numero = 1;
                                }else{
                                        $scope.numero = res.rows.item(0).max;
                                        $scope.numero++;
                                }
                                console.info("$scope.numero= "+$scope.numero);
                                deferred.resolve();
                         }else{
                              $scope.numero = 1;
                         }
                  });
                  return deferred.promise;
         }

        function loadProjetForm(idProjet){
               var deferred = $q.defer();
               $scope.selectedProject = idProjet;
               var querySelectForms = " SELECT _id, name, theme, geometry, id_fields, fields FROM formulaires WHERE id_project = '"+idProjet+"'  AND userId="+$scope.userId;
               console.info(querySelectForms);
               $cordovaSQLite.execute(db, querySelectForms).then(function(res) {
                             console.info(res.rows.length);
                             // console.info("res.rows.item(0).geometry"+res.rows.item(0).geometry);
                             // nonGeomtricData.setIdForm(res.rows.item(0).id_fields);
                              $scope.idForm = res.rows.item(0).id_fields;
                              $scope.formname = res.rows.item(0).name;
                              $scope.formdata = res.rows.item(0).field;
                              // $scope.formNonGeomData = JSON.parse(res.rows.item(0).fields);
                              // console.info($scope.formNonGeomData);
                              // console.info($scope.formNonGeomData);
                             // nonGeomtricData.setFormData(res.rows.item(0).fields);
                             // nonGeomtricData.setFormData(res.rows.item(0).fields);
                             // nonGeomtricData.setIdProjet(idProjet);
                             deferred.resolve();
               }, function (err) {
                      console.info("err => "+err+ " "+querySelectForms);
                      deferred.resolve();
               });
               return deferred.promise;
        }

        function loadCommune(){
               var deferred = $q.defer();
               $scope.selectedRegion="";
               $scope.selectedProvince="";
               $scope.selectedCommune="";
               var querySelectedCommune = " SELECT id_region, id_province, id_commune, name, id_projet FROM communes WHERE checkd =1 AND id_projet ='"+$scope.selectedProject+"' AND userId="+$scope.userId;
               console.info(querySelectedCommune);
               $cordovaSQLite.execute(db, querySelectedCommune).then(function(res) {
                console.info(res.rows.length);
                     if(res.rows.length > 0) {
                              $scope.selectedRegion = res.rows.item(0).id_region;
                              $scope.selectedProvince = res.rows.item(0).id_province;
                              $scope.selectedCommune = res.rows.item(0).id_commune;
                              console.info($scope.selectedRegion);
                              console.info($scope.selectedProvince);
                              console.info($scope.selectedCommune);
                     }
               });
               deferred.resolve();
               return deferred.promise;
        }

         var supportsNiv1 = [];
         var supportsNiv2 = [];
        $scope.array = [{ "douar": "D2", "eleveur": "ayb" }, { "douar": "D1", "eleveur":  "ben"}];
        function loadSupports(){
               var querySelectedSegment = " SELECT cid, id, id_commune, support FROM supports WHERE id_commune ="+ $scope.selectedCommune+" AND userId="+$scope.userId;
                querySelectedSegment+= " AND id_projet ="+ $scope.selectedProject;
               $cordovaSQLite.execute(db, querySelectedSegment).then(function(res) {
                console.info(res);
                console.info(res.rows.length);
                 var support = JSON.parse(res.rows.item(0).support);
                         // $scope.array = [{ "douar": support.properties[douar], "eleveur": support.properties[eleveur] }, { "douar": support.properties[douar], "eleveur":  support.properties[eleveur]}];


                      if(res.rows.length > 0) {
                              // var support = JSON.parse(res.rows.item(i).support);
                              for(var i=0; i< res.rows.length; i++){
                                      // var obj = {id:  res.rows.item(i).id, n: 'Support N°. ' + JSON.parse(res.rows.item(i).support).properties[featureAttribute], support: JSON.parse(res.rows.item(i).support).properties};
                                      // array = [{ "value": "ayb", "text": "1st" }, { "value": "ben", "text": "2nd" }];
                                       // array.push({ "douar": support.properties[douar], "eleveur": support.properties[eleveur] }, { "douar": support.properties[douar], "eleveur":  support.properties[eleveur]});

                                      // supportsNiv1.push(support.properties[douar]);
                                      // supportsNiv2.push(support.properties[eleveur]);
                              }
                      }
               });
        }

        $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> <br/>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
        });

        loadProject().then(function(){
                if($stateParams.mode=="n"){
                       getNewNumeroToCollecte($scope.selectedProject);
                         $timeout(function () {
                       $ionicLoading.hide();
                       $scope.updateDataVide();
                }, 300);
                }else{
                       $scope.numero =  nonGeomtricData.getNumero();
                         $timeout(function () {
                       $ionicLoading.hide();
                       $scope.updateData();
                }, 300);
                }
                loadProjetForm($scope.selectedProject).then(function(){
                      loadCommune().then(function(){
                              loadSupports();
                              $ionicLoading.hide();
                      });
                });
        });

        //===================================================================//
        $timeout(function () {
                $scope.formCreator();
        }, 700);
        //----------------------------------------------------------------------------------------------------------//
        $scope.formCreator = function(){
                var formio = new  Formio.createForm(document.getElementById('formio'), $scope.formNonGeomData, {
                      language: 'en',  i18n: { 'en': { Submit: 'Sauvegarder' } }
                  });
                formio.then(function(form) {

                       //-------------------------------------------------//
                       if($stateParams.mode=="m"){
                               form.submission=nonGeomtricData.getDataToUpdate();
                        }

                        if($stateParams.mode=="n"){
                              form.submission = {
                                data: {
                                  dssnumberdraw: $scope.numero
                                }
                              };
                        }

                       //-------------------------------------------------//
                       form.on('submit', function(submission) {
                              console.info(submission);
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
                              var exploitation = {};
                              console.info($scope.selectedProject+" , "+ $scope.numero+" , "+ $scope.userId+" , "+ JSON.stringify(exploitation)+" , "+ JSON.stringify(collecte)+" , "+$scope.selectedRegion+" , "+ $scope.selectedProvince+" , "+$scope.selectedCommune);

                               if($stateParams.mode=="m"){
                                     updateNonGeometricData($scope.IdToUpdate, JSON.stringify(collecte)).then(function(){
                                            ionicToast.hide();
                                           $state.go('menu', {}, {reload: true});
                                    });
                              }else{
                                     registerNonGeometricData($scope.selectedProject, $scope.numero, $scope.userId, 0, JSON.stringify(exploitation), JSON.stringify(collecte), $scope.selectedRegion, $scope.selectedProvince, $scope.selectedCommune).then(function(){
                                            ionicToast.hide();
                                            $state.go('menu', {}, {reload: true});
                                    });
                              }
                       });
                      //-------------------------------------------------//
                });
        }
        //----------------------------------------------------------------------------------------------------------//

        $scope.$on('formSubmit', function(err, submission) {

                console.info(submission);
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
                var exploitation = {};
                console.info($scope.selectedProject+" , "+ $scope.numero+" , "+ $scope.userId+" , "+ JSON.stringify(exploitation)+" , "+ JSON.stringify(collecte)+" , "+$scope.selectedRegion+" , "+ $scope.selectedProvince+" , "+$scope.selectedCommune);

                 if($stateParams.mode=="m"){
                       updateNonGeometricData($scope.IdToUpdate, JSON.stringify(collecte)).then(function(){
                              ionicToast.hide();
                             $state.go('menu', {}, {reload: true});
                      });
                }else{
                       registerNonGeometricData($scope.selectedProject, $scope.numero, $scope.userId, 0, JSON.stringify(exploitation), JSON.stringify(collecte), $scope.selectedRegion, $scope.selectedProvince, $scope.selectedCommune).then(function(){
                              ionicToast.hide();
                              $state.go('menu', {}, {reload: true});
                      });
                }

        });
        //===================================================================//

        function registerNonGeometricData(id_projet, numero, userId, area, exp, data, id_reg, id_prov, id_com){
                // function registerNonGeometricData(id_projet, data){
                console.info(id_projet+" , "+ numero+" , "+ userId+" , "+ area+" , "+ exp+" , "+data+" , "+ id_reg+" , "+ id_prov+" , "+id_com);
                var deferred = $q.defer();
                console.info(id_projet+" - "+data);
                var sqlInsertData= "INSERT INTO dynamicData (id_projet, numero, userId, superficie, exploitation, data, id_region, id_province, id_commune, geo, sync) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
                // var sqlInsertData= "INSERT INTO dynamicData (id_projet, data, geo, sync) VALUES(?,?,?,?)";
                $cordovaSQLite.execute(db, sqlInsertData,[id_projet, numero, userId, area, exp, data, id_reg, id_prov, id_com, "false",  0]).then(function(res) {
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


          var formio = new  Formio.createForm(document.getElementById('formio'),  $scope.formdd);

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

    // var urlgetRegions = "https://geoapiserver.herokuapp.com/api/perimetre/region";
    // var urlgetProvinces = " https://geoapiserver.herokuapp.com/api/perimetre/province/id_region";
    // var urlgetAllProvinces = " https://geoapiserver.herokuapp.com/api/perimetre/province";
    // var urlgetCommunes = " https://geoapiserver.herokuapp.com/api/perimetre/commune/id_province";

    var urlgetRegions = $localStorage.URLDSS+"/api/perimetre/region";
    var urlgetProvinces = $localStorage.URLDSS+"/api/perimetre/province/id_region";
    var urlgetAllProvinces = $localStorage.URLDSS+"/api/perimetre/province";
    var urlgetCommunes = $localStorage.URLDSS+"/api/perimetre/commune/id_province";


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

