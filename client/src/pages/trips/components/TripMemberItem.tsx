import type { TripMember } from "@/types/tripMember";
// Local interface declaration (not from types folder)
interface TripMemberProps {
  member: TripMember;
  isOnline?: boolean;
}

export const TripMemberItem = ({ member, isOnline = false }: TripMemberProps) => {
  return (
    
      <div className="flex gap-3 items-center">
          <div className="relative">
            <img src={member.user.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.user.name || member.user.email)}
              alt="avatar" className="w-10 h-10 ring-1 ring-white rounded-full"/>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{member.user.name}</div>
            <div className="text-xs text-slate-500">{member.role}</div>
          </div>

      </div>
    
  );
};
