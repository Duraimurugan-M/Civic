import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints, useUpdateStatus } from '../../hooks/useComplaints';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, CATEGORY_ICONS, STATUS_LABELS } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';

export default function AdminComplaints() {
  const [page, setPage]     = useState(1);
  const [filters, setFilters] = useState({ status:'', category:'', priority:'' });
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status:'', note:'', assignedTo:'' });

  const { data, isLoading }         = useComplaints({ page, limit:10, ...filters });
  const { mutate: updateStatus, isPending } = useUpdateStatus();

  // Fetch ALL staff + supervisors for assign dropdown
  const { data: staffRes } = useQuery({
    queryKey: ['staff-list'],
    queryFn:  () => userAPI.getAll({ role:'staff', limit:100 }).then(r => r.data),
  });
  const { data: supRes } = useQuery({
    queryKey: ['supervisor-list'],
    queryFn:  () => userAPI.getAll({ role:'supervisor', limit:100 }).then(r => r.data),
  });

  const staff = [...(staffRes?.users||[]), ...(supRes?.users||[])];
  const complaints = data?.complaints || [];

  const openUpdate = c => { setSelected(c); setUpdateForm({ status:c.status, note:'', assignedTo:c.assignedTo?._id||'' }); };

  const handleUpdate = () => {
    const fd = new FormData();
    Object.entries(updateForm).forEach(([k,v]) => { if (v) fd.append(k, v); });
    updateStatus({ id:selected._id, data:fd }, { onSuccess: () => setSelected(null) });
  };

  const setFilter = k => e => setFilters(p => ({...p, [k]:e.target.value}));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Complaints</h1>
          <p className="text-slate-500 text-sm">{data?.total||0} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        {[
          { key:'status',   opts:['','pending','assigned','in_progress','resolved','rejected','escalated'] },
          { key:'category', opts:['','road','water','electricity','garbage','sewage','park','streetlight','other'] },
          { key:'priority', opts:['','low','medium','high','emergency'] },
        ].map(f => (
          <select key={f.key} className="input max-w-[150px] text-xs" value={filters[f.key]} onChange={setFilter(f.key)}>
            {f.opts.map(o => <option key={o} value={o}>{o ? o.replace('_',' ').toUpperCase() : `All ${f.key}`}</option>)}
          </select>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : complaints.length === 0 ? (
        <div className="card"><EmptyState icon="📭" title="No complaints found" /></div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c, i) => (
            <motion.div key={c._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
              className="card flex items-start gap-3 p-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{CATEGORY_ICONS[c.category]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400">{c.complaintCode}</p>
                    <Link to={'/complaints/'+c._id} className="font-semibold text-slate-800 text-sm hover:text-primary leading-tight">
                      {c.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                  <span>By: {c.citizenId?.name}</span>
                  <span>ID: {c.citizenId?.citizenId||'-'}</span>
                  <span>Dept: {c.departmentId?.name||'Unassigned'}</span>
                  <span>👍 {c.supportCount}</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => openUpdate(c)} className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">Manage</button>
            </motion.div>
          ))}
          <Pagination page={page} pages={data?.pages} onPage={setPage} />
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Complaint">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-mono text-slate-400">{selected.complaintCode}</p>
              <p className="font-semibold text-slate-800 text-sm">{selected.title}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Status</label>
              <select className="input" value={updateForm.status} onChange={e => setUpdateForm(p=>({...p,status:e.target.value}))}>
                {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Assign To Staff</label>
              <select className="input" value={updateForm.assignedTo} onChange={e => setUpdateForm(p=>({...p,assignedTo:e.target.value}))}>
                <option value="">— Unassigned —</option>
                {staff.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Note</label>
              <textarea className="input resize-none" rows={3} value={updateForm.note}
                onChange={e => setUpdateForm(p=>({...p,note:e.target.value}))} placeholder="Add a note…" />
            </div>
            <button onClick={handleUpdate} disabled={isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isPending ? <Spinner size="sm" /> : 'Update Complaint'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
