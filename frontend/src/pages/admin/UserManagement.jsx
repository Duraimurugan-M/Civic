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

export default function UserManagement() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', aadhaarNumber: '',
    role: 'staff', departmentId: '',
  });
  const [showPw, setShowPw] = useState(false);
  const qc = useQueryClient();

  // Fetch citizens only in this page
  const { data, isLoading } = useQuery({
    queryKey: ['citizens', page, search],
    queryFn:  () => userAPI.getAll({ page, limit: 15, role: 'citizen', search }).then(r => r.data),
  });

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => departmentAPI.getAll().then(r => r.data.departments),
  });

  const createStaff = useMutation({
    mutationFn: () => userAPI.createStaff(createForm),
    onSuccess: (res) => {
      toast.success(`${res.data.user.role} created successfully!`);
      qc.invalidateQueries(['citizens']);
      setShowCreate(false);
      setCreateForm({ name:'', email:'', password:'', aadhaarNumber:'', role:'staff', departmentId:'' });
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to create user'),
  });

  const citizens = data?.users || [];

  const Field = ({ label, value, mono = false }) => (
    <div className="py-2.5 border-b border-slate-50 last:border-0">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-slate-300 font-normal">Not provided</span>}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Citizens</h1>
          <p className="page-subtitle">{data?.total || 0} registered citizens</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          + Add Staff / Supervisor
        </button>
      </div>

      {/* Search */}
      <div className="card p-3 sm:p-4">
        <input
          className="input text-sm"
          placeholder="Search by name, email or citizen ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</div>
      ) : citizens.length === 0 ? (
        <div className="card"><EmptyState icon="👥" title="No citizens found" /></div>
      ) : (
        <div className="space-y-2">
          {citizens.map((u, i) => (
            <motion.div key={u._id}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card flex items-center gap-3 p-3 sm:p-4"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}
              >
                {u.avatar
                  ? <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                  : u.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                  {!u.profileComplete && (
                    <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                      ⚠️ Profile Incomplete
                    </span>
                  )}
                  {!u.isActive && (
                    <span className="badge bg-red-100 text-red-500 text-[10px]">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                <div className="flex gap-3 mt-0.5 flex-wrap">
                  {u.citizenId && (
                    <span className="text-[10px] font-mono text-primary">{u.citizenId}</span>
                  )}
                  {u.phone && (
                    <span className="text-[10px] text-slate-400">📞 {u.phone}</span>
                  )}
                  <span className="text-[10px] text-slate-400">{formatDate(u.createdAt)}</span>
                </div>
              </div>

              {/* View button */}
              <button
                onClick={() => setViewUser(u)}
                className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
              >
                View
              </button>
            </motion.div>
          ))}
          <Pagination page={page} pages={data?.pages} onPage={setPage} />
        </div>
      )}

      {/* ── View Citizen Modal ── */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="Citizen Details" size="md">
        {viewUser && (
          <div>
            {/* Top profile strip */}
            <div
              className="flex items-center gap-4 p-4 rounded-2xl mb-5"
              style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden shadow"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}
              >
                {viewUser.avatar
                  ? <img src={viewUser.avatar} className="w-full h-full object-cover" alt="" />
                  : viewUser.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{viewUser.name}</p>
                <p className="text-sm text-slate-500">{viewUser.email}</p>
                {viewUser.citizenId && (
                  <p className="text-xs font-mono text-primary mt-0.5">{viewUser.citizenId}</p>
                )}
                <div className="flex gap-2 mt-1.5">
                  <span className="badge bg-blue-100 text-blue-700">citizen</span>
                  <span className={`badge ${viewUser.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'}`}>
                    {viewUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`badge ${viewUser.profileComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {viewUser.profileComplete ? '✓ Profile Complete' : '⚠ Incomplete'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="Full Name"      value={viewUser.name} />
              <Field label="Email"          value={viewUser.email} />
              <Field label="Citizen ID"     value={viewUser.citizenId} mono />
              <Field label="Aadhaar Number" value={viewUser.aadhaarNumber} mono />
              <Field label="Phone"          value={viewUser.phone} />
              <Field label="Date of Birth"  value={viewUser.dob} />
              <Field label="Address"        value={viewUser.address} />
              <Field label="City"           value={viewUser.city} />
              <Field label="District"       value={viewUser.district} />
              <Field label="State"          value={viewUser.state} />
              <Field label="Pincode"        value={viewUser.pincode} />
              <Field label="Registered On"  value={formatDate(viewUser.createdAt)} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Staff / Supervisor Modal ── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Staff / Supervisor" size="md">
        <div className="space-y-4">
          {/* Info note */}
          <div
            className="rounded-xl p-3 text-xs leading-relaxed"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}
          >
            💡 You are creating a new staff or supervisor account directly. After creation, share the email and password with the person. They can log in immediately.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Full Name *
              </label>
              <input className="input" placeholder="Eg: Ramesh Kumar"
                value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address *
              </label>
              <input type="email" className="input" placeholder="staff@example.com"
                value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-14"
                  placeholder="Min 6 characters"
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Aadhaar Number *
              </label>
              <input className="input" placeholder="12-digit Aadhaar" maxLength={12}
                value={createForm.aadhaarNumber}
                onChange={e => setCreateForm(p => ({ ...p, aadhaarNumber: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['staff', 'supervisor'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setCreateForm(p => ({ ...p, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 capitalize transition-all ${
                      createForm.role === r
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                    }`}>
                    {r === 'staff' ? '👔 Staff' : '🏅 Supervisor'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Department *
              </label>
              <select className="input"
                value={createForm.departmentId}
                onChange={e => setCreateForm(p => ({ ...p, departmentId: e.target.value }))}>
                <option value="">— Select Department —</option>
                {depts?.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => createStaff.mutate()}
            disabled={
              createStaff.isPending ||
              !createForm.name ||
              !createForm.email ||
              !createForm.password ||
              !createForm.aadhaarNumber ||
              !createForm.departmentId
            }
            className="btn-primary w-full py-3 mt-2 disabled:opacity-50"
          >
            {createStaff.isPending ? <Spinner size="sm" /> : `Create ${createForm.role.charAt(0).toUpperCase() + createForm.role.slice(1)}`}
          </button>
        </div>
      </Modal>
    </div>
  );
}