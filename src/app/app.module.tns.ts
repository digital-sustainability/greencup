import { NgModule, NO_ERRORS_SCHEMA, ValueProvider } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { ScannerComponent } from './scanner/scanner.component';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { TabsComponent } from './tabs/tabs.component';
import { OverviewComponent } from './overview/overview.component';

import { NavigationService } from './shared/services/navigation.service';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from 'nativescript-angular/forms';

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ActionBarComponent,
    ScannerComponent,
    TabsComponent,
    OverviewComponent,
  ],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
  ],
  providers: [
    NavigationService,
    BarcodeScanner
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
