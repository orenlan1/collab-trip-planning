
import { Navbar } from '../components/navigation/top/Navbar';
import { Footer } from '../components/navigation/top/Footer';
import { Outlet } from 'react-router-dom';


export function SearchingLayout() {
  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <main className="h-screen mx-auto ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}