import React from 'react';

export const Feature = () => {
  return (
    <section className="rounded-3xl bg-[#f6f7fa] px-8 py-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-16">
        <h2 className="text-center font-semibold text-5xl tracking-tighter">
          Securize your
          <br />
          data with us
        </h2>
        <div className="flex grid-cols-2 flex-col gap-4 md:grid">
          <div className="items-left col-span-1 flex flex-col gap-4 rounded-3xl bg-white px-8 pb-8">
            <img
              src="./imgs/ihpone-mocup3.png"
              className="mx-auto mb-6 max-w-[300px]"
              alt=""
            />
            <h3 className="font-bold text-xl">User data</h3>
            <p className="text-gray-600 text-sm">
              Quo laboriosam quas saepe sunt alias delectus ducimus quidem
              natus, suscipit id aliquid consectetur. Voluptate officiis iusto
              rem.
            </p>
            <a
              href=""
              className="mr-auto rounded-xl bg-[#cff245] px-4 py-2 text-black"
            >
              Get Started
            </a>
          </div>
          <div className="items-left relative col-span-1 flex min-h-[500px] flex-col gap-4 overflow-hidden rounded-3xl bg-white p-8">
            <h3 className="font-bold text-xl">Data Collection</h3>
            <p className="text-gray-600 text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro
              magni laudantium maxime, quo laboriosam quas saepe sunt alias
              delectus ducimus quidem natus.
            </p>
            <a
              href=""
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
            <h3 className="font-bold text-xl">Your data</h3>
            <p className="text-center text-gray-600 text-md">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi rem
              et inventore doloribus laborum, quae obcaecati maiores consectetur
              quam. Dolores exercitationem repellat !
            </p>
            <a href="" className="rounded-xl bg-[#cff245] px-4 py-2 text-black">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
