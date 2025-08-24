import {Link} from "react-router-dom";
import {DollarSignIcon, Map, LayoutDashboard, MessageSquareIcon } from "lucide-react";
import { useState } from "react";


export function Sidebar() {
   
  return (
    <aside className="w-64 bg-white/80 h-screen border-r border-neutral-200/40 dark:border-neutral-800/60">
      <nav className="flex flex-col p-4">
        <Link to="/trips" className="text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition">
          <LayoutDashboard className="inline-block mr-2" />
          <div className="inline-block ">
            Overview
          </div>
        </Link>
        <Link to="/invitations" className="text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition">
          <Map className="inline-block mr-2" />
          Itinerary
        </Link>
        <Link to="/" className="text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition">
          <DollarSignIcon className="inline-block mr-2" />
          Budget
        </Link>
        <Link to="/" className="text-slate-500 font-semibold py-2 px-4 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition">
          <MessageSquareIcon className="inline-block mr-2" />
          Chat
        </Link>

      </nav>
    </aside>
  );
}
