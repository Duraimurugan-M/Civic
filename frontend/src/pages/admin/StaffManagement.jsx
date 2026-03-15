import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, departmentAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';

export default function StaffManagement() {
  const [page, setPage]       = useState(1);
  const [roleFilter, setRF]   = useState('staff');
  const [search, setSearch]   = useState('');
  const [selected, setSel]    = useState(null);
  const [editForm, setEF]     = useState({ role:'staff', departmentId:'', isActive:true });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-mgmt', page, roleFilter, search],
    queryFn:  () => userAPI.getAll({ page, limit:15, role:roleFilter, search }).then(r => r.data),
  });
  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => departmentAPI.getAll().then(r => r.data.departments),
  });

  const updateUser = useMutation({
    mutationFn: () => userAPI.update(selected._id, editForm),
    onSuccess: () => {
      toast.success('Staff updated successfully!');
      qc.invalidateQueries(['staff-mgmt']);
      setSel(null);
    },
    onError: e => toast.error(e.response?.data?.message || 'Error updating user'),
  });

  const deactivate = useMutation({
    mutationFn: (id) => userAPI.update(id, { isActive: false }),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['staff-mgmt']); },
    onError:   e => toast.error(e.response?.data?.message || 'Error'),
  });

  const users = data?.users || [];

  const openEdit = u => {
    setSel(u);
    setEF({ role: u.role, departmentId: u.departmentId?._id || '', isActive: u.isActive });
  };

  const ROLE_STYLES = {
    staff:      { bg:'#F5F3FF', color:'#7C3AED' },
    supervisor: { bg:'#FFFBEB', color:'#D97706' },
    admin:      { bg:'#FEF2F2', color:'#DC2626' },
    citizen:    { bg:'#EFF6FF', color:'#2563EB' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Staff & Supervisor Management</h1>
          <p className="page-subtitle">Assign roles and departments to team members</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{background:'#EFF6FF', border:'1px solid #BFDBFE'}}>
        <span className="text-xl flex-shrink-0">💡</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">How to add Staff / Supervisor</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Citizens register themselves at the login page. To promote a citizen to Staff or Supervisor,
            find them in the list below → click <strong>Edit</strong> → change their role and assign a department.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-wrap gap-3 items-center">
        <input className="input text-sm flex-1 min-w-[160px]" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1.5">
          {['staff','supervisor','citizen'].map(r => (
            <button key={r} onClick={() => setRF(r)}
              className={`px-3 py-2 text-xs rounded-xl font-semibold border transition-colors capitalize ${
                roleFilter === r ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</div>
      ) : users.length === 0 ? (
        <div className="card">
          <EmptyState icon="👥" title={`No ${roleFilter} found`}
            description={roleFilter === 'staff' ? 'No staff members assigned yet. Promote citizens from the list.' : 'No users with this role yet.'} />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => {
            const rs = ROLE_STYLES[u.role] || ROLE_STYLES.citizen;
            return (
              <motion.div key={u._id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                className="card flex items-center gap-3 p-3 sm:p-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
                  style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
                  {u.avatar
                    ? <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                    : u.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                    <span className="badge text-[11px]" style={{background:rs.bg, color:rs.color}}>
                      {u.role}
                    </span>
                    {!u.isActive && (
                      <span className="badge bg-red-100 text-red-500 text-[10px]">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {u.citizenId && (
                      <span className="text-[10px] font-mono text-slate-400">{u.citizenId}</span>
                    )}
                    {u.departmentId
                      ? <span className="text-[10px] text-emerald-600 font-semibold">🏛️ {u.departmentId.name}</span>
                      : <span className="text-[10px] text-red-400">⚠️ No department assigned</span>
                    }
                    <span className="text-[10px] text-slate-400">Joined {formatDate(u.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(u)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                  {u.isActive && u.role !== 'admin' && (
                    <button
                      onClick={() => { if (confirm(`Deactivate ${u.name}?`)) deactivate.mutate(u._id); }}
                      className="btn-danger text-xs py-1.5 px-2.5">
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 15)} onPage={setPage} />
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!selected} onClose={() => setSel(null)} title="Edit Staff Member" size="sm">
        {selected && (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.email}</p>
                {selected.citizenId && (
                  <p className="text-[10px] font-mono text-slate-400">{selected.citizenId}</p>
                )}
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Assign Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['citizen','staff','supervisor','admin'].map(r => {
                  const rs = ROLE_STYLES[r] || ROLE_STYLES.citizen;
                  return (
                    <button key={r} type="button" onClick={() => setEF(p => ({...p, role:r}))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                        editForm.role === r ? 'border-transparent' : 'border-slate-200 bg-white text-slate-600'
                      }`}
                      style={editForm.role === r ? {background:rs.bg, color:rs.color, borderColor:rs.color} : {}}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department (only for staff/supervisor) */}
            {['staff','supervisor'].includes(editForm.role) && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Assign Department *
                </label>
                <select className="input" value={editForm.departmentId}
                  onChange={e => setEF(p => ({...p, departmentId:e.target.value}))}>
                  <option value="">— Select Department —</option>
                  {depts?.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                {!editForm.departmentId && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Department is required for staff/supervisor role</p>
                )}
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <input type="checkbox" id="active-toggle" checked={editForm.isActive}
                onChange={e => setEF(p => ({...p, isActive:e.target.checked}))}
                className="w-4 h-4 rounded accent-primary" />
              <label htmlFor="active-toggle" className="text-sm font-medium text-slate-700 flex-1">
                Account Active
              </label>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                editForm.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'
              }`}>
                {editForm.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <button
              onClick={() => updateUser.mutate()}
              disabled={updateUser.isPending || (['staff','supervisor'].includes(editForm.role) && !editForm.departmentId)}
              className="btn-primary w-full py-3 disabled:opacity-50">
              {updateUser.isPending ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
