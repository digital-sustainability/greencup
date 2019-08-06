export interface User {
    createdAt: number;
    updatedAt: number;
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    confirmed: boolean;
    confirm_token: string;
    phone: any;
    street: string;
    city: string;
    zip_code: number;
}
