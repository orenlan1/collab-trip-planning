import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import type { TripMember } from '@/types/tripMember';
import { getCurrencySymbol } from '@/lib/currency';

interface MemberSelectorProps {
  members: TripMember[];
  selectedMemberIds: string[];
  totalCost: number;
  currency?: string;
  onSelectionChange: (ids: string[]) => void;
}

export function MemberSelector({ 
  members, 
  selectedMemberIds, 
  totalCost,
  currency,
  onSelectionChange 
}: MemberSelectorProps) {
  const currencySymbol = currency ? getCurrencySymbol(currency) : '$';
  const handleToggleMember = (memberId: string): void => {
    if (selectedMemberIds.includes(memberId)) {
      const newSelection = selectedMemberIds.filter(id => id !== memberId);
      if (newSelection.length > 0) {
        onSelectionChange(newSelection);
      }
    } else {
      onSelectionChange([...selectedMemberIds, memberId]);
    }
  };

  const handleSelectAll = (): void => {
    if (selectedMemberIds.length === members.length) {
      onSelectionChange([members[0]?.id || members[0]?.userId || '']);
    } else {
      onSelectionChange(members.map(m => m.id || m.userId));
    }
  };

  const sharePerPerson = selectedMemberIds.length > 0 
    ? (totalCost / selectedMemberIds.length).toFixed(2)
    : '0.00';

  const allSelected = selectedMemberIds.length === members.length;

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

      <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
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
                className="w-4 h-4"
                disabled={selectedMemberIds.length === 1 && isSelected}
              />
              <Avatar 
                className="h-6 w-6"
                src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || member.user.email)}`}
                alt={member.user.name || ''}
                fallback={member.user.name?.charAt(0).toUpperCase() || 'U'}
              />
              <span className="flex-1 text-xs font-medium">
                {member.user.name || member.user.email}
              </span>
              {isSelected && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currencySymbol}{sharePerPerson}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {selectedMemberIds.length > 0 && (
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-2">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{selectedMemberIds.length}</span> {selectedMemberIds.length === 1 ? 'person' : 'people'} selected
            {' · '}
            <span className="font-semibold">{currencySymbol}{sharePerPerson}</span> per person
          </p>
        </div>
      )}
    </div>
  );
}
