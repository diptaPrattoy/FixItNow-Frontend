export default function AuthLoading() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl animate-pulse gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden rounded-3xl bg-emerald-100 lg:block" />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="mt-4 h-9 w-64 rounded-xl bg-slate-200" />
        <div className="mt-8 space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-12 rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
