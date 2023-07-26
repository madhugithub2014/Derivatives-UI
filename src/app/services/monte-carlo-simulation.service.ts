import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonteCarloSimulationService {

  apiUrl:string = 'http://localhost:5015';

  constructor(private http: HttpClient) { }

  postCallOptionPrice(data: any): Observable<any> {
    const url = `${this.apiUrl}/neve/callOption/price`;
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
