import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular';

@Component({
  selector: 'app-payout-modal',
  templateUrl: './payout-modal.component.html',
  styleUrls: ['./payout-modal.component.css']
})
export class PayoutModalComponent implements OnInit {

  constructor(private _modalDialogParams: ModalDialogParams) {}

  ngOnInit() {
  }

  getDepositValue() {
    const val = this._modalDialogParams.context.depositValue;
    return val % 1 === 0 ? `${val.toString()} CHF` : `${val.toFixed(2)} CHF`;
  }

  onCancel() {
    this._modalDialogParams.closeCallback(false);
  }

  onConfirmPayout() {
    this._modalDialogParams.closeCallback(true);
  }

}
