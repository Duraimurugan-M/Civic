import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatsCard from '../../components/common/StatsCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { formatDate, getSLACountdown, CATEGORY_ICONS } from '../../utils/helpers';
import SkeletonCard from '../../components/common/SkeletonCard';
import { motion } from 'framer-motion';

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey:['staff-complaints'],
    queryFn:  () => complaintAPI.getAll({ limit:20, sort:'-createdAt' }).then(r=>r.data),
  });
  const complaints = data?.complaints||[];
  const assigned   = complaints.filter(c=>c.status==='assigned').length;
  const inProgress = complaints.filter(c=>c.status==='in_progress').length;
  const resolved   = complaints.filter(c=>c.status==='resolved').length;
  const urgent     = complaints.filter(c=>['emergency','high'].includes(c.priority)).length;

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">{user?.name} · <span className="capitalize">{user?.role}</span></p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard title="Assigned"   value={assigned}   icon="📋" color="blue"   index={0} />
        <StatsCard title="In Progress" value={inProgress} icon="⚙️" color="purple" index={1} />
        <StatsCard title="Resolved"   value={resolved}   icon="✅" color="green"  index={2} />
        <StatsCard title="Urgent"     value={urgent}     icon="🚨" color="red"    index={3} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">Assigned Complaints</h2>
          <Link to="/staff/complaints" className="text-primary text-xs sm:text-sm font-semibold hover:underline">View all →</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i=><SkeletonCard key={i} lines={2}/>)}</div>
        ) : complaints.slice(0,8).map(c => {
          const sla = getSLACountdown(c.deadline);
          return (
            <Link key={c._id} to={'/complaints/'+c._id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[c.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-slate-400">{c.complaintCode}</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{c.title}</p>
                <p className="text-xs text-slate-400">{c.citizenId?.name} · {formatDate(c.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                {sla && !sla.expired && c.status!=='resolved' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${sla.urgent?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>
                    {sla.text}
                  </span>
                )}
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
