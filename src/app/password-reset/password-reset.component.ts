import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  enteredUserId: number;
  enteredToken: string;
  enteredPassword: string;
  enteredPasswordConfirm: string;
  processing: boolean;

  constructor(private _authService: AuthService,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.processing = true;
    this._authService.passwordReset(
      this.enteredUserId,
      this.enteredToken,
      this.enteredPassword,
      this.enteredPasswordConfirm)
      .subscribe(() => {
        this._navigationService.navigateTo('/login', true);
        this._feedbackService.show(FeedbackType.Success, 'Passwort erfolgreich zurückgesetzt', '', 4000);
      }, (err) => {
        console.log('|===> Err', err);
        if (err.status === 404) {
          this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden', 'Nutzer-Id stimmt nicht.', 4000);
        }
        else if (err.status === 403) {
          this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden', 'Code stimmt nicht.', 4000);
        }
        else if (err.status === 412) {
          this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden',
            'Code ist abgelaufen. Geh zurück auf den Login Screen und führe den Passwort Reset erneut aus.', 20000);
        }
        else {
          this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden', 'Passwörter stimmen nicht überein.', 4000);
        }
        this.processing = false;
      });
  }

}
