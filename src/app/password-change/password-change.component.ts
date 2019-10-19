import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {

  enteredOldPassword: string;
  enteredPassword: string;
  enteredPasswordConfirm: string;
  processing: boolean;
  passwordHidden = true;
  @ViewChild('oldPassword', { static: false }) oldPassword: ElementRef;
  @ViewChild('password', { static: false }) password: ElementRef;
  @ViewChild('passwordConfirm', { static: false }) passwordConfirm: ElementRef;

  constructor(
    private _authService: AuthService,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService
  ) { }

  ngOnInit(): void { }

  onSubmit(): void {
    if (!this._authService.passwordLenghtValid(this.enteredPassword, this.enteredPasswordConfirm, this.enteredOldPassword)) {
      this._feedbackService.show(FeedbackType.Warning, 'Passwörter müssen mind. 10 Zeichen enthalten', '');
    } else if (!this._authService.passwordsMatch(this.enteredPassword, this.enteredPasswordConfirm)) {
      this._feedbackService.show(FeedbackType.Warning, 'Neue Passwörter stimmen nicht überein', '');
    } else {
      this.processing = true;
      this._authService.passwordChange(
        this.enteredOldPassword,
        this.enteredPassword,
        this.enteredPasswordConfirm
      ).subscribe(
        () => {
          this._navigationService.navigateTo('/tabs', true);
          this._feedbackService.show(FeedbackType.Success, 'Passwort erfolgreich geändert', '', 4000);
        },
        (err) => {
          console.log('|===> Err', err);
          if (err.status === 400) {
            this._feedbackService.show(FeedbackType.Warning, 'Altes Passwort ist nicht korrekt', '', 4000);
          } else {
            const msg = err.message.substring(50) + '...';
            this._feedbackService.show(FeedbackType.Error, 'Passwort konnte nicht geändert werden', msg, 4000);
          }
          this.processing = false;
        }
      );
    }
  }
  focusOldPassword(): void {
    this.oldPassword.nativeElement.focus();
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
    this.oldPassword.nativeElement.secure = !this.oldPassword.nativeElement.secure;
    this.password.nativeElement.secure = !this.password.nativeElement.secure;
    this.passwordConfirm.nativeElement.secure = !this.passwordConfirm.nativeElement.secure;
  }

}
