import { Scan, StatusType } from '../shared/models/scan';
import { User } from '../shared/models/user';
import { Cup } from '../shared/models/cup';
import { CupRound } from '../shared/models/cup-round';


export class TestScan implements Scan {
  id: number;
  createdAt: number;
  updatedAt: number;
  verified: boolean;
  verifiedAt: number;
  rewarded: boolean;
  rewardedAt: number;
  user_id: number | User;
  status: StatusType;
  cup_round_id: CupRound;

  constructor(rdnId: number, status: StatusType) {
    this.id = rdnId;
    this.status = status;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.verifiedAt = undefined;
    this.verified = false;
    this.rewardedAt = undefined;
    this.rewarded = false;
    this.user_id = undefined;
    this.cup_round_id = <CupRound>{
      id: 1,
      special_event: '-',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cup_id: rdnId
    };
  }

}
