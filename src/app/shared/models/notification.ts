export interface Notification {
    statusType: StatusType;
    title: string;
    detail: string;
}

enum StatusType {
    success = 'SUCCESS',
    warning = 'WARNING',
    error = 'ERROR'
}
