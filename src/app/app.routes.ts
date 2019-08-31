import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ScansComponent } from './scans/scans.component';
import { TabsComponent } from './tabs/tabs.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'scans',
    component: ScansComponent
  },
  {
    path: 'tabs',
    component: TabsComponent
  },
];
