export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const range = [];
  for (let i = Math.max(1, page-2); i <= Math.min(pages, page+2); i++) range.push(i);
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button disabled={page<=1} onClick={()=>onPage(page-1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
      {range.map(p => (
        <button key={p} onClick={()=>onPage(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p===page ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
          {p}
        </button>
      ))}
      <button disabled={page>=pages} onClick={()=>onPage(page+1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
    </div>
  );
}
