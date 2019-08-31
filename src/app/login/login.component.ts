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
      this.login();
    } else {
      this.register();
    }
  }

  login(): void {
    if (!this.enteredEmail || !this.enteredPassword || this.validateEmail(this.enteredPassword)) {
      this._feedbackService.show(FeedbackType.Warning, '', 'Bitte Email und Password angeben', 4000);
      return;
    }
    this.processing = true;

    const token = this._authService.getUserToken('usertoken');
    if (token) {
      this._feedbackService.show(FeedbackType.Success, 'Login mit existierendem Token', '', 4000);
      this.processing = false;
    } else {
      const loginDetails = {
        email: this.enteredEmail,
        password: this.enteredPassword
      };
      this._authService.login(loginDetails).subscribe(
        tokenObj => {
          const createdToken = this._authService.setUserToken('usertoken', tokenObj.token);
          if (createdToken) {
            // TODO: Token auth
            this._feedbackService.show(FeedbackType.Success, 'Login mit neuem token', '', 4000);
          } else {
            // TODO: React to empty token
            console.log('|===> Problem occured');
          }
          this.processing = false;
        },
        err => {
          // TODO: Better Error handling, depending on Backend response
          console.log('|===> Err ', err);
          this.processing = false;
          this._feedbackService.show(FeedbackType.Warning, 'Login fehlgeschlagen', '', 4000);
          // this._feedbackService.show(FeedbackType.Warning, '', 'Keinen Benutzer mit dieser Email gefunden', 4000);
        }
      );
    }

    // this._authService.login(this.user)
    //   .then(() => {
    //     this.processing = false;
    //     this._routerExtensions.navigate(['/tabs'], { clearHistory: true });
    //   })
    //   .catch(() => {
    //     this.processing = false;
    //   });
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
        console.log('|===> User ', user);
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
    // this._authService.register(this.user)
    //   .then(() => {
    //     this.processing = false;
    //     this._feedbackService.show(FeedbackType.Success, '', 'Login erfolgreich', 4000);
    //     this.isLoggingIn = true;
    //   })
    //   .catch(() => {
    //     this.processing = false;
    //     this._feedbackService.show(FeedbackType.Error, 'Ein Fehler ist aufgetreten', 'Account konnte nicht erstellt werden', 4000);
    //   });
  }

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
        // this._authService.resetPassword(data.text.trim())
        //   .then(() => {
        //     this._feedbackService.show(FeedbackType.Success, '', 'Passwort wurde zurückgesetzt, Wir haben Ihnen ein Email gesendet', 4000);
        //   }).catch(() => {
        //     this._feedbackService.show(FeedbackType.Error, 'Ein Fehler ist aufgetreten', 'Passwort konnte nicht zurückgesetzt werden', 4000);
        //   });
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

  // alert(message: string) {
  //   return alert({
  //     title: 'APP NAME',
  //     okButtonText: 'OK',
  //     message: message
  //   });
  // }

  onEnter(route: string): void {
    this._navigationService.navigateTo(route);
  }

  private getUserToken() {
    const v = this._authService.getUserToken();
    console.log(v + ' reloaded');
  }

  private validateEmail(password: string): boolean {
    const re = /'^[^\s@]+@[^\s@]+\.[^\s@]+$'/;
    return password && re.test(password);
  }
}

