import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import useAuthStore from '../../store/authStore';

const COLORS = ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899'];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey:['analytics'],
    queryFn: () => analyticsAPI.get().then(r=>r.data),
  });

  if (isLoading) return (
    <div className="space-y-5">
      <div><h1 className="page-title">Admin Dashboard</h1></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[1,2,3,4,5].map(i=><SkeletonCard key={i} lines={2}/>)}</div>
    </div>
  );

  const { stats={}, byCategory=[], byStatus=[], recentTrend=[], departmentStats=[] } = data||{};
  const catData  = byCategory.map(c=>({name:c._id, value:c.count}));
  const trendData = recentTrend.slice(-14).map(t=>({date:t._id?.slice(5), count:t.count}));
  const deptData  = departmentStats.map(d=>({name:d.name?.split(' ')[0], total:d.total, resolved:d.resolved}));

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview · {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard title="Total"          value={stats.totalComplaints||0}  icon="📋" color="blue"   index={0} />
        <StatsCard title="Pending"        value={stats.pendingComplaints||0} icon="⏳" color="yellow" index={1} />
        <StatsCard title="Resolved"       value={stats.resolvedComplaints||0} icon="✅" color="green" index={2} />
        <StatsCard title="Citizens"       value={stats.totalUsers||0}        icon="👥" color="purple" index={3} />
        <StatsCard title="Avg Rating"     value={`${stats.avgRating||0}★`}  icon="⭐" color="yellow" index={4} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Complaints (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{fontSize:11}} />
              <Bar dataKey="total"    fill="#2563EB" radius={[4,4,0,0]} name="Total"    />
              <Bar dataKey="resolved" fill="#10B981" radius={[4,4,0,0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Status Overview</h3>
          <div className="space-y-2 mt-2">
            {byStatus.map(s => {
              const pct = stats.totalComplaints ? Math.round(s.count/stats.totalComplaints*100) : 0;
              const colors = {pending:'#F59E0B',resolved:'#10B981',in_progress:'#8B5CF6',assigned:'#3B82F6',rejected:'#94A3B8',escalated:'#F97316'};
              return (
                <div key={s._id}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-slate-600 capitalize font-medium">{s._id?.replace('_',' ')}</span>
                    <span className="text-slate-400">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:colors[s._id]||'#94A3B8'}} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
