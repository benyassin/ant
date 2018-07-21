import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the GlobalsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalsProvider {

  constructor(public http: HttpClient) {
    console.log('Hello GlobalsProvider Provider');
  }


  API: string = "http://192.168.1.180";
  // API: string = "http://105.159.251.103:1115";

}
