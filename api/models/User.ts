interface User {
    id?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    created_at?: Date;
    updated_at?: Date;
    jwt_refresh_token?: string | null;
    stripe_id?: string | null;
}

export type {
    User
}