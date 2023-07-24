import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DerivativePriceService {

  apiUrl:string = 'http://127.0.0.1:5015';

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
}
