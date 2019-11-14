import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { SelectedIndexChangedEventData } from 'tns-core-modules/ui/tab-view';
import { ScansComponent } from '../scans/scans.component.tns';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {
  selectedTabIndex: number;

  @ViewChild('scans', {static: false}) scanComponent: ScansComponent;

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

  openScanComponent() {
    this.selectedTabIndex = 1;
    this.scanComponent.onNewScanTap();
  }

}
