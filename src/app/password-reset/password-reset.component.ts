import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';
import { registerElement } from 'nativescript-angular';
import { DefaultHttpResponseHandlerService } from '../shared/services/default-http-response-handler.service';

registerElement('PreviousNextView', () => require('nativescript-iqkeyboardmanager').PreviousNextView);


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
  passwordHidden = true;
  processing: boolean;
  @ViewChild('token', { static: false }) token: ElementRef;
  @ViewChild('password', { static: false }) password: ElementRef;
  @ViewChild('passwordConfirm', { static: false }) passwordConfirm: ElementRef;

  constructor(private _authService: AuthService,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService,
    private _defaultHttpResponseHandlerService: DefaultHttpResponseHandlerService) { }

  ngOnInit(): void { }

  onSubmit(): void {
    if (!this._authService.passwordLenghtValid(this.enteredPassword, this.enteredPasswordConfirm)) {
      this._feedbackService.show(FeedbackType.Warning, 'Passwörter müssen mind. 10 Zeichen enthalten', '');
    } else if (!this._authService.passwordsMatch(this.enteredPassword, this.enteredPasswordConfirm)) {
      this._feedbackService.show(FeedbackType.Warning, 'Neue Passwörter stimmen nicht überein', '');
    } else {
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
          if (!this._defaultHttpResponseHandlerService.checkIfDefaultError(err)) {
            if (err.status === 404) {
              this._feedbackService.show(FeedbackType.Warning,
                'Passwort konnte nicht zurückgesetzt werden', 'Nutzer-Id stimmt nicht.', 4000);
            } else if (err.status === 403) {
              this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden', 'Code stimmt nicht.', 4000);
            } else if (err.status === 412) {
              const msg = 'Code ist abgelaufen. Geh zurück auf den Login Screen und führe den Passwort Reset erneut aus.';
              this._feedbackService.show(FeedbackType.Warning, 'Passwort konnte nicht zurückgesetzt werden', msg, 20000);
            } else {
              this._feedbackService.show(FeedbackType.Error, 'Unbekannter Fehler', 'Passwort konnte nicht zurückgesetzt werden', 4000);
            }
          }
          this.processing = false;
        }
      );
    }
  }
  focusToken(): void {
    this.token.nativeElement.focus();
  }

  focusPassword(): void {
    this.password.nativeElement.focus();
  }

  focusPasswordConfirm(): void {
    this.passwordConfirm.nativeElement.focus();
  }

  onTogglePeekPassword(): void {
    /**
     * FIXME Android: Move curser to back of text once `secure` attribute changes --> See login.component
     * FIXME Android: Fix bug that changes CSS font when `secure` attribute changes --> See login.component
     */
    this.passwordHidden = !this.passwordHidden;
    this.password.nativeElement.secure = !this.password.nativeElement.secure;
    this.passwordConfirm.nativeElement.secure = !this.passwordConfirm.nativeElement.secure;
  }

}
