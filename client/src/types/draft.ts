export interface UserPreferences {
    pace:               'relaxed' | 'moderate' | 'packed';
    interests:          string[];
    budgetTier:         'budget' | 'mid-range' | 'luxury';
    groupType:          'solo' | 'couple' | 'family' | 'friends';
    exclusions:         string[];
    dayTripWillingness: 'yes' | 'no' | 'maybe';
}

export interface ActivitySuggestion {
    name: string;
    url?: string;
}

export interface DraftActivity {
    name:          string;
    description:   string;
    timeSlot:      'morning' | 'afternoon' | 'evening';
    type:          'attraction' | 'food' | 'experience' | 'neighborhood_walk' | 'day_trip' | 'event';
    address:       string | null;
    lat:           number | null;
    lon:           number | null;
    imageUrl:      string | null;
    removed:       boolean;
    searchQuery:   string;
    startingPoint: string | null;
    suggestions:   ActivitySuggestion[];
}

export interface ExistingActivity {
    name:     string;
    timeSlot: 'morning' | 'afternoon' | 'evening' | null;
    address:  string | null;
    image:    string | null;
}

export interface DraftDay {
    tripDayId:          string;
    date:               string;
    theme:              string;
    activities:         DraftActivity[];
    existingActivities: ExistingActivity[];
}

export interface DraftData {
    days: DraftDay[];
}
