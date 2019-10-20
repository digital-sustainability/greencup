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

  navigateTo(path: string, clearHistory?: boolean, data?: string | number): void {
    const config = {
      animated: true,
      transition: {
        name: 'slide',
        duration: 200,
        curve: 'ease'
      },
      clearHistory: clearHistory || false
    };
    const commands = data ? [path, data] : [path];
    this._routerExtensions.navigate(commands, config);
  }

  navigateBack(backRoute?: string): void {
    // Fixes a bug that sometimes the back button won't work on specific sites
    backRoute ? this._routerExtensions.navigate([backRoute]) : this._routerExtensions.back();
  }

  getPreviousUrl(): string {
    return this._previousUrl;
  }

  historyAvailable(): boolean {
    return this._routerExtensions.canGoBack();
  }
}
