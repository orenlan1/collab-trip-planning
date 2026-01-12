import { useTripStore } from "@/stores/tripStore";
import { useTripSocket } from "@/context/TripSocketContext";
import { useAuth } from "@/context/AuthContext";

export function ChatHeader() {
  const tripTitle = useTripStore(state => state.title);
  const members = useTripStore(state => state.members);
  const { connectedUserIds } = useTripSocket();
  const { user } = useAuth();

  const connectedUsers = members
    .filter(member => 
      connectedUserIds.has(member.userId) && 
      member.userId !== user?.id
    )
    .map(member => member.user.name);

  const connectedUsersText = connectedUsers.length > 0
    ? 'connected: ' + connectedUsers.join(', ')
    : 'No one else online';

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="flex items-center">
        <div>
          <h3 className="font-semibold text-gray-900">
            {tripTitle || 'Trip Chat'}
          </h3>
          <p className="text-sm text-gray-500">
            {connectedUsersText}
          </p>
        </div>
      </div>
    </div>
  );
}