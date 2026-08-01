export default function PaymentLoading() {
  return (
    <div className="mx-auto grid min-h-[65vh] max-w-2xl animate-pulse place-items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto size-14 rounded-2xl bg-slate-200" />
        <div className="mx-auto mt-6 h-8 w-64 rounded-lg bg-slate-200" />
        <div className="mx-auto mt-4 h-4 w-full max-w-md rounded-full bg-slate-100" />
        <div className="mx-auto mt-2 h-4 w-4/5 max-w-sm rounded-full bg-slate-100" />
        <div className="mx-auto mt-8 h-12 w-44 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
