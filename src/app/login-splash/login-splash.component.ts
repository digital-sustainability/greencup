import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { AuthService } from '../shared/services/auth.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';
import { Page } from 'tns-core-modules/ui/page/page';
import { connectionType, startMonitoring, stopMonitoring } from 'tns-core-modules/connectivity';
import { FirebaseService } from '../shared/services/firebase.service';
import { Subscription } from 'rxjs';
import { device } from 'tns-core-modules/platform/platform';

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
    private firebaseService: FirebaseService
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

    // Init firebase
    this.firebaseService.initFirebase()
      .subscribe((complete) => {
        if (complete) {
          this.login();
        }
      }, (err) => {
        console.log('[Firebase]', err);
        if (err === 'Firebase already initialized') {
          this.login();
        }
        else {
          this._feedbackService.show(FeedbackType.Error, 'Push Benachrichtigungen konnten nicht initialisiert werden', '');
        }
      });
  }

  login() {
    const email = this._authService.getStorageItem('email');
    const token = this._authService.getStorageItem('usertoken');
    const deviceToken = this._authService.getStorageItem('deviceToken');
    if (email && token && deviceToken) {
      this._authService.tokenLogin({
        email: email,
        token: token,
        device_token: deviceToken
      }).subscribe(
        user => {
          stopMonitoring();
          if (user.cleaner) {
            this._navigationService.navigateTo('admin', true);
          } else {
            if (this._authService.isFirstRun()) {
              this._navigationService.navigateTo('info', true);
            } else {
              this._navigationService.navigateTo('tabs', true);
            }
          }
          this._feedbackService.show(FeedbackType.Success, `Hallo ${user.first_name} ${user.last_name}`, '');
        },
        err => {
          console.log('|===> Error', err);
          if (err.status === 400) {
            this._navigationService.navigateTo('email-confirm', true);
            const msg = 'Bestätige bitte deine Email Adresse über das Mail, das wir dir geschickt haben.';
            this._feedbackService.show(FeedbackType.Error, 'Login error', msg, 5000);
          } else if(err.status === 401) {
            const msg = 'Bitte logge dich ein oder erstelle einen Account';
            this._feedbackService.show(FeedbackType.Info, 'Login erforderlich', msg, 5000);
            this._navigationService.navigateTo('login', true);
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
