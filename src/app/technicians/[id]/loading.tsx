export default function TechnicianDetailsLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="h-56 rounded-3xl bg-slate-200" />
          <div className="mt-6 h-8 w-56 rounded-lg bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 rounded-2xl bg-white ring-1 ring-slate-200" />
            ))}
          </div>
        </div>
        <div className="h-[520px] rounded-3xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
