import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { OverviewComponent } from './overview/overview.component';
import { TabsComponent } from './tabs/tabs.component';
import { ScansComponent } from './scans/scans.component';
import { NativeScriptMaterialCardViewModule } from 'nativescript-material-cardview/angular';
import { LoginComponent } from './login/login.component';
import { LoginSplashComponent } from './login-splash/login-splash.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

@NgModule({
  declarations: [
    AppComponent,
    ActionBarComponent,
    OverviewComponent,
    TabsComponent,
    ScansComponent,
    NativeScriptMaterialCardViewModule,
    LoginComponent,
    LoginSplashComponent,
    EmailConfirmComponent,
    PasswordResetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
