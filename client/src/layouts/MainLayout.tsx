
import { Navbar } from '../components/navigation/top/Navbar';
import { Footer } from '../components/navigation/top/Footer';
import { Outlet } from 'react-router-dom';


export function MainLayout() {
  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
