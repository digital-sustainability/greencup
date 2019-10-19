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

  getScannedLabelText(scan: Scan): string {
    if (!scan.verified && scan.status !== StatusType.reserved) {
      // overbid
      return 'Ursprünglich gescannt:';
    } else {
      // normal
      return 'Gescannt:';
    }
  }

  getStatusLabel(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'Ausbezahlt' : 'Guthaben';
    } else {
      return scan.status === StatusType.reserved ? 'Gescannt' : 'Überscannt';
    }
  }

  getStatusDescription(scan: Scan): string {
    switch (this.getStatusLabel(scan)) {
      case 'Gescannt':
        return 'Becher wurde von dir gescannt. Wenn du ihn zurückgibst wird dir nach dem Waschvorgang das Depot in der App gutgeschrieben.';
      case 'Guthaben':
        return 'Du kannst dir das Guthaben für diesen Becher an der Kasse in Bargeld auszahlen lassen.';
      case 'Ausbezahlt':
        return 'Die Gutschrift für diesen Becher wurde dir an der Kasse in Bargeld ausbezahlt.';
      default:
        return 'Du hast den Becher nicht zurückgegeben. Eine andere Person hat den Becher nach dir gescannt.';
    }
  }

  getCupId(scan: Scan): number | Cup {
    return has(scan, 'cup_round_id.cup_id') ? scan.cup_round_id.cup_id : 0;
  }

  getScannedTime(scan: Scan): string {
    return scan.scanned_at ? dayjs(scan.scanned_at).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }

  getVerifiedTime(scan: Scan): string {
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
