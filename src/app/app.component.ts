import { Component } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { }
