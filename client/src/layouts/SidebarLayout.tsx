import { Navbar } from '../components/navigation/top/Navbar';
import { Sidebar } from '../components/navigation/side/Sidebar';
import { Footer } from '../components/navigation/top/Footer';
import { Outlet } from 'react-router-dom';

export function SidebarLayout() {
  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 max-w-[1200px] mx-auto py-8 px-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}