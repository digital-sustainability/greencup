import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { CardView } from 'nativescript-cardview';
registerElement('CardView', () => CardView);
import { Fab } from '@nstudio/nativescript-floatingactionbutton';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { connectionType, startMonitoring, stopMonitoring } from 'tns-core-modules/connectivity';
import { RadListViewComponent } from 'nativescript-ui-listview/angular';

import { HttpService } from '../shared/services/http.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { AuthService } from '../shared/services/auth.service';
// https://github.com/EddyVerbruggen/nativescript-barcodescanner
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { FeedbackType } from 'nativescript-feedback';

import { Scan, StatusType } from '../shared/models/scan';
import { Cup } from '../shared/models/cup';
import { TestScan } from '../shared/models/test-scan';

import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { has } from 'lodash';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.css']
})
export class ScansComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scanListView', { read: RadListViewComponent, static: false }) scanListViewComponent: RadListViewComponent;
  actionBarTitle = 'SBB Rail Coffee ☕';
  defaultItems = [{
    message: 'Keine Scans vorhanden...',
    action: 'Drücke den Scan-Button um den QR-Code eines Bechers zu scannen!'
  }];
  // @ViewChild('fab', { static: false }) btn: Fab;
  // button: Fab;

  sortASC = String.fromCharCode(0xf106);
  sortDESC = String.fromCharCode(0xf107);

  // Initial ASC sort by time of scan.
  timeSortIcon = this.sortDESC;
  statusSortIcon = '';
  // Boolean values to toggle the sorting direction.
  private _sortTimeASC = true;
  private _sortStatusASC = true;

  private _loaded: boolean;
  private _scans: ObservableArray<Scan>;
  private _throttle = false;
  private _throttleTime = 2000;
  private _connection: boolean;
  private _scanOptions = {
    formats: 'QR_CODE',
    cancelLabel: 'Schliessen', // iOS only
    cancelLabelBackgroundColor: '#999999', // iOS only
    message: 'Use the volume buttons for extra light', // Android only
    showFlipCameraButton: false,
    preferFrontCamera: false,
    showTorchButton: true,
    beepOnScan: false,
    resultDisplayDuration: 0, // Android only, default 1500 (ms)
    openSettingsIfPermissionWasPreviouslyDenied: true // iOS only, send user to settings app if access previously denied
  };

  // FIXME testing only
  private _dataSource = interval(1500);


  constructor(
    private _httpService: HttpService,
    private _codeScanner: BarcodeScanner,
    private _feedbackService: FeedbackService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _authService: AuthService
    ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    // Monitor the users internet connection. Change connection status if the user is offline
    startMonitoring((newConnectionType) => {
      this._connection = newConnectionType !== connectionType.none;
      if (this._connection) {
        this.loadData();
      }
    });
    this._changeDetectionRef.detectChanges();
  }

  ngAfterViewInit(): void {
    // this.button = this.btn.nativeView;
  }

  ngOnDestroy(): void {
    stopMonitoring();
  }

  // ANCHOR *** User-Interaction Methods ***

  onNewScanTap(): void {
    if (!this._throttle) { // TODO Replace with rxjs that calls next on btn click
      this._throttle = true;
      this._codeScanner.scan(this._scanOptions)
        // Handle codeScanner promise.
        .then((result) => {
          if (result.format === 'QR_CODE' && result.text.length) {
            if (this.validateScan(result.text)) {
              // In case the QR-Code matches all requirements, send it to the server.
              this.saveScan(result.text);
            } else {
              const msg = 'Der gescannte Code ist kein Rail-Coffee Code!';
              this._feedbackService.show(FeedbackType.Warning, 'QR-Code ungültig', msg);
            }
          } else {
            this._feedbackService.show(FeedbackType.Error, 'Scan nicht erkannt');
          }
        // Handle scan errors.
        }, errMsg => {
          if (errMsg === 'Scan aborted') {
            this._feedbackService.show(FeedbackType.Info, 'Scan abgebrochen', '', 2000);
          } else {
            this._feedbackService.show(FeedbackType.Error, 'Scanfehler', errMsg.substring(0, 60) + '...');
          }
      });
    }
    setTimeout(() => this._throttle = false, this._throttleTime);
  }

  onScanTap(args): void {
    console.log('|===> TAP');
    alert('User tapped');
  }

  onPullToRefreshInit(args) {
    this.loadData(args);
  }

  onSortByTime(): void {
    this.statusSortIcon = ' ';
    if (this._scans && this._scans.length) {
      if (this._sortTimeASC) {
        this.timeSortIcon = this.sortASC;
        this.scanListViewComponent.listView.sortingFunction = (a: Scan, b: Scan) =>  a.scanned_at > b.scanned_at ? -1 : 1;
      } else {
        this.timeSortIcon = this.sortDESC;
        this.scanListViewComponent.listView.sortingFunction = (a: Scan, b: Scan) => b.scanned_at > a.scanned_at ? -1 : 1;
      }
    }
    this._sortTimeASC = !this._sortTimeASC;
  }

  onSortByStatus(): void {
    this.timeSortIcon = ' ';
    if (this._scans && this._scans.length) {
      if (this._sortStatusASC) {
        this.statusSortIcon = this.sortASC;
        this.scanListViewComponent.listView.sortingFunction = (a: Scan, b: Scan) => {
          return this.getStatusDescription(b).localeCompare(this.getStatusDescription(a));
        };
      } else {
        this.statusSortIcon = this.sortDESC;
        this.scanListViewComponent.listView.sortingFunction = (a: Scan, b: Scan) => {
          return this.getStatusDescription(a).localeCompare(this.getStatusDescription(b));
        };
      }
    }
    this._sortStatusASC = !this._sortStatusASC;
  }

  // ANCHOR *** Accessor Methods ***

  getStatusClass(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'status-rewarded' : 'status-verified';
    } else {
      return scan.status === StatusType.reserved ? 'status-reserved' : 'status-overbid';
    }
  }

  getStatusDescription(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'Ausbezahlt' : 'Gutgeschrieben';
    } else {
      return scan.status === StatusType.reserved ? 'Reserviert' : 'Überboten';
    }
  }

  getCupId(scan: Scan): number | Cup {
    return has(scan, 'cup_round_id.cup_id') ? scan.cup_round_id.cup_id : 0;
  }

  getScannedTime(scan: Scan): string {
    return scan.scanned_at ? dayjs(scan.scanned_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }

  get scanCount(): number {
    return this._scans ? this._scans.length : undefined;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get scans(): ObservableArray<Scan> {
    return this._scans;
  }

  get connection(): boolean {
    return this._connection;
  }

  // ANCHOR *** Private Methods ***

  private loadData(pullToRefreshArgs?): void {
    this._httpService.getScans(this._authService.getAuthenticatedUser().id).subscribe(
      (scans: Scan[]) => {
        console.log('|===> CONNECTED TO BACKEND');
        // Initally sort list ASC by scan time
        this._scans = new ObservableArray(scans.sort((a: Scan, b: Scan) => b.scanned_at - a.scanned_at));
        this._loaded = true;
        // this._scans = new ObservableArray([]); // FIXME testing only
        if (pullToRefreshArgs) {
          const listView = pullToRefreshArgs.object;
          listView.notifyPullToRefreshFinished();
        }
      },
      err => {
        this._feedbackService.show(FeedbackType.Error, 'Verbindungsfehler', err.message.substring(0, 60) + '...');
        console.log('|===> ERROR WHILE CONNECTING TO BACKEND', err);
        if (pullToRefreshArgs) {
          const listView = pullToRefreshArgs.object;
          listView.notifyPullToRefreshFinished();
        }
      }
    );
    // this._dataSource.pipe(take(5)).subscribe(val => this._scans.push(new TestScan(val, StatusType.overbid))); // FIXME testing only
  }

  private saveScan(code: string): void {
    this._httpService.addScan(code).subscribe(
      (scan: Scan) => {
        if (scan) {
          this.adjustScanList(scan);
        } else {
          // TODO: Test all possible backend responses; Check from backend received scans for errors?
          const msg = 'Der QR Code konnte nicht gespeichert werden. Bitte scannen Sie den Becher erneut';
          this._feedbackService.show(FeedbackType.Error, 'Kein Scan erhalten', msg);
        }
      },
      err => this._feedbackService.show(FeedbackType.Error, 'Ein Fehler ist aufgetreten', err.message.substring(0, 60) + '...')
    );
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{14,18})\-[a-fA-f0-9]{5}');
    return message && message.length >= 20 && message.length <= 28 && re.test(message);
  }

  private adjustScanList(scan: Scan): void {
    // Check whether the newly added scan ID aleady exist in the view
    const existing = this._scans.filter(e => e.id === scan.id);
    // If scan already exists remove it by index.
    if (existing && existing.length) {
      const idx = this._scans.indexOf(existing[0]);
      this.scans.splice(idx, 1);
    }
    // Add the new scan and notify the user.
    this._scans.unshift(scan);
    const msg = 'Nach der Reinigung des Bechers erhält die letzte Reservation die Pfandgutschrift';
    this._feedbackService.show(FeedbackType.Success, 'Becher reserviert!', msg, 4500);
  }

}
