/// <reference types="@rsbuild/core/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    // process.env.PUBLIC_FOO
    PUBLIC_FOO: string;
  }
}
