import { Component, OnInit } from '@angular/core';
import * as utils from 'tns-core-modules/utils/utils';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  actionBarTitle = 'Support';

  constructor() { }

  ngOnInit(): void { }

  onContact(): void {
    utils.openUrl('mailto:al.kraeuchi@gmail.com');
  }

}
