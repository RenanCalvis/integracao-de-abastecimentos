export default function SkeletonReceipt() {
  return (
    <div className="max-w-md mx-auto my-8 bg-white text-slate-900 rounded-lg shadow-2xl p-6 relative animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-3"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-6"></div>

      <div className="border-t border-b border-dashed border-slate-300 py-4 my-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>

      <div className="space-y-4 my-6">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </div>

      <div className="h-8 bg-slate-300 rounded w-1/2 ml-auto my-6"></div>

      <div className="h-10 bg-blue-200 rounded-lg w-full mt-8"></div>
    </div>
  );
}
