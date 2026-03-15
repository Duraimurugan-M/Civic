import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';

export default function DepartmentManagement() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ name:'', description:'' });

  const { data, isLoading } = useQuery({
    queryKey:['departments'],
    queryFn: () => departmentAPI.getAll().then(r=>r.data.departments),
  });

  const create = useMutation({
    mutationFn: () => departmentAPI.create(form),
    onSuccess: () => { toast.success('Department created!'); qc.invalidateQueries(['departments']); setShowModal(false); setForm({name:'',description:''}); },
    onError: e => toast.error(e.response?.data?.message||'Error'),
  });
  const update = useMutation({
    mutationFn: () => departmentAPI.update(editing._id, form),
    onSuccess: () => { toast.success('Updated!'); qc.invalidateQueries(['departments']); setEditing(null); },
    onError: e => toast.error(e.response?.data?.message||'Error'),
  });
  const remove = useMutation({
    mutationFn: id => departmentAPI.delete(id),
    onSuccess: () => { toast.success('Department deactivated'); qc.invalidateQueries(['departments']); },
    onError: e => toast.error(e.response?.data?.message||'Error'),
  });

  const openEdit = d => { setEditing(d); setForm({ name:d.name, description:d.description||'' }); };
  const depts    = data||[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{depts.length} departments</p>
        </div>
        <button onClick={()=>{ setShowModal(true); setForm({name:'',description:''}); }}
          className="btn-primary text-sm px-4 py-2.5">+ Add Department</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3].map(i=><div key={i} className="card animate-pulse h-24"/>)}
        </div>
      ) : depts.length===0 ? (
        <div className="card">
          <EmptyState icon="🏛️" title="No departments" description="Create your first department."
            action={<button onClick={()=>setShowModal(true)} className="btn-primary mt-2">Create Department</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {depts.map((d,i) => (
            <motion.div key={d._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <h3 className="font-bold text-slate-800 text-sm">{d.name}</h3>
                  </div>
                  {d.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{d.description}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={()=>openEdit(d)} className="btn-secondary text-xs py-1.5 px-2.5">Edit</button>
                  <button onClick={()=>{ if(confirm('Deactivate this department?')) remove.mutate(d._id); }}
                    className="btn-danger text-xs py-1.5 px-2.5">Remove</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal||!!editing} onClose={()=>{ setShowModal(false); setEditing(null); }}
        title={editing?'Edit Department':'Add Department'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Department Name *</label>
            <input className="input" placeholder="Eg: Roads & Infrastructure" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What issues does this department handle?"
              value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
          </div>
          <button onClick={()=>editing?update.mutate():create.mutate()}
            disabled={!form.name||create.isPending||update.isPending} className="btn-primary w-full py-3">
            {(create.isPending||update.isPending) ? <Spinner size="sm"/> : (editing?'Update':'Create Department')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
