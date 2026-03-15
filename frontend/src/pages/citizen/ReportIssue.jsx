import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { complaintAPI, departmentAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const CATEGORIES = [
  {v:'road',label:'Roads',icon:'🛣️'},
  {v:'water',label:'Water',icon:'💧'},
  {v:'electricity',label:'Electric',icon:'⚡'},
  {v:'garbage',label:'Garbage',icon:'🗑️'},
  {v:'sewage',label:'Sewage',icon:'🚰'},
  {v:'park',label:'Parks',icon:'🌳'},
  {v:'streetlight',label:'Streetlight',icon:'💡'},
  {v:'other',label:'Other',icon:'📋'},
];
const PRIORITIES = [
  {v:'low',label:'Low',color:'#10B981'},
  {v:'medium',label:'Medium',color:'#3B82F6'},
  {v:'high',label:'High',color:'#F59E0B'},
  {v:'emergency',label:'Emergency',color:'#EF4444'},
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title:'',description:'',category:'',departmentId:'',priority:'medium',latitude:'',longitude:'',address:'' });
  const [images, setImages]   = useState([]);
  const [locLoading, setLocL] = useState(false);
  const [duplicate, setDup]   = useState(null);
  const [showDup, setShowDup] = useState(false);
  const fileRef = useRef();

  const { data: depts } = useQuery({
    queryKey:['departments'],
    queryFn: () => departmentAPI.getAll().then(r=>r.data.departments),
  });

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocL(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setForm(p=>({...p, latitude:String(latitude), longitude:String(longitude)}));
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setForm(p=>({...p, address: data.display_name||''}));
        } catch {}
        setLocL(false);
        toast.success('Location captured!');
      },
      () => { setLocL(false); toast.error('Could not get location. Allow permission.'); }
    );
  };

  const checkDup = useMutation({
    mutationFn: complaintAPI.checkDuplicate,
    onSuccess: res => {
      if (res.data.duplicate) { setDup(res.data.complaint); setShowDup(true); }
      else doSubmit();
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: fd => complaintAPI.create(fd),
    onSuccess: res => { toast.success('Complaint submitted!'); navigate('/complaints/'+res.data.complaint._id); },
    onError:   e  => toast.error(e.response?.data?.message||'Submission failed'),
  });

  const doSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => { if(v) fd.append(k,v); });
    images.forEach(img => fd.append('images', img));
    submit(fd);
  };

  const supportExisting = useMutation({
    mutationFn: () => complaintAPI.support(duplicate._id),
    onSuccess: () => { toast.success('Supported!'); setShowDup(false); navigate('/complaints/'+duplicate._id); },
    onError:   e => toast.error(e.response?.data?.message||'Error'),
  });

  const stepOk = {
    1: form.title && form.category && form.description,
    2: form.latitude && form.longitude,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="page-title">Report a Civic Issue</h1>
        <p className="page-subtitle">Help improve your community</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              step>s  ? 'bg-primary border-primary text-white' :
              step===s ? 'border-primary text-primary bg-blue-50' :
              'border-slate-200 text-slate-400'
            }`}>{step>s ? '✓' : s}</div>
            {s<3 && <div className={`h-0.5 w-8 sm:w-16 rounded transition-colors ${step>s?'bg-primary':'bg-slate-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-slate-500 font-medium">
          {['Issue Details','Location','Review'][step-1]}
        </span>
      </div>

      <form onSubmit={e => { e.preventDefault(); checkDup.mutate({ latitude:form.latitude, longitude:form.longitude, category:form.category }); }}>
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step===1 && (
            <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="card space-y-4">
              <h2 className="font-bold text-slate-700">Issue Details</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Title *</label>
                <input className="input" placeholder="Short description of the issue" required
                  value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category *</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.v} type="button" onClick={()=>setForm(p=>({...p,category:c.v}))}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                        form.category===c.v ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                      }`}>
                      <div className="text-xl sm:text-2xl">{c.icon}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${form.category===c.v?'text-primary':'text-slate-500'}`}>{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Description *</label>
                <textarea className="input resize-none" rows={3} placeholder="Describe the issue in detail…"
                  value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Priority</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRIORITIES.map(p => (
                      <button key={p.v} type="button" onClick={()=>setForm(f=>({...f,priority:p.v}))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                          form.priority===p.v ? 'text-white border-transparent' : 'border-slate-200 text-slate-500 bg-white'
                        }`}
                        style={form.priority===p.v ? {background:p.color,borderColor:p.color} : {}}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Department</label>
                  <select className="input text-xs" value={form.departmentId} onChange={e=>setForm(p=>({...p,departmentId:e.target.value}))}>
                    <option value="">Auto assign</option>
                    {depts?.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Photos (up to 5)</label>
                <div onClick={()=>fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors active:bg-slate-50">
                  {images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {images.map((img,i) => (
                        <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg" alt="" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl">📷</span>
                      <p className="text-xs text-slate-400 mt-1">Tap to upload or take photo</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" capture="environment"
                  className="hidden" onChange={e=>setImages(Array.from(e.target.files).slice(0,5))} />
              </div>

              <button type="button" disabled={!stepOk[1]} onClick={()=>setStep(2)}
                className="btn-primary w-full py-3 disabled:opacity-50">
                Next: Set Location →
              </button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="card space-y-4">
              <h2 className="font-bold text-slate-700">Location</h2>

              <button type="button" onClick={getLocation} disabled={locLoading}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                {locLoading ? <Spinner size="sm" /> : '📍'}
                {locLoading ? 'Getting location…' : 'Tap to Capture My Location'}
              </button>

              {form.latitude && (
                <div className="rounded-xl p-3 text-sm" style={{background:'#F0FDF4',border:'1px solid #BBF7D0',color:'#166534'}}>
                  ✅ Location captured
                  {form.address && <p className="text-xs mt-1 line-clamp-2 opacity-80">{form.address}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Address</label>
                <input className="input text-sm" placeholder="Auto-filled after location capture"
                  value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={()=>setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button type="button" disabled={!stepOk[2]} onClick={()=>setStep(3)} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  Review →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step===3 && (
            <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="card space-y-4">
              <h2 className="font-bold text-slate-700">Review & Submit</h2>
              <div className="rounded-xl overflow-hidden border border-slate-100">
                {[
                  ['Title',       form.title],
                  ['Category',    form.category],
                  ['Priority',    form.priority],
                  ['Description', form.description],
                  ['Location',    form.address || `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`],
                  ['Photos',      `${images.length} attached`],
                ].map(([k,v],i) => (
                  <div key={k} className={`flex gap-3 px-4 py-2.5 text-sm ${i%2===0?'bg-slate-50':'bg-white'}`}>
                    <span className="font-semibold text-slate-500 w-24 flex-shrink-0 text-xs pt-0.5">{k}</span>
                    <span className="text-slate-700 text-xs break-words">{v||'—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                <button type="submit" disabled={isPending||checkDup.isPending} className="btn-primary flex-1 py-3">
                  {isPending||checkDup.isPending ? <Spinner size="sm" /> : '🚀 Submit'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Duplicate Modal */}
      <Modal open={showDup} onClose={()=>setShowDup(false)} title="Similar Complaint Found" size="sm">
        <div className="space-y-4">
          <div className="rounded-xl p-3 text-sm" style={{background:'#FFFBEB',border:'1px solid #FDE68A',color:'#92400E'}}>
            ⚠️ A similar complaint already exists near this location.
          </div>
          {duplicate && (
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-mono text-slate-400">{duplicate.complaintCode}</p>
              <h3 className="font-semibold text-slate-800 text-sm">{duplicate.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={duplicate.status} />
                <span className="text-xs text-slate-400">👍 {duplicate.supportCount} supports</span>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <button onClick={()=>supportExisting.mutate()} disabled={supportExisting.isPending}
              className="btn-primary w-full py-3">
              {supportExisting.isPending ? <Spinner size="sm" /> : '👍 Support Existing Complaint'}
            </button>
            <button onClick={()=>navigate('/complaints/'+duplicate?._id)} className="btn-secondary w-full py-2.5 text-sm">
              View Existing
            </button>
            <button onClick={()=>{ setShowDup(false); doSubmit(); }}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Submit as new complaint anyway
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
