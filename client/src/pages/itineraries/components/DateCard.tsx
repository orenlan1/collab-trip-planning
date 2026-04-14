
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function DateCard({ date, index, setDay, isSelected }: { date: Date, index: number, setDay: () => void, isSelected?: boolean }) {
  const dayAbbr = weekday[date.getDay()].slice(0, 3);

  return (
    <div
      onClick={setDay}
      className={`
        shrink-0 w-28 rounded-xl p-2 mx-2 text-center cursor-pointer transition-all duration-200
        ${isSelected
          ? 'bg-linear-to-br from-primary to-violet-500 text-white scale-105 shadow-lg ring-2 ring-offset-2 ring-primary/60'
          : 'bg-card border border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-muted-foreground'
        }
      `}
    >
      <span className={`block text-xs font-semibold uppercase tracking-wider ${
        isSelected ? 'text-white/70' : 'text-muted-foreground'
      }`}>
        Day {index + 1}
      </span>
      <span className={`block text-xl font-bold mt-1 ${
        isSelected ? 'text-white' : 'text-foreground'
      }`}>
        {date.getDate()}
      </span>
      <span className={`block text-xs mt-1 ${
        isSelected ? 'text-white/70' : 'text-muted-foreground'
      }`}>
        {monthNames[date.getMonth()].slice(0, 3)}, {dayAbbr}
      </span>
    </div>
  );
}
