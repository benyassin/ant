import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalCollecteEditPage } from './modal-collecte-edit';

@NgModule({
  declarations: [
    ModalCollecteEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalCollecteEditPage),
  ],
})
export class ModalCollecteEditPageModule {}
