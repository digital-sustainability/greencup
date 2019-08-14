import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ScansComponent } from './scans/scans.component';
import { TabsComponent } from './tabs/tabs.component';

export const routes: Routes = [
  {
      path: '',
      redirectTo: '/tabs',
      pathMatch: 'full',
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
