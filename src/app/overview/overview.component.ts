import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Button } from 'tns-core-modules/ui/button';
import { View } from 'tns-core-modules/ui/core/view';
import { ScrollView } from 'tns-core-modules/ui/scroll-view';
import { FeedbackType } from 'nativescript-feedback';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { PanGestureEventData, TouchGestureEventData } from 'tns-core-modules/ui/gestures';
import { confirm } from 'tns-core-modules/ui/dialogs';
import { layout } from 'tns-core-modules/utils/utils';
import { isAndroid } from 'tns-core-modules/platform';
import { Page } from 'tns-core-modules/ui/page';

import { HttpService } from '../shared/services/http.service';
import { FeedbackService } from '../shared/services/feedback.service';

import { Scan, StatusType } from '../shared/models/scan';
import { registerElement } from 'nativescript-angular/element-registry';
registerElement('PullToRefresh', () => require('@nstudio/nativescript-pulltorefresh').PullToRefresh);

import { Subscription } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit {

  private _scans: ObservableArray<Scan>;
  private _loaded = false;
  private _depositChfValue = 1;
  private _isConfirmPayoutDialogOpen = false;
  private _sliding = false;


  actionBarTitle = 'SBB Rail Coffee ☕';
  backRoute = '/home';
  lastScan = '...';
  obs: any;
  sub: Subscription;

  constructor(
    private _httpService: HttpService,
    private _feedbackService: FeedbackService,
    private _authService: AuthService,
    private _page: Page
  ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void { }

  // ANCHOR *** User-Interaction Methods ***

  onPullToRefreshInit(args) {
    const pullRefresh = args.object;
    this._loaded = false;
    this.loadData();
    pullRefresh.refreshing = false;
  }

  onSlideButtonTouch(args: TouchGestureEventData) {
    // finger on screen
    if (args.action === 'down') {
      // only accept starting points on the left side of the button
      if (args.getX() < 0.5 * layout.toDeviceIndependentPixels(args.view.getMeasuredWidth())) {
        this._sliding = true;
        this.isScrollEnabled(false);
      }
    }

    // finger moved on screen
    if (args.action === 'move' && this._sliding) {

      const x = args.getX();
      const y = args.getY();

      // update the red slide progress indicator
      if (isAndroid) {
        args.view.style.backgroundSize = layout.toDevicePixels(x) + ' ' + args.view.getMeasuredHeight();
      } else {
        args.view.style.backgroundSize = x + ' ' + args.view.getMeasuredHeight();
      }

      if (this.hasPannedEnough(x, layout.toDeviceIndependentPixels(args.view.getMeasuredWidth()))
        && !this._isConfirmPayoutDialogOpen) {
        // the user panned enough, show the confirm dialog
        this._isConfirmPayoutDialogOpen = true;
        const options = {
            title: 'Auszahlung bestätigen',
            message: 'Dieser Schritt kann nicht rückgängig gemacht werden.',
            okButtonText: 'Ja',
            cancelButtonText: 'Nein',
            neutralButtonText: 'Abbrechen'
        };

        confirm(options).then((result: boolean) => {
            this._isConfirmPayoutDialogOpen = false;

            if (result) {
              this.confirmPayout();
            }
        });

        // reset slide progress indicator (for iOS)
        args.view.style.backgroundSize = '0 0';

        this._sliding = false;
        this.isScrollEnabled(true);
      }

      if (this.isFarAwayFromButton(y, layout.toDeviceIndependentPixels(args.view.getMeasuredHeight()))) {
        // reset the slide progress indicator and cancel sliding
        args.view.style.backgroundSize = '0 0';

        this._sliding = false;
        this.isScrollEnabled(true);
      }
    }

    // finger removed from screen
    if (args.action === 'up') {
      // reset the slide progress indicator
      args.view.style.backgroundSize = '0 0';

      this._sliding = false;
      this.isScrollEnabled(true);
    }
  }

  onLogout(): void {
    // TODO: Confirm logout
    console.log('|===> Logout');
  }

  onChangePassword(): void {
    console.log('|===> Change Password');
  }

  // ANCHOR *** Accessor Methods ***

  get loaded(): boolean {
    return this._loaded;
  }

  get scans(): ObservableArray<Scan> {
    return this._scans;
  }

  getAuthenticatedUser() {
    return this._authService.getAuthenticatedUser();
  }

  getReservedOrOverbidCount(scans: ObservableArray<Scan>, filterCritera: string): number {
    return scans ? scans.filter(e => e.status === filterCritera && !e.verified && !e.rewarded).length : 0;
  }

  getVerifiedCount(scans: ObservableArray<Scan>): number {
    return scans ? scans.filter(e => e.status === 'reserved' && e.verified && !e.rewarded).length : 0;
  }

  getRewardedCount(scans: ObservableArray<Scan>): number {
    return scans ? scans.filter(e => e.status === 'reserved' && e.verified && e.rewarded).length : 0;
  }

  getDepositValue(scans: ObservableArray<Scan>, filterProperty: string): string {
    if (scans) {
      const val = this._depositChfValue * scans.filter(e => e[filterProperty]).length;
      // Return floats rounded to two digits
      return val % 1 === 0 ? `${val.toString()} CHF` : `${val.toFixed(2)} CHF`;
    } else {
      return 'Kein QR-Scans geladen';
    }
  }

  // ANCHOR *** Private Methods ***

  private loadData(): void {
    this._httpService.getScans(this._authService.getAuthenticatedUser().id).subscribe(
      (scans: Scan[]) => {
        console.log('|===> CONNECTED TO BACKEND');
        this._scans = new ObservableArray(scans);
        this._loaded = true;
      },
      err => {
        this._feedbackService.show(FeedbackType.Error, 'Verbindungsfehler', err.message.substring(0, 60) + '...');
        console.log('|===> ERROR WHILE CONNECTING TO BACKEND', err);
      }
    );
  }

  // checks if the user panned enough - only in x-direction
  private hasPannedEnough(x: number, buttonWidth: number): boolean {
    if (x >= buttonWidth) {
      return true;
    } else {
      return false;
    }
  }

  // checks if the user moved too far away from the button - in y-direction (to prevent unintentional slides only by scrolling)
  private isFarAwayFromButton(y: number, buttonHeight: number): boolean {
    if (Math.abs(y - (buttonHeight / 2)) >= 2 * buttonHeight) {
      return true;
    } else {
      return false;
    }
  }

  // enables/disables scrolling of the specified ScrollView
  private isScrollEnabled(enabled: boolean) {
    const scrollView = <ScrollView>this._page.getViewById('scrollView');
    scrollView.isScrollEnabled = enabled;
  }

  // uses httpService to send a request confirming the payout and displays feedback to the user
  private confirmPayout() {
    this._httpService.payout().subscribe(
      msg => {
        this._feedbackService.show(FeedbackType.Success, 'Auszahlung bestätigt', 'Die Auszahlung wurde bestätigt', 4000);
      },
      (errorMessage) => {
        this._feedbackService.show(FeedbackType.Error, 'Auszahlung konnte nicht bestätigt werden', errorMessage, 4000);
      }
    );
  }

}


