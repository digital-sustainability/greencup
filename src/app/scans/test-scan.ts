import { Scan, StatusType } from '../shared/models/scan';
import { User } from '../shared/models/user';
import { Cup } from '../shared/models/cup';
import { CupRound } from '../shared/models/cup-round';


export class TestScan implements Scan {
  createdAt: number;
  updatedAt: number;
  verified: boolean;
  verifiedAt: number;
  rewarded: boolean;
  rewardedAt: number;
  cup_id: number | Cup;
  user_id: number | User;
  status: StatusType;
  cup_round: CupRound;

  constructor(cupId: number, status: StatusType) {
    this.status = status;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.verifiedAt = undefined;
    this.verified = false;
    this.rewardedAt = undefined;
    this.rewarded = false;
    this.user_id = undefined;
    this.cup_id = <Cup>{
      id: cupId,
      batch_version: 1,
      // code: 'SBB-1xxw4jzcan2n412345-e5885',
      code: `SBB-${cupId}xxw4jzcan2n412345-e5885`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scans: []
    };
    this.cup_round = {
      id: 1,
      special_event: '-',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cup_id: 1
    };
  }

}
