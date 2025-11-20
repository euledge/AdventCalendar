import { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
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
            toast.error('Please enter a valid URL');
            return;
        }

        setLoading(true);

        try {
            const docId = `${year}-${day}`;
            await setDoc(doc(db, 'entries', docId), {
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

            toast.success(existingEntry ? 'Entry updated!' : 'Entry created!');
            onSuccess();
        } catch (error) {
            console.error('Error saving entry:', error);
            toast.error('Failed to save entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        December {day}, {year}
                    </DialogTitle>
                    <DialogDescription>
                        {existingEntry && !isOwner
                            ? 'This day is already taken by another user.'
                            : existingEntry
                                ? 'Edit your entry'
                                : 'Register your article for this day'}
                    </DialogDescription>
                </DialogHeader>

                {existingEntry && !isOwner ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Title</p>
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
                                <p className="text-sm font-medium">Comment</p>
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
                            <p className="text-sm text-muted-foreground">by {existingEntry.userName}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="My awesome article"
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
                            <Label htmlFor="comment">Comment (Optional)</Label>
                            <Input
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="A brief description..."
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : existingEntry ? 'Update' : 'Register'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
