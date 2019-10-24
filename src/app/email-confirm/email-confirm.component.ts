import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/services/navigation.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';
import { registerElement, PageRoute } from 'nativescript-angular';
import { switchMap } from 'rxjs/operators';

registerElement('PreviousNextView', () => require('nativescript-iqkeyboardmanager').PreviousNextView);


@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css']
})
export class EmailConfirmComponent implements OnInit {

  email: string;

  constructor(
    private _navigationService: NavigationService,
    private _feedbackService: FeedbackService,
    private _pageRoute: PageRoute,
  ) { }

  ngOnInit(): void {
    this._pageRoute.activatedRoute
      .pipe(switchMap(activatedRoute => activatedRoute.params))
      .forEach(params => this.email = params.email);
  }

  onOkay(): void {
    this._navigationService.navigateTo('/login', true);
    this._feedbackService.show(FeedbackType.Info, 'Bitte bestätige deine Email vor dem Login', '', 4000);
  }

  onNavigateToLogin(): void {
    this._navigationService.navigateTo('login');
  }

}
