"use client";

// app/test-server/page.tsx
import React from "react";
import config from "../../cms.config";
import { ClientOnly } from "@/app/broken-components";
// import { ClientResult } from './client-result';

// This is a Server Component
export default function TestServerPage() {
  // In a Server Component, createSafeComponent should return null components
  // that don't throw errors when called

  // Test all the broken components by calling them
  const BrokenLogoResult = config;
  // const brokenBrowserResult = config.ui.brokenBrowser();
  // const brokenInitResult = config.ui.brokenInit();
  // const brokenUndefinedResult = config.ui.brokenUndefined();

  return (
    <div className="test-page">
      <h1>Testing Broken Components on Server</h1>

      <h2>Server Component Results</h2>
      <div>
        {/* <p>Config name: {config.ui.name}</p> */}
        <p>
          Broken Logo Result:{" "}
          {/* {brokenLogoResult === null ? 'null (good)' : 'rendered (bad)'} */}
        </p>
        {/* <p>
          Broken Browser API Result:{' '}
          {brokenBrowserResult === null ? 'null (good)' : 'rendered (bad)'}
        </p>
        <p>
          Broken Init Result:{' '}
          {brokenInitResult === null ? 'null (good)' : 'rendered (bad)'}
        </p>
        <p>
          Broken Undefined Result:{' '}
          {brokenUndefinedResult === null ? 'null (good)' : 'rendered (bad)'}
        </p> */}
      </div>

      <hr />

      {/* This will test the same components on the client side */}
      {/* <ClientResult /> */}
    </div>
  );
}
