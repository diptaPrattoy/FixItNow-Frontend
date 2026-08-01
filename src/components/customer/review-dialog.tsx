"use client";

import { useState } from "react";

import type { CustomerBooking } from "@/types/api";

type ReviewDialogProps = {
  booking: CustomerBooking;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export function ReviewDialog({
  booking,
  submitting,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !submitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Completed service
        </p>
        <h2
          id="review-dialog-title"
          className="mt-2 text-xl font-bold text-slate-950"
        >
          Review {booking.service.name}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Share your experience with {booking.technician.user.name}. Your rating
          will appear on the technician&apos;s public profile.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-700">
            Rating
          </legend>
          <div className="mt-2 flex gap-1" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const selected = value <= rating;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  disabled={submitting}
                  className={`flex size-10 items-center justify-center rounded-lg text-2xl transition focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "text-amber-500 hover:bg-amber-50"
                      : "text-slate-300 hover:bg-slate-50 hover:text-slate-400"
                  }`}
                  aria-label={`Rate ${value} out of 5`}
                  aria-pressed={rating === value}
                >
                  ★
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-slate-500">{rating} out of 5 stars</p>
        </fieldset>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">
            Comment <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            maxLength={1000}
            disabled={submitting}
            placeholder="What went well?"
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <span className="mt-1 block text-right text-xs text-slate-400">
            {comment.length}/1000
          </span>
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => onSubmit(rating, comment.trim())}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}
