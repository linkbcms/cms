/// <reference types="@rsbuild/core/types" />

declare namespace NodeJS {
  type ProcessEnv = {
    // process.env.PUBLIC_FOO
    PUBLIC_FOO: string;
  };
}
