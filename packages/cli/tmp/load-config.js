import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function run() {
  try {
    const { register } = require('tsx/cjs');
    register();
    const _config =
      require('/Users/vincent/Bootcamp/code/cms/cms/packages/linkb/dist/src/sample/cms.config.tsx').default;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
