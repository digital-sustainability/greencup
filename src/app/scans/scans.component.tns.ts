import { Component, OnInit, OnChanges, OnDestroy, ChangeDetectorRef, ViewChild, ViewContainerRef, Input, SimpleChanges } from '@angular/core';
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
import { ScanModalComponent } from '../scan-modal/scan-modal.component';

import { Scan, StatusType } from '../shared/models/scan';
import { Cup } from '../shared/models/cup';
import { TestScan } from '../shared/models/test-scan';

import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { has } from 'lodash';
import * as dayjs from 'dayjs';
import { RadListView } from 'nativescript-ui-listview';
import { topmost } from 'tns-core-modules/ui/frame/frame';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import * as connectivity from 'tns-core-modules/connectivity';

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.css']
})
export class ScansComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('scanListView', { read: RadListViewComponent, static: false }) scanListViewComponent: RadListViewComponent;
  actionBarTitle = 'SBB GreenCup ☕';
  defaultItems = [{
    message: 'Keine Scans vorhanden...',
    action: 'Drücke den Scan-Button um den QR-Code eines Bechers zu scannen!'
  }];
  // @ViewChild('fab', { static: false }) btn: Fab;
  // button: Fab;
  @Input() selectedTab: number;

  sortASC = String.fromCharCode(0xf106);
  sortDESC = String.fromCharCode(0xf107);

  // Initial ASC sort by time of scan.
  sortConfig = {
    attr: 'time',
    direction: 'DESC'
  };

  statusSortIcon: string;
  timeSortIcon = this.sortDESC;

  private _loaded: boolean;
  private _scans: ObservableArray<Scan>;
  private _hasInternetConnection: boolean;
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

  constructor(
    private _httpService: HttpService,
    private _codeScanner: BarcodeScanner,
    private _feedbackService: FeedbackService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _modalService: ModalDialogService,
    private _viewContainerRef: ViewContainerRef
  ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    // Monitor the users internet connection. Change connection status if the user is offline
    startMonitoring((newConnectionType) => {
      this._hasInternetConnection = newConnectionType !== connectionType.none;
      if (this._hasInternetConnection) {
        this.loadData();
      }
    });
    const currentConnectionType = connectivity.getConnectionType();
    this._hasInternetConnection = currentConnectionType !== connectionType.none;

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Refresh data if the user switches to this tab
    if (this.selectedTab === 1) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    stopMonitoring();
  }

  // ANCHOR *** User-Interaction Methods ***

  onNewScanTap(): void {
    this._codeScanner.scan(this._scanOptions)
      // Handle codeScanner promise.
      .then((result) => {
        if (result.format === 'QR_CODE' && result.text.length) {
          if (this.validateScan(result.text)) {
            // In case the QR-Code matches all requirements, send it to the server.
            this.saveScan(result.text);
          } else {
            const msg = 'Der gescannte Code ist kein GreenCup Code!';
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

  onScanTap(scan: Scan): void {
    const options = {
      viewContainerRef: this._viewContainerRef,
      context: {scan: scan},
      fullscreen: false
    };

    this._modalService.showModal(ScanModalComponent, options).then(result => {
        console.log(result);
    });
  }

  onPullToRefreshInit(args) {
    this.loadData(args);
  }

  onSort(attr: string) {
    if (attr === this.sortConfig.attr) {
      this.sortConfig.direction = this.sortConfig.direction === 'DESC' ? 'ASC' : 'DESC';
    }
    else {
      this.sortConfig = {
        attr: attr,
        direction: 'DESC'
      };
    }

    if (attr === 'status') {
      this.statusSortIcon = this.sortConfig.direction === 'DESC' ? this.sortDESC : this.sortASC;
      this.timeSortIcon = ' ';
    }
    else {
      this.timeSortIcon = this.sortConfig.direction === 'DESC' ? this.sortDESC : this.sortASC;
      this.statusSortIcon = ' ';
    }

    this.scanListViewComponent.listView.sortingFunction = this.compareScans(this.sortConfig.attr, this.sortConfig.direction);
  }

  compareScans(attr: string, direction: string) {
    switch (attr) {
      case 'time':
        if (direction === 'DESC') {
          return (a: Scan, b: Scan) => b.scanned_at > a.scanned_at ? -1 : 1;
        }
        return (a: Scan, b: Scan) => a.scanned_at > b.scanned_at ? -1 : 1;
      case 'status':
        if (direction === 'DESC') {
          return (a: Scan, b: Scan) => this.getStatusDescriptionIdx(a).localeCompare(this.getStatusDescriptionIdx(b));
        }
        return (a: Scan, b: Scan) => this.getStatusDescriptionIdx(b).localeCompare(this.getStatusDescriptionIdx(a));
    }
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
      return scan.rewarded ? 'Guthaben für Becher ausbezahlt' : 'Offenes Guthaben';
    } else {
      return scan.status === StatusType.reserved ? 'Becher Gescannt' : 'Von anderer Person überscannt';
    }
  }

  getStatusDescriptionIdx(scan: Scan): string {
    switch (this.getStatusDescription(scan)) {
      case 'Von anderer Person überscannt':
        return 'a';
      case 'Guthaben für Becher ausbezahlt':
        return 'b';
      case 'Offenes Guthaben':
        return 'c';
      case 'Becher Gescannt':
        return 'd';
    }
  }

  getCupId(scan: Scan): number | Cup {
    return has(scan, 'cup_round_id.cup_id') ? scan.cup_round_id.cup_id : 0;
  }

  getScannedTime(scan: Scan): string {
    return scan.scanned_at ?
    `${ dayjs(scan.scanned_at).format('D.M.YY') } um ${ dayjs(scan.scanned_at).format('HH:mm') } Uhr` :
    'Unbekannt';
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
    return this._hasInternetConnection;
  }

  // ANCHOR *** Private Methods ***

  private loadData(pullToRefreshArgs?): void {
    this._httpService.getScans(this._authService.getAuthenticatedUser().id).subscribe(
      (data: Scan[]) => {
        /**
         * Initally sort list ASC by scan time and transform to an observable arry
         * ObservableArry Documentation: https://docs.nativescript.org/ns-framework-modules/observable-array
         */
        const scans = new ObservableArray(data.sort((a: Scan, b: Scan) => b.scanned_at - a.scanned_at));
        // Initiate or update UI of users scan list. This suppresses list animation when data has not changed
        if (this.dataHasChanged(this.scans, scans)) {
          this._scans = scans;
        }
        this._loaded = true;
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
  }

  // Compare two arrays of Scans that contain data for similarity
  private dataHasChanged(prev: ObservableArray<Scan>, curr: ObservableArray<Scan>): boolean {
    return prev && curr ? JSON.stringify(this.limitScans(prev)) !== JSON.stringify(this.limitScans(curr)) : true;
  }

  // Reduce a users array of Scans to the core differentail attributes for easier comparison with other Scan arrays
  private limitScans(arr: ObservableArray<Scan>): { status: StatusType, scanned_at: number, verified: boolean, rewarded: boolean }[] {
    return arr.map((e: Scan) => {
      return {
        status: e.status,
        scanned_at: e.scanned_at,
        verified: e.verified,
        rewarded: e.rewarded
      };
    });
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
    // const listView: RadListView = <RadListView>(topmost().currentPage.getViewById('listView'));
    // Add the new scan and notify the user.
    if (this.sortConfig.direction === 'DESC') {
      this.scans.unshift(scan);
      this.scanListViewComponent.listView.scrollToIndex(0);
    } else {
      const length = this.scans.push(scan);
      this.scanListViewComponent.listView.scrollWithAmount(1000 * length, false);
    }
    const msg = 'Nach der Reinigung des Bechers erhält die letzte Reservation die Pfandgutschrift';
    this._feedbackService.show(FeedbackType.Success, 'Becher gescannt!', msg, 4500);
  }

}
