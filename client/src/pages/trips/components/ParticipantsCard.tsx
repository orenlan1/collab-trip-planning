import { useState } from "react";
import { TripMemberItem } from "./TripMemberItem";
import { FiUsers } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";
import { InviteModal } from "./InviteModal";
import { useTripStore } from "@/stores/tripStore";

interface ParticipantCardProps {
    tripId: string;
}


export function ParticipantsCard({ tripId }: ParticipantCardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const members = useTripStore(state => state.members);

  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 dark:bg-slate-800 shadow-sm">
        <div className="flex px-4 gap-3 items-center">
            <FiUsers className="text-xl text-indigo-500" />
            <h1 className="font-semibold text-xl">Participants</h1>
        </div>
        <div className="flex flex-col">
            <ul>
              {members.map(member => (
                <li key={member.userId} className="flex items-center gap-4 p-4 ">
                  <TripMemberItem member={member} />
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