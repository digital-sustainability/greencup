export interface Notification {
    statusType: StatusType;
    detail: string;
}

enum StatusType {
    success = 'SUCCESS',
    warning = 'WARNING',
    error = 'ERROR'
}
