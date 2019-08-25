import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  constructor(
    private _navigationService: NavigationService,
  ) { }

  ngOnInit() { }
  // TODO: triger data load on tab switch

  onNavigateBack(): void {
    this._navigationService.navigateBack();
  }

}
