export const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
};
export const formatDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
};
export const timeAgo = (d) => {
  if (!d) return '';
  const sec = Math.floor((new Date() - new Date(d)) / 1000);
  if (sec < 60)  return 'just now';
  const intervals = [[31536000,'year'],[2592000,'month'],[86400,'day'],[3600,'hour'],[60,'minute']];
  for (const [s,label] of intervals) {
    const count = Math.floor(sec/s);
    if (count >= 1) return `${count} ${label}${count>1?'s':''} ago`;
  }
  return 'just now';
};
export const getSLACountdown = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { expired:true, text:'Overdue', urgent:true };
  const hours = Math.floor(diff/3600000);
  const mins  = Math.floor((diff%3600000)/60000);
  return { expired:false, text: hours>0 ? `${hours}h ${mins}m` : `${mins}m`, urgent: hours<2 };
};
export const CATEGORY_ICONS = {
  road:'🛣️', water:'💧', electricity:'⚡', garbage:'🗑️',
  sewage:'🚰', park:'🌳', streetlight:'💡', other:'📋',
};
export const CATEGORY_LABELS = {
  road:'Roads', water:'Water Supply', electricity:'Electricity',
  garbage:'Garbage', sewage:'Sewage', park:'Parks', streetlight:'Streetlights', other:'Other',
};
export const PRIORITY_COLORS = {
  low:       'bg-emerald-100 text-emerald-700',
  medium:    'bg-blue-100 text-blue-700',
  high:      'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};
export const STATUS_LABELS = {
  pending:'Pending', assigned:'Assigned', in_progress:'In Progress',
  resolved:'Resolved', rejected:'Rejected', escalated:'Escalated',
};
