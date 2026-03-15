import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

export default function Navbar({ sidebarWidth, onMobileMenuOpen }) {
  const { user }         = useAuthStore();
  const unreadCount      = useNotificationStore(s => s.unreadCount);
  const [search, setSearch] = useState('');
  const navigate         = useNavigate();

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-16 transition-all duration-300"
      style={{
        left: 0,
        background: 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <div className="space-y-1.5">
          <span className="block w-5 h-0.5 bg-slate-600 rounded"></span>
          <span className="block w-5 h-0.5 bg-slate-600 rounded"></span>
          <span className="block w-3.5 h-0.5 bg-slate-600 rounded"></span>
        </div>
      </button>

      {/* Spacer on desktop to match sidebar */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: sidebarWidth }} />

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            onKeyDown={e => {
              if (e.key === 'Enter' && search.trim()) {
                navigate('/my-complaints?search=' + search.trim());
                setSearch('');
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <button onClick={() => navigate('/notifications')}
          className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
          <span className="text-xl leading-none">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white font-bold flex items-center justify-center"
              style={{fontSize:9,minWidth:17,height:17,borderRadius:9,padding:'0 3px'}}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl px-2.5 py-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0"
            style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
            {user?.avatar
              ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
