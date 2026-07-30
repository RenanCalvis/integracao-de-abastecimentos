export default function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="h-5 bg-slate-700/80 rounded w-1/3"></div>
          <div className="flex space-x-4">
            <div className="h-3.5 bg-slate-700/50 rounded w-24"></div>
            <div className="h-3.5 bg-slate-700/50 rounded w-16"></div>
            <div className="h-3.5 bg-slate-700/50 rounded w-32"></div>
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 bg-slate-700/80 rounded w-28 ml-auto"></div>
          <div className="h-3.5 bg-slate-700/50 rounded w-16 ml-auto"></div>
        </div>
      </div>
    </div>
  );
}
