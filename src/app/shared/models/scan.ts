import { User } from './user';
import { CupRound } from './cup-round';

export enum StatusType {
  reserved = 'reserved',
  overbid = 'overbid',
}

export interface Scan {
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
  scanned_at: number;
}
