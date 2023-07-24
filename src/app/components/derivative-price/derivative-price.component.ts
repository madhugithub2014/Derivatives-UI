import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DerivativePriceService } from '../../services/derivative-price.service';
import { DatePipe } from '@angular/common';
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
export class DerivativePriceComponent {
  private subscription: Subscription[] =[];
  constructor(private service: DerivativePriceService, private datePipe : DatePipe) {}
  submitted = false;
  title = 'Price Prediction';
  symbols: any [] = [];
  selectedSymbol: string = '';
  result: any = {};
  value: any;

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
    currentMarketPrices: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')])),
    strikePrices: new FormControl('0', Validators.required),
    dateOfTransaction: new FormControl(formatDate(this.post.startDate, 'yyyy-MM-dd', 'en'), Validators.required),
    expirationDate: new FormControl(formatDate(this.post.endDate, 'yyyy-MM-dd', 'en'), Validators.required),
    impliedVolatilityPercentage: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')]))
  });

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
    //const date2 = new Date(priceDerivativeObj.expirationDate);
    //const diffTime = Math.abs(date2 - date1);
    //const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    let Obj = {
      "strike_price": priceDerivativeObj.strikePrices,
      "spot_price": priceDerivativeObj.currentMarketPrices,
      "bid_ask": 0,
      "diff": 0,
      "orders": 0,
      "days_diff": 0,
      "time_to_expiry": 255,
      "implied_volatility": Number(priceDerivativeObj.impliedVolatilityPercentage)
    }
  
    this.subscription.push(this.service.postPredictData(Obj).subscribe((res) => {
      this.value = parseFloat(res.option_call_price).toFixed(2);
      this.resultForm.patchValue({
        valueOfCall:  this.value 
      });
    }))
  }

  getSymbolDetail() {
    this.service.getSymbolDetail(this.selectedSymbol).subscribe((response: any) => {
      console.log(response);
      this.result = response;
      let mydate = this.parseLastTradeDate(this.result.lastTradeDate);
      console.log("check:"+mydate);
      this.priceDerivativeForm.patchValue({
        currentMarketPrices: this.result.currentPrice,
        strikePrices: this.result.strikePrice,
        dateOfTransaction : formatDate(mydate, "yyyy-MM-dd", 'en'),
        expirationDate: this.formatExpirationDate(this.result.expiryDate),
        impliedVolatilityPercentage: this.parseVolatilityValue(this.result.impliedVolatility)
      });
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

  get priceDerivativeFormControl() {
    return this.priceDerivativeForm.controls;
  }
}
