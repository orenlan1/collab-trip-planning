import { Link, useParams, useLocation } from "react-router-dom";
import { DollarSignIcon, Map, LayoutDashboard, MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import { useTripSocket } from "@/context/TripSocketContext";
import { get } from "react-hook-form";

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


  return (
    <aside className="w-64 bg-white/80 h-screen border-r border-neutral-200/40 dark:border-neutral-800/60">
      <nav className="flex flex-col p-4">
        <Link 
          to={`/trips/${tripId}/overview`} 
          className={`text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition
             ${activeLink === "overview" ? "bg-neutral-200/60 dark:bg-neutral-800/60" : ""}`}
        >
          <LayoutDashboard className="inline-block mr-2" />
          <div className="inline-block">
            Overview
          </div>
        </Link>
        <Link 
          to={`/trips/${tripId}/itinerary`} 
          className={`text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition
             ${activeLink === "itinerary" ? "bg-neutral-200/60 dark:bg-neutral-800/60" : ""}`}
        >
          <Map className="inline-block mr-2" />
          Itinerary
        </Link>
        <Link 
          to={`/trips/${tripId}/budget`} 
          className={`text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition
             ${activeLink === "budget" ? "bg-neutral-200/60 dark:bg-neutral-800/60" : ""}`}
        >
          <DollarSignIcon className="inline-block mr-2" />
          Budget
        </Link>
        <Link 
          to={`/trips/${tripId}/chat`} 
          className={`text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition
             ${activeLink === "chat" ? "bg-neutral-200/60 dark:bg-neutral-800/60" : ""}`}
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
  );
}