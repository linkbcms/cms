
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
      
      async function run() {
        try {
          const { register } = require('tsx/cjs');
          register();
          const config = require('/Users/vincent/Bootcamp/code/cms/cms/packages/linkb/dist/src/sample/cms.config.tsx').default;
          console.log(JSON.stringify(config));
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      }
      
      run();
      