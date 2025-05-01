import { defineConfig, fields } from '@linkbcms/core';

export default defineConfig({
  ui: {
    logo: () => <img src="/logo.png" alt="logo" width={32} height={32} />,
  },

  collections: {
    custom: fields.customCollection({
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

    settings: fields.singleton({
      label: 'Settings',
      schema: {
        title: fields.text({ name: 'title', label: 'Title' }),
        description: fields.text({ name: 'description', label: 'Description' }),
        number: fields.number({ name: 'number', label: 'Number' }),
        select: fields.select({
          name: 'select',
          label: 'Select',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        }),
      },
    }),

    settings2: fields.singleton({
      label: 'Settings 2',
      schema: {
        title: fields.text({ name: 'title', label: 'Title' }),
        description: fields.text({ name: 'description', label: 'Description' }),
      },
    }),
  },

  db: {
    provider: 'supabase',
    timezone: 'Asia/Jakarta',
  },
});
