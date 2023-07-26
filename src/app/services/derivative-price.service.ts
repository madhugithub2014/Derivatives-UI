import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DerivativePriceService {

  apiUrl:string = 'http://localhost:5015';

  symbolList = new EventEmitter<object>();
  valueOfCallResult = new EventEmitter<any>();
  constructor(private http: HttpClient) { }

  postPredictData(data: any): Observable<any>{
    const url = `${this.apiUrl}/neve/ml/predict`;
    return this.http.post<any>(url, data);
  }

  getSymbol(): Observable<any[]> {
    const url = `${this.apiUrl}/neve/symbols`;
    console.log(url);
    return this.http.get<any[]>(url);
  }

  getSymbolDetail(data: any): Observable<any[]> {
    const url = `${this.apiUrl}/neve/symbol/details/${data}`;
    console.log(url);
    return this.http.get<any[]>(url);
  }

  dataEmit(data:object) {
    this.symbolList.emit(data);
  }

  valueofCallEmit(data:any) {
    this.valueOfCallResult.emit(data);
  }
}
