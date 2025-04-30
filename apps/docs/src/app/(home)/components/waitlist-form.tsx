'use client';

import { addToWaitlist } from '@/app/(home)/actions';
import { Loader2 } from 'lucide-react';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export const WaitlistForm = () => {
  // useActionState is available with React 19 (Next.js App Router)
  const [state, formAction] = useActionState(addToWaitlist, initialState);

  console.log(state);

  const data = state?.data;

  return (
    <form action={formAction} className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-x-4 gap-y-2 sm:flex-row">
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          className="rounded-xl border border-gray-700 bg-[#ebebeb]/5 px-4 py-1 focus:outline-none"
        />
        <SubmitButton />
      </div>
      <p aria-live="polite">{state?.message}</p>

      {data?.referral_token && (
        <p aria-live="polite" className="text-center">
          Here is your referral link:
          <br />
          <a
            className="text-blue-500 underline"
            href={`https://linkbcms.com?ref_id=${data.referral_token}`}
          >
            linkbcms.com?ref_id={data.referral_token}
          </a>
          <br />
          <br />
          Refer to your other <b>3 friends</b>, to move up the waitlist.
        </p>
      )}
    </form>
  );
};

const initialState = {
  message: '',
  data: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="relative w-full cursor-pointer rounded-xl bg-[#cff245] px-4 py-1 text-black aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
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
