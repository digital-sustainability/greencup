import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { prompt } from 'tns-core-modules/ui/dialogs';
import { Page } from 'tns-core-modules/ui/page';
import { RouterExtensions } from 'nativescript-angular/router';

import { User } from '../shared/models/user';
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
    private _routerExtensions: RouterExtensions,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService, // TODO: Leave on the page for longer Feedbacks until next user action occurs
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
    if (this._navigationService.getPreviousUrl().includes('info')) {
      this._feedbackService.show(FeedbackType.Success, 'Login', 'Melde dich bitte an', 4000);
    } else {
      this._feedbackService.show(FeedbackType.Error, 'Login', 'Melde dich bitte an', 4000);
    }
  }

  toggleForm() {
    this.isLoggingIn = !this.isLoggingIn;
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
    // TODO: Improve Password validation
    // TODO: Refactor validation to seperate method

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

    if (this.enteredPassword !== this.enteredConfirmPassword) {
      this._feedbackService.show(FeedbackType.Warning, 'Ungültig', 'Passwörter stimmen nicht überein', 4000);
      return;
    }

    // if (this.enteredPassword.length >= 10) {
    //   this._feedbackService.show(FeedbackType.Warning, 'Ungültig', 'Passwort muss mindestens 10 Zeichen enthalten', 4000);
    //   return;
    // }



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
        // TODO: navigate user to login- or confirm-email screen
        // TODO: Save email and received token to store
        console.log('|===> Answer ', user);
        this._navigationService.navigateTo('/email-confirm', true);
        this._feedbackService.show(FeedbackType.Success, 'Registrierung erfolgreich', 'Bestätige deine Email Adresse über das Email das du erhalten hast.', 4000);
        this.processing = false;
      },
      err => {
        // TODO: Better Error handling, depending on Backend response
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

  // TODO: Implement forgot password functionallity. Replace the default below
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

  private getUserToken() {
    const v = this._authService.getStorageItem('usertoken');
    console.log(v + ' reloaded');
  }

  private validateEmail(password: string): boolean {
    const re = /'^[^\s@]+@[^\s@]+\.[^\s@]+$'/;
    return password && re.test(password);
  }
}

