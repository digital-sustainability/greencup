import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError, empty } from 'rxjs';
import { CsrfService } from './csrf.service';
import { mergeMap, catchError } from 'rxjs/operators';
import { NavigationService } from './navigation.service';

@Injectable({ providedIn: 'root' })
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private csrfService: CsrfService,
    private navigationService: NavigationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return this.csrfService.getCSRFToken().pipe(mergeMap((csrf) => {
        request = request.clone({
          setHeaders: {
            'X-CSRF-Token': csrf
          },
          withCredentials: false
        });
        return next.handle(request).pipe(
          catchError((err) => {
            // Navigate to login screen if not authenticated
            if (err.status === 401) {
              this.navigationService.navigateTo('/login', true);

            }
            return throwError(err);
          })
        );
      }));
    } else {
      request = request.clone({
        withCredentials: false
      });
      return next.handle(request).pipe(
        catchError((err) => {
          // Navigate to login screen if not authenticated
          if (err.status === 401) {
            this.navigationService.navigateTo('/login', true);
          }
          return throwError(err);
        })
      );
    }
  }
}
