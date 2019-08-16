import { User } from './user';
import { Cup } from './cup';

export enum StatusType {
    reserved,
    overbid,
    rewarded
}

export interface Scan {
    createdAt: number;
    updatedAt: number;
    cleaned: boolean;
    cleanedAt: number;
    rewarded: boolean;
    rewardedAt: number;
    cup_id: number | Cup;
    user_id: number | User;
    scanStatus: StatusType;
}
