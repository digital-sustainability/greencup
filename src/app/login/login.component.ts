import { Component, ElementRef, ViewChild } from '@angular/core';
import { prompt } from 'tns-core-modules/ui/dialogs';
import { Page } from 'tns-core-modules/ui/page';
import { RouterExtensions } from 'nativescript-angular/router';

import { User } from '../shared/models/user';
import { RegisteringUser } from '../shared/models/registering-user';
import { FeedbackType } from 'nativescript-feedback';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';

@Component({
  selector: 'app-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

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

  constructor(
    private _page: Page,
    private _authService: AuthService,
    private _routerExtensions: RouterExtensions,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService, // TODO: Leave on the page for longer Feedbacks until next user action occurs
  ) {
    this._page.actionBarHidden = true;
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
          this._feedbackService.show(FeedbackType.Success, 'Neuen Token erhalten', '', 4000);
          this._authService.tokenLogin({
            email: this.enteredEmail,
            token: tokenObj.token
          }).subscribe(
            user => {
              console.log(user);
              this._feedbackService.show(FeedbackType.Success, `Welcome ${user.first_name}`);
              this._navigationService.navigateTo('tabs');
            },
            err => console.log(err)
          );
        } else {
          // TODO: React saving error
          console.log('|===> Problem occured');
          this._feedbackService.show(FeedbackType.Warning, 'Token Saving Error', '', 4000);
        }
        this.processing = false;
      },
      err => {
        // TODO: Better Error handling, depending on Backend response
        console.log('|===> Err ', err);
        this.processing = false;
        this._feedbackService.show(FeedbackType.Warning, 'Login fehlgeschlagen', '', 4000);
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
        this._feedbackService.show(FeedbackType.Success, 'Registrierung erfolgreich', '', 4000);
        this.processing = false;
      },
      err => {
        // TODO: Better Error handling, depending on Backend response
        console.log('|===> Err ', err);
        this._feedbackService.show(FeedbackType.Error, 'Ein Fehler ist aufgetreten', 'Account konnte nicht erstellt werden', 4000);
        this.processing = false;
      }
    );
  }

  // TODO: Implement forgot password functionallity. Replace the default below
  forgotPassword() {
    prompt({
      title: 'Forgot Password',
      message: 'Enter the email address you used to register for APP NAME to reset your password.',
      inputType: 'email',
      defaultText: '',
      okButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((data) => {
      if (data.result) {
        console.log('|===> Reset Password');
      }
    });
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

