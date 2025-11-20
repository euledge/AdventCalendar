export interface User {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    provider: 'google' | 'github';
}

export interface Entry {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    day: number; // 1-25
    year: number;
    title: string;
    url: string;
    comment?: string;
    createdAt: Date;
}
