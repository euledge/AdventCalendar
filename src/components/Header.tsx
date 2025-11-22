import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function Header() {
    const { user, signInWithGoogle, signInWithGithub, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <header className="bg-transparent pt-8 pb-4">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4">
                <div className="flex flex-row items-center gap-4 relative">
                    <img
                        src="/tree-mikan.png"
                        alt="Tree and Mikan"
                        className="h-24 w-auto object-contain -rotate-6 hidden sm:block"
                    />
                    <div className="flex flex-row items-center gap-2">
                        <img src="/adventcalendar-logo.PNG" alt="Advent Calendar Logo" className="h-24 w-auto" />
                        <h1 className="text-5xl md:text-7xl font-bold text-[#BA3627] tracking-wider text-center">
                            2025
                        </h1>
                    </div>
                    <img
                        src="/gift-box.png"
                        alt="Gift Box"
                        className="h-20 w-auto object-contain rotate-12 hidden sm:block"
                    />
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {user.photoURL && (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className="w-8 h-8 rounded-full border border-[#BA3627]/20"
                                    />
                                )}
                                <span className="text-sm font-medium hidden sm:inline-block text-[#BA3627]">
                                    {user.displayName}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="border-[#BA3627] text-[#BA3627] hover:bg-[#BA3627] hover:text-white"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                ログアウト
                            </Button>
                        </div>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-[#BA3627] hover:bg-[#992D20] text-white">
                                    ログイン
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>ログイン</DialogTitle>
                                    <DialogDescription>
                                        記事を登録するにはログインが必要です。
                                        お好きな方法でログインしてください。
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-4 py-4">
                                    <Button variant="outline" onClick={signInWithGoogle} className="w-full">
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Googleでログイン
                                    </Button>
                                    <Button variant="outline" onClick={signInWithGithub} className="w-full">
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
                                            />
                                        </svg>
                                        GitHubでログイン
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </header>
    );
}
