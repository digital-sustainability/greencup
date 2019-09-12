import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { AuthService } from '../shared/services/auth.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Component({
  selector: 'app-login-splash',
  templateUrl: './login-splash.component.html',
  styleUrls: ['./login-splash.component.css']
})
export class LoginSplashComponent implements OnInit {

  constructor(
    private _navigationService: NavigationService,
    private _authService: AuthService,
    private _feedbackService: FeedbackService,
  ) { }

  ngOnInit() {
    // TODO: Init some kind of loading screen
    const email = this._authService.getStorageItem('email');
    const token = this._authService.getStorageItem('usertoken');
    if (email && token) {
      this._authService.tokenLogin({ email: email, token: token }).subscribe(
        user => {
          console.log('|===> User', user);
          this._feedbackService.show(FeedbackType.Success, `Hallo ${user.first_name} ${user.last_name}`, '', 4000);
          if (user.cleaner) {
            this._navigationService.navigateTo('admin', true);
          }
          else {
            this._navigationService.navigateTo('tabs', true);
          }
        },
        err => {
          console.log('|===> Error', err);
          if (err.status === 400) {
            this._feedbackService.show(FeedbackType.Error, 'Login error',
            'Bestätige bitte deine Email Adresse über das Mail, das wir dir geschickt haben.', 4000);
          } else {
            this._feedbackService.show(FeedbackType.Error, 'Login error', 'Melde dich bitte erneut an', 4000);
            this._navigationService.navigateTo('login', true);
          }
          /**
           * TODO:
           * * Send user to confirm Email screen if that was the error received from backend
           * * Or: Send user to login other case
           * * Or: Handle other severe errors
           */
        }
      );
    } else {
      this._navigationService.navigateTo('login', true);
    }
  }

}
