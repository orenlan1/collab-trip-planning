import { useState, useCallback } from "react";

export function useActivityAnimation() {
    const [animatedActivityIds, setAnimatedActivityIds] = useState<Set<string>>(new Set());

    const animateActivity = useCallback((activityId: string) => {
        setAnimatedActivityIds(prev => new Set(prev).add(activityId));
        setTimeout(() => {
            setAnimatedActivityIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(activityId);
                return newSet;
            });
        }, 1000);
    }, []);

    return { animatedActivityIds, animateActivity };
}
