import { WaitlistForm } from '@/app/(home)/components/waitlist-form';
import React from 'react';
export const Hero = () => {
  return (
    <section
      id="waitlist"
      className="relative max-h-[900px] scroll-mt-20 items-center overflow-hidden bg-[#0d0e11] px-8 py-20"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <i className="bi bi-shield-check text-green-400" />
            <i className="bi bi-shield-check text-green-400" />
            <i className="bi bi-shield-check text-green-400" />
          </div>
          <span className="text-gray-400 text-xs">
            AI-powered content management for modern teams
          </span>
        </div>
        <h1 className="text-center font-semibold text-5xl tracking-tighter">
          LinkbCMS <br /> Modern AI-Powered CMS
        </h1>
        <strong className="text-center font-normal text-xl">
          Streamline content operations with AI-powered tools
          <br /> and a modern, open source headless CMS.
        </strong>
        <WaitlistForm />
        <small className="px-2 text-center text-xs">
          By joining the waitlist, you'd like to receive updates from us.
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
