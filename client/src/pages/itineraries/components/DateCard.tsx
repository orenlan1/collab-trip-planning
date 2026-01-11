
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
        flex-shrink-0 w-28 rounded-xl p-2 mx-2 text-center cursor-pointer transition-all
        ${isSelected 
          ? 'bg-indigo-600 dark:bg-indigo-600 text-white scale-105 shadow-lg ring-2 ring-offset-2 ring-indigo-600 dark:ring-offset-slate-900' 
          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300'
        }
      `}
    >
      <span className={`block text-xs font-medium uppercase tracking-wider ${
        isSelected ? 'opacity-70' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'
      }`}>
        Day {index + 1}
      </span>
      <span className={`block text-xl font-bold mt-1 ${
        isSelected ? '' : 'text-slate-800 dark:text-white'
      }`}>
        {date.getDate()}
      </span>
      <span className={`block text-xs mt-1 ${
        isSelected ? 'opacity-70' : 'text-slate-400 dark:text-slate-500'
      }`}>
        {monthNames[date.getMonth()].slice(0, 3)}, {dayAbbr}
      </span>
    </div>
  );
}