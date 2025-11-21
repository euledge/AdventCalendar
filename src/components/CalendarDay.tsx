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
    //const isFuture = targetDate > today;
    const isFuture = false; // TODO: Remove this line for production

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
        relative aspect-square flex flex-col items-center justify-center
        transition-all duration-200 border-0 shadow-md
        ${entry ? 'bg-white/90 hover:bg-white' : 'bg-white hover:bg-gray-50'}
        ${!entry && !isFuture && isAuthenticated ? 'cursor-pointer hover:scale-105' : ''}
        ${isFuture ? 'opacity-80 cursor-not-allowed bg-gray-100' : ''}
        ${entry ? 'cursor-pointer hover:scale-105' : ''}
      `}
            onClick={handleClick}
        >
            {!entry && (
                <div className={`text-2xl sm:text-3xl font-bold ${isFuture ? 'text-gray-400' : 'text-[#BA3627]'}`}>
                    {day}
                </div>
            )}

            {isFuture && (
                <div className="absolute bottom-2 flex flex-col items-center">
                    <Lock className="w-4 h-4 text-gray-400" />
                </div>
            )}

            {entry && (
                <div className="absolute inset-0 p-2 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-1 left-2 text-sm font-bold text-[#BA3627]/50">
                        {day}
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full gap-1">
                        {entry.userPhotoURL && (
                            <img
                                src={entry.userPhotoURL}
                                alt={entry.userName}
                                className="w-8 h-8 rounded-full border-2 border-[#BA3627]/20"
                            />
                        )}
                        <p className="text-[10px] sm:text-xs font-medium line-clamp-2 w-full text-gray-700 leading-tight">
                            {entry.title}
                        </p>
                    </div>
                </div>
            )}

            {!entry && !isFuture && isAuthenticated && (
                <div className="absolute bottom-2 text-[10px] text-[#BA3627]/60 font-medium">
                    登録可
                </div>
            )}
        </Card>
    );
}
