import { format, isToday, isYesterday } from "date-fns";

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-border/60" />
      <div className="bg-secondary text-muted-foreground text-xs px-3 py-1 rounded-full border border-border/60 shrink-0">
        {getDateLabel(date)}
      </div>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}
