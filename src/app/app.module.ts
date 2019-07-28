import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { ScannerComponent } from './scanner/scanner.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ActionBarComponent,
    ScannerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
