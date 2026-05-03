import { X, MapPin, Clock, Plane, Footprints, Utensils, Star, Navigation, ExternalLink } from 'lucide-react';
import type { DraftDay, DraftActivity } from '@/types/draft';

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
                {/* Thumbnail — compact fixed-width column */}
                {activity.imageUrl && (
                    <div className="relative w-28 shrink-0 self-stretch min-h-[120px]">
                        <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.parentElement!.style.display = 'none';
                            }}
                        />
                        {/* Time slot badge over image */}
                        <span className={`absolute bottom-2 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TIME_SLOT_COLORS[activity.timeSlot]}`}>
                            {TIME_SLOT_LABELS[activity.timeSlot]}
                        </span>
                    </div>
                )}

                {/* Content — pr-7 reserves space so the absolute remove button never overlaps */}
                <div className="flex-1 p-3 pr-7 min-w-0">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-muted-foreground shrink-0">{TYPE_ICONS[activity.type]}</span>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">{activity.name}</h4>
                        </div>
                        {/* Time badge when no image */}
                        {!activity.imageUrl && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${TIME_SLOT_COLORS[activity.timeSlot]}`}>
                                {TIME_SLOT_LABELS[activity.timeSlot]}
                            </span>
                        )}
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

    return (
        <div className="flex flex-col gap-3 p-3">
            {/* Day theme header */}
            {draftDay.theme && (
                <div className="px-1 pb-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Today&apos;s Theme</p>
                    <h3 className="text-base font-semibold text-foreground mt-0.5">{draftDay.theme}</h3>
                </div>
            )}

            {/* Activity cards */}
            <div className="flex flex-col gap-2.5">
                {draftDay.activities.map((activity, index) => (
                    <ActivityCard
                        key={`${draftDay.tripDayId}-${index}`}
                        activity={activity}
                        index={index}
                        tripDayId={draftDay.tripDayId}
                        onRemove={onRemoveActivity}
                    />
                ))}

                {isLoading && (
                    <>
                        <ActivitySkeleton />
                        <ActivitySkeleton />
                    </>
                )}
            </div>

            {!isLoading && visibleActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    All activities removed for this day.
                </p>
            )}
        </div>
    );
}
