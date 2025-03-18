// import { defineConfig, fields } from 'cms';

const localConfig = {};

const prodConfig = {};

const defineConfig = (config: any) => config;

const fields = {
  customCollection: (config: any) => config,
  collection: (config: any) => config,
  singleton: (config: any) => config,
  text: (config: any) => config,
  image: (config: any) => config,
  group: (config: any, layout: any) => config,
  reference: (config: any) => config,
  array: (config: any) => config,
  custom: (config: any) => config,
};

export default defineConfig({
  ui: {
    navigation: {
      blogs: ['blogs'],
    },
    logo: () => <img src="/logo.png" alt="logo" width={32} height={32} />,
  },

  collections: {
    custom: fields.customCollection({
      Component: () => <div>Custom</div>,
    }),

    blogs: fields.collection({
      label: 'Blogs',
      fieldSlug: 'title',
      i18n: {
        locales: ['en', 'id'],
        defaultLocale: 'en',
      },

      canCreate: false,
      canDelete: false,
      canUpdate: false,
      canRead: false,

      schema: {
        title: fields.text({
          label: 'Title',
          required: true,
          multiline: true,
          i18n: {
            id: 'Judul',
          },
          db: false,
        }),
        slug: fields.text({ name: 'slug', label: 'Slug' }),
        description: fields.text({ name: 'description', label: 'Description' }),
        content: fields.text({ name: 'content', label: 'Content' }),
        image: fields.image({ name: 'image', label: 'Image' }),
        date: fields.text({ name: 'date', label: 'Date', hidden: true }),
        custom: fields.custom({
          Component: () => <div>Custom</div>,
        }),
        author: fields.array(
          fields.reference({
            name: 'author',
            label: 'Author',
            collection: 'authors',
          }),
        ),
      },
    }),

    authors: fields.collection({
      label: 'Authors',
      schema: {
        name: fields.text({ name: 'name', label: 'Name' }),
      },
    }),

    settings: fields.singleton({
      label: 'Settings',
      schema: {
        title: fields.text({ name: 'title', label: 'Title' }),
        navigation: fields.group(
          {
            schema: {
              title: fields.text({ name: 'title', label: 'Title' }),
              slug: fields.text({ name: 'slug', label: 'Slug' }),
            },
          },
          {
            layout: [6, 6],
          },
        ),
        description: fields.text({ name: 'description', label: 'Description' }),
      },
    }),
  },

  db: {
    provider: 'supabase',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    timezone: 'Asia/Jakarta',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id'],
  },

  hook: {
    onInit: async ({ config, req }) => {
      console.log('onInit', config, req);
      if (config.collections.blogs) {
      }
    },
    onUpdate: async ({ config }) => {
      console.log('onUpdate', config);
    },
    onDelete: async ({ config }) => {
      console.log('onDelete', config);
    },
  },

  auth: {
    providers: [
      {
        provider: 'local',
      },
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      {
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    ],
  },

  baseUrl: '/cms',

  cors: '*',

  plugins: [
    (config) => {
      if (config.auth.providers.length === 0) {
        config.auth.providers.push({
          provider: 'local',
        });
      }
    },
  ],
});
