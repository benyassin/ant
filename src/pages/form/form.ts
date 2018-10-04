import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

declare const Formio: any;

@IonicPage()
@Component({
  selector: 'page-form',
  templateUrl: 'form.html',
})
export class FormPage {
  
  form: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FormPage');
    this.form = this.navParams.get('formData');
    this.openFormio(this.form.id, this.form.name, this.form.color, this.form.schema, this.form.data);
  }


  public fermerModal(data) {
    console.log(data);
    this.viewCtrl.dismiss(data);
  }

  openFormio(id, name, color, schema,data) {
    let self = this;
    let formio = new Formio.createForm(document.getElementById('formio'), JSON.parse(schema), {
      language: 'fr', i18n: {
        'fr': {
          Submit: 'Sauvegarder',
          error: "Veuillez corriger les erreurs mentionnées avant de soumettre.",
          cancel: 'Vider',
          next: 'Suivant',
          previous: "Précedent",
          complete: 'Enregistrement avec succès'
        }
      }
    });

    formio.then(function (form) {
      console.log(data);
      if (data!=null) form.submission = JSON.parse(data);

      form.on('submit', function (submission) {
      let dataObj = {
        id: id,
        name: name,
        color: color,
        data: submission
      };
        self.fermerModal(dataObj);
      console.log(submission);
      });
    });
  }

}
