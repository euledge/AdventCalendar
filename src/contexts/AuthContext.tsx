import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(mapFirebaseUser(firebaseUser));
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
        const providerId = firebaseUser.providerData[0]?.providerId || '';
        let provider: 'google' | 'github' = 'google';

        if (providerId.includes('github')) {
            provider = 'github';
        }

        return {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider,
        };
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('ログインがキャンセルされました');
            } else if (error.code === 'auth/popup-blocked') {
                toast.error('ポップアップがブロックされました。ブラウザの設定を確認してください');
            } else {
                toast.error('ログインに失敗しました。もう一度お試しください');
            }
        }
    };

    const signInWithGithub = async () => {
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error('GitHub sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('ログインがキャンセルされました');
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                toast.error('このメールアドレスは既に別の認証方法で登録されています');
            } else {
                toast.error('ログインに失敗しました。もう一度お試しください');
            }
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signInWithGoogle,
                signInWithGithub,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
