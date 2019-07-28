import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ScannerComponent } from './scanner/scanner.component';

export const routes: Routes = [
  {
      path: '',
      redirectTo: '/home',
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
];
