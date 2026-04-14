
import { Navbar } from '../components/navigation/top/Navbar';
import { Footer } from '../components/navigation/top/Footer';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';


export function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <ScrollToTop />
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
