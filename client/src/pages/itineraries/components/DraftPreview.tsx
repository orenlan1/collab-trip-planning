import { X, MapPin, Clock, Plane, Footprints, Utensils, Star, Navigation, ExternalLink, Lock } from 'lucide-react';
import type { DraftDay, DraftActivity, ExistingActivity } from '@/types/draft';

interface DraftPreviewProps {
    draftDay: DraftDay;
    isLoading: boolean;
    onRemoveActivity: (tripDayId: string, activityIndex: number) => void;
}

const TIME_SLOT_LABELS: Record<DraftActivity['timeSlot'], string> = {
    morning:   'Morning',
    afternoon: 'Afternoon',
    evening:   'Evening',
};

const TIME_SLOT_COLORS: Record<DraftActivity['timeSlot'], string> = {
    morning:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    afternoon: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    evening:   'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const TYPE_ICONS: Record<DraftActivity['type'], React.ReactNode> = {
    attraction:        <Star size={13} />,
    food:              <Utensils size={13} />,
    experience:        <Star size={13} />,
    neighborhood_walk: <Footprints size={13} />,
    day_trip:          <Plane size={13} />,
    event:             <Clock size={13} />,
};

const TIME_SLOT_ORDER: Record<string, number> = {
    morning: 0, afternoon: 1, evening: 2,
};

function LockedActivityCard({ activity }: { activity: ExistingActivity }) {
    const slotColor = activity.timeSlot ? TIME_SLOT_COLORS[activity.timeSlot] : 'bg-secondary text-muted-foreground';
    const slotLabel = activity.timeSlot ? TIME_SLOT_LABELS[activity.timeSlot] : 'No time set';

    return (
        <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden opacity-80">
            <div className="flex gap-0">
                {/* Thumbnail — always present; gradient with lock when no image */}
                <div className="relative w-28 shrink-0 self-stretch min-h-[90px]">
                    {activity.image ? (
                        <img
                            src={activity.image}
                            alt={activity.name}
                            className="absolute inset-0 w-full h-full object-cover grayscale-30"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-muted/60 to-muted flex items-center justify-center">
                            <Lock size={16} className="text-muted-foreground/30" />
                        </div>
                    )}
                    <span className={`absolute bottom-2 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${slotColor}`}>
                        {slotLabel}
                    </span>
                </div>
                <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Lock size={11} className="shrink-0 text-muted-foreground/60" />
                        <h4 className="text-sm font-semibold text-foreground leading-tight truncate">{activity.name}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">Already planned</p>
                    {activity.address && (
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground/60">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{activity.address}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden animate-pulse flex gap-3 p-3">
            <div className="w-24 h-24 shrink-0 rounded-lg bg-muted" />
            <div className="flex-1 flex flex-col gap-2 py-1">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
            </div>
        </div>
    );
}

function ActivityCard({
    activity,
    index,
    tripDayId,
    onRemove,
}: {
    activity: DraftActivity;
    index: number;
    tripDayId: string;
    onRemove: (tripDayId: string, index: number) => void;
}) {
    if (activity.removed) return null;

    return (
        <div className="group relative rounded-xl border border-border/50 bg-card hover:border-border transition-colors overflow-hidden">
            <div className="flex gap-0">
                {/* Thumbnail — always present; gradient when no image */}
                <div className="relative w-28 shrink-0 self-stretch min-h-[120px]">
                    {activity.imageUrl ? (
                        <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-violet-500/25 flex items-center justify-center">
                            <span className="text-primary/40">{TYPE_ICONS[activity.type]}</span>
                        </div>
                    )}
                    {/* Time slot badge */}
                    <span className={`absolute bottom-2 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TIME_SLOT_COLORS[activity.timeSlot]}`}>
                        {TIME_SLOT_LABELS[activity.timeSlot]}
                    </span>
                </div>

                {/* Content — pr-7 reserves space so the absolute remove button never overlaps */}
                <div className="flex-1 p-3 pr-7 min-w-0">
                    {/* Name row */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground shrink-0">{TYPE_ICONS[activity.type]}</span>
                        <h4 className="text-sm font-semibold text-foreground leading-tight">{activity.name}</h4>
                    </div>

                    {/* Description — full text, no clamp */}
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {activity.description}
                    </p>

                    {/* Address */}
                    {activity.address && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/70">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{activity.address}</span>
                        </div>
                    )}

                    {/* Starting point (for walks/nightlife/cruises) */}
                    {!activity.address && activity.startingPoint && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-primary/80">
                            <Navigation size={10} className="shrink-0" />
                            <span>{activity.startingPoint}</span>
                        </div>
                    )}

                    {/* Suggestions */}
                    {activity.suggestions && activity.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {activity.suggestions.map((s, i) =>
                                s.url ? (
                                    <a
                                        key={i}
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline bg-primary/6 px-2 py-0.5 rounded-full border border-primary/20"
                                    >
                                        {s.name}
                                        <ExternalLink size={9} />
                                    </a>
                                ) : (
                                    <span
                                        key={i}
                                        className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full"
                                    >
                                        {s.name}
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={() => onRemove(tripDayId, index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 border border-border/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:border-destructive/40 transition-all"
                title="Remove this activity"
            >
                <X size={12} />
            </button>
        </div>
    );
}

export function DraftPreview({ draftDay, isLoading, onRemoveActivity }: DraftPreviewProps) {
    const visibleActivities = draftDay.activities.filter(a => !a.removed);
    const existing = draftDay.existingActivities ?? [];

    // Merge existing (locked) and draft activities sorted by time slot for a coherent day view
    type MergedItem =
        | { kind: 'draft'; activity: DraftActivity; index: number }
        | { kind: 'existing'; activity: ExistingActivity };

    const merged: MergedItem[] = [
        ...draftDay.activities.map((activity, index) => ({ kind: 'draft' as const, activity, index })),
        ...existing.map(activity => ({ kind: 'existing' as const, activity })),
    ].sort((a, b) => {
        const slotA = TIME_SLOT_ORDER[a.activity.timeSlot ?? ''] ?? 3;
        const slotB = TIME_SLOT_ORDER[b.activity.timeSlot ?? ''] ?? 3;
        return slotA - slotB;
    });

    return (
        <div className="flex flex-col gap-3 p-3">
            {/* Day theme header */}
            {draftDay.theme && (
                <div className="px-1 pb-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Today&apos;s Theme</p>
                    <h3 className="text-base font-semibold text-foreground mt-0.5">{draftDay.theme}</h3>
                </div>
            )}

            {/* Activity cards — existing (locked) and AI-generated interleaved by time slot */}
            <div className="flex flex-col gap-2.5">
                {merged.map((item, i) =>
                    item.kind === 'existing' ? (
                        <LockedActivityCard key={`existing-${i}`} activity={item.activity} />
                    ) : (
                        <ActivityCard
                            key={`${draftDay.tripDayId}-${item.index}`}
                            activity={item.activity}
                            index={item.index}
                            tripDayId={draftDay.tripDayId}
                            onRemove={onRemoveActivity}
                        />
                    )
                )}

                {isLoading && (
                    <>
                        <ActivitySkeleton />
                        <ActivitySkeleton />
                    </>
                )}
            </div>

            {!isLoading && visibleActivities.length === 0 && existing.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    All activities removed for this day.
                </p>
            )}
        </div>
    );
}
