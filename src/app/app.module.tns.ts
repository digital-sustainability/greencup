import { NgModule, NO_ERRORS_SCHEMA, ValueProvider } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {NativeScriptFormsModule} from 'nativescript-angular/forms';

import { AppComponent } from './app.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { OverviewComponent } from './overview/overview.component';
import { TabsComponent } from './tabs/tabs.component';
import { ScansComponent } from './scans/scans.component';

import { NavigationService } from './shared/services/navigation.service';
import { CsrfService } from './shared/services/csrf.service';
import { HttpInterceptorService } from './shared/services/http-intercepter.service';
import { FeedbackService } from './shared/services/feedback.service';
import { AuthService } from './shared/services/auth.service';

import { BarcodeScanner } from 'nativescript-barcodescanner';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { LoginSplashComponent } from './login-splash/login-splash.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ScanModalComponent } from './scan-modal/scan-modal.component';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { InfoComponent } from './info/info.component';
import { PasswordChangeComponent } from './password-change/password-change.component';
import { PayoutModalComponent } from './payout-modal/payout-modal.component';
import { CupStatusInfoModalComponent } from './cup-status-info-modal/cup-status-info-modal.component';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from 'nativescript-angular/forms';

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';

@NgModule({
  declarations: [
    AppComponent,
    ActionBarComponent,
    OverviewComponent,
    TabsComponent,
    ScansComponent,
    LoginComponent,
    AdminComponent,
    LoginSplashComponent,
    EmailConfirmComponent,
    PasswordResetComponent,
    InfoComponent,
    ScanModalComponent,
    PasswordChangeComponent,
    PayoutModalComponent,
    CupStatusInfoModalComponent,
  ],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    HttpClientModule,
    NativeScriptUIListViewModule,
    NativeScriptFormsModule,
  ],
  entryComponents: [
    ScanModalComponent,
    PayoutModalComponent,
    CupStatusInfoModalComponent
  ],
  providers: [
    NavigationService,
    BarcodeScanner,
    CsrfService,
    HttpInterceptorService,
    FeedbackService,
    AuthService,
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
