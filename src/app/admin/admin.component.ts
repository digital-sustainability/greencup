import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FeedbackService } from '../shared/services/feedback.service';
// https://github.com/EddyVerbruggen/nativescript-barcodescanner
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { FeedbackType } from 'nativescript-feedback';
import { HttpService } from '../shared/services/http.service';
import { Scan, StatusType } from '../shared/models/scan';
import { Cup } from '../shared/models/cup';
import { User } from '../shared/models/user';
import { has } from 'lodash';
import { CupRound } from '../shared/models/cup-round';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { connectionType, startMonitoring, stopMonitoring } from 'tns-core-modules/connectivity';
import { AuthService } from '../shared/services/auth.service';
import * as dayjs from 'dayjs';
import { Toasty } from 'nativescript-toasty';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {

  actionBarTitle = 'SBB Rail Coffee ☕ - Cleaner';

  private _cupRounds: ObservableArray<CupRound>;
  private _throttle = false;
  private _throttleTime = 2000;
  private _connection: boolean;
  private _loaded = false;
  private _lastQrCode = '';
  private _lastScanTime = 0;

  constructor(
    private _feedbackService: FeedbackService,
    private _httpService: HttpService,
    private _authService: AuthService
  ) { }

  ngOnInit() {
    // FIXME re enable monitoring
     // Monitor the users internet connection. Change connection status if the user is offline
     //startMonitoring((newConnectionType) => {
     // this._connection = newConnectionType !== connectionType.none;
     // if (this._connection) {
        this.loadData();
     // }
    //});
  }


  // ANCHOR *** User-Interaction Methods ***

  onNewScanTap(): void {
    const scanOptions = {
      formats: 'QR_CODE',
      cancelLabel: 'Schliessen', // iOS only
      cancelLabelBackgroundColor: '#999999', // iOS only
      message: 'Use the volume buttons for extra light', // Android only
      showFlipCameraButton: false,
      preferFrontCamera: false,
      showTorchButton: true,
      beepOnScan: true,
      openSettingsIfPermissionWasPreviouslyDenied: true, // iOS only, send user to settings app if access previously denied
      continuousScanCallback: (result) => {
        if (result.format === 'QR_CODE' && result.text.length) {
          if (this.validateScan(result.text)) {
            // In case the QR-Code matches all requirements, send it to the server, if its not the same code as the code scanned before

            // allow duplicates after 10 seconds
            if (this._lastQrCode !== result.text || Date.now() - this._lastScanTime >= 1000 * 10) {
              this._lastQrCode = result.text; // update last scan
              this._lastScanTime = Date.now();

              const toast = new Toasty({ text: 'Scan überprüfen...' });
              toast.show();
              this.sendScan(result.text);
            }
           } else {
            const toast = new Toasty({ text: 'Der gescannte Code ist kein Rail-Coffee Code!' });
            toast.show();
          }
        } else {
          const toast = new Toasty({ text: 'Scan nicht erkannt' });
          toast.show();
        }
      },
      reportDuplicates: true // allow multiple scans of the same cup
    };

    if (!this._throttle) { // TODO Replace with rxjs that calls next on btn click
      this._throttle = true;
      new BarcodeScanner().scan(scanOptions).then((res) => {});
    }
    setTimeout(() => this._throttle = false, this._throttleTime);
  }

  onPullToRefreshInit(args) {
    this.loadData(args);
  }

  // ANCHOR *** Accessor Methods ***

  get loaded(): boolean {
    return this._loaded;
  }
  get cupRounds(): ObservableArray<CupRound> {
    return this._cupRounds;
  }
  getCupId(cupRound: CupRound): number {
    if (typeof cupRound.cup_id === 'number') {
      return cupRound.cup_id;
    } else {
      return has(cupRound, 'cup_id.id') ? (<Cup>cupRound.cup_id).id : 0;
    }
  }
  getClosedBy(cupRound: CupRound): number {
    if (typeof cupRound.closed_by === 'number') {
       return cupRound.closed_by;
    } else {
      return has(cupRound, 'closed_by.id') ? (<User>cupRound.closed_by).id : 0;
    }
  }
  getClosedAtTime(cupRound: CupRound): string {
    return cupRound.closed_at ? dayjs(cupRound.closed_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }
  getCupRoundId(cupRound: CupRound): number {
    return cupRound.id;
  }

  // ANCHOR *** Private Methods ***
  private loadData(pullToRefreshArgs?): void {
    this._httpService.getCupRounds(this._authService.getAuthenticatedUser().id).subscribe(
      (cupRounds: CupRound[]) => {
        // Initally sort list ASC by closed time
        this._cupRounds = new ObservableArray(cupRounds.sort((a: CupRound, b: CupRound) => b.closed_at - a.closed_at));
        this._loaded = true;

        if (pullToRefreshArgs) {
          const listView = pullToRefreshArgs.object;
          listView.notifyPullToRefreshFinished();
        }
      },
      err => {
        this._feedbackService.show(FeedbackType.Error, 'Verbindungsfehler', err.message.substring(0, 60) + '...');
        if (pullToRefreshArgs) {
          const listView = pullToRefreshArgs.object;
          listView.notifyPullToRefreshFinished();
        }
      }
    );
  }

  private sendScan(code: string): void {
    this._httpService.closeRound(code).subscribe(
      (cupRound: CupRound) => {
        if (cupRound) {
          this.adjustCupRoundList(cupRound);
        } else {
          // TODO: Test all possible backend responses
          const toast = new Toasty({ text: 'Die Runde konnte nicht geschlossen werden' });
          toast.show();
        }
      },
      err => {
        const toast = new Toasty({ text: 'Fehler bei der Übertragung' });
        toast.show();
      }
    );
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{14,18})\-[a-fA-f0-9]{5}');
    return message && message.length >= 20 && message.length <= 28 && re.test(message);
  }

  private adjustCupRoundList(cupRound: CupRound): void {
    // Check whether the newly added scan ID aleady exist in the view
    const existing = this._cupRounds.filter(e => e.id === cupRound.id);
    // If scan already exists remove it by index.
    if (existing && existing.length) {
      const idx = this._cupRounds.indexOf(existing[0]);
      this._cupRounds.splice(idx, 1);
    }
    // Add the new scan and notify the user.
    this._cupRounds.unshift(cupRound);

    const toast = new Toasty({ text: 'Erfolgreich, Becher-ID: ' + cupRound.cup_id, textColor: 'limegreen' });
    toast.show();
  }


}
