import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BarcodeScanner, ScanOptions, ScanResult } from 'nativescript-barcodescanner';
import { Button } from 'tns-core-modules/ui/button';
import { View } from 'tns-core-modules/ui/core/view';
import { FeedbackType } from 'nativescript-feedback';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

import { HttpService } from '../shared/services/http.service';
import { FeedbackService } from '../shared/services/feedback.service';

import { Scan, StatusType } from '../shared/models/scan';

import { fromEvent, Subscription, interval } from 'rxjs';
import { throttle } from 'rxjs/operators';
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

  actionBarTitle = 'SBB Rail Coffee ☕';
  backRoute = '/home';
  lastScan = '...';
  obs: any;
  sub: Subscription;
  throttling = false;
  throttleTime = 2000;

  // @ViewChild('rxBtn', { static: false }) btn: ElementRef;
  // button: Button;

  scanOptions = {
    formats: 'QR_CODE',
    cancelLabel: 'Schliessen', // iOS only
    cancelLabelBackgroundColor: '#999999', // iOS only
    message: 'Use the volume buttons for extra light', // Android only
    showFlipCameraButton: false,
    preferFrontCamera: false,
    showTorchButton: true,
    beepOnScan: true, // Play or Suppress beep on scan
    torchOn: false, // launch with the flashlight on
    // closeCallback: () => (console.log('I WAS CLOSED')),
    resultDisplayDuration: 0, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
    openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
  };

  constructor(
    private _codeScanner: BarcodeScanner,
    private _httpService: HttpService,
    private _feedbackService: FeedbackService,
    private _authService: AuthService
  ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // this.button = this.btn.nativeElement;
    // fromEvent(this.button, 'tap').pipe(throttle(val => interval(2000))).subscribe(
    //   event => {
    //     console.log('Rx Tap!');

    //   }
    //   event => this.onOpenScanner()
    // );
    // this.button.animate({ opacity: 0, duration: 2000 }).catch((e) => {
    //   console.log(e.message);
    // });
  }

  // ANCHOR *** User-Interaction Methods ***

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

  getStatusSum(scans: ObservableArray<Scan>, filterCritera: string): number {
    return scans ? scans.filter(e => e.status === filterCritera).length : 0;
  }

  getSuccessSum(scans: ObservableArray<Scan>, filterProperty: string): number {
    return scans ? scans.filter(e => e[filterProperty]).length : 0;
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
    // this._dataSource.pipe(take(3)).subscribe(val => this._scans.unshift(new TestScan(val, StatusType.overbid))); // FIXME testing only
  }


  // FIXME *** Methods for Testing only ***
  onOpenScanner(): void {
    if (!this.throttling) {
      this.throttling = true;
      this._codeScanner.scan(this.scanOptions)
        .then((result) => {
          // This Promise is never invoked when a 'continuousScanCallback' function is provided
          // TODO: check all these formats
          // "QR_CODE" | "PDF_417" | "AZTEC" | "UPC_E" | "CODE_39" | "CODE_39_MOD_43" | "CODE_93" | "CODE_128" | "DATA_MATRIX"
          // "EAN_8" | "ITF" | "EAN_13" | "UPC_A" | "CODABAR" | "MAXICODE" | "RSS_14" | "INTERLEAVED_2_OF_5"
          if (result.format === 'QR_CODE' && result.text.length) {
            this.lastScan = this.changeTestOutput(result.text);
            this._feedbackService.show(FeedbackType.Success, 'Neuer Scan', result.text, 4000);
          } else {
            this._feedbackService.show(FeedbackType.Error, 'Scan wurde nicht erkannt');
          }
        }, (errorMessage) => {
          this._feedbackService.show(FeedbackType.Error, 'Scanfehler', errorMessage);
        });
    }
    // Allow next button tap
    setTimeout(() => this.throttling = false, this.throttleTime);
  }

  private changeTestOutput(message: string): string {
    return message.length <= 30 ? message : message.substring(0, 30) + '...';
  }

  animate(target: View) {
    const duration = 500;
    target.animate({ opacity: 0, duration: duration })
      .then(() => target.animate({ opacity: 1, duration: duration })
      ).catch((e) => {
        console.log(e.message);
      });
  }

  onTestGetScan() {
    this._httpService.getScans(1).subscribe(s => console.log('**YES** ', s), err => console.log('|===> NO ', err));
  }

  onShowFeedback() {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.';
    this._feedbackService.show(Math.floor(((Math.random() * 4) + 1)), 'A Feedback Title', msg);
  }
}


