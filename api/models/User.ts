interface User {
    id: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    created_at?: number;
    updated_at?: number;
    jwt_refresh_token?: string;
    stripe_id?: string;
}

export type {
    User
}