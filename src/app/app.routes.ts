import { Routes } from '@angular/router';

import { ScansComponent } from './scans/scans.component';
import { TabsComponent } from './tabs/tabs.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { LoginSplashComponent } from './login-splash/login-splash.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login-splash',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: 'scans',
    component: ScansComponent
  },
  {
    path: 'tabs',
    component: TabsComponent
  },
  {
    path: 'login-splash',
    component: LoginSplashComponent
  },
];
