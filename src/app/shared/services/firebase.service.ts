import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'nativescript-plugin-firebase';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private messageSubject$ = new Subject<firebase.Message>();

  constructor(private ngZone: NgZone,
    private authService: AuthService) { }

  initFirebase(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.ngZone.runOutsideAngular(() => {
        firebase.init({
          showNotifications: true,
          showNotificationsWhenInForeground: true,

          onPushTokenReceivedCallback: (token) => {
            console.log('[Firebase] onPushTokenReceivedCallback:', { token });
            this.ngZone.run(() => {
              this.authService.setStorageItem('deviceToken', token);
              observer.next(true);
              observer.complete();
            });
          },

          onMessageReceivedCallback: (message: firebase.Message) => {
            console.log('[Firebase] onMessageReceivedCallback:', { message });
            this.ngZone.run(() => {
              this.messageSubject$.next(message);
            });
          }
        })
          .then(() => {
            return firebase.subscribeToTopic('all');
          })
          .then(() => {
            this.ngZone.run(() => {
              observer.next(false);
            });
          })
          .catch(error => {
            this.ngZone.run(() => {
              observer.error(error);
            });
          });
      });
    });
  }

  onMessageReceived(): Observable<firebase.Message> {
    return this.messageSubject$.asObservable();
  }

}
