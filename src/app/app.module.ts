import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { OverviewComponent } from './overview/overview.component';
import { TabsComponent } from './tabs/tabs.component';
import { ScansComponent } from './scans/scans.component';
import { InfoComponent } from './info/info.component';
import { LoginComponent } from './login/login.component';
import { LoginSplashComponent } from './login-splash/login-splash.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ScanModalComponent } from './scan-modal/scan-modal.component';
import { PasswordChangeComponent } from './password-change/password-change.component';
<<<<<<< src/app/app.module.ts
import { PayoutModalComponent } from './payout-modal/payout-modal.component';
import { CupStatusInfoModalComponent } from './cup-status-info-modal/cup-status-info-modal.component';
import { HelpComponent } from './shared/components/help/help.component';
=======
import { PayoutModalComponent } from './payout-modal/payout-modal.component';
import { AdminComponent } from './admin/admin.component';
>>>>>>> src/app/app.module.ts

@NgModule({
  declarations: [
    AppComponent,
    ActionBarComponent,
    OverviewComponent,
    TabsComponent,
    ScansComponent,
    LoginComponent,
    LoginSplashComponent,
    EmailConfirmComponent,
    PasswordResetComponent,
    InfoComponent,
    ScanModalComponent,
    PasswordChangeComponent,
    PayoutModalComponent,
<<<<<<< src/app/app.module.ts
    CupStatusInfoModalComponent,
HelpComponent,
=======
    AdminComponent
>>>>>>> src/app/app.module.ts
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
