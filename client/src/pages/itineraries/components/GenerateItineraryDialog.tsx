import { useState } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import type { UserPreferences } from '@/types/draft';

interface GenerateItineraryDialogProps {
    onClose: () => void;
    onGenerate: (preferences: UserPreferences) => void;
    isGenerating: boolean;
    hasExistingActivities: boolean;
}

const INTERESTS = [
    { id: 'history',   label: 'History' },
    { id: 'food',      label: 'Food & Drink' },
    { id: 'outdoors',  label: 'Outdoors' },
    { id: 'nightlife', label: 'Nightlife' },
    { id: 'shopping',  label: 'Shopping' },
    { id: 'art',       label: 'Art & Culture' },
    { id: 'sports',    label: 'Sports' },
];

const EXCLUSION_TAGS = [
    { id: 'churches',  label: 'No churches / cathedrals' },
    { id: 'museums',   label: 'No museums' },
    { id: 'shopping',  label: 'No shopping malls' },
    { id: 'nightlife', label: 'No nightlife / bars' },
    { id: 'outdoors',  label: 'No outdoor / nature' },
    { id: 'sports',    label: 'No sports venues' },
];

const TOTAL_STEPS = 4;

export function GenerateItineraryDialog({
    onClose,
    onGenerate,
    isGenerating,
    hasExistingActivities,
}: GenerateItineraryDialogProps) {
    const [step, setStep] = useState(1);
    const [groupType,          setGroupType]          = useState<UserPreferences['groupType']>('friends');
    const [pace,               setPace]               = useState<UserPreferences['pace']>('moderate');
    const [interests,          setInterests]          = useState<string[]>(['history', 'food']);
    const [budgetTier,         setBudgetTier]         = useState<UserPreferences['budgetTier']>('mid-range');
    const [exclusions,         setExclusions]         = useState<string[]>([]);
    const [dayTripWillingness, setDayTripWillingness] = useState<UserPreferences['dayTripWillingness']>('maybe');

    const toggleInterest = (id: string) =>
        setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const toggleExclusion = (id: string) =>
        setExclusions(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);

    const handleGenerate = () => {
        if (interests.length === 0) return;
        onGenerate({ pace, interests, budgetTier, groupType, exclusions, dayTripWillingness });
    };

    const canAdvance = step !== 2 || interests.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border/60">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-primary" size={20} />
                        <h2 className="text-lg font-semibold text-foreground">Generate Itinerary</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 px-6 pt-5">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                s <= step ? 'bg-primary' : 'bg-border'
                            }`}
                        />
                    ))}
                </div>

                {/* Step content */}
                <div className="p-6 min-h-[240px]">

                    {/* Step 1: Group type */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-4">Who are you traveling with?</h3>
                            <div className="flex flex-col gap-2">
                                {([
                                    { value: 'solo',    label: 'Solo',             desc: 'Independent exploration at your own pace' },
                                    { value: 'couple',  label: 'Couple',           desc: 'Romantic spots and shared experiences' },
                                    { value: 'family',  label: 'Family with kids', desc: 'Kid-friendly, balanced, outdoor-focused' },
                                    { value: 'friends', label: 'Group of friends', desc: 'Social energy, nightlife, shared adventures' },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setGroupType(opt.value)}
                                        className={`text-left p-3 rounded-lg border transition-all ${
                                            groupType === opt.value
                                                ? 'border-primary bg-primary/8 text-foreground'
                                                : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span className="font-medium block">{opt.label}</span>
                                        <span className="text-xs mt-0.5 block opacity-75">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pace + interests */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-3">Trip pace</h3>
                                <div className="flex gap-2">
                                    {([
                                        { value: 'relaxed',  label: 'Relaxed',  desc: '2 activities / day' },
                                        { value: 'moderate', label: 'Moderate', desc: '3 activities / day' },
                                        { value: 'packed',   label: 'Packed',   desc: '4 activities / day' },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setPace(opt.value)}
                                            className={`flex-1 text-center p-2.5 rounded-lg border text-sm transition-all ${
                                                pace === opt.value
                                                    ? 'border-primary bg-primary/8 text-foreground'
                                                    : 'border-border hover:border-primary/50 text-muted-foreground'
                                            }`}
                                        >
                                            <span className="font-medium block">{opt.label}</span>
                                            <span className="text-xs opacity-70 block mt-0.5">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map(interest => (
                                        <button
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                interests.includes(interest.id)
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                            }`}
                                        >
                                            {interest.label}
                                        </button>
                                    ))}
                                </div>
                                {interests.length === 0 && (
                                    <p className="text-xs text-destructive mt-2">Select at least one interest</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Budget + exclusions */}
                    {step === 3 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-3">Budget</h3>
                                <div className="flex flex-col gap-2">
                                    {([
                                        { value: 'budget',    label: 'Budget',    desc: 'Free & affordable options' },
                                        { value: 'mid-range', label: 'Mid-range', desc: 'Mix of free and paid experiences' },
                                        { value: 'luxury',    label: 'Luxury',    desc: 'Premium venues and experiences' },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setBudgetTier(opt.value)}
                                            className={`text-left p-3 rounded-lg border transition-all ${
                                                budgetTier === opt.value
                                                    ? 'border-primary bg-primary/8 text-foreground'
                                                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <span className="font-medium block">{opt.label}</span>
                                            <span className="text-xs mt-0.5 block opacity-75">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-1">Anything to exclude?</h3>
                                <p className="text-xs text-muted-foreground mb-2">Optional — AI will avoid these entirely</p>
                                <div className="flex flex-wrap gap-2">
                                    {EXCLUSION_TAGS.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleExclusion(tag.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                exclusions.includes(tag.id)
                                                    ? 'bg-destructive/10 text-destructive border-destructive/40'
                                                    : 'border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive/80'
                                            }`}
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Day trips */}
                    {step === 4 && (
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-1">Open to day trips?</h3>
                            <p className="text-xs text-muted-foreground mb-4">AI may suggest leaving the city for a day to visit a nearby gem</p>
                            <div className="flex flex-col gap-2">
                                {([
                                    { value: 'yes',   label: 'Yes, absolutely',    desc: 'Include a day trip if there is somewhere great nearby' },
                                    { value: 'maybe', label: 'Only if it\'s iconic', desc: 'Only suggest it if it\'s truly unmissable' },
                                    { value: 'no',    label: 'No, stay in the city', desc: 'Keep all activities in the destination city' },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDayTripWillingness(opt.value)}
                                        className={`text-left p-3 rounded-lg border transition-all ${
                                            dayTripWillingness === opt.value
                                                ? 'border-primary bg-primary/8 text-foreground'
                                                : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span className="font-medium block">{opt.label}</span>
                                        <span className="text-xs mt-0.5 block opacity-75">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                            {hasExistingActivities && (
                                <p className="text-xs text-muted-foreground mt-4 bg-secondary/50 rounded-lg p-3">
                                    AI will consider your existing activities and won&apos;t suggest duplicates.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border/60">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>
                    ) : (
                        <span />
                    )}

                    {step < TOTAL_STEPS ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canAdvance}
                            className="flex items-center gap-1.5 bg-linear-to-r from-primary to-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || interests.length === 0}
                            className="flex items-center gap-1.5 bg-linear-to-r from-primary to-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <Sparkles size={15} />
                            {isGenerating ? 'Generating…' : 'Generate'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
