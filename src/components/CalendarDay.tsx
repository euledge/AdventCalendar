import type { Entry } from '@/types';
import { Card } from '@/components/ui/card';
import { ExternalLink, Lock } from 'lucide-react';

interface CalendarDayProps {
    day: number;
    entry?: Entry;
    onDayClick: (day: number) => void;
    isAuthenticated: boolean;
}

export function CalendarDay({ day, entry, onDayClick, isAuthenticated }: CalendarDayProps) {
    const today = new Date();
    const targetDate = new Date(2025, 11, day); // December is month 11
    // Temporarily disable future date check for testing
    const isFuture = false; // targetDate > today;

    const handleClick = () => {
        if (entry) {
            // Open external link
            window.open(entry.url, '_blank', 'noopener,noreferrer');
        } else if (!isFuture && isAuthenticated) {
            // Open entry dialog
            onDayClick(day);
        }
    };

    return (
        <Card
            className={`
        relative aspect-square p-4 flex flex-col items-center justify-center
        transition-all duration-200
        ${entry ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer' : ''}
        ${!entry && !isFuture && isAuthenticated ? 'hover:bg-accent cursor-pointer' : ''}
        ${isFuture ? 'opacity-50 cursor-not-allowed' : ''}
      `}
            onClick={handleClick}
        >
            <div className="absolute top-2 left-2 text-2xl font-bold text-muted-foreground">
                {day}
            </div>

            {isFuture && (
                <Lock className="w-6 h-6 text-muted-foreground" />
            )}

            {entry && (
                <div className="flex flex-col items-center gap-2 mt-6">
                    {entry.userPhotoURL && (
                        <img
                            src={entry.userPhotoURL}
                            alt={entry.userName}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <p className="text-xs text-center font-medium line-clamp-2">
                        {entry.title}
                    </p>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
            )}

            {!entry && !isFuture && isAuthenticated && (
                <div className="text-center mt-6">
                    <p className="text-xs text-muted-foreground">Click to register</p>
                </div>
            )}

            {!entry && !isFuture && !isAuthenticated && (
                <div className="text-center mt-6">
                    <p className="text-xs text-muted-foreground">Available</p>
                </div>
            )}
        </Card>
    );
}
