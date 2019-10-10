import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  isFirstRun = false;

  constructor(private _navigationService: NavigationService) {
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
