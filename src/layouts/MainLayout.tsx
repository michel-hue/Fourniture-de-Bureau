import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomTabBar } from '../components/BottomTabBar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      {/* Marge basse : la bottom tab bar est fixed sur mobile (< 640px) */}
      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}