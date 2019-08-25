import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BarcodeScanner, ScanOptions, ScanResult } from 'nativescript-barcodescanner';
import { HttpService } from '../shared/services/http.service';
import { Scan } from '../shared/models/scan';
import { Button } from 'tns-core-modules/ui/button';
import { fromEvent, Subscription, interval } from 'rxjs';
import { throttle } from 'rxjs/operators';

import { View } from 'tns-core-modules/ui/core/view';

import { FeedbackType } from 'nativescript-feedback';
import { FeedbackService } from '../shared/services/feedback.service';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit {

  actionBarTitle = 'SBB Rail Coffee ☕';
  backRoute = '/home';
  lastScan = '...';
  obs: any;
  sub: Subscription;
  throttling = false;
  throttleTime = 2000;

  @ViewChild('rxBtn', { static: false }) btn: ElementRef;
  button: Button;

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
    private _FeedbackService: FeedbackService,
  ) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.button = this.btn.nativeElement;
    fromEvent(this.button, 'tap').pipe(throttle(val => interval(2000))).subscribe(
      event => {
        console.log('Rx Tap!');

      }
      // event => this.onOpenScanner()
    );
    // this.button.animate({ opacity: 0, duration: 2000 }).catch((e) => {
    //   console.log(e.message);
    // });
  }


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
            this._FeedbackService.show(FeedbackType.Success, 'Neuer Scan', result.text, 4000);
          } else {
            this._FeedbackService.show(FeedbackType.Error, 'Scan wurde nicht erkannt');
          }
        }, (errorMessage) => {
          this._FeedbackService.show(FeedbackType.Error, 'Scanfehler', errorMessage);
        });
    }
    // Allow next button tap
    setTimeout(() => this.throttling = false, this.throttleTime);
  }

  onTestGetScan() {
    this._httpService.getScans(1).subscribe(scan => console.log('**YES** ', scan), err => console.log('**NO** ', err));
  }

  onShowFeedback() {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.';
    this._FeedbackService.show(Math.floor(((Math.random() * 4) + 1)), 'A Feedback Title', msg);
  }

  onLogout(): void {
    // TODO: Confirm logout
    console.log('|===> Logout');
  }

  onChangePassword(): void {
    console.log('|===> Change Password');
  }

  // TODO: Remove – Only for testing
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
}
