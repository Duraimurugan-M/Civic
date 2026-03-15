import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useComplaints } from '../../hooks/useComplaints';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, CATEGORY_ICONS } from '../../utils/helpers';
import { motion } from 'framer-motion';

export default function MyComplaints() {
  const [searchParams] = useSearchParams();
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCat]  = useState('');
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useComplaints({ page, limit:10, status, category, search });
  const complaints = data?.complaints || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">{data?.total||0} total</p>
        </div>
        <Link to="/report" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
          + Report
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-wrap gap-2">
        <select value={status} onChange={e=>setStatus(e.target.value)}
          className="input text-xs flex-1 min-w-[110px] max-w-[160px]">
          <option value="">All Status</option>
          {['pending','assigned','in_progress','resolved','rejected','escalated'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>
          ))}
        </select>
        <select value={category} onChange={e=>setCat(e.target.value)}
          className="input text-xs flex-1 min-w-[110px] max-w-[160px]">
          <option value="">All Categories</option>
          {['road','water','electricity','garbage','sewage','park','streetlight','other'].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><SkeletonCard key={i} />)}</div>
      ) : complaints.length===0 ? (
        <div className="card">
          <EmptyState icon="📭" title="No complaints found"
            description="You haven't reported any issues matching these filters."
            action={<Link to="/report" className="btn-primary mt-2">Report an Issue</Link>} />
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c,i) => (
            <motion.div key={c._id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}>
              <Link to={'/complaints/'+c._id}
                className="card flex items-start gap-3 hover:shadow-hover active:scale-[0.99] transition-all p-3 sm:p-4 block">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                  style={{background:'#EFF6FF'}}>
                  {CATEGORY_ICONS[c.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-slate-400">{c.complaintCode}</p>
                      <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{c.title}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-slate-400">📍 {c.location?.address?.slice(0,30)||'Location set'}…</span>
                    <span className="text-xs text-slate-400">👍 {c.supportCount}</span>
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          <Pagination page={page} pages={data?.pages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
