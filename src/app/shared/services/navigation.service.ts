import { Injectable } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  private _previousUrl: string;
  private _currentUrl: string;

  constructor(
    private _routerExtensions: RouterExtensions,
  ) {
    this._currentUrl = this._routerExtensions.router.url;
    this._routerExtensions.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._previousUrl = this._currentUrl;
        this._currentUrl = event.url;
      }
    });
  }

  navigateTo(path: string, clearHistory?: boolean): void {
    const config = {
      animated: true,
      transition: {
        name: 'slide',
        duration: 200,
        curve: 'ease'
      },
      clearHistory: clearHistory || false
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

  getPreviousUrl(): string {
    return this._previousUrl;
  }

  historyAvailable(): boolean {
    return this._routerExtensions.canGoBack();
  }
}
