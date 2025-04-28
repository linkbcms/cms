import React from 'react';

export const Tools = () => {
  return (
    <section className="px-8 py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-16">
        <h2 className="text-center font-semibold text-5xl text-white tracking-tighter">
          Powerful AI Tools
          <br />
          Built for Modern Teams
        </h2>
        <div className="flex w-full flex-wrap justify-center gap-2">
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-pencil-square text-4xl" />
            <span className="text-center font-bold">
              Open
              <br />
              Source
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-robot text-4xl" />
            <span className="text-center font-bold">
              Easy to
              <br />
              Extend
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-700 bg-[#cff245] p-8">
            <i className="bi bi-cloud-arrow-up text-4xl" />
            <span className="text-center font-bold">
              AI
              <br />
              Assistant
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-people text-4xl" />
            <span className="text-center font-bold">
              Import
              <br />
              Export Data
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-shield-check text-4xl" />
            <span className="text-center font-bold">
              Multi
              <br />
              Language
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-graph-up text-4xl" />
            <span className="text-center font-bold">
              Code
              <br />
              Configuration
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-gear text-4xl" />
            <span className="text-center font-bold">
              Workflow
              <br />
              Automation
            </span>
          </div>
          <div className="box-content flex w-full max-w-[100px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8">
            <i className="bi bi-code-square text-4xl" />
            <span className="text-center font-bold">
              API
              <br />
              Integration
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
