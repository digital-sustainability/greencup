import { Cup } from './cup';

export interface CupRound {
  id: number;
  createdAt: number;
  updatedAt: number;
  special_event: string;
  cup_id: number | Cup;
}
