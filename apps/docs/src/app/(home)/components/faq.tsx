import React from 'react';

export const Faq = () => {
  return (
    <section id="faq" className="rounded-3xl bg-[#f6f7fa] py-20">
      <div className="mx-auto h-full max-w-5xl">
        <div className="flex flex-col gap-12">
          <div>
            <h2 className="text-center font-semibold text-5xl tracking-tighter">
              FAQ
            </h2>
            <p className="mx-auto mt-4 text-center text-gray-600 text-sm">
              Frequent questions &amp; answers
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 text-base text-gray-400">
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                What is LinkbCMS?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                LinkbCMS is a powerful open-source content management system
                that helps developers build and manage websites more
                efficiently. It provides a flexible and intuitive interface for
                creating, organizing, and publishing content while maintaining
                full control over your codebase.
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                Which programming languages are supported?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                LinkbCMS is built with modern web technologies and supports
                development in JavaScript/TypeScript, React, and Next.js. The
                system is designed to be extensible, allowing you to integrate
                with various programming languages and frameworks through its
                API.
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                Is LinkbCMS free to use?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Yes! LinkbCMS is completely free and open source. You can use
                all core features without any cost. We're committed to
                maintaining an open-source model while developing additional
                premium features for enterprise users in the future.
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                How do I get started with LinkbCMS?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Getting started with LinkbCMS is straightforward. You can clone
                our repository from GitHub, follow our comprehensive
                documentation, and have your first project up and running in
                minutes. We also provide starter templates to help you begin
                quickly.
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                Can I self-host LinkbCMS?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Yes, LinkbCMS is designed to be self-hosted! You have complete
                control over your deployment and data. You can host it on your
                own servers or choose from various cloud hosting providers. We
                provide detailed deployment guides for different hosting
                scenarios.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};
