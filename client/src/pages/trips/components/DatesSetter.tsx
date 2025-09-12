import { Calendar } from "@/components/ui/calendar";
import { useTripStore } from "@/stores/tripStore";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export const DatesSetter = () => {
    const startDate = useTripStore(state => state.startDate);
    const endDate = useTripStore(state => state.endDate);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
    });

  return (
    <div>
      <Calendar 
        mode="range"
        numberOfMonths={2}
        selected={dateRange}
        onSelect={undefined}
        disabled={(date) => date < new Date()}
        initialFocus={undefined}
      />
      <button onClick={() => {}} className="bg-indigo-500 hover:bg-indigo-600 transition text-white m-4 px-4 py-2 rounded-md" >Save</button>
    </div>
  );
}