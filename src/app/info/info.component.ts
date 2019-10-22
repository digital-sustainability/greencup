import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { Page } from 'tns-core-modules/ui/page/page';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  isFirstRun = false;

  constructor(
    private _navigationService: NavigationService,
    private _page: Page) {
      _page.actionBarHidden = true;
  }

  ngOnInit() {
    if (this._navigationService.getPreviousUrl().includes('email-confirm')) {
      this.isFirstRun = true;
    }
  }

  onNavigateToLogin(): void {
    this._navigationService.navigateTo('login');
  }

}
