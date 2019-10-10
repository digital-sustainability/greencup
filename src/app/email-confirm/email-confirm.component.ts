import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';
import { registerElement } from 'nativescript-angular';

registerElement('PreviousNextView', () => require('nativescript-iqkeyboardmanager').PreviousNextView);


@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css']
})
export class EmailConfirmComponent implements OnInit {

  enteredUserId: number;
  enteredToken: string;
  processing: boolean;
  @ViewChild('token', { static: false }) token: ElementRef;

  constructor(private _authService: AuthService,
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.processing = true;
    this._authService.confirmEmail(this.enteredUserId, this.enteredToken)
      .subscribe(() => {
        this._navigationService.navigateTo('info', true);
        this._feedbackService.show(FeedbackType.Success, 'Email erfolgreich bestätigt', '', 4000);
      }, (err) => {
        console.log('|===> Err', err);
        if (err.status === 404) {
          this._feedbackService.show(FeedbackType.Warning, 'Email Bestätigung fehlgeschlagen', 'Nutzer-Id stimmt nicht', 4000);
        }
        else {
          this._feedbackService.show(FeedbackType.Warning, 'Email Bestätigung fehlgeschlagen', 'Code stimmt nicht', 4000);
        }
        this.processing = false;
      });
  }

  focusToken() {
    this.token.nativeElement.focus();
  }

}
