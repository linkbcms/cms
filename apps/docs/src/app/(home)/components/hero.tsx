import { WaitlistForm } from '@/app/(home)/components/waitlist-form';
import React from 'react';
export const Hero = () => {
  return (
    <section className="relative max-h-[900px] items-center overflow-hidden bg-[#0d0e11] px-8 py-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <i className="bi bi-star-fill text-yellow-400" />
            <i className="bi bi-star-fill text-yellow-400" />
            <i className="bi bi-star-fill text-yellow-400" />
            <i className="bi bi-star-fill text-yellow-400" />
            <i className="bi bi-star-fill text-yellow-400" />
          </div>
          <span className="text-gray-400 text-xs">4.8/5 (45k reviews)</span>
        </div>
        <h1 className="text-center font-semibold text-5xl tracking-tighter">
          adipisicing elit
          <br /> quia eius ratione natus.
        </h1>
        <strong className="text-center font-normal text-xl">
          Lorem ipsum, dolor sit amet consectetur
          <br /> adipisicing elit quia eius ratione natus.
        </strong>
        <WaitlistForm />
        <small className="px-2 text-center text-xs">
          By clicking Join Waitlist you're confirming that you agree with our{' '}
          <a href="/pages/terms" className="underline">
            Terms and Conditions
          </a>
          .
        </small>
        <div className="mt-20">
          <img
            src="/imgs/hero-black.png"
            className="mx-auto w-full max-w-[1000px] rounded shadow-2xl"
            alt=""
          />
        </div>
      </div>
    </section>
  );
};
