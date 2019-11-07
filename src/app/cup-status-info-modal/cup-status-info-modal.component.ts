import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular';

@Component({
  selector: 'app-cup-status-info-modal',
  templateUrl: './cup-status-info-modal.component.html',
  styleUrls: ['./cup-status-info-modal.component.css']
})
export class CupStatusInfoModalComponent implements OnInit {
  private _status = '';

  constructor(private _modalDialogParams: ModalDialogParams) {
    this._status = this._modalDialogParams.context.status;
  }

  ngOnInit() {
  }

  // ANCHOR *** User-Interaction Methods ***

  onClose(): void {
    this._modalDialogParams.closeCallback();
  }

  // ANCHOR *** Accessor Methods ***

  get statusString(): string {
    switch (this._status) {
      case 'reserved':
        return 'Gescannt'; break;
      case 'overbid':
        return  'Überscannt'; break;
      case 'verified':
        return 'Guthaben'; break;
      case 'rewarded':
        return 'Ausbezahlt'; break;
      default: return '';
    }
  }

  get status(): string {
    return this._status;
  }

}
