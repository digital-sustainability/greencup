import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ScannerComponent } from './scanner/scanner.component';
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
      path: 'scanner',
      component: ScannerComponent
  },
  {
      path: 'tabs',
      component: TabsComponent
  },
];
