import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './shared/services/firebase.service';
import { FeedbackService } from './shared/services/feedback.service';
import { FeedbackType } from 'nativescript-feedback';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private _firebaseService: FirebaseService,
    private _feedbackService: FeedbackService) {}

  ngOnInit() {
    this._firebaseService.onMessageReceived()
    .subscribe((message) => {
      this._feedbackService.show(FeedbackType.Info, message.title, message.body,
        10000);
    });
  }
}
