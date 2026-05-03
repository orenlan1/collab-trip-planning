import { create } from 'zustand';
import type { DraftData, DraftDay } from '@/types/draft';

interface DraftStore {
    draft: DraftData | null;
    isGenerating: boolean;
    generatingDayNumber: number | null;
    error: string | null;

    setDraft: (draft: DraftData) => void;
    appendDay: (day: DraftDay) => void;
    setGenerating: (generating: boolean, dayNumber?: number) => void;
    setError: (error: string | null) => void;
    clearDraft: () => void;

    // Optimistic remove before server confirms
    removeActivity: (tripDayId: string, activityIndex: number) => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
    draft: null,
    isGenerating: false,
    generatingDayNumber: null,
    error: null,

    setDraft: (draft) => set({ draft, isGenerating: false, generatingDayNumber: null }),

    appendDay: (day) =>
        set((state) => {
            if (!state.draft) {
                return { draft: { days: [day] }, generatingDayNumber: 2 };
            }
            const exists = state.draft.days.some(d => d.tripDayId === day.tripDayId);
            const days = exists
                ? state.draft.days.map(d => d.tripDayId === day.tripDayId ? day : d)
                : [...state.draft.days, day];
            return { draft: { days }, generatingDayNumber: days.length + 1 };
        }),

    setGenerating: (isGenerating, dayNumber) =>
        set({ isGenerating, generatingDayNumber: dayNumber ?? null }),

    setError: (error) => set({ error, isGenerating: false }),

    clearDraft: () => set({ draft: null, isGenerating: false, generatingDayNumber: null, error: null }),

    removeActivity: (tripDayId, activityIndex) =>
        set((state) => {
            if (!state.draft) return state;
            const days = state.draft.days.map(day => {
                if (day.tripDayId !== tripDayId) return day;
                const activities = day.activities.map((a, i) =>
                    i === activityIndex ? { ...a, removed: true } : a
                );
                return { ...day, activities };
            });
            return { draft: { days } };
        }),
}));
