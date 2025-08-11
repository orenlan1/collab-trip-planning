export function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-6 py-6 text-xs text-slate-600">
      <div className="flex items-center justify-between">
        <div>© <span className="font-semibold">TripSync</span> 2025</div>
        <div className="text-slate-500">
          Need help? <button className="text-indigo-600 hover:underline">Support</button>
        </div>
      </div>
    </footer>
  );
}
