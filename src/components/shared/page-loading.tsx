type PageLoadingProps = {
  cards?: number;
  compact?: boolean;
};

export function PageLoading({ cards = 4, compact = false }: PageLoadingProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8 ${
        compact ? "py-8" : "py-12"
      }`}
      aria-label="Loading page content"
      aria-busy="true"
    >
      <div className="h-4 w-28 rounded-full bg-slate-200" />
      <div className="mt-4 h-9 w-full max-w-md rounded-xl bg-slate-200" />
      <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-100" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-4 w-20 rounded-full bg-slate-200" />
            <div className="mt-5 h-7 w-28 rounded-lg bg-slate-200" />
            <div className="mt-4 h-3 w-full rounded-full bg-slate-100" />
            <div className="mt-2 h-3 w-3/4 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-64 rounded-3xl border border-slate-200 bg-white" />
    </div>
  );
}
