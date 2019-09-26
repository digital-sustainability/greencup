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
  verified_at: number;
  rewarded: boolean;
  rewarded_at: number;
  user_id: number | User;
  status: StatusType;
  cup_round_id: CupRound;
  scanned_at: number;
}
