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
    private _navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.selectedTabIndex = 0;
  }
  // TODO: triger data load on tab switch https://docs.nativescript.org/angular/ui/ng-ui-widgets/tab-view

  onNavigateBack(): void {
    this._navigationService.navigateBack();
  }

  onSelectedIndexChanged(args: SelectedIndexChangedEventData): void {
    this.selectedTabIndex = args.newIndex;
  }

}
