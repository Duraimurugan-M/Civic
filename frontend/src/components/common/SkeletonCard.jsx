export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-100 rounded-lg mb-2 ${i === lines-1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}
