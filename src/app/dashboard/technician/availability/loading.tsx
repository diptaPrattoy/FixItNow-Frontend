export default function TechnicianAvailabilityLoading() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
