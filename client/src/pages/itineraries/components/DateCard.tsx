
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function DateCard({ date, index, setDay, isSelected }: { date: Date, index: number, setDay: () => void, isSelected?: boolean }) {
  return (
    <div onClick={setDay} className={`flex flex-col items-center border hover:border-indigo-400  rounded-lg p-4 shadow-md ${isSelected ? 'bg-indigo-200' : 'bg-slate-200'}`}>
      <p className="text-slate-600 font-semibold">Day {index + 1}</p>
      <h2 className="text-md text-black font-bold">{date.getDate()} {monthNames[date.getMonth()]}, {date.getFullYear()} </h2>
      <p className="text-slate-500 font-light">{weekday[date.getDay()]}</p>
    </div>
  );
}