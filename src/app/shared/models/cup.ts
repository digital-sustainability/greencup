import { Scan } from './scan';

export interface Cup {
    createdAt: number;
    updatedAt: number;
    id: number;
    code: string;
    scans: Scan[];
}
