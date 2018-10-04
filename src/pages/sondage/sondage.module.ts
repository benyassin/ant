import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SondagePage } from './sondage';

// @NgModule({
//   declarations: [
//     SondagePage,
//   ],
//   imports: [
//     IonicPageModule.forChild(SondagePage),
//   ],
// })

  @NgModule({
    declarations: [
      SondagePage
    ],
    imports: [
      IonicPageModule.forChild(SondagePage)
    ],
    entryComponents: [
      SondagePage
    ]
  })
export class SondagePageModule {}
