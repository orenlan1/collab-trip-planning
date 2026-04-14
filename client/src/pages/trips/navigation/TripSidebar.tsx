import { Link, useParams, useLocation } from "react-router-dom";
import { DollarSignIcon, Map, LayoutDashboard, MessageSquareIcon, Menu, X } from "lucide-react";
import { useTripSocket } from "@/context/TripChatSocketContext";
import { useState, useEffect } from "react";


function getActiveLink(pathname: string, tripId?: string) {
  if (!tripId) return "";
  if (pathname.includes(`/trips/${tripId}/overview`)) return "overview";
  if (pathname.includes(`/trips/${tripId}/itinerary`)) return "itinerary";
  if (pathname.includes(`/trips/${tripId}/budget`)) return "budget";
  if (pathname.includes(`/trips/${tripId}/chat`)) return "chat";
  return "";
}

export function TripSidebar() {
  const { tripId } = useParams();
  const location = useLocation();
  const activeLink = getActiveLink(location.pathname, tripId);
  const { unreadCount } = useTripSocket();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-22 left-4 z-[120] lg:hidden bg-card p-2 rounded-md shadow-lg border border-border/60 hover:bg-secondary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        w-64 bg-card/90 dark:bg-card backdrop-blur-sm
        min-h-[calc(100vh-64px)]
        border-r border-border/60
        shadow-[2px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.25)]
        transition-transform duration-300 ease-in-out
        z-[100]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <nav className="flex flex-col gap-1 p-4 sticky top-20">
        <Link
          to={`/trips/${tripId}/overview`}
          className={`flex items-center font-semibold py-2.5 px-4 rounded-lg transition-all duration-150
             ${activeLink === "overview"
               ? "bg-linear-to-r from-primary/15 to-violet-500/10 text-primary border-l-2 border-primary"
               : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5"}`}
        >
          <LayoutDashboard size={18} className="mr-2.5 shrink-0" />
          Overview
        </Link>
        <Link
          to={`/trips/${tripId}/itinerary`}
          className={`flex items-center font-semibold py-2.5 px-4 rounded-lg transition-all duration-150
             ${activeLink === "itinerary"
               ? "bg-linear-to-r from-primary/15 to-violet-500/10 text-primary border-l-2 border-primary"
               : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5"}`}
        >
          <Map size={18} className="mr-2.5 shrink-0" />
          Itinerary
        </Link>
        <Link
          to={`/trips/${tripId}/budget`}
          className={`flex items-center font-semibold py-2.5 px-4 rounded-lg transition-all duration-150
             ${activeLink === "budget"
               ? "bg-linear-to-r from-primary/15 to-violet-500/10 text-primary border-l-2 border-primary"
               : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5"}`}
        >
          <DollarSignIcon size={18} className="mr-2.5 shrink-0" />
          Budget
        </Link>
        <Link
          to={`/trips/${tripId}/chat`}
          className={`flex items-center font-semibold py-2.5 px-4 rounded-lg transition-all duration-150
             ${activeLink === "chat"
               ? "bg-linear-to-r from-primary/15 to-violet-500/10 text-primary border-l-2 border-primary"
               : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5"}`}
        >
          <MessageSquareIcon size={18} className="mr-2.5 shrink-0" />
          <span className="flex-1">Chat</span>
          {unreadCount > 0 && (
            <span className="bg-linear-to-r from-primary to-violet-500 text-white text-xs rounded-full min-w-[1.35rem] h-[1.35rem] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </nav>
    </aside>
    </>
  );
}