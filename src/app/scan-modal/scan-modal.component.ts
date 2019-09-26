import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Scan, StatusType } from '../shared/models/scan';

import { has } from 'lodash';
import * as dayjs from 'dayjs';
import { Cup } from '../shared/models/cup';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-scan-modal',
  templateUrl: './scan-modal.component.html',
  styleUrls: ['./scan-modal.component.css']
})
export class ScanModalComponent implements OnInit {
  scan: Scan;

  constructor(private _modalDialogParams: ModalDialogParams) {
    this.scan = _modalDialogParams.context.scan;
  }

  ngOnInit() {
  }

  // ANCHOR *** User-Interaction Methods ***

  onClose(): void {
    this._modalDialogParams.closeCallback();
  }

  // ANCHOR *** Accessor Methods ***

  getStatusClass(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'status-rewarded' : 'status-verified';
    } else {
      return scan.status === StatusType.reserved ? 'status-reserved' : 'status-overbid';
    }
  }

  getStatusDescription(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'Ausbezahlt' : 'Gutgeschrieben';
    } else {
      return scan.status === StatusType.reserved ? 'Reserviert' : 'Überboten';
    }
  }

  getCupId(scan: Scan): number | Cup {
    return has(scan, 'cup_round_id.cup_id') ? scan.cup_round_id.cup_id : 0;
  }

  getScannedTime(scan: Scan): string {
    return scan.scanned_at ? dayjs(scan.scanned_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }

  getVerifiedTime(scan: Scan): string {
    console.log(scan);
    return scan.verified_at ? dayjs(scan.verified_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }

  getRewardedTime(scan: Scan): string {
    return scan.rewarded_at ? dayjs(scan.rewarded_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }
  getUserId(scan: Scan): number {
    if (typeof scan.user_id === 'number') {
      return scan.user_id ;
    } else {
      return has(scan, 'user_id.id') ? (<User>scan.user_id).id : 0;
    }
  }
}
