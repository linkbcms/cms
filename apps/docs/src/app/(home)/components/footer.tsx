import { Logo } from '@/app/icons/logo';
import React from 'react';

export const Footer = () => {
  return (
    <footer className="flex flex-col gap-12 px-8 py-20">
      <div className="mx-auto max-w-5xl">
        <div>
          <div className="text-white">
            <div className="inline-flex items-center gap-3">
              <Logo />
              <p className="font-bold text-xl">LinkbCMS</p>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              LinkbCMS is an open-source content management system designed to
              help developers build and manage websites efficiently. With a
              flexible and intuitive interface, it empowers you to create,
              organize, and publish content while maintaining full control over
              your codebase.
            </p>
          </div>
        </div>
        <div className="flex flex-col pt-12 md:flex-row md:items-center md:justify-between">
          <p className="text-left">
            <span className="mx-auto mt-2 text-gray-500 text-xs lg:mx-0">
              © LinkbCMS. All rights reserved
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
