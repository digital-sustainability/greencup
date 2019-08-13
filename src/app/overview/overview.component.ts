import { Component, OnInit } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { CardView } from 'nativescript-cardview';
import { HttpService } from '../shared/services/http.service';
import { Scan } from '../shared/models/scan';
registerElement('CardView', () => CardView);

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  actionBarTitle = 'Rail Coffee ☕';
  loaded: boolean;
  // TODO: Dump scans after a while?
  items: Scan[];

  constructor(
    private _httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this._httpService.getScans().subscribe(
      scans => {
        this.items = scans;
        this.loaded = true;
      },
      err => {
        // TODO: Display that scans could not be loaded
        console.log(err);
      }
    );
  }

  onNewScanTap(): void {
    alert('Fabulous FAB!');
  }

  getTime(ms: number): Date {
    return new Date(ms);
  }
}
