export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'admin' | 'customer' | 'driver';
    phone?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}

export interface UsersData {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Filters {
    search: string;
    role: string;
    per_page: number;
}

export interface Stats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    recent_logins: number;
    admin_users: number;
    user_users: number;
    moderator_users: number;
}

export interface PageProps {
    users: UsersData;
    filters: Filters;
    stats: Stats;
    [key: string]: unknown;
}
