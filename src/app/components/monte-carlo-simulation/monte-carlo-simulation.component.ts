import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { MonteCarloSimulationService } from '../../services/monte-carlo-simulation.service';
import { DerivativePriceService } from '../../services/derivative-price.service';
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
  constructor(private dpservice: DerivativePriceService, private service: MonteCarloSimulationService, private datePipe : DatePipe) {}
 
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
    this.setSymbolDetail();
  }



  monteCarloSimulationForm = new FormGroup({
    symbol: new FormControl('', Validators.required),
    currentMarketPrice: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')])),
    strikePrice: new FormControl('0', Validators.required),
    dateOfTransaction: new FormControl(formatDate(this.post.startDate, 'yyyy-MM-dd', 'en'), Validators.required),
    expirationDate: new FormControl(formatDate(this.post.endDate, 'yyyy-MM-dd', 'en'), Validators.required),
    impliedVolatilityPercentage: new FormControl('0', 
    Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(20), 
      Validators.pattern('\d+([.]\d+)?')])),
    simulationPathList: new FormControl(this.simulationPathList[0].steps, Validators.required)
  });

  setSymbolDetail() {
    this.dpservice.symbolList.subscribe((resp) => {
      console.log("data from first :" + resp);
      this.result = resp;
      this.monteCarloSimulationForm.patchValue({
        symbol: this.result.symbol,
        currentMarketPrice: this.result.currentMarketPrice,
        strikePrice: this.result.strikePrice,
        dateOfTransaction :  this.result.dateOfTransaction,
        expirationDate:  this.result.expirationDate,
        impliedVolatilityPercentage:  this.result.impliedVolatilityPercentage
      });
    })
  }

  postPredictData() {
    let monteCarloObj = this.monteCarloSimulationForm.getRawValue();
    let timeToExpiry = this.timeToExpiryFormula(monteCarloObj.expirationDate, monteCarloObj.dateOfTransaction);
    let Obj = {
      "strikePrice": monteCarloObj.strikePrice,
      "spotPrice": monteCarloObj.currentMarketPrice,
      "time": timeToExpiry,
      "volatility": Number(monteCarloObj.impliedVolatilityPercentage),
      "steps": 200,
      "trials": Number(monteCarloObj.simulationPathList)      
    }
    this.subscription.push(this.service.postCallOptionPrice(Obj).subscribe((res) => {
      this.value = parseFloat(res).toFixed(2);
      this.resultForm.patchValue({
        valueOfCall:  this.value 
      });
    }))
    this.dpservice.valueOfCallResult.subscribe((resp) => {
      console.log(resp);
    });
  }

  timeToExpiryFormula(expirationDate: any, dateOfTransaction: any) {
    const expDate = new Date(expirationDate).valueOf();
    const transDate = new Date(dateOfTransaction).valueOf();
    const diffTime = Math.abs(expDate - transDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays/250;
  }

  resultForm = new FormGroup ({
    valueOfCall: new FormControl('', Validators.maxLength(30))
  })

  get  monteCarloSimulationFormControl() {
    return this.monteCarloSimulationForm.controls;
  }

}
