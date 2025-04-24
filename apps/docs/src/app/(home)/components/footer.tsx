import React from 'react';

export const Footer = () => {
  return (
    <footer className="flex flex-col gap-12 px-8 py-20">
      <div className="mx-auto max-w-5xl">
        <div>
          <div className="text-white">
            <div className="inline-flex items-center gap-3">
              <p className="font-bold text-2xl uppercase">SendIt</p>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi
              dignissimos deleniti qui voluptatem quis unde aliquam delectus,
              consequatur veritatis suscipit sit beatae accusamus quo blanditiis
              dicta magni! Quos, quae fuga.
            </p>
          </div>
        </div>
        <div className="flex flex-col pt-12 md:flex-row md:items-center md:justify-between">
          <p className="text-left">
            <span className="mx-auto mt-2 text-gray-500 text-xs lg:mx-0">
              © SendIt. All rights reserved
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
