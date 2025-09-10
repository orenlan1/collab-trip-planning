import { useState, useEffect, useCallback, useRef } from 'react';

export type AutoSaveState = 'idle' | 'saving' | 'saved';

interface UseAutoSaveTextOptions {
  /** Function to save the data - should return a promise */
  saveFunction: (value: string) => Promise<void>;
  /** Debounce delay in milliseconds before saving starts (default: 1000ms) */
  debounceMs?: number;
  /** How long to show "saved" state before returning to idle (default: 1000ms) */
  savedDisplayMs?: number;
  /** How long to show "saving" state minimum (default: 500ms) */
  minSavingMs?: number;
  /** Initial value */
  initialValue: string;
}

export function useAutoSaveInput({
  saveFunction,
  debounceMs = 1000,
  savedDisplayMs = 1000,
  minSavingMs = 500,
  initialValue
}: UseAutoSaveTextOptions) {
  const [value, setValue] = useState<string>(initialValue);
  const [saveState, setSaveState] = useState<AutoSaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs to track timeouts and prevent stale closures
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savingStartTimeRef = useRef<number | undefined>(undefined);
  const isMountedRef = useRef(true);
  const lastSavedValueRef = useRef<string>(initialValue);

  // Cleanup timeouts on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  // Update local value when initialValue changes (e.g., from store)
  useEffect(() => {
    setValue(initialValue);
    lastSavedValueRef.current = initialValue;
  }, [initialValue]);

  const performSave = useCallback(async (valueToSave: string) => {
    if (!isMountedRef.current) return;

    try {
      // Record when saving started
      savingStartTimeRef.current = Date.now();
      setSaveState('saving');
      setError(null);

      // Perform the actual save
      await saveFunction(valueToSave);
      
      if (!isMountedRef.current) return;

      // Calculate how long saving took
      const savingDuration = Date.now() - savingStartTimeRef.current;
      const remainingTime = Math.max(0, minSavingMs - savingDuration);

      // Show "saving" for at least minSavingMs
      setTimeout(() => {
        if (!isMountedRef.current) return;
        
        setSaveState('saved');
        lastSavedValueRef.current = valueToSave;

        // Show "saved" state for the specified duration
        savedTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setSaveState('idle');
        }, savedDisplayMs);
      }, remainingTime);

    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('Auto-save failed:', err);
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaveState('idle');
    }
  }, [saveFunction, minSavingMs, savedDisplayMs]);

  const debouncedSave = useCallback((newValue: string) => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear any existing "saved" timeout since we're about to save again
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    // Trim values for comparison to avoid saving just whitespace changes
    const trimmedNewValue = newValue.trim();
    const trimmedLastSaved = lastSavedValueRef.current.trim();

    // Only save if the trimmed value has actually changed
    if (trimmedNewValue === trimmedLastSaved) {
      return;
    }

    // Set up new debounce timeout - save the original value (with spaces)
    debounceTimeoutRef.current = setTimeout(() => {
      performSave(newValue);
    }, debounceMs);
  }, [performSave, debounceMs]);

  // Handle value updates
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
    
    // Reset to idle if we're currently showing "saved"
    if (saveState === 'saved') {
      setSaveState('idle');
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    }
    
    // Reset error state when user starts typing again
    if (error) {
      setError(null);
    }

    debouncedSave(newValue);
  }, [debouncedSave, saveState, error]);

  // Manual save function (bypasses debounce)
  const saveNow = useCallback(async () => {
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    await performSave(value);
  }, [performSave, value]);

  return {
    value,
    updateValue,
    saveState,
    error,
    saveNow,
    /** Whether there are unsaved changes */
    hasUnsavedChanges: value.trim() !== lastSavedValueRef.current.trim()
  };
}
