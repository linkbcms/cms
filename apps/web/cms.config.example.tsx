import { defineConfig, fields } from "cms";

const localConfig = {};

const prodConfig = {};

export default defineConfig({
  ui: {
    navigation: {
      blogs: ["blogs"],
    },
    logo: () => <img src="/logo.png" alt="logo" width={32} height={32} />,
  },

  collections: {
    custom: fields.customCollection({
      Component: () => <div>Custom</div>,
    }),

    blogs: fields.collection({
      label: "Blogs",
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
          name: "title", // If name not specified, it will be the same as key
          label: "Title", // Required
          required: true, //default: false
          i18n: {
            id: "Judul",
          },
          fieldType: "text", //default: "text", selection: "url,number,email,tel,color"
          hidden: true, //default: false
          readonly: false, //default: false
          db: true, //default: true
        }),
        slug: fields.text({
          name: "slug", // If name not specified, it will be the same as key
          label: "Slug",
          required: false, //default: false
          unique: true, //default: false
          slug: {
            source: "title",
            maxLength: 200,
          },
          hidden: true, //default: false
          readonly: true, //default: false
          db: true, //default: true
        }),
        content: fields.textarea({
          name: "content", // If name not specified, it will be the same as key
          label: "Content",
          richText: true, //default: false
          required: true, //default: false
          rows: 10,
          resizable: true, //default: false
          hidden: false, //default: false
          readonly: false, //default: false
          db: true, //default: true
        }),
        isActive: fields.radio({
          name: "is_active", // If name not specified, it will be the same as key
          label: "Is Active?",
          required: true, //default: false
          options: [
            {
              label: "Yes",
              value: true,
            },
            {
              label: "No",
              value: false,
            },
          ], //Options will be ignored if reference is set
          reference: {
            foreignCollection: "<table name>",
            foreignKey: "<table primary key>",
            key: "<current table foreign key>",
          },
          defaultValue: true,
          hidden: false, //default: false
          readonly: false, //default: false
          db: true, //default: true
        }),
        Genre: fields.checkbox({
          name: "genre", // If name not specified, it will be the same as key
          label: "Genre",
          options: [
            {
              label: "Male",
              value: "male",
            },
            {
              label: "Female",
              value: "female",
            },
            {
              label: "Both",
              value: "both",
            },
          ], //Options will be ignored if reference is set
          reference: {
            foreignCollection: "<table name>",
            foreignKey: "<table primary key>",
            key: "<current table foreign key>",
          },
          minSelected: 1,
          maxSelected: 2,
          defaultValue: [], //default: []
          hidden: false, //default: false
          readonly: false, //default: false
          db: true, //default: true
        }),
        image: fields.image({
          name: "image", // If name not specified, it will be the same as key
          label: "Image",
          hidden: false, //default: false
          readonly: false, //default: false
          db: true, //default: true
        }),
        date: fields.date({
          label: "Date",
          min: new Date(),
          max: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          defaultValue: new Date(),
          required: true, //default: false
          hidden: true, //default: false
          readonly: true, //default: false
          db: true, //default: true
        }),
        author: fields.select({
          name: "author",
          label: "Author",
          required: true, //default: false
          hidden: true, //default: false
          readonly: true, //default: false
          db: true, //default: true
          multiple: true, //default: false
          ajax: false, //default: true
          options: [
            {
              label: "Joko",
              value: "joko",
            },
            {
              label: "Aaaa",
              value: "aaaa",
            },
          ], //Options will be ignored if reference is set
          reference: {
            foreignCollection: "authors",
            foreignKey: "id",
            key: "authorId",
          },
        }),
        custom: fields.custom({
          Component: () => <div>Custom</div>,
        }),
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
  },
  timezone: "Asia/Jakarta",
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
