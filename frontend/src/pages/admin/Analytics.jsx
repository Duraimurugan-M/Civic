import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatsCard from '../../components/common/StatsCard';

const COLORS = ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899','#84CC16'];

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey:['analytics'],
    queryFn: () => analyticsAPI.get().then(r=>r.data),
  });

  if (isLoading) return (
    <div className="space-y-5">
      <div><h1 className="page-title">Analytics</h1></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[1,2,3,4,5].map(i=><SkeletonCard key={i} lines={2}/>)}</div>
    </div>
  );

  const { stats={}, byCategory=[], byPriority=[], recentTrend=[], departmentStats=[] } = data||{};
  const catData    = byCategory.map(c=>({name:c._id, value:c.count}));
  const trendData  = recentTrend.slice(-30).map(t=>({date:t._id?.slice(5), count:t.count}));
  const deptPerf   = departmentStats.map(d=>({ name:d.name?.split(' ')[0], total:d.total, resolved:d.resolved,
    rate: d.total>0 ? Math.round(d.resolved/d.total*100) : 0 }));
  const priorityData = byPriority.map(p=>({name:p._id, value:p.count}));

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Comprehensive civic system insights</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard title="Total"          value={stats.totalComplaints||0}  icon="📋" color="blue"   index={0} />
        <StatsCard title="Pending"        value={stats.pendingComplaints||0} icon="⏳" color="yellow" index={1} />
        <StatsCard title="Resolved"       value={stats.resolvedComplaints||0} icon="✅" color="green" index={2} />
        <StatsCard title="Resolution Rate" value={`${stats.resolutionRate||0}%`} icon="📊" color="purple" index={3} />
        <StatsCard title="Avg Rating"     value={`${stats.avgRating||0}★`}  icon="⭐" color="yellow" index={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">30-Day Complaint Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{fontSize:9}} interval={4} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value"
                label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{fontSize:10}} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{fontSize:10}} />
              <Bar dataKey="total"    fill="#2563EB" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="resolved" fill="#10B981" radius={[4,4,0,0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="card">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{fontSize:10}} />
              <YAxis dataKey="name" type="category" tick={{fontSize:10}} width={70} />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
