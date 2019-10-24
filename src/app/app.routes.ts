import { Routes } from '@angular/router';

import { ScansComponent } from './scans/scans.component';
import { TabsComponent } from './tabs/tabs.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { LoginSplashComponent } from './login-splash/login-splash.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { InfoComponent } from './info/info.component';
import { PasswordChangeComponent } from './password-change/password-change.component';

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
    path: 'email-confirm',
    redirectTo: 'email-confirm/',
  },
  {
    path: 'email-confirm/:email',
    component: EmailConfirmComponent
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent
  },
  {
    path: 'password-change',
    component: PasswordChangeComponent
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
  {
    path: 'info',
    component: InfoComponent
  }
];
