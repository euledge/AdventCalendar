import { useState } from 'react';
import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Entry } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EntryDialogProps {
    day: number;
    year: number;
    existingEntry?: Entry;
    onClose: () => void;
    onSuccess: () => void;
}

export function EntryDialog({ day, year, existingEntry, onClose, onSuccess }: EntryDialogProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(existingEntry?.title || '');
    const [url, setUrl] = useState(existingEntry?.url || '');
    const [comment, setComment] = useState(existingEntry?.comment || '');
    const [loading, setLoading] = useState(false);

    const isOwner = existingEntry?.userId === user?.uid;
    const canEdit = !existingEntry || isOwner;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !canEdit) return;

        // Validate URL
        try {
            new URL(url);
        } catch {
            toast.error('有効なURLを入力してください');
            return;
        }

        setLoading(true);

        try {
            const docId = `${year}-${day}`;
            const docRef = doc(db, 'entries', docId);

            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(docRef);

                // Check if entry exists and belongs to another user
                if (docSnap.exists() && docSnap.data().userId !== user.uid) {
                    throw new Error('この日付は既に他のユーザーによって登録されています');
                }

                transaction.set(docRef, {
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    userPhotoURL: user.photoURL,
                    day,
                    year,
                    title,
                    url,
                    comment: comment || null,
                    createdAt: Timestamp.now(),
                });
            });

            toast.success(existingEntry ? 'エントリーを更新しました' : 'エントリーを登録しました');
            onSuccess();
        } catch (error: any) {
            console.error('Error saving entry:', error);
            if (error.message.includes('既に他のユーザー')) {
                toast.error(error.message);
            } else {
                toast.error('保存に失敗しました。もう一度お試しください');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {year}年12月{day}日
                    </DialogTitle>
                    <DialogDescription>
                        {existingEntry && !isOwner
                            ? 'この日付は既に他のユーザーによって登録されています。'
                            : existingEntry
                                ? 'エントリーを編集'
                                : 'この記事を登録する'}
                    </DialogDescription>
                </DialogHeader>

                {existingEntry && !isOwner ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">タイトル</p>
                            <p className="text-sm text-muted-foreground">{existingEntry.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">URL</p>
                            <a
                                href={existingEntry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                            >
                                {existingEntry.url}
                            </a>
                        </div>
                        {existingEntry.comment && (
                            <div>
                                <p className="text-sm font-medium">コメント</p>
                                <p className="text-sm text-muted-foreground">{existingEntry.comment}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {existingEntry.userPhotoURL && (
                                <img
                                    src={existingEntry.userPhotoURL}
                                    alt={existingEntry.userName}
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                            <p className="text-sm text-muted-foreground">登録者: {existingEntry.userName}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">タイトル *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="記事のタイトルを入力"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="url">URL *</Label>
                            <Input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/my-article"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="comment">コメント (任意)</Label>
                            <Input
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="記事の紹介文など"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? '保存中...' : existingEntry ? '更新する' : '登録する'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
