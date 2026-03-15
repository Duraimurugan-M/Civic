import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';
import { motion } from 'framer-motion';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICONS = { complaint:'📋', status:'🔄', reminder:'⏰', system:'🔔' };

export default function Notifications() {
  const { data, isLoading } = useNotifications();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();
  const notifications = data?.notifications||[];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{data?.unread||0} unread</p>
        </div>
        {(data?.unread||0) > 0 && (
          <button onClick={()=>markAllRead.mutate()}
            className="btn-secondary text-xs py-2 px-3">Mark all read</button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><SkeletonCard key={i} lines={2}/>)}</div>
      ) : notifications.length===0 ? (
        <div className="card">
          <EmptyState icon="🔔" title="All caught up!" description="No notifications right now." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n,i) => (
            <motion.div key={n._id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.025}}
              onClick={()=>{ if (!n.isRead) markRead.mutate(n._id); }}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer active:scale-[0.99] transition-all ${
                n.isRead ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'
              }`}>
                {TYPE_ICONS[n.type]||'🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${n.isRead?'text-slate-600':'text-slate-800'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
