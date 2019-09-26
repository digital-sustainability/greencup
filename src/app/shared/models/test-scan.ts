import { Scan, StatusType } from './scan';
import { User } from './user';
import { Cup } from './cup';
import { CupRound } from './cup-round';


export class TestScan implements Scan {
  id: number;
  createdAt: number;
  updatedAt: number;
  verified: boolean;
  verified_at: number;
  rewarded: boolean;
  rewarded_at: number;
  user_id: number | User;
  status: StatusType;
  cup_round_id: CupRound;
  scanned_at: number;

  constructor(rdnId: number, status: StatusType) {
    this.id = rdnId;
    this.status = status;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.verified_at = undefined;
    this.verified = false;
    this.rewarded_at = undefined;
    this.rewarded = false;
    this.user_id = undefined;
    this.scanned_at = Date.now();
    this.cup_round_id = <CupRound>{
      id: 1,
      special_event: '-',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cup_id: rdnId
    };
  }

}
