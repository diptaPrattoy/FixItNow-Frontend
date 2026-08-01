import { DiscoverySkeleton } from "@/components/public/discovery-skeleton";

export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-10 max-w-xl animate-pulse rounded bg-slate-200" />
      <div className="mt-10"><DiscoverySkeleton /></div>
    </div>
  );
}
