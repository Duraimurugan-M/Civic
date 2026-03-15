import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useComplaint, useSupportComplaint } from '../../hooks/useComplaints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { formatDateTime, getSLACountdown, CATEGORY_ICONS } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-3xl transition-transform hover:scale-110 ${s<=value ? 'text-amber-400' : 'text-slate-200'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function ComplaintDetail() {
  const { id }   = useParams();
  const { user } = useAuthStore();
  const { data, isLoading } = useComplaint(id);
  const support  = useSupportComplaint();
  const [feedback, setFeedback] = useState({ rating:5, comment:'' });
  const qc = useQueryClient();

  const { data: feedbackData } = useQuery({
    queryKey: ['feedback', id],
    queryFn:  () => feedbackAPI.get(id).then(r => r.data),
  });

  const submitFeedback = useMutation({
    mutationFn: () => feedbackAPI.submit(id, feedback),
    onSuccess: () => { toast.success('Feedback submitted! Thank you.'); qc.invalidateQueries(['feedback', id]); },
    onError:   e  => toast.error(e.response?.data?.message || 'Error'),
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="card animate-pulse h-24 bg-slate-100 rounded-2xl" />)}
    </div>
  );

  const { complaint, logs=[], userSupported } = data || {};
  if (!complaint) return <div className="card text-center py-12 text-slate-400">Complaint not found</div>;

  const sla     = getSLACountdown(complaint.deadline);
  const isOwner = complaint.citizenId?._id === user?._id;
  const canRate = isOwner && complaint.status === 'resolved' && !feedbackData?.feedback;

  // userSupported: 'owner' | true | false
  const hasSupported   = userSupported === true;
  const canShowSupport = !isOwner && !hasSupported && complaint.status !== 'resolved';

  const steps       = ['pending','assigned','in_progress','resolved'];
  const currentStep = steps.indexOf(complaint.status);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link to="/my-complaints" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
        ← Back to Complaints
      </Link>

      {/* Header */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{background:'#EFF6FF'}}>
            {CATEGORY_ICONS[complaint.category]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-0.5">{complaint.complaintCode}</p>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">{complaint.title}</h1>
              </div>
              {sla && complaint.status !== 'resolved' && (
                <div className={`text-center px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${
                  sla.expired ? 'bg-red-50 text-red-600' : sla.urgent ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <p className="text-[10px] font-medium opacity-70">SLA</p>
                  {sla.text}
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{complaint.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <span className="text-xs text-slate-400">👍 {complaint.supportCount} supports</span>
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
          {[
            ['Citizen ID',   complaint.citizenId?.citizenId || '-'],
            ['Reported By',  complaint.citizenId?.name],
            ['Department',   complaint.departmentId?.name || 'Unassigned'],
            ['Reported On',  formatDateTime(complaint.createdAt)],
          ].map(([k,v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{v||'-'}</p>
            </div>
          ))}
        </div>

        {/* Support button */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {canShowSupport && (
            <button onClick={() => support.mutate(id)} disabled={support.isPending}
              className="btn-secondary flex items-center gap-2 text-sm">
              {support.isPending ? <Spinner size="sm" /> : '👍'} Support this complaint
            </button>
          )}
          {hasSupported && (
            <span className="text-sm text-emerald-600 font-medium">✅ You supported this complaint</span>
          )}
          {isOwner && complaint.status !== 'resolved' && (
            <span className="text-xs text-slate-400">This is your complaint</span>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="card">
        <h2 className="font-bold text-slate-800 mb-5">Progress Timeline</h2>
        {/* Step bar */}
        <div className="flex items-center mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i < currentStep  ? 'bg-primary border-primary text-white' :
                  i === currentStep ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' :
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {i < currentStep ? '✓' : i+1}
                </div>
                <p className={`text-xs mt-1 font-medium whitespace-nowrap ${i <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
                  {s.replace('_',' ')}
                </p>
              </div>
              {i < steps.length-1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${i < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Log entries */}
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={log._id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                {i < logs.length-1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
              </div>
              <div className="pb-3">
                <p className="text-sm font-semibold text-slate-700 capitalize">{log.status.replace('_',' ')}</p>
                {log.note && <p className="text-xs text-slate-500 mt-0.5">{log.note}</p>}
                <p className="text-xs text-slate-400 mt-0.5">
                  by <span className="font-medium">{log.updatedBy?.name}</span> · {formatDateTime(log.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      {(complaint.images?.length > 0 || complaint.beforeImage || complaint.afterImage) && (
        <div className="card">
          <h2 className="font-bold text-slate-800 mb-4">Photos</h2>
          {complaint.images?.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {complaint.images.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer">
                  <img src={img} className="w-full h-20 sm:h-24 object-cover rounded-xl hover:opacity-80 transition-opacity" alt="" />
                </a>
              ))}
            </div>
          )}
          {(complaint.beforeImage || complaint.afterImage) && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              {complaint.beforeImage && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Before</p>
                  <img src={complaint.beforeImage} className="w-full h-36 object-cover rounded-xl" alt="Before" />
                </div>
              )}
              {complaint.afterImage && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1.5">After ✅</p>
                  <img src={complaint.afterImage} className="w-full h-36 object-cover rounded-xl" alt="After" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Existing feedback */}
      {feedbackData?.feedback && (
        <div className="card">
          <h2 className="font-bold text-slate-800 mb-3">Your Rating</h2>
          <StarRating value={feedbackData.feedback.rating} onChange={() => {}} />
          {feedbackData.feedback.comment && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{feedbackData.feedback.comment}</p>
          )}
        </div>
      )}

      {/* Rate resolution */}
      {canRate && (
        <div className="card">
          <h2 className="font-bold text-slate-800 mb-4">Rate the Resolution</h2>
          <StarRating value={feedback.rating} onChange={r => setFeedback(p => ({...p, rating:r}))} />
          <textarea className="input mt-4 resize-none" rows={3} placeholder="Share your experience (optional)…"
            value={feedback.comment} onChange={e => setFeedback(p => ({...p, comment:e.target.value}))} />
          <button onClick={() => submitFeedback.mutate()} disabled={submitFeedback.isPending}
            className="btn-primary mt-3 flex items-center gap-2">
            {submitFeedback.isPending ? <Spinner size="sm" /> : '⭐ Submit Rating'}
          </button>
        </div>
      )}
    </div>
  );
}
