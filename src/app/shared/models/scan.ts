import { User } from './user';
import { Cup } from './cup';
import { CupRound } from './cup-round';

export enum StatusType {
  reserved = 'reserved',
  overbid = 'overbid',
}

export interface Scan {
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
}
