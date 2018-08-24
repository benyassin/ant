
app.filter('unique', function() {
    return function(input, key) {
        var unique = {};
        var uniqueList = [];
        for(var i = 0; i < input.length; i++){
            if(typeof unique[input[i][key]] == "undefined"){
                unique[input[i][key]] = "";
                uniqueList.push(input[i]);
            }
        }
        return uniqueList;
    };
});

app.controller("QuestCtrl", function($scope, leafletData,$timeout,$location,$ionicGesture,$rootScope,$ionicLoading,$ionicPopup,
  $ionicModal,$state,$window,$cordovaSQLite,$ionicSideMenuDelegate,ionicToast, $ionicHistory, $stateParams, $ionicPlatform, 
  $ionicPopover,$compile,$parse, $cordovaGeolocation,$q, $ionicSlideBoxDelegate, $cordovaCamera, $localStorage, $ionicScrollDelegate) {

 $ionicHistory.clearCache();
  $scope.$on('$ionicView.enter', function () {
  // alert("life cycle Ok questionnaire");
  // $localStorage.tabActive = "questionnaire";
  // console.info( $localStorage.tabActive);
});
   $localStorage.tabActive = "questionnaire";
  console.info( $localStorage.tabActive);
// app.controller("QuestCtrl",function($location,$scope, $ionicModal, $cordovaSQLite, $stateParams, $http, ionicToast, $state, $ionicPlatform, $fileFactory,$timeout, $ionicLoading, $ionicPopup,$rootScope, $q,$ionicHistory,$state,$window, $localStorage, ConnectivityMonitor){

        console.info("$stateParams.numCollecte");  console.info($stateParams.numCollecte);
        console.info("$stateParams.numero");  console.info($stateParams.numero);
        console.info("$stateParams.mode");console.info($stateParams.mode);
        console.info("$stateParams.questionnaire");console.info($stateParams.questionnaire);
        console.info("$stateParams.data");console.info($stateParams.data);
        console.info("$stateParams.type");console.info($stateParams.type);
        console.info("$stateParams.idCollecte");console.info($stateParams.idCollecte);
      
        if(($stateParams.type=="POINT") || ($stateParams.type=="POINTBD")){
            $scope.questPoint = true;
        }else{
            $scope.questPoint = false;
        }

        $scope.questForm = $stateParams.questionnaire;
        // $scope.dataObject = $stateParams.data;
        $scope.dataCollecte = JSON.parse($stateParams.data);


        if($stateParams.type!="ATTRIBUT"){ 

                // console.info("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                // console.info("$stateParams.data= "+$stateParams.data);
                // console.info("JSON.parse($stateParams.data)= "+JSON.parse($stateParams.data));
                // console.info("$scope.dataCollecte.formdata= "+$scope.dataCollecte.formdata);
                // console.info("SON.stringify($scope.dataCollecte)= "+JSON.stringify($scope.dataCollecte));
                // console.info("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");

                $scope.dataObject = $scope.dataCollecte.formdata;
                $scope.imgURI = $scope.dataCollecte.capture;
                $scope.numero = $stateParams.numero;
                
                 if(($stateParams.type=="POINT") || ($stateParams.type=="POINTBD")){ 
                         $scope.titre = "POINT";
                 }
                 if(($stateParams.type=="POLYLINE") || ($stateParams.type=="POLYLINEBD")){ 
                         $scope.titre = "POLYLINE";
                 }
                 if(($stateParams.type=="POLYGONE") || ($stateParams.type=="POLYGONEBD")){ 
                         $scope.titre = "POLYGONE";
                 }
        }else{
               if($scope.dataCollecte!=null){ 
                       $scope.dataObject =  JSON.stringify($scope.dataCollecte); 
                       $scope.imgURI = $scope.dataCollecte.capture; 
               }
                $scope.numero = $stateParams.numCollecte;
                $scope.titre = "Identification";
        }

        console.info("$scope.dataObject = "+$scope.dataObject);

        var numeroAuto, superficieAuto;
       if($stateParams.type!="ATTRIBUT"){ 
               if($scope.dataCollecte.numero!=undefined){
                       numeroAuto = $scope.dataCollecte.numero;
                       console.info("numeroAuto "+numeroAuto);
               }
               if($scope.dataCollecte.superficie!=undefined){
                       superficieAuto = $scope.dataCollecte.superficie;
                       console.info("superficieAuto "+superficieAuto);
                }
       }

        $scope.$on('formLoad', function() { 
                console.info("$scope.dataObject load = "+$scope.dataObject);
               if(($scope.dataObject==undefined) || ($scope.dataObject==null)){                              
                       console.info("load 2 ");
                       $scope.dataForm = {};
                       if($stateParams.type!="ATTRIBUT"){ 
                              if(($stateParams.type=="POLYGONE") || ($stateParams.type=="POLYGONEBD")){ 
                                     $scope.dataForm.data = {dssnumberdraw: numeroAuto, dssareac: superficieAuto};
                                     // $scope.dataForm.data = {dssnumberdraw: $stateParams.numCollecte, dssareac: superficieAuto};
                              }else{
                                     $scope.dataForm.data = {dssnumberdraw: numeroAuto};
                                     // $scope.dataForm.data = {dssnumberdraw: $stateParams.numCollecte};
                              }
                       }
               }else{
                       // $scope.dataForm = {};
                       $scope.dataForm = JSON.parse($scope.dataObject);
                       console.info("load 1  "+$scope.dataForm);
               }     

        });

        $scope.$on('formSubmit', function(err, submission) {

                console.info(err);  
                console.info(submission);  
                 // console.info(JSON.stringify(submission.data));
               if($stateParams.type!="ATTRIBUT"){ 
                       $scope.dataCollecte.formdata = JSON.stringify(submission);
                       updateTableTemporaire($stateParams.numCollecte, $stateParams.numero, $stateParams.mode, $stateParams.type, JSON.stringify($scope.dataCollecte), JSON.stringify(submission)).then(function(){
                               $timeout(function () {
                                       if($stateParams.mode=="n"){
                                              // $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                                              $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                                       }else{
                                              // $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" },{reload:true});
                                              $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" });
                                       }
                                }, 1000);
                       });                     

               }else{
                       $scope.dataCollecte = JSON.stringify(submission);
                       updateTableTemporaire($stateParams.numCollecte, 0, $stateParams.mode, $stateParams.type, $scope.dataCollecte, JSON.stringify(submission)).then(function(){
                               $timeout(function () {
                                       if($stateParams.mode=="n"){
                                              // $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                                              $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                                       }else{
                                              // $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" },{reload:true});
                                              $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" });
                                       }
                                }, 1000);
                       });                   

               }
                console.info(" $scope.dataCollecte.formdata= "+$scope.dataCollecte.formdata);

         });

        var formio;
        $scope.userId = $localStorage.userIdParam;      
        function a(){
               var deferred = $q.defer();
               var querySelectedProject = " SELECT _id, support FROM projets WHERE checkd =1 AND userId="+$scope.userId;
               console.info(querySelectedProject);
               $cordovaSQLite.execute(db, querySelectedProject).then(function(res) {
                       console.info(res.rows.length);
                       if(res.rows.length > 0){
                              for (var i = 0; i < res.rows.length ; i++) {
                                     $scope.selectedProject = res.rows.item(i)._id;
                                     $scope.support = res.rows.item(i).support;
                                     // if($scope.hasSupport){
                                     //    $scope.typeSupport = JSON.parse($scope.support).type; 
                                     // }else{
                                     //  $scope.typeSupport = "";
                                     // }
                                     
                                     $scope.hasSupport = ($scope.support !="")? true : false;
                                     if($scope.hasSupport){
                                        $scope.typeSupport = JSON.parse($scope.support).type; 
                                     }else{
                                      $scope.typeSupport = "";
                                     }
                                     console.info("xxxxxxxxxxxxxxxxxxxxxxxx");
                                     console.info($scope.hasSupport);
                                     console.info($scope.typeSupport);
                             }
                       }
                      deferred.resolve();
               });
               return deferred.promise;
        }

        function b(){
               if($scope.hasSupport && $scope.typeSupport=="tabulaire"){
                      $scope.supportSelect1 = true;
                      $scope.supportSelect2 = true;
                       var querySelectedSegment = " SELECT cid, id, id_commune, support FROM supports WHERE  userId="+$scope.userId +" AND id_commune IN( ";
                       querySelectedSegment+=" SELECT id_commune FROM communes WHERE checkd =1 AND userId="+$scope.userId+" ) ";
                       console.info(querySelectedSegment);
                       $cordovaSQLite.execute(db, querySelectedSegment).then(function(res) {
                              console.info(res);
                              console.info(res.rows.length);
                               if(res.rows.length > 0) {
                                      for(var i=0; i< res.rows.length; i++){
                                             // var supp = JSON.parse(JSON.parse(res.rows.item(i).support));
                                             var supp =JSON.parse(res.rows.item(i).support);
                                             $scope.supportNivList.push(supp);
                                             if(supp.id_echantillon==undefined) $scope.supportSelect1 = false;
                                             if(supp.id_echantillon2==undefined) $scope.supportSelect2 = false;
                                      }
                               }
                               console.info($scope.supportSelect1);
                               console.info($scope.supportSelect2);
                       });

               }
        }
        // $(document).ready(function() {
        //    $('.btn-wizard-nav-cancel').click(function() {
        //                        console.info("reset 1111111111");
        //                 });
        // });

       $scope.updateSupportNiv1=function(supp){
                formio.then(function(form) {
                       // if($scope.supportSelect1!=false){
                       //        if($scope.supportSelect2==false){
                       //               $scope.dataCollecte.id_support = supp.id;
                       //               $scope.dataCollecte.support = supp;
                       //        }
                       // }
                       form.submission = { data: { id_echantillon: supp.id_echantillon,  id_echantillon2 : '' }  };
                 });

               $scope.dataCollecte.id_support = supp.id;
               $scope.dataCollecte.support = supp;
        }
        $scope.updateSupportNiv2=function(supp){
               formio.then(function(form) {
                     form.submission = { data: {  id_echantillon2: supp.id_echantillon2  }   };
               });
               $scope.dataCollecte.id_support = supp.id;
               $scope.dataCollecte.support = supp;
               console.info($scope.dataCollecte.id_support);
               console.info($scope.dataCollecte.support);  
        }

        $scope.supportNivList = [];
        a().then(function(){
               console.info($scope.hasSupport);
               console.info($scope.typeSupport);
               console.info($scope.dataCollecte.id_support);
               console.info($scope.dataCollecte.support);  
               b();

               $timeout(function () {
                      $scope.formCreator();
               }, 700);
        });

      
        //----------------------------------------------------------------------------------------------------------//
          //-------------------------------------------------//
                       // Ecrire ici le code pour charger les 2 select des données support tabulaire ;) 

                     
                    
                    
                       //-------------------------------------------------//
        //----------------------------------------------------------------------------------------------------------//
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
                    $scope.dataCollecte.capture= "data:image/jpeg;base64," + imageData;
                    // alert($scope.imgURI);
                }, function(err) {
                    // alert("An error Occured");
                    // alert(err);
                });
         }


        $scope.formCreator = function(){
                formio = new  Formio.createForm(document.getElementById('formio'), $scope.questForm, {
                      language: 'en',  i18n: { 'en': { 
                        Submit: 'Sauvegarder',
                        error : "Veuillez corriger les erreurs suivantes avant de soumettre.",
                        cancel:'Vider',
                        next:'Suivant',
                        previous : "Précedent",
                        complete:'Modification avec succès'
                        } }
                  });
                formio.then(function(form) {
                      
                       //-------------------------------------------------//
                       
                       //-------------------------------------------------//
                       console.info("$scope.dataObject load = "+$scope.dataObject);
                       if(($scope.dataObject==undefined) || ($scope.dataObject==null)){                              
                               console.info("load 2");
                               form.submission = {};
                               if($stateParams.type!="ATTRIBUT"){ 
                                      if(($stateParams.type=="POLYGONE") || ($stateParams.type=="POLYGONEBD")){ 
                                             // form.submission.data = {dssnumberdraw: numeroAuto, dssareac: superficieAuto};
                                             form.submission = {
                                                    data: {
                                                            // dssnumberdraw: $stateParams.numCollecte, 
                                                            dssnumberdraw: numeroAuto, 
                                                            dssareac: superficieAuto
                                                    }
                                             };
                                      }else{
                                             // form.submission.data = {dssnumberdraw: numeroAuto};
                                              form.submission = {
                                                    data: {
                                                            dssnumberdraw: numeroAuto 
                                                            // dssnumberdraw: $stateParams.numCollecte 
                                                    }
                                             };
                                      }
                               }
                       }else{
                               
                               // if($stateParams.type!="ATTRIBUT"){ 
                               //        form.submission = $scope.dataObject;
                               // }else{
                                      if(typeof($scope.dataObject)=="string"){
                                            form.submission = JSON.parse($scope.dataObject);
                                      }else{
                                            form.submission = $scope.dataObject;
                                      }
                                      
                               // }
                               
                               console.info("load 1  "+form.submission);
                       }    
                       //-------------------------------------------------//
                       // form.on('change', function() {

                       //        console.info("reset 1111111111");
                       // });

                       form.on('submit', function(submission) {
                              console.log('Submission was made!' +JSON.stringify(submission));
                              if($stateParams.type!="ATTRIBUT"){ 
                                     // $scope.dataCollecte.formdata = JSON.stringify(submission);
                                     $scope.dataCollecte.formdata = submission;
                                     updateTableTemporaire($stateParams.numCollecte, $stateParams.numero, $stateParams.mode, $stateParams.type, JSON.stringify($scope.dataCollecte), JSON.stringify(submission)).then(function(){
                                             $timeout(function () {
                                                     if($stateParams.mode=="n"){
                                                            // $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                                                            $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                                                     }else{
                                                            // $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" },{reload:true});
                                                            $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" });
                                                     }
                                              }, 1000);
                                     });                     

                               }else{

                                     if($scope.hasSupport ==true && $scope.typeSupport =="tabulaire"){
                                             if($scope.dataCollecte.id_support=undefined){
                                                    ionicToast.show('Veuillez sélectionner une donnée de support !!','middle', false, 2500);
                                                    return;
                                             } 
                                     }
                                     $scope.dataCollecte = JSON.stringify(submission);
                                     updateTableTemporaire($stateParams.numCollecte, 0, $stateParams.mode, $stateParams.type, $scope.dataCollecte, JSON.stringify(submission)).then(function(){
                                             $timeout(function () {
                                                     if($stateParams.mode=="n"){
                                                            // $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                                                            $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                                                     }else{
                                                            // $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" },{reload:true});
                                                            $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" });
                                                     }
                                             }, 1000);
                                     });                   
                               }
                              console.info(" $scope.dataCollecte.formdata= "+$scope.dataCollecte.formdata);
                       });
                });
        }
        //----------------------------------------------------------------------------------------------------------//

        $scope.goCarte=function(){
               if($stateParams.mode=="n"){
                            $state.go('tab.collecte', { numCollecte: null, mode: "n" });
                      }else{
                            $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" });
                      }
        }

        function selectFromTableTemporaire(){

                var sqlselect= "SELECT id,numCollecte,numero,mode, type, data, formdata FROM tempData ";
                console.info("Sql select QuestCtrl= "+sqlselect);

               $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                       console.info(res);
                       if(res.rows.length>0){
                              console.info("((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((");
                              console.info("id= "+res.rows.item(0).id);
                              console.info("numCollecte= "+res.rows.item(0).numCollecte);
                              console.info("numero= "+res.rows.item(0).numero);
                              console.info("mode= "+res.rows.item(0).mode);
                              console.info("type= "+res.rows.item(0).type);
                              console.info("data= "+res.rows.item(0).data);
                              console.info("formdata= "+res.rows.item(0).formdata);
                              console.info("))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))");
                       }
                     
               }, function (err) {
                       console.log(err);
                       console.log('ERR SQL sqlselect= '+sqlselect);
               });    
        }

        updateTableTemporaire = function(numCollecte, numero, mode, type, data, formdata){
                console.info(numCollecte+" , "+ numero+" , "+ mode+" , "+ type+" , "+ data+" , "+ formdata);
                var deferred = $q.defer();
                // var sqlselect= "UPDATE tempData SET data = '"+data+"',  formdata = '"+formdata+"' WHERE   id ='"+id+"' ";
                if(type!="ATTRIBUT"){
                       var sqlselect= "UPDATE tempData SET data = '"+data+"',  formdata = '"+formdata+"' WHERE  ";
                       sqlselect+=" numCollecte = '"+numCollecte+"' AND numero = "+numero+ " AND type = '"+type+"' ";
                }else{
                       var sqlselect= "UPDATE tempData SET data = '"+data+"',  formdata = '"+formdata+"'  WHERE  numCollecte = '"+numCollecte+"' AND type = '"+type+"' ";
                }
                console.info("Sql update QuestCtrl= "+sqlselect);       
                 
                $cordovaSQLite.execute(db, sqlselect).then(function(res) {
                       console.info(res);
                       deferred.resolve();
                       // if($stateParams.mode=="n"){
                       //        $state.go('tab.collecte', { numCollecte: null, mode: "n" },{reload:true});
                       // }else{
                       //        $state.go('tab.collecte', { numCollecte: $stateParams.numCollecte, mode: "m" },{reload:true});
                       // }
               }, function (err) {
                       console.log(err);
                       console.log('ERR SQL sqlselect= '+sqlselect);
                       deferred.resolve();
               });    
                return deferred.promise;
        }

        //----------------------------------------------------------------------------------------------------------//

        $('input[name=image1]').change(function(ev) {
            var doc1 = document.getElementById("image1").files[0].name;
            console.info(doc1.split(".")[0]);
            formio.then(function(form) {
                form.submission = { data: { image1: doc1 }  };
            });
        });
         $('input[name=image2]').change(function(ev) {
            var doc2 = document.getElementById("image2").files[0].name;
            console.info(doc2.split(".")[0]);
            formio.then(function(form) {
                form.submission = { data: { image2: doc2 }  };
            });
        });
          $('input[name=image3]').change(function(ev) {
            var doc3 = document.getElementById("image3").files[0].name;
            console.info(doc3.split(".")[0]);
            formio.then(function(form) {
                form.submission = { data: { image3: doc3 }  };
            });
        });
        //----------------------------------------------------------------------------------------------------------//

});