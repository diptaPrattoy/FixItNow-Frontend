export default function TechnicianBookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-[440px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
