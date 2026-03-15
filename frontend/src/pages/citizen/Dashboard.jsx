import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatsCard from '../../components/common/StatsCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { StatusBadge } from '../../components/common/Badge';
import { formatDate, CATEGORY_ICONS } from '../../utils/helpers';

const quickActions = [
  { to:'/report',        icon:'📝', label:'Report Issue',    bg:'linear-gradient(135deg,#2563EB,#1D4ED8)' },
  { to:'/my-complaints', icon:'📋', label:'My Complaints',   bg:'linear-gradient(135deg,#1E293B,#334155)' },
  { to:'/map',           icon:'🗺️', label:'View Map',        bg:'linear-gradient(135deg,#059669,#10B981)' },
  { to:'/notifications', icon:'🔔', label:'Notifications',   bg:'linear-gradient(135deg,#D97706,#F59E0B)' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['complaints', { limit:5 }],
    queryFn:  () => complaintAPI.getAll({ limit:5 }).then(r => r.data),
  });

  const complaints = data?.complaints || [];
  const total      = data?.total || 0;
  const pending    = complaints.filter(c => ['pending','assigned','in_progress'].includes(c.status)).length;
  const resolved   = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        {user?.citizenId && (
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Citizen ID: {user.citizenId}</p>
        )}
        <p className="page-subtitle">Here's an overview of your civic reports</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard title="Total Reported" value={total}    icon="📋" color="blue"   index={0} />
        <StatsCard title="Pending"        value={pending}  icon="⏳" color="yellow" index={1} />
        <StatsCard title="Resolved"       value={resolved} icon="✅" color="green"  index={2} />
        <StatsCard title="Supported"      value={0}        icon="👍" color="purple" index={3} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a, i) => (
          <motion.div key={a.to} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}>
            <Link to={a.to}
              className="rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-2 hover:opacity-90 active:scale-95 transition-all block text-center"
              style={{background:a.bg}}>
              <span className="text-2xl sm:text-3xl">{a.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-white leading-tight">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">Recent Reports</h2>
          <Link to="/my-complaints" className="text-primary text-xs sm:text-sm font-semibold hover:underline">View all →</Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-slate-500 text-sm mb-4">No complaints reported yet</p>
            <Link to="/report" className="btn-primary text-sm px-5 py-2">Report your first issue</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map(c => (
              <Link key={c._id} to={'/complaints/'+c._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors border border-slate-100">
                <span className="text-xl sm:text-2xl flex-shrink-0">{CATEGORY_ICONS[c.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.complaintCode} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
