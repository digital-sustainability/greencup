import { NgModule, NO_ERRORS_SCHEMA, ValueProvider } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { ScannerComponent } from './scanner/scanner.component';
import { TabsComponent } from './tabs/tabs.component';
import { OverviewComponent } from './overview/overview.component';

import { NavigationService } from './shared/services/navigation.service';
import { CsrfService } from './shared/services/csrf.service';
import { HttpInterceptorService } from './shared/services/http-intercepter.service';

import { BarcodeScanner } from 'nativescript-barcodescanner';

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
    HttpClientModule,
  ],
  providers: [
    NavigationService,
    BarcodeScanner,
    CsrfService,
    HttpInterceptorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },

  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
