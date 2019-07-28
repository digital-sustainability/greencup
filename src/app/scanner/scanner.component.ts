import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit {

  actionBarTitle = 'The Scanner';
  backRoute = '/home';

  constructor(
    private _navigationService: NavigationService,
  ) { }

  ngOnInit() { }

  onNavigateBack(): void {
    this._navigationService.navigateBack();
  }

}
