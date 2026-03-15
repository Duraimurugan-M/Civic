import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useNotifications } from '../../hooks/useNotifications';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location  = useLocation();
  const isDesktop = useIsDesktop();
  useNotifications();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
        style={{ width: sidebarWidth }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
      >
        <Navbar sidebarWidth={isDesktop ? sidebarWidth : 0} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 pt-16 px-3 sm:px-5 lg:px-6 pb-8 max-w-screen-2xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
