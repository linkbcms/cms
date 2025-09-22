import { defineConfig, fields } from '@linkbcms/core';

export default defineConfig({
  ui: {
    logo: () => <img alt="logo" height={32} src="/logo.png" width={32} />,
  },

  collections: {
    custom: fields.customCollection({
      // Component: createSafeComponent(BrokenImage),
      label: 'Custom',
      Component: () => <div className="p-10">test</div>,
    }),

    blogs: fields.collection({
      label: 'Blogs',
      fieldSlug: 'title',

      schema: {
        title: fields.text({
          label: 'Title',
          validation: {
            required: true,
          },
        }),
        order: fields.number({
          label: 'Order',
          validation: {
            required: true,
          },
        }),
        status: fields.select({
          label: 'Status',
          validation: {
            required: true,
          },
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' },
          ],
        }),

        slug: fields.text({ name: 'slug', label: 'Slug' }),
        content: fields.text({ name: 'content', label: 'Content' }),
      },
    }),

    authors: fields.collection({
      label: 'Authors',
      schema: {
        name: fields.text({ name: 'name', label: 'Name' }),
      },
      fieldSlug: 'name',
    }),
  },

  db: {
    provider: 'supabase',
    timezone: 'Asia/Jakarta',
  },

  // hook: {
  //   onInit: async ({ config, req }) => {
  //     console.log('onInit', config, req);
  //     if (config.collections.blogs) {
  //     }
  //   },
  //   onUpdate: async ({ config }) => {
  //     console.log('onUpdate', config);
  //   },
  //   onDelete: async ({ config }) => {
  //     console.log('onDelete', config);
  //   },
  // },

  baseUrl: '/cms',
});
