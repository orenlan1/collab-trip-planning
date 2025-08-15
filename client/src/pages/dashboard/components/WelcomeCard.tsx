export function WelcomeCard() {
  return (
    <div className="">
        <div className="flex justify-between">
          <div>
             <h2 className="text-2xl text-slate-900 font-semibold tracking-tight mb-1">Welcome back</h2>
             <p className="text-sm text-slate-600 ">Manage your trips, invite friends, and co- plan in real-time.</p>
          </div>
          <div>
            <div className="text-xs text-slate-500">
              Active trips
            </div>
            <div className="text-2xl font-semibold text-indigo-600 tracking-tight mt-1">
              0
            </div>
             
          </div>
         
        </div>
    </div>

  );
}
