import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Entry } from '@/types';
import { CalendarDay } from './CalendarDay.tsx';
import { EntryDialog } from './EntryDialog.tsx';
import { useAuth } from '@/contexts/AuthContext';

const CURRENT_YEAR = 2025;

export function CalendarGrid() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<Map<number, Entry>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const q = query(
                collection(db, 'entries'),
                where('year', '==', CURRENT_YEAR)
            );
            const querySnapshot = await getDocs(q);
            const entriesMap = new Map<number, Entry>();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const entry: Entry = {
                    id: doc.id,
                    userId: data.userId,
                    userName: data.userName,
                    userPhotoURL: data.userPhotoURL,
                    day: data.day,
                    year: data.year,
                    title: data.title,
                    url: data.url,
                    comment: data.comment,
                    createdAt: (data.createdAt as Timestamp).toDate(),
                };
                entriesMap.set(entry.day, entry);
            });

            setEntries(entriesMap);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDayClick = (day: number) => {
        if (!user) return;
        setSelectedDay(day);
    };

    const handleEntryCreated = () => {
        setSelectedDay(null);
        loadEntries();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading calendar...</p>
            </div>
        );
    }

    const days = Array.from({ length: 25 }, (_, i) => i + 1);

    // December 1, 2025 is a Monday (day of week = 1)
    // Sunday = 0, Monday = 1, ..., Saturday = 6
    const firstDayOfMonth = new Date(2025, 11, 1).getDay(); // 11 = December (0-indexed)
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="relative max-w-6xl mx-auto mt-4 mb-12 px-4">
            {/* Hanging hole decoration */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#BA3627] rounded-full flex items-center justify-center z-0">
                <div className="w-6 h-6 bg-[#FDF6E3] rounded-full shadow-inner bg-background" />
            </div>

            {/* Main board */}
            <div className="relative bg-[#BA3627] p-6 sm:p-8 rounded-3xl shadow-xl z-10">
                {/* Week day headers - only show on large screens (7 columns) */}
                <div className="hidden lg:grid grid-cols-7 gap-3 sm:gap-4 mb-3">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                        <div key={index} className="text-center text-white font-bold text-sm py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                    {/* Empty cells for days before the 1st - only show on large screens */}
                    {emptyDays.map((i) => (
                        <div key={`empty-${i}`} className="hidden lg:block aspect-[1/1]" />
                    ))}

                    {days.map((day) => (
                        <CalendarDay
                            key={day}
                            day={day}
                            entry={entries.get(day)}
                            onDayClick={handleDayClick}
                            isAuthenticated={!!user}
                        />
                    ))}
                </div>
            </div>

            {selectedDay && (
                <EntryDialog
                    day={selectedDay}
                    year={CURRENT_YEAR}
                    existingEntry={entries.get(selectedDay)}
                    onClose={() => setSelectedDay(null)}
                    onSuccess={handleEntryCreated}
                />
            )}
        </div>
    );
}
