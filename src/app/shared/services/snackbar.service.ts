import { Injectable } from '@angular/core';
import { SnackBar, SnackBarOptions } from '@nstudio/nativescript-snackbar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  constructor() { }

  // TODO: Remove service if not needed
  snackbar = new SnackBar(); // https://github.com/nstudio/nativescript-snackbar

  showSimpleSnackbar() {
  /// Show a simple snackbar with no actions
  this.snackbar.simple('Snackbar', '#ff0000', '#fff', 3, false).then(
    function (args) {
       this.set('jsonResult', JSON.stringify(args));
    });
  }
}
