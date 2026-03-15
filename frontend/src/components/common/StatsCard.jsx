import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon, color='blue', index=0 }) {
  const colors = {
    blue:   { bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE' },
    green:  { bg:'#F0FDF4', text:'#059669', border:'#BBF7D0' },
    yellow: { bg:'#FFFBEB', text:'#D97706', border:'#FDE68A' },
    red:    { bg:'#FEF2F2', text:'#DC2626', border:'#FECACA' },
    purple: { bg:'#F5F3FF', text:'#7C3AED', border:'#DDD6FE' },
  };
  const c = colors[color] || colors.blue;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:index*0.08}}
      className="card hover:shadow-hover transition-shadow cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl"
          style={{background:c.bg, border:`1px solid ${c.border}`}}>
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-800">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{title}</p>
    </motion.div>
  );
}
