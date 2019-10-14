import { Component, OnInit, Input } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { isAndroid } from 'tns-core-modules/platform';
@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.css']
})
export class ActionBarComponent implements OnInit {

  @Input() title: string;

  constructor(
    private _routerExtensions: RouterExtensions,
  ) { }

  ngOnInit() { }

  // get android(): boolean {
  //   return isAndroid;
  // }

  navigateBack() {
    this._routerExtensions.back();
  }

  canGoBack() {
    return this._routerExtensions.canGoBack();
  }


}
