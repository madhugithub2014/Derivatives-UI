import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DerivativePriceComponent } from './components/derivative-price/derivative-price.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Neve Derivatives';
}
