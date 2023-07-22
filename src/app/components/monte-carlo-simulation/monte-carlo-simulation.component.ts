import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-monte-carlo-simulation',
  templateUrl: './monte-carlo-simulation.component.html',
  styleUrls: ['./monte-carlo-simulation.component.scss']
})
export class MonteCarloSimulationComponent {

  title = 'MCS validation';
  simulationPathList = ['10k', '1k', '100k'];

  monteCarloSimulationForm = new FormGroup({
    symbol: new FormControl('', Validators.required),
    currentMarketPrices: new FormControl('', Validators.required),
    strikePrices: new FormControl('', Validators.required),
    dateOfTransaction: new FormControl('', Validators.required),
    expirationDate: new FormControl('', Validators.required),
    impliedVolatilityPercentage: new FormControl('', Validators.required),
    optionType: new FormControl('call', Validators.required)
  });
}
