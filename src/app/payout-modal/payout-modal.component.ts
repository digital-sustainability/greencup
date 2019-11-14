import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular';
import { HttpService } from '../shared/services/http.service';
import { DefaultHttpResponseHandlerService } from '../shared/services/default-http-response-handler.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Component({
  selector: 'app-payout-modal',
  templateUrl: './payout-modal.component.html',
  styleUrls: ['./payout-modal.component.css']
})
export class PayoutModalComponent implements OnInit {
  _loading = false;
  _payoutConfirmed = false;

  constructor(
    private _modalDialogParams: ModalDialogParams,
    private _httpService: HttpService,
    private _defaultHttpResponseHandlerService: DefaultHttpResponseHandlerService,
    private _feedbackService: FeedbackService
  ) {}

  ngOnInit() {
    this._payoutConfirmed = false;
    this._loading = false;
  }

  getDepositValue() {
    const val = this._modalDialogParams.context.depositValue;
    return val % 1 === 0 ? `${val.toString()} CHF` : `${val.toFixed(2)} CHF`;
  }

  onCancel() {
    this._modalDialogParams.closeCallback(false);
  }

  onClose() {
    this._modalDialogParams.closeCallback(true);
  }


  // uses httpService to send a request confirming the payout and displays feedback to the user
  onConfirmPayout(): void {
    this._loading = true;

    this._httpService.payout().subscribe(
      event => {
        this._loading = false;
        this._payoutConfirmed = true;
      },
      err => {
        if (!this._defaultHttpResponseHandlerService.checkIfDefaultError(err)) {
          this._feedbackService.show(FeedbackType.Error, 'Unbekannter Fehler', 'Auszahlung konnte nicht bestätigt werden', 4000);
        }

        this._modalDialogParams.closeCallback(false);
      }
    );
  }

}
