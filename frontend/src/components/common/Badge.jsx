import { STATUS_LABELS, PRIORITY_COLORS } from '../../utils/helpers';

export function StatusBadge({ status }) {
  const cls = {
    pending: 'badge-pending', resolved: 'badge-resolved', urgent: 'badge-urgent',
    in_progress: 'badge-progress', assigned: 'badge-assigned',
    rejected: 'badge-rejected', escalated: 'bg-orange-100 text-orange-700 badge',
  }[status] || 'badge bg-gray-100 text-gray-600';
  const dots = { pending:'🟡', resolved:'🟢', in_progress:'🔵', assigned:'🔵', rejected:'⚫', escalated:'🟠', urgent:'🔴' };
  return <span className={cls}>{dots[status]||'⚪'} {STATUS_LABELS[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge ${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority?.toUpperCase()}
    </span>
  );
}
