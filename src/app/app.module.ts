import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule} from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CurrencyPipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DerivativePriceComponent } from './components/derivative-price/derivative-price.component';
import { MonteCarloSimulationComponent } from './components/monte-carlo-simulation/monte-carlo-simulation.component';
import { DerivativePriceService } from './services/derivative-price.service';
import { MonteCarloSimulationService } from './services/monte-carlo-simulation.service';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MonteCarloSimulationComponent,
    DerivativePriceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    HttpClientModule
  ],
  providers: [DerivativePriceService,MonteCarloSimulationService,DatePipe,CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
