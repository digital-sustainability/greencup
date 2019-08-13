import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { HttpService } from '../shared/services/http.service';
import { Scan } from '../shared/models/scan';
import { Notification} from '../shared/models/notification';
import { ScanStatus } from '../shared/models/scan-status';
import { SnackbarService } from '../shared/services/snackbar.service';
import { ToasterService } from '../shared/services/toaster.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit {

  actionBarTitle = 'The Scanner';
  backRoute = '/home';
  lastScan = '...';
  statusTitle: string;
  statusMessage: string;
  noScan: string;

  constructor(
    private _codeScanner: BarcodeScanner,
    private _httpService: HttpService,
    private _snackbarService: SnackbarService,
    private _toasterService: ToasterService
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
      // closeCallback: () => (console.log('I WAS CLOSED')),
      resultDisplayDuration: 0, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then((result) => {

      let message: Notification;
      // This Promise is never invoked when a 'continuousScanCallback' function is provided
      // TODO: check all these formats
      // "QR_CODE" | "PDF_417" | "AZTEC" | "UPC_E" | "CODE_39" | "CODE_39_MOD_43" | "CODE_93" | "CODE_128" | "DATA_MATRIX"
      // "EAN_8" | "ITF" | "EAN_13" | "UPC_A" | "CODABAR" | "MAXICODE" | "RSS_14" | "INTERLEAVED_2_OF_5"
      if (result.format === 'QR_CODE' && result.text.length) {
        if (this.validateScan(result.text)) {
          this.lastScan = this.changeTestOutput(result.text);
          message = {
            statusType: 'SUCCESS',
            title: 'Erfolgreicher Scan',
            detail: result.text
          } as Notification;
        }
        else {
          message = {
            statusType: 'ERROR',
            title: 'Falsches Format',
            detail: 'Der gescannte Code ist kein Rail-Coffee Code!'
          } as Notification;
        }

      } else {
        message = {
          statusType: 'ERROR',
          title: 'Falsches Format',
          detail: 'Scan wurde nicht erkannt'
        } as Notification;
      }

      this._toasterService.showToast(message);
    }, (errorMessage) => {
      this._toasterService.showToast({
        statusType: 'WARNING',
        title: 'Falsches Format',
        detail: errorMessage
      } as Notification);
    });
  }

  onTestGetScan() {
    this._httpService.getScan(1).subscribe(scan => console.log('**YES** ', scan), err => console.log('**NO** ', err));
  }

  onShowSnack() {
    this._snackbarService.showSimpleSnackbar();
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{18})\-[a-fA-f0-9]{5}');
    return message && message.length === 28 && re.test(message);
  }

  // TODO: Remove – Only for testing
  private changeTestOutput(message: string): string {
    return message.length <= 30 ? message : message.substring(0, 30) + '...';
  }

}
