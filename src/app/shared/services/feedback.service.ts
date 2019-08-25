import { Injectable } from '@angular/core';
import { Feedback, FeedbackType, FeedbackPosition } from 'nativescript-feedback';

@Injectable({ providedIn: 'root' })
export class FeedbackService {

  // https://github.com/EddyVerbruggen/nativescript-feedback
  private _feedback: Feedback;

  constructor() {
    this._feedback = new Feedback();
  }

  show(type: FeedbackType, title: string, message?: string, duration = 3000, onTap?: () => void): void {
    const opts = {
      type: type,
      title: title,
      position: FeedbackPosition.Top, // .Bottom is iOS only
      duration: duration,
      // titleColor: new color.Color('#222222'),
      // messageColor: new color.Color('#333333'),
      // backgroundColor: new color.Color('yellowgreen'),
      // icon: 'customicon', // in App_Resources/platform folders
      // onShow: function(animating) { console.log(animating ? 'showCustomIcon animating' : 'showCustomIcon shown'); },
      // onHide: function() { console.log('showCustomIcon hidden'); }
    };

    // Add the optional message if defined
    if (message.length) {
      opts['message'] = message;
    }

    // Add a onTap Callback to the message in case one is provided
    if (onTap) {
      opts['onTap'] = onTap;
    }
    this._feedback.show(opts);
  }
}
