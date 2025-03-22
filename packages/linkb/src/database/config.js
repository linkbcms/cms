const localConfig = {};

const prodConfig = {};

const defineConfig = (config) => config;

const fields = {
  customCollection: (config) => config,
  collection: (config) => config,
  singleton: (config) => config,
  text: (config) => config,
  image: (config) => config,
  group: (config, layout) => config,
  reference: (config) => config,
  array: (config) => config,
  custom: (config) => config,
};

module.exports = defineConfig({
  ui: {
    navigation: {
      blogs: ["blogs"],
    },
    logo: () => "Logo",
    name: "CMS2",
    theme: {
      defaultTheme: "system",
      storageKey: "vite-ui-theme",
    },
  },

  collections: {
    custom: fields.customCollection({
      Component: () => "Custom",
    }),

    blogs: fields.collection({
      label: "Blogs",
      fieldSlug: "title",
      i18n: {
        locales: ["en", "id"],
        defaultLocale: "en",
      },

      canCreate: false,
      canDelete: false,
      canUpdate: false,
      canRead: false,

      schema: {
        title: fields.text({
          label: "Title",
          required: true,
          multiline: true,
          i18n: {
            id: "Judul",
          },
          db: false,
        }),
        slug: fields.text({ name: "slug", label: "Slug" }),
        description: fields.text({ name: "description", label: "Description" }),
        content: fields.text({ name: "content", label: "Content" }),
        image: fields.image({ name: "image", label: "Image" }),
        date: fields.text({ name: "date", label: "Date", hidden: true }),
        custom: fields.custom({
          Component: () => "Custom",
        }),
        author: fields.array(
          fields.reference({
            name: "author",
            label: "Author",
            collection: "authors",
          })
        ),
      },
    }),

    authors: fields.collection({
      label: "Authors",
      schema: {
        name: fields.text({ name: "name", label: "Name" }),
      },
    }),

    settings: fields.singleton({
      label: "Settings",
      schema: {
        title: fields.text({ name: "title", label: "Title" }),
        navigation: fields.group(
          {
            schema: {
              title: fields.text({ name: "title", label: "Title" }),
              slug: fields.text({ name: "slug", label: "Slug" }),
            },
          },
          {
            layout: [6, 6],
          }
        ),
        description: fields.text({ name: "description", label: "Description" }),
      },
    }),
  },

  db: {
    provider: "supabase",
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    timezone: "Asia/Jakarta",
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en", "id"],
  },

  hook: {
    onInit: async ({ config, req }) => {
      console.log("onInit", config, req);
      if (config.collections.blogs) {
      }
    },
    onUpdate: async ({ config }) => {
      console.log("onUpdate", config);
    },
    onDelete: async ({ config }) => {
      console.log("onDelete", config);
    },
  },

  auth: {
    providers: [
      {
        provider: "local",
      },
      {
        provider: "google",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      {
        provider: "github",
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    ],
  },

  baseUrl: "/cms",

  cors: "*",

  plugins: [
    (config) => {
      if (config.auth.providers.length === 0) {
        config.auth.providers.push({
          provider: "local",
        });
      }
    },
  ],
}); 