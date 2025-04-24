import React from 'react';

export const Faq = () => {
  return (
    <section className="rounded-3xl bg-[#f6f7fa] py-20">
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
                What does SendIt?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
                quae distinctio nemo natus, accusantium magni, nam eveniet sint
                iusto odio assumenda laborum. Nobis vero quas consequatur
                aspernatur blanditiis maiores expedita?
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                What coding languages ?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
                quae distinctio nemo natus, accusantium magni, nam eveniet sint
                iusto odio assumenda laborum. Nobis vero quas consequatur
                aspernatur blanditiis maiores expedita?
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                How fast will I get my coded website?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
                quae distinctio nemo natus, accusantium magni, nam eveniet sint
                iusto odio assumenda laborum. Nobis vero quas consequatur
                aspernatur blanditiis maiores expedita?
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                How can I check the progress of my website?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
                quae distinctio nemo natus, accusantium magni, nam eveniet sint
                iusto odio assumenda laborum. Nobis vero quas consequatur
                aspernatur blanditiis maiores expedita?
              </p>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-base text-gray-900 tracking-tight">
                If I have a blog, do you count each post as a separate page?
              </summary>
              <p className="pt-4 text-gray-500 text-sm">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
                quae distinctio nemo natus, accusantium magni, nam eveniet sint
                iusto odio assumenda laborum. Nobis vero quas consequatur
                aspernatur blanditiis maiores expedita?
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};
