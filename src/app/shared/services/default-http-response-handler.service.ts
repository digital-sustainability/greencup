import { Injectable } from '@angular/core';
import { FeedbackService } from './feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Injectable({
  providedIn: 'root'
})
export class DefaultHttpResponseHandlerService {

  constructor(private _feedbackService: FeedbackService) {
  }

  checkIfDefaultError(err, handle401 = true): boolean {
    console.log(err);
    if (err.status === 0) {
      this._feedbackService.show(FeedbackType.Error, 'Keine Internetverbindung', 'Stelle eine Verbindung her, um fortzufahren', 4000);

      return true;
    } else if (err.status === 500) {
      this._feedbackService.show(FeedbackType.Error, 'Server-Fehler', 'Probiere es später nochmals', 4000);

      return true;
    } else if (err.status === 401 && handle401) {
      return true;
    } else {
      return false;
    }
  }
}
