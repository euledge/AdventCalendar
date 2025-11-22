import type { Entry } from '@/types';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useMemo } from 'react';

interface CalendarDayProps {
    day: number;
    entry?: Entry;
    onDayClick: (day: number) => void;
    isAuthenticated: boolean;
}

// Icon positions in the sprite (5x5 grid)
// Row 0: tree, orange, gift, candy-cane, star
// Row 1: ornament, holly, stocking, santa, snowflake
// Row 2: candle, pudding, star-green, letter, mitten
// Row 3: hat, ornament-green, sled, reindeer, bell
// Row 4: branch, candy, calendar-25, snow-globe, coffee

const ICON_POSITIONS = [
    { row: 0, col: 0 }, // 1: tree
    { row: 0, col: 1 }, // 2: orange
    { row: 0, col: 2 }, // 3: gift
    { row: 0, col: 3 }, // 4: candy-cane
    { row: 0, col: 4 }, // 5: star
    { row: 1, col: 0 }, // 6: ornament
    { row: 1, col: 1 }, // 7: holly
    { row: 1, col: 2 }, // 8: stocking
    { row: 1, col: 3 }, // 9: santa
    { row: 1, col: 4 }, // 10: snowflake
    { row: 2, col: 0 }, // 11: candle
    { row: 2, col: 1 }, // 12: pudding
    { row: 2, col: 2 }, // 13: star-green
    { row: 2, col: 3 }, // 14: letter
    { row: 2, col: 4 }, // 15: mitten
    { row: 3, col: 0 }, // 16: hat
    { row: 3, col: 1 }, // 17: ornament-green
    { row: 3, col: 2 }, // 18: sled
    { row: 3, col: 3 }, // 19: reindeer
    { row: 3, col: 4 }, // 20: bell
    { row: 4, col: 0 }, // 21: branch
    { row: 4, col: 1 }, // 22: candy
    { row: 4, col: 2 }, // 23: calendar-25
    { row: 4, col: 3 }, // 24: snow-globe
];

export function CalendarDay({ day, entry, onDayClick, isAuthenticated }: CalendarDayProps) {

    //const isFuture = targetDate > today;
    const isFuture = false; // TODO: Remove this line for production

    // Get icon position for this day
    const iconPosition = useMemo(() => {
        if (!entry) return null;

        // Day 25 always gets the calendar icon (index 22)
        if (day === 25) {
            return ICON_POSITIONS[22]; // calendar-25
        }

        // For other days, use a deterministic random based on entry ID
        // This ensures the same entry always shows the same icon
        const seed = entry.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const iconIndex = seed % 24; // 0-23 (excluding calendar-25)
        return ICON_POSITIONS[iconIndex];
    }, [entry, day]);

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
        group relative aspect-[3/2] lg:aspect-[1/1] flex flex-col items-center justify-center overflow-visible
        transition-all duration-200 border-0 shadow-md
        ${entry ? '!bg-[hsl(39,100%,93%)]' : 'bg-background'}
        ${!entry && !isFuture ? 'hover:bg-[hsl(148,49%,29%)]' : 'hover:bg-gray-50'}
        ${!entry && !isFuture && isAuthenticated ? 'cursor-pointer hover:scale-105' : ''}
        ${isFuture ? 'opacity-80 cursor-not-allowed bg-gray-100' : ''}
        ${entry ? 'cursor-pointer hover:scale-105' : ''}
      `}
            onClick={handleClick}
        >
            {/* Christmas icon in top-right corner for entries */}
            {entry && iconPosition && (
                <div
                    className="absolute top-1 right-1 w-10 h-10 sm:w-12 sm:h-12 opacity-90 group-hover:opacity-100 transition-opacity z-0"
                    style={{
                        backgroundImage: 'url(/icons/christmas-icons.jpg)',
                        backgroundSize: '500% 500%',
                        backgroundPosition: `${iconPosition.col * 25}% ${iconPosition.row * 25}%`,
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}

            {!entry && (
                <div className={`text-2xl sm:text-3xl font-bold ${isFuture ? 'text-gray-400' : 'text-[#BA3627] group-hover:text-white'}`}>
                    {day}
                </div>
            )}

            {isFuture && (
                <div className="absolute bottom-2 flex flex-col items-center">
                    <Lock className="w-4 h-4 text-gray-400" />
                </div>
            )}


            {entry && (
                <>
                    {/* Compact view - always visible */}
                    <div className="absolute inset-0 p-2 flex flex-col text-left z-10">
                        <div className="text-xs font-bold text-white bg-[#BA3627] px-1.5 py-0.5 rounded self-start">
                            {day}
                        </div>

                        <div className="flex-1" />

                        <div className="w-full bg-[hsl(39,100%,93%)]/95 rounded-lg p-1.5 shadow-sm border border-[#BA3627]/10">
                            <div className="flex items-center gap-1.5 mb-1">
                                {entry.userPhotoURL && (
                                    <img
                                        src={entry.userPhotoURL}
                                        alt={entry.userName}
                                        className="w-6 h-6 rounded-full border border-[#BA3627]/20 flex-shrink-0"
                                    />
                                )}
                                <p className="text-[9px] sm:text-[10px] font-medium text-gray-600 truncate">
                                    {entry.userName}
                                </p>
                            </div>
                            <p className="text-[10px] sm:text-xs font-medium line-clamp-2 text-gray-800 leading-tight">
                                {entry.title}
                            </p>
                        </div>
                    </div>

                    {/* Tooltip - visible on hover, positioned above the card */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                        <div className="bg-white rounded-lg shadow-2xl border-2 border-[#BA3627]/20 p-3">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                <div className="text-xs font-bold text-white bg-[#BA3627] px-2 py-1 rounded">
                                    {day}日
                                </div>
                                {entry.userPhotoURL && (
                                    <img
                                        src={entry.userPhotoURL}
                                        alt={entry.userName}
                                        className="w-8 h-8 rounded-full border-2 border-[#BA3627]/30 flex-shrink-0"
                                    />
                                )}
                                <p className="text-sm font-semibold text-gray-800 truncate flex-1">
                                    {entry.userName}
                                </p>
                            </div>

                            <div className="max-h-32 overflow-y-auto">
                                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    {entry.title}
                                </p>
                                {entry.comment && (
                                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                        {entry.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Arrow pointing down to the card */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-[#BA3627]/20 rotate-45"></div>
                    </div>
                </>
            )}

            {!entry && !isFuture && isAuthenticated && (
                <div className="absolute bottom-2 text-[10px] text-[#BA3627]/60 font-medium group-hover:text-white">
                    登録可
                </div>
            )}
        </Card>
    );
}

