import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectePage } from './collecte';

// @NgModule({
//   declarations: [
//     CollectePage,
//   ],
//   imports: [
//     IonicPageModule.forChild(CollectePage),
//   ],
// })


  @NgModule({
    declarations: [
      CollectePage
    ],
    imports: [
      IonicPageModule.forChild(CollectePage)
    ],
    entryComponents: [
      CollectePage
    ]
  })

export class CollectePageModule {}
