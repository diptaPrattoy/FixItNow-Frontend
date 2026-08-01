export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-8 w-44 rounded-lg bg-slate-200" />
      <div className="mt-5 h-14 max-w-2xl rounded-xl bg-slate-200" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-48 rounded-3xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
