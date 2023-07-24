import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { MonteCarloSimulationService } from '../../services/monte-carlo-simulation.service';
import { DatePipe } from '@angular/common';
import { formatDate } from '@angular/common' 
import { Subscription } from 'rxjs';

interface Post {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-monte-carlo-simulation',
  templateUrl: './monte-carlo-simulation.component.html',
  styleUrls: ['./monte-carlo-simulation.component.scss']
})
export class MonteCarloSimulationComponent {
  private subscription: Subscription[] =[];
  constructor(private service: MonteCarloSimulationService, private datePipe : DatePipe) {}
  title = 'Monte Carlo Simulation validation';
  simulationPathList = [{path: '10k', steps: '10000'}, {path: '1k', steps: '1000'}, {path: '100k', steps: '100000'}];
  submitted = false;
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

  loadSymbol() {
    this.service.getSymbol().subscribe((data:any[]) => {
      this.symbols = data;
    });
  }


  monteCarloSimulationForm = new FormGroup({
    symbol: new FormControl('', Validators.required),
    currentMarketPrices: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')])),
    strikePrices: new FormControl('0', Validators.required),
    dateOfTransaction: new FormControl(formatDate(this.post.startDate, 'yyyy-MM-dd', 'en'), Validators.required),
    expirationDate: new FormControl(formatDate(this.post.endDate, 'yyyy-MM-dd', 'en'), Validators.required),
    impliedVolatilityPercentage: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')])),
    simulationPathList: new FormControl(this.simulationPathList[0].steps, Validators.required)
  });

  postPredictData() {
    let monteCarloObj = this.monteCarloSimulationForm.getRawValue();
    let Obj = {
      "strikePrice": monteCarloObj.strikePrices,
      "spotPrice": monteCarloObj.currentMarketPrices,
      "time": 0,
      "volatility": Number(monteCarloObj.impliedVolatilityPercentage),
      "steps": Number(monteCarloObj.simulationPathList),
      "trials": 1000      
    }

    this.subscription.push(this.service.postCallOptionPrice(Obj).subscribe((res) => {
      this.value = parseFloat(res).toFixed(2);
      this.resultForm.patchValue({
        valueOfCall:  this.value 
      });
    }))
  }

  getSymbolDetail() {
    let monteCarloObj = this.monteCarloSimulationForm.getRawValue();
    this.service.getSymbolDetail(this.selectedSymbol).subscribe((response: any) => {
      console.log(response);
      this.result = response;
      let mydate = this.parseLastTradeDate(this.result.lastTradeDate);
      console.log("check:"+mydate);
      this.monteCarloSimulationForm.patchValue({
        currentMarketPrices: this.result.currentPrice,
        strikePrices: this.result.strikePrice,
        dateOfTransaction : formatDate(mydate, "yyyy-MM-dd", 'en'),
        expirationDate: this.formatExpirationDate(this.result.expiryDate),
        impliedVolatilityPercentage: this.parseVolatilityValue(this.result.impliedVolatility),
        simulationPathList: monteCarloObj.simulationPathList
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

  resultForm = new FormGroup ({
    valueOfCall: new FormControl('', Validators.maxLength(30))
  })

  get  monteCarloSimulationFormControl() {
    return this.monteCarloSimulationForm.controls;
  }

}
