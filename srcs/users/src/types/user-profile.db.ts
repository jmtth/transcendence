export interface UserProfileDB {
    id: string;
    id_user: string;
    username: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    id: string;
    username: string;
    avatarUrl: string;
}