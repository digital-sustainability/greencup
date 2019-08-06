import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsrfService } from './csrf.service';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private csrfService: CsrfService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return this.csrfService.getCSRFToken().pipe(mergeMap((csrf) => {
        request = request.clone({
          setHeaders: {
            'X-CSRF-Token': csrf
          },
          withCredentials: false
        });
        return next.handle(request);
      }));
    } else {
      request = request.clone({
        withCredentials: false
      });
      return next.handle(request);
    }
  }
}
