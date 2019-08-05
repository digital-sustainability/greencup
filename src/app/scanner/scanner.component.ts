import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from 'nativescript-barcodescanner';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit {

  actionBarTitle = 'The Scanner';
  backRoute = '/home';

  constructor(
    private barcodeScanner: BarcodeScanner,
  ) { }

  ngOnInit() { }

  onOpenScanner(): void {
    this.barcodeScanner.scan({
      formats: 'QR_CODE',
      cancelLabel: "Schliessen", // iOS only
      cancelLabelBackgroundColor: "#999999", // iOS only
      message: "Use the volume buttons for extra light", // Android only
      showFlipCameraButton: false,
      preferFrontCamera: false,
      showTorchButton: true,
      beepOnScan: true, // Play or Suppress beep on scan
      torchOn: false, // launch with the flashlight on
      // closeCallback: (result) => {
      //   console.log(result.text);
      //   console.log("Scanner closed")
      // }, // invoked when the scanner was closed (success or abort)
      resultDisplayDuration: 1500, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then((result) => {
        console.log(result.text);
        // Note that this Promise is never invoked when a 'continuousScanCallback' function is provided
        alert({
          title: "Scan result",
          message: "Format: " + result.format + ",\nValue: " + result.text,
          okButtonText: "OK"
        });
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      });
  }

}
