import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';

const NAV = {
  citizen: [
    { to:'/dashboard',     icon:'🏠', label:'Dashboard' },
    { to:'/report',        icon:'📝', label:'Report Issue' },
    { to:'/my-complaints', icon:'📋', label:'My Complaints' },
    { to:'/map',           icon:'🗺️', label:'Map View' },
    { to:'/notifications', icon:'🔔', label:'Notifications' },
    { to:'/profile',       icon:'👤', label:'Profile' },
  ],
  staff: [
    { to:'/staff/dashboard',  icon:'🏠', label:'Dashboard' },
    { to:'/staff/complaints', icon:'📋', label:'Complaints' },
    { to:'/map',              icon:'🗺️', label:'Map View' },
    { to:'/notifications',    icon:'🔔', label:'Notifications' },
    { to:'/profile',          icon:'👤', label:'Profile' },
  ],
  supervisor: [
    { to:'/staff/dashboard',  icon:'🏠', label:'Dashboard' },
    { to:'/staff/complaints', icon:'📋', label:'Complaints' },
    { to:'/map',              icon:'🗺️', label:'Map View' },
    { to:'/notifications',    icon:'🔔', label:'Notifications' },
    { to:'/profile',          icon:'👤', label:'Profile' },
  ],
  admin: [
    { to:'/admin/dashboard',   icon:'📊', label:'Dashboard' },
    { to:'/admin/complaints',  icon:'📋', label:'All Complaints' },
    { to:'/admin/users',       icon:'👥', label:'Citizens' },
    { to:'/admin/staff',       icon:'👔', label:'Staff & Supervisors' },
    { to:'/admin/departments', icon:'🏛️', label:'Departments' },
    { to:'/admin/analytics',   icon:'📈', label:'Analytics' },
    { to:'/map',               icon:'🗺️', label:'Heatmap' },
    { to:'/notifications',     icon:'🔔', label:'Notifications' },
    { to:'/profile',           icon:'👤', label:'Profile' },
  ],
};

export default function Sidebar({ collapsed, onToggle, onMobileClose }) {
  const { user, logout }  = useAuthStore();
  const unreadCount       = useNotificationStore(s => s.unreadCount);
  const navigate          = useNavigate();
  const items             = NAV[user?.role] || NAV.citizen;

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg,#0F172A 0%,#1E293B 100%)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
        borderRadius: '0 24px 0 0',
        width: '100%',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div className="flex-shrink-0 flex items-center justify-center text-white font-black text-lg shadow-lg"
          style={{width:38,height:38,background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',borderRadius:12}}>
          C
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}}
              exit={{opacity:0,width:0}} className="overflow-hidden whitespace-nowrap flex-1">
              <p className="text-white font-bold text-sm leading-tight">CivicConnect</p>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>Smart Civic Mgmt</p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Mobile close button */}
        <button onClick={onMobileClose}
          className="lg:hidden ml-auto p-1 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0"
          style={{background:'rgba(255,255,255,0.05)'}}>
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden"
        style={{scrollbarWidth:'none'}}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/staff/dashboard' || item.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              }`
            }
            style={({ isActive }) => isActive
              ? {background:'rgba(59,130,246,0.2)',boxShadow:'inset 0 0 0 1px rgba(59,130,246,0.3)'}
              : {}
            }
          >
            <span className="text-base flex-shrink-0 leading-none relative">
              {item.icon}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold flex items-center justify-center"
                  style={{fontSize:9,minWidth:16,height:16,borderRadius:8,padding:'0 2px'}}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="whitespace-nowrap overflow-hidden text-sm">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="flex-shrink-0 p-3" style={{borderTop:'1px solid rgba(255,255,255,0.07)'}}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 overflow-hidden flex-1">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</p>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:10,textTransform:'capitalize'}}>{user?.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm font-medium"
          style={{color:'#F87171'}}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <span className="text-base flex-shrink-0">🚪</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Desktop collapse toggle — fixed to right edge */}
      <button onClick={onToggle}
        className="hidden lg:flex absolute items-center justify-center transition-all duration-150"
        style={{
          top:72, right:-14, width:28, height:28,
          background:'#1E293B',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:'50%',
          color:'rgba(255,255,255,0.5)',
          fontSize:11,
          boxShadow:'2px 2px 8px rgba(0,0,0,0.35)',
          zIndex:50,
          cursor:'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.background='#334155'; }}
        onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.background='#1E293B'; }}
      >
        {collapsed ? '▶' : '◀'}
      </button>
    </div>
  );
}
