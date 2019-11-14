import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { Button } from 'tns-core-modules/ui/button';
import { View } from 'tns-core-modules/ui/core/view';
import { ScrollView } from 'tns-core-modules/ui/scroll-view';
import { FeedbackType } from 'nativescript-feedback';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { PanGestureEventData, TouchGestureEventData } from 'tns-core-modules/ui/gestures';
import { alert } from 'tns-core-modules/ui/dialogs';
import { layout } from 'tns-core-modules/utils/utils';
import { isAndroid } from 'tns-core-modules/platform';
import { Page } from 'tns-core-modules/ui/page';
import * as connectivity from 'tns-core-modules/connectivity';
import { ScansComponent } from '../scans/scans.component.tns';


import { HttpService } from '../shared/services/http.service';
import { FeedbackService } from '../shared/services/feedback.service';

import { Scan, StatusType } from '../shared/models/scan';
import { PayoutModalComponent } from '../payout-modal/payout-modal.component';
import { registerElement } from 'nativescript-angular/element-registry';
registerElement('PullToRefresh', () => require('@nstudio/nativescript-pulltorefresh').PullToRefresh);

import { Subscription } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { ThrowStmt } from '@angular/compiler';
import { NavigationService } from '../shared/services/navigation.service';
import { ModalDialogService } from 'nativescript-angular';
import { CupStatusInfoModalComponent } from '../cup-status-info-modal/cup-status-info-modal.component';
import { DefaultHttpResponseHandlerService } from '../shared/services/default-http-response-handler.service';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  providers: [ScansComponent]
})
export class OverviewComponent implements OnInit, OnChanges {

  private _scans: ObservableArray<Scan>;
  private _loaded = false;
  private _depositChfValue = 1;
  private _isConfirmPayoutDialogOpen = false;
  private _sliding = false;

  @Input() selectedTab: number;
  @Output() selectedTabEvent = new EventEmitter<number>();

  actionBarTitle = 'SBB GreenCup ☕';
  backRoute = '/home';
  lastScan = '...';
  obs: any;
  sub: Subscription;

  constructor(
    private _httpService: HttpService,
    private _feedbackService: FeedbackService,
    private _authService: AuthService,
    private _navigationService: NavigationService,
    private _page: Page,
    private _modalService: ModalDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _defaultHttpResponseHandlerService: DefaultHttpResponseHandlerService,
    private _scansComponent: ScansComponent
  ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Refresh data if the user switches to this tab
    if (this.selectedTab === 0) {
      this.loadData();
    }
  }

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
        if (this.hasInternetConnection()) {
          this._isConfirmPayoutDialogOpen = true;

          let depositValue = 0;
          if (this._scans) {
            depositValue = this._depositChfValue * this._scans.filter(e => e['verified'] && !e['rewarded']).length; // FIXME
          }

          const options = {
            viewContainerRef: this._viewContainerRef,
            context: {depositValue: depositValue},
            fullscreen: false,
            android: {cancelable: false}, // to prevent closing of modal if tapped outside
          };

          this._modalService.showModal(PayoutModalComponent, options).then((result) => {
            this._isConfirmPayoutDialogOpen = false;

            if (result !== false) {
              // we want also result === undefined
              this.loadData();
            }
          });

          // reset slide progress indicator (for iOS)
          args.view.style.backgroundSize = '0 0';

          this._sliding = false;
          this.isScrollEnabled(true);
        } else {
          this._isConfirmPayoutDialogOpen = true;

          const options = {
            title: 'Keine Internetverbindung',
            message: 'Um eine Auszahlung vorzunehmen, wird eine Internetverbindung benötigt.',
            okButtonText: 'OK'
          };

          alert(options).then((res) => {this._isConfirmPayoutDialogOpen = false; });
        }
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


  onNavigateTo(route: string): void {
    this._navigationService.navigateTo(route);
  }

  onLogout(): void {
    this._authService.logout().subscribe(
      logout => {
        this._feedbackService.show(FeedbackType.Info, 'Tschüss, bis bald!', '', 4000);
        this._navigationService.navigateTo('login', true);
      },
      err => {
        if (!this._defaultHttpResponseHandlerService.checkIfDefaultError(err)) {
          this._feedbackService.show(FeedbackType.Error, 'Unbekannter Fehler', 'Logout konnte nicht durchgeführt werden', 4000);
        }
      }
    );
  }

  onChangePassword(): void {
    this._navigationService.navigateTo('/password-change');
  }

  onShowCupStatusInfoModal(status: string): void {
    const options = {
      viewContainerRef: this._viewContainerRef,
      context: {status: status},
      fullscreen: false
    };

    this._modalService.showModal(CupStatusInfoModalComponent, options).then(result => {
      if (result) {

      }
    });
  }

  onNewScanTap(): void {
    this.selectedTabEvent.emit(1);

    this._scansComponent.onNewScanTap();
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
      let val;
      if (filterProperty === 'verified') {
        val = this._depositChfValue * scans.filter(e => e['verified'] && !e['rewarded']).length;
      } else {
        val = this._depositChfValue * scans.filter(e => e[filterProperty]).length;
      }
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
        this._scans = new ObservableArray(scans);
        this._loaded = true;
      },
      err => {
        if (!this._defaultHttpResponseHandlerService.checkIfDefaultError(err)) {
          this._feedbackService.show(FeedbackType.Error, 'Unbekannter Fehler', 'Daten konnten nicht geladen werden', 4000);
        }
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
  private isScrollEnabled(enabled: boolean): void {
    const scrollView = <ScrollView>this._page.getViewById('scrollView');
    scrollView.isScrollEnabled = enabled;
  }


  private hasInternetConnection(): boolean {
    const connectionType = connectivity.getConnectionType();
    if (connectionType === connectivity.connectionType.none) {
      return false;
    } else {
      return true;
    }
  }
}



