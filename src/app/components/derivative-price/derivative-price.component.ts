import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DerivativePriceService } from '../../services/derivative-price.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { formatDate } from '@angular/common' 
import { Subscription } from 'rxjs';

interface Post {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-derivative-price',
  templateUrl: './derivative-price.component.html',
  styleUrls: ['./derivative-price.component.scss']
})
export class DerivativePriceComponent implements OnInit{
  private subscription: Subscription[] =[];
  constructor(private service: DerivativePriceService, private datePipe : DatePipe,
    private currencyPipe: CurrencyPipe) {}
  submitted = false;
  
  symbols: any [] = [];
  selectedSymbol: string = '';
  priceDerivativeResult: any;
  result: any = {};
  value: any;
  defaultCurrentMarketPrice: any = 0.00;

  post: Post = {
    startDate: new Date(Date.now()),
    endDate: new Date(this.lastThurday())
  }

  lastThurday() {
    var now = new Date();
    var daysAfterLastThursday = (-7 + 4) - now.getDay(); // 7 = number of days in week, 4 = the thursdayIndex (0= sunday)
    var currentMs = now.getTime();
    var lastThursday = new Date(currentMs + (daysAfterLastThursday * 24 * 60 * 60 * 1000));
    return lastThursday;
  }

  ngOnInit() {
    this.loadSymbol();
  }

  priceDerivativeForm = new FormGroup({
    symbol: new FormControl('', Validators.required),
    currentMarketPrice: new FormControl(this.currencyPipe.transform('0'), Validators.required),
    strikePrice: new FormControl( this.currencyPipe.transform('0'), Validators.required),
    dateOfTransaction: new FormControl(formatDate(this.post.startDate, 'yyyy-MM-dd', 'en'), Validators.required),
    expirationDate: new FormControl(formatDate(this.post.endDate, 'yyyy-MM-dd', 'en'), Validators.required),
    impliedVolatilityPercentage: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')]))
  });

  resetForm() {
    this.priceDerivativeForm.patchValue({
      symbol: '',
      currentMarketPrice: this.currencyPipe.transform('0'),
      strikePrice: this.currencyPipe.transform('0'),
      dateOfTransaction : formatDate(this.post.startDate, 'yyyy-MM-dd', 'en'),
      expirationDate: formatDate(this.post.endDate, 'yyyy-MM-dd', 'en'),
      impliedVolatilityPercentage: '0'
    });
    this.resultForm.reset();
  }

  resultForm = new FormGroup ({
    valueOfCall: new FormControl('', Validators.maxLength(30))
  })

  loadSymbol() {
    this.service.getSymbol().subscribe((data:any[]) => {
      this.symbols = data;
    });
  }

  postPredictData() {
    let priceDerivativeObj = this.priceDerivativeForm.getRawValue();
    let strikePriceValue =  priceDerivativeObj.strikePrice?.slice(1);
    let spotPriceValue = priceDerivativeObj.currentMarketPrice?.slice(1);
    let diff = this.diffFormula(Number(spotPriceValue), Number(strikePriceValue));
    let daysDiff = this.daysDiffFormula(priceDerivativeObj.expirationDate, priceDerivativeObj.dateOfTransaction);
    let timeToExpiry = this.timeToExpiryFormula(daysDiff);
    
    let Obj = {
      "strike_price": Number(strikePriceValue),
      "spot_price": Number(spotPriceValue),
      "bid_ask": 0,
      "diff": diff,
      "orders": 0,
      "days_diff": 0,
      "time_to_expiry": timeToExpiry,
      "implied_volatility": Number(priceDerivativeObj.impliedVolatilityPercentage)
    }
  
    this.subscription.push(this.service.postPredictData(Obj).subscribe((res) => {
      this.value = parseFloat(res.option_call_price).toFixed(2);
      this.resultForm.patchValue({
        valueOfCall:  this.value 
      });
      this.priceDerivativeResult = this.value;
      this.service.valueofCallEmit(this.priceDerivativeResult);
    }))
  }

  getSymbolDetail() {
     
    this.service.getSymbolDetail(this.selectedSymbol).subscribe((response: any) => {
      console.log(response);
      this.result = response;
      let mydate = this.parseLastTradeDate(this.result.lastTradeDate);
      console.log("check:"+mydate);
      this.priceDerivativeForm.patchValue({
        currentMarketPrice: this.currencyPipe.transform(this.result.currentPrice),
        strikePrice: this.currencyPipe.transform(this.result.strikePrice),
        dateOfTransaction : formatDate(mydate, "yyyy-MM-dd", 'en'),
        expirationDate: this.formatExpirationDate(this.result.expiryDate),
        impliedVolatilityPercentage: this.parseVolatilityValue(this.result.impliedVolatility)
      }); 
      let object = {
        "symbol" : this.selectedSymbol,
        "currentMarketPrice": this.result.currentPrice,
        "strikePrice": this.result.strikePrice,
        "dateOfTransaction" : formatDate(mydate, "yyyy-MM-dd", 'en'),
        "expirationDate": this.formatExpirationDate(this.result.expiryDate),
        "impliedVolatilityPercentage": this.parseVolatilityValue(this.result.impliedVolatility)
      }
      this.service.dataEmit(object);
    });
  }

  parseLastTradeDate(date: any) {
    const parseDate = date.split('-');
    const parseTime = parseDate[2].split(' ');
    const parsedDate = `${parseTime[0]}/${parseDate[1]}/${parseDate[0]}`
    let format = parsedDate.split(/\//);
    let finalDate =  [ format[1], format[0], format[2] ].join('/');
    return finalDate;
  }

  formatExpirationDate(date: any) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
  }

  parseVolatilityValue(value : any) {
    return value.substring(0, value.length - 1);
  }

  diffFormula(spot: any, strike: any) {
    let diff = Math.abs(((spot - strike) /spot) * 100);
    return diff;
  }

  daysDiffFormula(expirationDate: any, dateOfTransaction: any) {
    const expDate = new Date(expirationDate).valueOf();
    const transDate = new Date(dateOfTransaction).valueOf();
    const diffTime = Math.abs(expDate - transDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffDays + " days");
    return diffDays;
  }

  timeToExpiryFormula(daysDiff: any) {
    let timeToExpiry = daysDiff/250;
    return timeToExpiry;
  }

  get priceDerivativeFormControl() {
    return this.priceDerivativeForm.controls;
  }
  
}
