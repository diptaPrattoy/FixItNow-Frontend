import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        id={id}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
        }`}
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1.5 block text-sm text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
