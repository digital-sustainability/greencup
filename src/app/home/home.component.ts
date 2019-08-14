import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  title = 'rail-coffee-mobile';
  actionBarTitle = 'SBB Rail Coffee ☕';

  constructor(
    private _navigationService: NavigationService,
  ) { }

  ngOnInit() { }

  onEnter(route: string): void {
    this._navigationService.navigateTo(route);
  }
}
