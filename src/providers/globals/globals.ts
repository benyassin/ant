import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


/*
  Generated class for the GlobalsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalsProvider {

  constructor(public storage:Storage) {
    console.log('Hello GlobalsProvider Provider');
    storage.set('name', 'Max');

    // Or to get a key/value pair
    storage.get('name').then((val) => {
      console.log('Your name is', val);
    });
  
  }


  // API: string = "http://192.168.1.180";
  API: string = "http://192.168.1.180:8000";
  // API: string = "http://105.159.251.103:1111";

  public setStorage(settingName,value){
    return this.storage.set(settingName,value);
  }

  public getValue(key: string): Promise<any> {
    return this.storage.get(key);
  }

  public getStorage(settingName){
    // let res:any;
    return new Promise((resolve, reject) => {
      this.storage.get(settingName)
     .then((data)=>{
        resolve(data);
          }, (err) => {
        reject(err);
          });
    });

    
    // this.storage.get(settingName)
    //  .then((data)=>{
    //   // console.log(data); 
    //   res = data;
    // });
    // return res;

    // this.storage.getStorage('token').then((data)=>{console.log(this.var);});

  }

  public async removeStorage(settingName){
    return await this.storage.remove(settingName);
  }

  public clear() {
    return new Promise((resolve, reject) => {
      this.storage.clear().then(() => {
        console.log('all keys cleared');
        resolve('cleeeeeeeeeeeeeeeaaaaaaar');
      });
    });
  }


}
