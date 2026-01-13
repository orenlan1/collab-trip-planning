import { set } from "date-fns";
import { useEffect, useState } from "react";
import { useSocket } from "../../../context/SocketContext"; 
import { Notifications } from "../../Notifications";

export function NotificationBell() {
  const [count, setCount] = useState<number>(0);
  const { socket, isReady } = useSocket();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    
    if (!socket || !isReady) return;

    // Listen for new trips invitations
    socket.on('invite:created', (invitation) => {
      console.log('Received invitation:', invitation);
      setCount((prevCount) => prevCount + 1);
      // Handle the invitation (e.g., show notification)
    });

    return () => {
      console.log('Cleaning up socket listener');
      socket.off('invite:created');
    };


  }, [socket]);

 

  return (
    <button
      onClick={() => setIsOpen((prev) => !prev)}
      aria-label="Notifications"
      className="relative p-2 rounded-md hover:bg-neutral-300/60  dark:hover:bg-neutral-800/60 outline-none focus:ring-2 focus:ring-indigo-500 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-slate-700 dark:text-slate-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-cyan-600 text-white">
          {count}
        </span>
      )}
      {isOpen && <Notifications />}
    </button>
  );
}
