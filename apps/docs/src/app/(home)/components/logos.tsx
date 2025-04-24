import React from 'react';

export const Logos = () => {
  return (
    <section className="rounded-3xl bg-[#f6f7fa] px-8 py-20">
      <div className="mx-auto h-full max-w-5xl">
        <div className="mx-auto flex w-full max-w-5xl flex-col justify-between gap-10 lg:flex-row">
          <div className="mx-auto max-w-[200px] text-gray-400 text-sm lg:ms-0">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </div>
          <ul className="flex flex-row flex-wrap items-center justify-center gap-5">
            <li>
              <img
                className="max-w-[100px] grayscale"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png"
                alt=""
              />
            </li>
            <li>
              <img
                className="max-w-[100px] grayscale"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Coinbase.svg/2560px-Coinbase.svg.png"
                alt=""
              />
            </li>
            <li>
              <img
                className="max-w-[100px] grayscale"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
                alt=""
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
