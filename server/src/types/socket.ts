import type { Socket, Server } from 'socket.io';

// Define your custom events here
interface ServerToClientEvents {
  "invite:created": (invitation: { tripId: string; inviterId: string }) => void;
}

interface ClientToServerEvents {
  // No client-to-server events needed for invitations
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
