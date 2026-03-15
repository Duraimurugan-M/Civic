import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints, useUpdateStatus } from '../../hooks/useComplaints';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, CATEGORY_ICONS } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';

const STATUSES = ['assigned','in_progress','resolved','rejected'];

export default function StaffComplaints() {
  const [page, setPage]   = useState(1);
  const [statusF, setStatF] = useState('');
  const [selected, setSel]  = useState(null);
  const [form, setForm]     = useState({ status:'', note:'' });
  const [proofs, setProofs] = useState({});

  const { data, isLoading }         = useComplaints({ page, limit:10, status:statusF });
  const { mutate: updateStatus, isPending } = useUpdateStatus();

  const complaints = data?.complaints||[];
  const openUpdate = c => { setSel(c); setForm({ status:c.status, note:'' }); setProofs({}); };

  const handleUpdate = () => {
    const fd = new FormData();
    fd.append('status', form.status);
    if (form.note) fd.append('note', form.note);
    if (proofs.before) fd.append('beforeImage', proofs.before);
    if (proofs.after)  fd.append('afterImage',  proofs.after);
    updateStatus({ id:selected._id, data:fd }, { onSuccess:()=>{ setSel(null); setProofs({}); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">{data?.total||0} total</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['','assigned','in_progress','resolved'].map(s => (
            <button key={s} onClick={()=>setStatF(s)}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition-colors ${
                statusF===s ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s||'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      ) : complaints.length===0 ? (
        <div className="card"><EmptyState icon="✅" title="No complaints" description="All caught up!"/></div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c,i) => (
            <motion.div key={c._id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
              <div className="card flex items-start gap-3 p-3 sm:p-4">
                <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{CATEGORY_ICONS[c.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-slate-400">{c.complaintCode}</p>
                  <Link to={'/complaints/'+c._id} className="font-semibold text-slate-800 text-sm hover:text-primary leading-tight">
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-slate-400">{c.citizenId?.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                </div>
                <button onClick={()=>openUpdate(c)} className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">Update</button>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} pages={data?.pages} onPage={setPage} />
        </div>
      )}

      <Modal open={!!selected} onClose={()=>setSel(null)} title="Update Status" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-mono text-slate-400">{selected.complaintCode}</p>
              <p className="font-semibold text-slate-800 text-sm">{selected.title}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">New Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Note</label>
              <textarea className="input resize-none" rows={3} placeholder="Add a note about the update…"
                value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Before Photo</label>
                <input type="file" accept="image/*" className="input py-2 text-xs"
                  onChange={e=>setProofs(p=>({...p,before:e.target.files[0]}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">After Photo</label>
                <input type="file" accept="image/*" className="input py-2 text-xs"
                  onChange={e=>setProofs(p=>({...p,after:e.target.files[0]}))} />
              </div>
            </div>
            <button onClick={handleUpdate} disabled={isPending} className="btn-primary w-full py-3">
              {isPending ? <Spinner size="sm"/> : 'Update Status'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
