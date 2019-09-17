import { Cup } from './cup';
import { User } from './user';

export interface CupRound {
  id: number;
  createdAt: number;
  updatedAt: number;
  special_event: string;
  cup_id: number | Cup;
  closed_at: number;
  closed_by: number | User;
}
