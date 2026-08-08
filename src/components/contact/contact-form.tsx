"use client";

import { useState, type FormEvent } from "react";

import { FormField } from "@/components/auth/form-field";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactFieldErrors = Partial<Record<keyof ContactFormState, string>>;

type ContactResponse = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
};

const initialForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const { toast } = useToast();

  const [form, setForm] = useState<ContactFormState>(initialForm);

  const [errors, setErrors] = useState<ContactFieldErrors>({});

  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await apiRequest<ContactResponse>("/api/contact", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
      });

      setForm(initialForm);

      toast("Your message has been sent successfully.", "success");
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);

      setErrors(fieldErrors as ContactFieldErrors);

      toast(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      noValidate
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Send a message
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
          How can we help?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Fill in the form and our support team will review your message.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField
          id="contact-name"
          label="Name"
          type="text"
          value={form.name}
          placeholder="Your full name"
          autoComplete="name"
          error={errors.name}
          onChange={(event) => updateField("name", event.target.value)}
        />

        <FormField
          id="contact-email"
          label="Email"
          type="email"
          value={form.email}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <FormField
          id="contact-phone"
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          placeholder="+880 17XXXXXXXX"
          autoComplete="tel"
          error={errors.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />

        <FormField
          id="contact-subject"
          label="Subject"
          type="text"
          value={form.subject}
          placeholder="How can we help?"
          error={errors.subject}
          onChange={(event) => updateField("subject", event.target.value)}
        />
      </div>

      <label htmlFor="contact-message" className="mt-5 block">
        <span className="text-sm font-semibold text-slate-700">Message</span>

        <textarea
          id="contact-message"
          rows={6}
          value={form.message}
          placeholder="Tell us a little more about your issue..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          onChange={(event) => updateField("message", event.target.value)}
          className={`mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            errors.message
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
          }`}
        />

        <div className="mt-1.5 flex items-center justify-between gap-3">
          {errors.message ? (
            <span id="contact-message-error" className="text-sm text-rose-600">
              {errors.message}
            </span>
          ) : (
            <span />
          )}

          <span className="text-xs text-slate-400">
            {form.message.length}/2000
          </span>
        </div>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending message..." : "Send message"}
      </button>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Please do not include passwords, payment card details, or other
        sensitive information in your message.
      </p>
    </form>
  );
}
