'use client';

import { addToWaitlist } from '@/app/(home)/actions';
import { Loader2 } from 'lucide-react';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export const WaitlistForm = () => {
  // useActionState is available with React 19 (Next.js App Router)
  const [state, formAction] = useActionState(addToWaitlist, initialState);

  console.log(state);

  return (
    <form action={formAction} className="flex items-center gap-4">
      <input
        name="email"
        type="email"
        placeholder="Enter your email"
        className="rounded-xl border border-gray-700 bg-[#ebebeb]/5 px-4 py-1 focus:outline-none"
      />
      <SubmitButton />
      <p aria-live="polite">{state?.message}</p>
    </form>
  );
};

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="relative cursor-pointer rounded-xl bg-[#cff245] px-4 py-1 text-black aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
    >
      <span className={pending ? 'opacity-0' : ''}>Join Waitlist</span>
      {pending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </button>
  );
}
