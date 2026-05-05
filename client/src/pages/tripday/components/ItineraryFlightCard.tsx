import { IoAirplaneOutline } from "react-icons/io5";
import { Plane } from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";
import { format } from "date-fns";
import type { Flight } from "@/pages/flights/services/api";
import { formatCurrencyAmount } from "@/lib/currency";

interface Props {
  flight: Flight;
}

export function ItineraryFlightCard({ flight }: Props) {
  const depTime = flight.departure.split("T")[1].substring(0, 5);
  const arrTime = flight.arrival.split("T")[1].substring(0, 5);

  const durationMs = new Date(flight.arrival).getTime() - new Date(flight.departure).getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${hours}h ${minutes > 0 ? ` ${minutes}m` : ""}`.trim();

  const arrivalDate = new Date(flight.arrival);
  const departureDate = new Date(flight.departure);
  const isNextDay =
    arrivalDate.getUTCDate() !== departureDate.getUTCDate() ||
    arrivalDate.getUTCMonth() !== departureDate.getUTCMonth();

  return (
    <div className="border border-indigo-200 dark:border-indigo-900/50 rounded-xl overflow-hidden shadow-sm mb-4">
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2">
          <IoAirplaneOutline className="text-indigo-500 text-base" />
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {flight.airline}
          </span>
          <span className="text-xs font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
            {flight.flightNumber}
          </span>
        </div>
        {flight.expense && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
            <FaMoneyBillWave className="w-3.5 h-3.5" />
            <span>{formatCurrencyAmount(flight.expense.cost, flight.expense.currency)}</span>
          </div>
        )}
      </div>

      {/* Flight route */}
      <div className="flex items-center px-6 py-4 bg-gradient-to-r from-indigo-50/40 to-violet-50/40 dark:from-indigo-950/20 dark:to-violet-950/20">
        {/* Departure */}
        <div className="w-28 shrink-0 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-0.5">From</p>
          <p className="text-2xl font-bold tracking-tight text-foreground leading-none">{depTime}</p>
          <p className="text-sm font-semibold text-foreground mt-1 leading-tight">{flight.from}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{format(departureDate, "MMM d")}</p>
        </div>

        {/* Duration line */}
        <div className="flex-1 flex flex-col items-center gap-1 mx-4">
          <span className="text-xs text-muted-foreground">{duration}</span>
          <div className="w-full flex items-center">
            <div className="w-2 h-2 rounded-full border-2 border-indigo-400 dark:border-indigo-500 shrink-0" />
            <div className="h-px bg-indigo-200 dark:bg-indigo-700 flex-1" />
            <Plane className="text-indigo-500 w-5 h-5 mx-2 shrink-0" />
            <div className="h-px bg-indigo-200 dark:bg-indigo-700 flex-1" />
            <div className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />
          </div>
          <span className="text-xs text-muted-foreground">Direct</span>
        </div>

        {/* Arrival */}
        <div className="w-28 shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-0.5">To</p>
          <div className="flex items-baseline justify-end gap-1 leading-none">
            <p className="text-2xl font-bold tracking-tight text-foreground">{arrTime}</p>
            {isNextDay && (
              <span className="text-xs text-indigo-500 font-semibold">+1</span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground mt-1 leading-tight">{flight.to}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{format(arrivalDate, "MMM d")}</p>
        </div>
      </div>
    </div>
  );
}
