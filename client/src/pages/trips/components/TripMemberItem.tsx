import type { TripMember } from "@/types/tripMember";
// Local interface declaration (not from types folder)
interface TripMemberProps {
  member: TripMember;

}

export const TripMemberItem = ({ member }: TripMemberProps) => {
  return (
    
      <div className="flex gap-3 items-center">
          <img src={member.user.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.user.name || member.user.email)}
            alt="avatar" className="w-10 h-10 ring-1 ring-white rounded-full"/>
            <div className="flex-1">
              <div className="text-sm font-semibold">{member.user.name}</div>
              <div className="text-xs text-slate-500">{member.role}</div>
            </div>

      </div>
    
  );
};
