import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { OverviewComponent } from './overview/overview.component';
import { TabsComponent } from './tabs/tabs.component';
import { ScansComponent } from './scans/scans.component';
import { NativeScriptMaterialCardViewModule } from 'nativescript-material-cardview/angular';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ActionBarComponent,
    OverviewComponent,
    TabsComponent,
    ScansComponent,
    NativeScriptMaterialCardViewModule,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
