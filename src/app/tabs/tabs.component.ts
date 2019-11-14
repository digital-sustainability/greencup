import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { SelectedIndexChangedEventData } from 'tns-core-modules/ui/tab-view';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {
  selectedTabIndex: number;

  constructor(
    private _navigationService: NavigationService
  ) { }

  ngOnInit() {
    this.selectedTabIndex = 0;
  }

  onNavigateBack(): void {
    this._navigationService.navigateBack();
  }

  onSelectedIndexChanged(newIndex: number): void {
    this.selectedTabIndex = newIndex;
  }

}
