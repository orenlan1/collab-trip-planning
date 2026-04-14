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
    <div className="border-b border-border/60 bg-card px-6 py-4 flex items-center gap-3 shrink-0">
      <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-violet-500 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground leading-tight truncate">
          {tripTitle || 'Trip Chat'}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${connectedUsers.length > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          <p className="text-xs text-muted-foreground truncate">
            {connectedUsersText}
          </p>
        </div>
      </div>
    </div>
  );
}