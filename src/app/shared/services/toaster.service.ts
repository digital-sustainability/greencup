import { Injectable } from '@angular/core';
import { Toasty } from 'nativescript-toasty';
import { Color } from 'tns-core-modules/color';
import { ToastDuration, ToastPosition } from '..//models/toastyOptions';
import { Notification } from '..//models/notification';

@Injectable({ providedIn: 'root' })
export class ToasterService {

  toasty: Toasty; // https://github.com/triniwiz/nativescript-toasty

  constructor() { }

  showToast(notification: Notification): void {
    if (notification) {
      const opts = {
        text: notification.detail,
        textColor: '#fff',
        backgroundColor: notification.statusType === 'ERROR' ? new Color('red') : new Color('green'),
        duration: ToastDuration.LONG,
        position: ToastPosition.BOTTOM,
        android: { yAxisOffset: 200 },
        ios: {
          // TODO: Check this: Must be the native iOS view instance (button, page, action bar, tabbar, etc.)
          // anchorView: someButton.ios,
          cornerRadius: 24,
        }
      };
      this.toasty = new Toasty(opts);
      this.toasty.show();
    }
  }

}
