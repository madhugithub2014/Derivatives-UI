import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-derivative-price',
  templateUrl: './derivative-price.component.html',
  styleUrls: ['./derivative-price.component.scss']
})
export class DerivativePriceComponent {

  title = 'Price Prediction';

  priceDerivativeForm = new FormGroup({
    symbol: new FormControl('', Validators.required),
    currentMarketPrices: new FormControl('', Validators.required),
    strikePrices: new FormControl('', Validators.required),
    dateOfTransaction: new FormControl('', Validators.required),
    expirationDate: new FormControl('', Validators.required),
    impliedVolatilityPercentage: new FormControl('', Validators.required),
    optionType: new FormControl('call', Validators.required)
  });
}
