import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { HttpService } from '../shared/services/http.service';
import { Scan } from '../shared/models/scan';
import { format } from 'util';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit {

  actionBarTitle = 'The Scanner';
  backRoute = '/home';
  lastScan = '...';

  constructor(
    private _codeScanner: BarcodeScanner,
    private _httpService: HttpService,
  ) { }

  ngOnInit() { }

  onOpenScanner(): void {
    this._codeScanner.scan({
      formats: 'QR_CODE',
      cancelLabel: 'Schliessen', // iOS only
      cancelLabelBackgroundColor: '#999999', // iOS only
      message: 'Use the volume buttons for extra light', // Android only
      showFlipCameraButton: false,
      preferFrontCamera: false,
      showTorchButton: true,
      beepOnScan: true, // Play or Suppress beep on scan
      torchOn: false, // launch with the flashlight on
      // closeCallback: cb
      resultDisplayDuration: 1500, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then((result) => {
        // This Promise is never invoked when a 'continuousScanCallback' function is provided
        // TODO: check all these formats
        // "QR_CODE" | "PDF_417" | "AZTEC" | "UPC_E" | "CODE_39" | "CODE_39_MOD_43" | "CODE_93" | "CODE_128" | "DATA_MATRIX"
        // "EAN_8" | "ITF" | "EAN_13" | "UPC_A" | "CODABAR" | "MAXICODE" | "RSS_14" | "INTERLEAVED_2_OF_5"
        if (result.format === 'QR_CODE' && result.text.length) {
          // this.saveScan(result.text);
          if (result.text.length <= 15) {
            this.lastScan = result.text;
          } else {
            this.lastScan = result.text.substring(0, 12) + '...';
          }
        }

      }, (errorMessage) => {
        console.log('No scan. ' + errorMessage);
      });
  }

  onTestSetScan() {
     this.saveScan('abcdefghij');
   }

  onTestGetScan() {
    this._httpService.getScan(1).subscribe(scan => console.log('**YES** ', scan), err => console.log('**NO** ', err));
  }

  private saveScan(cupScan: string): void {
    // TODO: Add post-scan check of previous scans. Use async/promise
    // TODO: Get cup ID by matching code
    // TODO: Display logged code to user (just for now)
    // TODO: Get user info
    const cupId = 1;
    const userId = 1;
    this._httpService.setScan(cupId, userId).subscribe(
      scan => {
        // TODO: Notify user, re-route
        console.log('New scan: ', scan);
      },
      err => {
        // TODO: Notify user about error, re-route
        console.log('Error: ', err);
      }
    );
  }

}
