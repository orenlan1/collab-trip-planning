import { useState } from "react";
import { TripMember } from "./TripMember";
import { FiUsers } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";
import { InviteModal } from "./InviteModal";

interface ParticipantCardProps {
    tripId: string;
    members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
    };
  }>;
}


export function ParticipantsCard({ members, tripId }: ParticipantCardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 shadow-sm">
        <div className="flex px-4 gap-3 items-center">
            <FiUsers className="text-xl text-indigo-500" />
            <h1 className="font-semibold text-xl">Participants</h1>
        </div>
        <div className="flex flex-col">
            <ul>
              {members.map(member => (
                <li key={member.userId} className="flex items-center gap-4 p-4 ">
                  <TripMember member={member} />
                </li>
              ))}
            </ul>
        </div>

        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center bg-indigo-500 hover:bg-indigo-600 transition ml-4 rounded-2xl gap-2 px-4 py-2 text-sm font-semibold text-white"
        >
            <FiUserPlus className="text-lg" />
            Add Participant
        </button>

        <InviteModal 
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          tripId={tripId}
        />
    </div>
  );
}