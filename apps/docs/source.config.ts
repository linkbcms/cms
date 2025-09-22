import { remarkInstall } from 'fumadocs-docgen';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

// Options: https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: [
      [
        remarkInstall,
        {
          persist: {
            id: 'package-manager',
          },
        },
      ],
    ],
  },
});
