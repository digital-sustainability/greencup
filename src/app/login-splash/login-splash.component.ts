import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { AuthService } from '../shared/services/auth.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';
import { Page } from 'tns-core-modules/ui/page/page';
import { connectionType, startMonitoring, stopMonitoring } from 'tns-core-modules/connectivity';

@Component({
  selector: 'app-login-splash',
  templateUrl: './login-splash.component.html',
  styleUrls: ['./login-splash.component.css']
})
export class LoginSplashComponent implements OnInit, OnDestroy {

  private _hasInternetConnection: boolean;

  constructor(
    private _navigationService: NavigationService,
    private _authService: AuthService,
    private _feedbackService: FeedbackService,
    private _page: Page,
  ) {
    this._page.actionBarHidden = true;
  }

  ngOnInit(): void {
    // Monitor the users internet connection. Change connection status if the user is offline
    startMonitoring((newConnectionType) => {
      this._hasInternetConnection = newConnectionType !== connectionType.none;
      if (!this._hasInternetConnection) {
        // If offline navigate the user to login screen where a 'No Connection' message is displayed
        this._navigationService.navigateTo('login');
      }
    });

    const email = this._authService.getStorageItem('email');
    const token = this._authService.getStorageItem('usertoken');
    if (email && token) {
      this._authService.tokenLogin({ email: email, token: token }).subscribe(
        user => {
          if (user.cleaner) {
            this._navigationService.navigateTo('admin', true);
          } else {
            this._navigationService.navigateTo('tabs', true);
          }
          this._feedbackService.show(FeedbackType.Success, `Hallo ${user.first_name} ${user.last_name}`, '', 4000);
        },
        err => {
          console.log('|===> Error', err);
          if (err.status === 400) {
            this._navigationService.navigateTo('email-confirm', true);
            const msg = 'Bestätige bitte deine Email Adresse über das Mail, das wir dir geschickt haben.';
            this._feedbackService.show(FeedbackType.Error, 'Login error', msg, 5000);
          } else {
            const msg = 'Beim Login ist ein unbekannter Fehler aufgetreten. Bitte versuche es später erneut.';
            this._feedbackService.show(FeedbackType.Error, 'Login error', msg, 5000);
            this._navigationService.navigateTo('login', true);
          }
        }
      );
    } else {
      this._navigationService.navigateTo('login', true);
    }
  }

  ngOnDestroy(): void {
    stopMonitoring();
  }

}
