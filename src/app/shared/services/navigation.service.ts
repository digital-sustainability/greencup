import { Injectable } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(
    private _routerExtensions: RouterExtensions,
  ) { }

  navigateTo(path: string): void {
    const config = {
      animated: true,
      transition: {
        name: "slide",
        duration: 200,
        curve: "ease"
      }
    };
    this._routerExtensions.navigate([path], config);
  }

  navigateBack(backRoute?: string): void {
    if (backRoute) {
      // Fixes a bug that sometimes the back button won't work on specific sites
      this._routerExtensions.navigate([backRoute]);
    } else {
      this._routerExtensions.back();
    }
  }
}