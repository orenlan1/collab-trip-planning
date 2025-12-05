import { Link, useParams, useLocation } from "react-router-dom";
import { DollarSignIcon, Map, LayoutDashboard, MessageSquareIcon, Menu, X } from "lucide-react";
import { useTripSocket } from "@/context/TripSocketContext";
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
        className="fixed top-22 left-4 z-50 lg:hidden bg-white dark:bg-slate-800 p-2 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-700 transition"
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static 
        w-64 bg-white/80 dark:bg-slate-800 backdrop-blur-sm
        min-h-[calc(100vh-64px)] 
        border-r border-neutral-200/40 dark:border-neutral-800/60
        transition-transform duration-300 ease-in-out
        z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <nav className="flex flex-col p-4 sticky top-20">
        <Link 
          to={`/trips/${tripId}/overview`} 
          className={`font-semibold py-2 px-4 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition
             ${activeLink === "overview" ? "text-indigo-700  bg-slate-200/60 dark:bg-slate-700  dark:text-white"  : "text-slate-500 "}`}
        >
          <LayoutDashboard className="inline-block mr-2" />
          <div className="inline-block">
            Overview
          </div>
        </Link>
        <Link 
          to={`/trips/${tripId}/itinerary`} 
          className={`font-semibold py-2 px-4 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition
             ${activeLink === "itinerary" ? "text-indigo-700 bg-slate-200/60 dark:bg-slate-700  dark:text-white" : "text-slate-500 "}`}
        >
          <Map className="inline-block mr-2" />
          Itinerary
        </Link>
        <Link 
          to={`/trips/${tripId}/budget`} 
          className={` font-semibold py-2 px-4 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition
             ${activeLink === "budget" ? "text-indigo-700 bg-slate-200/60 dark:bg-slate-700  dark:text-white" : "text-slate-500 "}`}
        >
          <DollarSignIcon className="inline-block mr-2" />
          Budget
        </Link>
        <Link 
          to={`/trips/${tripId}/chat`} 
          className={` font-semibold py-2 px-4 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition
             ${activeLink === "chat" ? "text-indigo-700 bg-slate-200/60 dark:bg-slate-700  dark:text-white" : "text-slate-500 "}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <MessageSquareIcon className="inline-block mr-2" />
              Chat
            </div>
            <div>
              {unreadCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>
      </nav>
    </aside>
    </>
  );
}