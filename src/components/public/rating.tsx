type RatingProps = {
  value: number;
  count?: number;
};

export function Rating({ value, count }: RatingProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span className="text-amber-500" aria-hidden="true">★</span>
      <span className="font-semibold text-slate-800">{value.toFixed(1)}</span>
      {count !== undefined ? <span>({count})</span> : null}
    </span>
  );
}
