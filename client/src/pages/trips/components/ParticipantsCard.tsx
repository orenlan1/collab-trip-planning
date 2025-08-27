import { TripMember } from "./TripMember";
import { FiUsers } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";

interface ParticipantCardProps {
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


export function ParticipantsCard({ members }: ParticipantCardProps) {
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
        {/* <div className="bg-indigo-200 border-1 rounded-2xl w-1/2 m-4 hover:bg-indigo-300 transition "> */}
            <button className="flex bg-indigo-500 hover:bg-indigo-600 transition ml-4 rounded-2xl gap-2 px-4 py-2 text-sm font-semibold text-white">
                <FiUserPlus className="text-lg" />
                Add Participant
            </button>
        {/* </div> */}

    </div>
  );
}