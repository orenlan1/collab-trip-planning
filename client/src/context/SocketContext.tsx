import { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<{ socket: Socket | null; isReady: boolean }>({
  socket: null,
  isReady: false
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    if (user) {
      const newSocket = io('http://localhost:3000', {
        withCredentials: true      
      });

      // Handle connection events
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setSocket(newSocket);
        setIsReady(true);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      

      // Cleanup on unmount or when user logs out
      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); // Re-run when user changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, isReady }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider and user must be authenticated');
  }
  return socket;
}; 

export default SocketContext;