export interface ScanStatus {
    stausType: StatusType;
    explenation: string;
}

enum StatusType {
    reserved = 'Reserviert',
    overbid = 'Überboten',
    paid = 'Ausbezahlt'
}