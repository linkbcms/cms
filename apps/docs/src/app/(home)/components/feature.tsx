import React from 'react';

export const Feature = () => {
  return (
    <section id="features" className="rounded-3xl bg-[#f6f7fa] px-8 py-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-16">
        <h2 className="text-center font-semibold text-5xl tracking-tighter">
          Build and manage content
          <br />
          at scale with ease
        </h2>
        <div className="flex grid-cols-2 flex-col gap-4 md:grid">
          <div className="items-left col-span-1 flex flex-col gap-4 rounded-3xl bg-white px-8 pb-8">
            <img
              src="./imgs/ihpone-mocup3.png"
              className="mx-auto mb-6 max-w-[300px]"
              alt=""
            />
            <h3 className="font-bold text-xl">Content Management</h3>
            <p className="text-gray-600 text-sm">
              Easily create, update and manage your content with our intuitive
              interface. Built for teams to collaborate efficiently and scale
              content operations.
            </p>
            <a
              href="#waitlist"
              className="mr-auto rounded-xl bg-[#cff245] px-4 py-2 text-black"
            >
              Get Started
            </a>
          </div>
          <div className="items-left relative col-span-1 flex min-h-[500px] flex-col gap-4 overflow-hidden rounded-3xl bg-white p-8">
            <h3 className="font-bold text-xl">AI-powered content creation</h3>
            <p className="text-gray-600 text-sm">
              Leverage AI to streamline your content creation workflow. Our
              intelligent assistant helps generate, optimize, and enhance your
              content while maintaining your brand voice and quality standards.
            </p>
            <a
              href="#waitlist"
              className="mr-auto rounded-xl bg-[#cff245] px-4 py-2 text-black"
            >
              Get Started
            </a>
            <div className="absolute bottom-0 left-0 flex w-full">
              <img
                src="./imgs/hero-black.png"
                className="ml-auto max-w-[80%]"
                alt=""
              />
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-center gap-4 rounded-3xl bg-white p-10 md:p-20">
            <h3 className="font-bold text-xl">Data Security & Control</h3>
            <p className="text-center text-gray-600 text-md">
              Your data remains fully under your control with our secure,
              self-hosted solution. Benefit from enterprise-grade security
              features, granular access controls, and complete data ownership
              while maintaining compliance with privacy regulations.
            </p>
            <a
              href="#waitlist"
              className="rounded-xl bg-[#cff245] px-4 py-2 text-black"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
