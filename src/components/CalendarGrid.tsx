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

    return (
        <div className="relative max-w-3xl mx-auto mt-12 mb-12">
            {/* Hanging hole decoration */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#BA3627] rounded-full flex items-center justify-center z-0">
                <div className="w-6 h-6 bg-[#FDF6E3] rounded-full shadow-inner bg-background" />
            </div>

            {/* Main board */}
            <div className="relative bg-[#BA3627] p-6 sm:p-8 rounded-3xl shadow-xl z-10">
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
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
