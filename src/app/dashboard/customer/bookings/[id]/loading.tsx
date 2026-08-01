export default function BookingDetailsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[32rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
