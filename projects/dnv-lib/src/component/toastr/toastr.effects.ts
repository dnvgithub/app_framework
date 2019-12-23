import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { Observable, of, forkJoin, throwError } from 'rxjs';
import { flatMap, withLatestFrom, map, delay, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ToasterActionType, ToastUserNotification } from './toastr.actions';
import { UserNotification } from './toastr.state';


@Injectable()
export class ToastrEffects {

  @Effect({ dispatch: false }) toastUserNotification$ = this.actions$.pipe( // { dispatch: false }
    ofType(ToasterActionType.ToastUserNotification),
    map((action: ToastUserNotification) => {
      const notification: UserNotification = action.payload;
      if (notification) {
        switch (notification.type) {
          case 'success':
            this.toastr.success(notification.message, notification.title, notification.options || {});

            break;
          case 'info':
            this.toastr.info(notification.message, notification.title, notification.options || {});

            break;
          case 'warning':
            this.toastr.warning(notification.message, notification.title, notification.options || {});

            break;

          case 'error':
            this.toastr.error(notification.message, notification.title, notification.options || {});

            break;
          default:
            console.log(notification);

            this.toastr.error(
              notification.message || 'Please raise a suport ticket with information about what you were doing in the application!'
              , notification.title || 'Something went wrong...', notification.options || {});
            break;
        }
      } else {
        this.toastr.error(
          'Please raise a suport ticket with information about what you were doing in the application!',
          'Something went wrong...', {});
      }
    })
  );


  constructor(
    private actions$: Actions,
    private toastr: ToastrService
  ) { }


}
