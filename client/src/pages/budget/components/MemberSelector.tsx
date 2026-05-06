import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { TripMember } from '@/types/tripMember';
import { getCurrencySymbol } from '@/lib/currency';

interface MemberSelectorProps {
  members: TripMember[];
  selectedMemberIds: string[];
  totalCost: number;
  currency?: string;
  splitMode: 'equal' | 'custom';
  customSplitAmounts: Record<string, string>;
  onSelectionChange: (ids: string[]) => void;
  onSplitModeChange: (mode: 'equal' | 'custom') => void;
  onCustomAmountsChange: (amounts: Record<string, string>) => void;
}

export function MemberSelector({
  members,
  selectedMemberIds,
  totalCost,
  currency,
  splitMode,
  customSplitAmounts = {},
  onSelectionChange,
  onSplitModeChange,
  onCustomAmountsChange,
}: MemberSelectorProps) {
  const currencySymbol = currency ? getCurrencySymbol(currency) : '$';

  const handleToggleMember = (memberId: string): void => {
    if (selectedMemberIds.includes(memberId)) {
      const newSelection = selectedMemberIds.filter(id => id !== memberId);
      if (newSelection.length > 0) {
        onSelectionChange(newSelection);
        if (splitMode === 'custom') {
          const updated = { ...customSplitAmounts };
          delete updated[memberId];
          onCustomAmountsChange(updated);
        }
      }
    } else {
      onSelectionChange([...selectedMemberIds, memberId]);
    }
  };

  const handleSelectAll = (): void => {
    if (selectedMemberIds.length === members.length) {
      const keepId = members[0]?.id || members[0]?.userId || '';
      onSelectionChange([keepId]);
      if (splitMode === 'custom') {
        const updated: Record<string, string> = {};
        if (keepId) updated[keepId] = customSplitAmounts[keepId] ?? '';
        onCustomAmountsChange(updated);
      }
    } else {
      onSelectionChange(members.map(m => m.id || m.userId));
    }
  };

  const handleSwitchMode = (mode: 'equal' | 'custom'): void => {
    if (mode === 'custom' && splitMode === 'equal') {
      // Pre-fill equal amounts so user has a starting point
      const equalShare = selectedMemberIds.length > 0
        ? (totalCost / selectedMemberIds.length).toFixed(2)
        : '0.00';
      const prefilled: Record<string, string> = {};
      for (const id of selectedMemberIds) {
        prefilled[id] = equalShare;
      }
      onCustomAmountsChange(prefilled);
    }
    onSplitModeChange(mode);
  };

  const handleAmountChange = (memberId: string, value: string): void => {
    onCustomAmountsChange({ ...customSplitAmounts, [memberId]: value });
  };

  const sharePerPerson = selectedMemberIds.length > 0
    ? (totalCost / selectedMemberIds.length).toFixed(2)
    : '0.00';

  const allSelected = selectedMemberIds.length === members.length;

  const customTotal = selectedMemberIds.reduce((sum, id) => {
    return sum + (parseFloat(customSplitAmounts[id] || '0') || 0);
  }, 0);
  const remaining = totalCost - customTotal;
  const isCustomValid = Math.abs(remaining) < 0.01;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Split expense among</Label>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Split mode toggle */}
      <div className="flex rounded-md border border-input overflow-hidden w-fit text-xs">
        <button
          type="button"
          onClick={() => handleSwitchMode('equal')}
          className={`px-3 py-1 transition-colors ${
            splitMode === 'equal'
              ? 'bg-blue-600 text-white'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Equal
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('custom')}
          className={`px-3 py-1 transition-colors ${
            splitMode === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Custom
        </button>
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
        {members.map((member) => {
          const memberId = member.id || member.userId;
          const isSelected = selectedMemberIds.includes(memberId);

          return (
            <label
              key={memberId}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleMember(memberId)}
                className="w-4 h-4 shrink-0"
                disabled={selectedMemberIds.length === 1 && isSelected}
              />
              <Avatar
                className="h-6 w-6 shrink-0"
                src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || member.user.email)}`}
                alt={member.user.name || ''}
                fallback={member.user.name?.charAt(0).toUpperCase() || 'U'}
              />
              <span className="flex-1 text-xs font-medium truncate">
                {member.user.name || member.user.email}
              </span>
              {isSelected && splitMode === 'equal' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                  {currencySymbol}{sharePerPerson}
                </span>
              )}
              {isSelected && splitMode === 'custom' && (
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.preventDefault()}>
                  <span className="text-xs text-gray-500">{currencySymbol}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customSplitAmounts[memberId] ?? ''}
                    onChange={e => handleAmountChange(memberId, e.target.value)}
                    className="h-6 w-20 text-xs px-1"
                    placeholder="0.00"
                  />
                </div>
              )}
            </label>
          );
        })}
      </div>

      {selectedMemberIds.length > 0 && splitMode === 'equal' && (
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-2">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{selectedMemberIds.length}</span>{' '}
            {selectedMemberIds.length === 1 ? 'person' : 'people'} selected
            {' · '}
            <span className="font-semibold">{currencySymbol}{sharePerPerson}</span> per person
          </p>
        </div>
      )}

      {selectedMemberIds.length > 0 && splitMode === 'custom' && (
        <div className={`rounded-md p-2 ${isCustomValid ? 'bg-green-50 dark:bg-green-950' : 'bg-amber-50 dark:bg-amber-950'}`}>
          <p className={`text-xs ${isCustomValid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {isCustomValid
              ? `Amounts sum to ${currencySymbol}${totalCost.toFixed(2)}`
              : remaining > 0
                ? `${currencySymbol}${remaining.toFixed(2)} left to assign`
                : `${currencySymbol}${Math.abs(remaining).toFixed(2)} over total`}
          </p>
        </div>
      )}
    </div>
  );
}
