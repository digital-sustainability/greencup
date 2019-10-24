import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { prompt } from 'tns-core-modules/ui/dialogs';
import { Page, isAndroid } from 'tns-core-modules/ui/page';
import { RegisteringUser } from '../shared/models/registering-user';
import { FeedbackType } from 'nativescript-feedback';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { startMonitoring, connectionType } from 'tns-core-modules/connectivity/connectivity';
import { registerElement } from 'nativescript-angular';

registerElement('PreviousNextView', () => require('nativescript-iqkeyboardmanager').PreviousNextView);


@Component({
  selector: 'app-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  pwAndroidTypeFace: any;
  passwordHidden = true;
  passwordPeekIcon = '&#xf06e;&nbsp;';
  isLoggingIn = true;
  enteredFirstname: string;
  enteredLastname: string;
  enteredEmail: string;
  enteredPassword: string;
  enteredConfirmPassword: string;
  processing = false;
  @ViewChild('firstname', { static: false }) firstname: ElementRef;
  @ViewChild('lastname', { static: false }) lastname: ElementRef;
  @ViewChild('password', { static: false }) password: ElementRef;
  @ViewChild('confirmPassword', { static: false }) confirmPassword: ElementRef;
  private _hasInternetConnection: boolean;
  noConnectionMessage = 'Anmeldung nicht möglich, da keine Verbindung zum Internet besteht';

  constructor(
    private _page: Page,
    private _authService: AuthService,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService,
  ) {
    this._page.actionBarHidden = true;
  }

  ngOnInit() {
    // Monitor the users internet connection. Change connection status if the user is offline
    startMonitoring((newConnectionType) => {
      this._hasInternetConnection = newConnectionType !== connectionType.none;
      if (!this._hasInternetConnection) {
        this._feedbackService.show(FeedbackType.Error, 'Keine Internetverbindung', this.noConnectionMessage, 6000);
      }
    });
    // TODO: Check if this does not suppress any error messages
    if (this._navigationService.getPreviousUrl().includes('info')) {
      this._feedbackService.show(FeedbackType.Success, 'Login', 'Melde dich bitte an', 4000);
    }
  }

  toggleForm() {
    this.isLoggingIn = !this.isLoggingIn;
    this.passwordHidden = true;
    this.enteredPassword = '';
  }

  onSubmit(): void {
    if (this.isLoggingIn) {
      this.loginWithNewToken();
    } else {
      this.register();
    }
  }

  loginWithNewToken(): void {
    if (!this.enteredEmail || !this.enteredPassword || this.validateEmail(this.enteredPassword)) {
      this._feedbackService.show(FeedbackType.Warning, '', 'Bitte Email und Password angeben', 4000);
      return;
    }
    this.processing = true;

    const loginDetails = {
      email: this.enteredEmail,
      password: this.enteredPassword
    };
    this._authService.createNewToken(loginDetails).subscribe(
      tokenObj => {
        const savedEmail = this._authService.setStorageItem('email', this.enteredEmail);
        const savedToken = this._authService.setStorageItem('usertoken', tokenObj.token);
        if (savedEmail && savedToken) {
          this._navigationService.navigateTo('/', true);
        } else {
          // TODO: React saving error
          console.log('|===> Problem occured');
          const msg = 'Token konnte nicht auf Gerät gespeichert werden. Versuche es nochmals.';
          this._feedbackService.show(FeedbackType.Warning, 'Error', msg, 4000);
        }
        this.processing = false;
      },
      err => {
        console.log('|===> Err ', err);
        if (!this._hasInternetConnection) {
          this._feedbackService.show(FeedbackType.Warning, 'Keine Internetverbindung', this.noConnectionMessage, 4000);
        } else if (err.status === 404) {
          this._feedbackService.show(FeedbackType.Warning, 'Login fehlgeschlagen', 'Email Adresse nicht korrekt', 4000);
        } else if (err.status === 401) {
          this._feedbackService.show(FeedbackType.Warning, 'Login fehlgeschlagen', 'Passwort ist ungültig', 4000);
        } else {
          this._feedbackService.show(FeedbackType.Warning, 'Login fehlgeschlagen', '', 4000);
        }
        this.processing = false;
      }
    );
  }

  register() {
    if (!this.enteredFirstname
      || !this.enteredFirstname
      || !this.enteredEmail
      || !this.enteredPassword
      || !this.enteredConfirmPassword) {
      this._feedbackService.show(FeedbackType.Warning, 'Unvollständig', 'Bitte füllen Sie alle Felder aus', 4000);
      return;
    }

    if (this.validateEmail(this.enteredEmail)) {
      this._feedbackService.show(FeedbackType.Warning, 'Ungültig', 'Bitte geben Sie eine valide Email ein', 4000);
      return;
    }

    if (!this._authService.passwordLenghtValid(this.enteredPassword, this.enteredConfirmPassword)) {
      this._feedbackService.show(FeedbackType.Warning, 'Passwörter müssen mind. 10 Zeichen enthalten', '');
      return;
    }

    if (!this._authService.passwordsMatch(this.enteredPassword, this.enteredConfirmPassword)) {
      this._feedbackService.show(FeedbackType.Warning, 'Passwörter stimmen nicht überein', '');
      return;
    }

    this.processing = true;
    const userDetail = {
      first_name: this.enteredFirstname,
      last_name: this.enteredLastname,
      email: this.enteredEmail,
      password: this.enteredPassword,
      confirm_password: this.enteredConfirmPassword
    } as RegisteringUser;
    this._authService.register(userDetail).subscribe(
      user => {
        console.log('|===> Answer ', user);
        const email = this.enteredEmail ? this.enteredEmail : '';
        this._navigationService.navigateTo('/email-confirm', true, email);
        const msg = 'Bestätige deine Email Adresse über das Email das du erhalten hast.';
        this._feedbackService.show(FeedbackType.Success, 'Registrierung erfolgreich', msg, 4000);
        this.processing = false;
      },
      err => {
        console.log('|===> Err ', err);
        if (err.status === 409) {
          this._feedbackService.show(FeedbackType.Error, 'Fehler', 'Email wird bereits verwendet.', 4000);
        }
        else {
          this._feedbackService.show(FeedbackType.Error, 'Fehler', 'Account konnte nicht erstellt werden.', 4000);
        }

        this.processing = false;
      }
    );
  }

  forgotPassword() {
    prompt({
      title: 'Passwort vergessen',
      message: 'Gib deine Email-Adresse an, um dein Passwort zurückzusetzen.',
      inputType: 'email',
      defaultText: '',
      okButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((data) => {
      if (data.result) {
        this.requestNewPassword(data.text);
      }
    });
  }

  requestNewPassword(email: string) {
    this.processing = true;
    this._authService.requestNewPassword(email).subscribe(
      () => {
        this.processing = false;
        this._navigationService.navigateTo('/password-reset');
        this._feedbackService.show(FeedbackType.Success,
          'Passwort zurücksetzen',
          'Gib die Nutzer-Id und den Code ein, die du per Mail erhalten hast und setze dein neues Passwort.', 10000);
      },
      err => {
        console.log('|===> Err ', err);
        if (err.status === 404) {
          this._feedbackService.show(FeedbackType.Warning, 'Email inkorrekt', 'Die Email Adresse existiert nicht.', 4000);
        } else {
          this._feedbackService.show(FeedbackType.Warning, 'Error', 'Passwort kann nicht zurückgesetzt werden. Versuche es erneut.', 4000);
        }
        this.processing = false;
      }
    );
  }

  focusPassword() {
    this.password.nativeElement.focus();
  }

  focusFirstname() {
    this.firstname.nativeElement.focus();
  }

  focusLastname() {
    this.lastname.nativeElement.focus();
  }

  focusConfirmPassword() {
    if (!this.isLoggingIn) {
      this.confirmPassword.nativeElement.focus();
    } else {
      this.onSubmit();
    }
  }

  onEnter(route: string): void {
    this._navigationService.navigateTo(route);
  }

  onTogglePeekPassword(): void {
    // Save the current password peek mode
    this.passwordHidden = !this.password.nativeElement.secure;
    // Make the text visible by changing the `secure` attribute of password and the confirm field
    this.password.nativeElement.secure = !this.password.nativeElement.secure;
    // Fixes an Android bug, where the textfield cursor would jump to index 0 once the `secure` attribute changes
    /**
     * FIXME Bug fix necessairy: On Android the password textfield changes CSS font with toggle of `secure` attribute
     * Checkout this soltion: https://github.com/NativeScript/NativeScript/issues/4626#issuecomment-508094081
     */
    if (isAndroid && this.pwAndroidTypeFace) {
      this.pwAndroidTypeFace.setSelection(this.pwAndroidTypeFace.length());
    }
    if (!this.isLoggingIn) {
      this.confirmPassword.nativeElement.secure = !this.confirmPassword.nativeElement.secure;
    }
  }

  passwordHasInput(): boolean {
    return this.enteredPassword && this.enteredPassword.length > 0;
  }

  typeFaceLoaded(args): void {
    if (isAndroid) {
      this.pwAndroidTypeFace = args.object.android;
    }
  }

  private getUserToken() {
    const v = this._authService.getStorageItem('usertoken');
    console.log(v + ' reloaded');
  }

  private validateEmail(password: string): boolean {
    const re = /'^[^\s@]+@[^\s@]+\.[^\s@]+$'/;
    return password && re.test(password);
  }
}

