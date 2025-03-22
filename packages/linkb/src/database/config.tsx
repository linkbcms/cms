// import { defineConfig, fields } from 'cms';

const defineConfig = (config: any) => config;

// Define more specific field types
interface TextField {
  label: string;
  name?: string;
  required?: boolean;
  multiline?: boolean;
  hidden?: boolean;
  i18n?: Record<string, string>;
  db?: boolean;
}

interface ImageField {
  label: string;
  name?: string;
}

interface ReferenceField {
  label: string;
  name?: string;
  collection: string;
}

interface CustomField {
  Component: () => any;
}

// Define more specific collection types before field functions
interface CollectionConfig {
  label: string;
  fieldSlug?: string;
  i18n?: {
    locales: string[];
    defaultLocale: string;
  };
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdate?: boolean;
  canRead?: boolean;
  schema: Record<string, any>;
}

interface SingletonConfig {
  label: string;
  schema: Record<string, any>;
}

interface CustomCollectionConfig {
  Component: () => any;
}

// Define field functions with proper return types - with specific return types
const fields = {
  // Each field function returns a specific, clearly defined type
  customCollection: (config: {
    Component: () => any;
  }): CustomCollectionConfig => ({ ...config }),
  collection: (config: CollectionConfig): CollectionConfig => ({ ...config }),
  singleton: (config: SingletonConfig): SingletonConfig => ({ ...config }),
  text: (config: TextField): TextField => ({ ...config }),
  image: (config: ImageField): ImageField => ({ ...config }),
  group: (config: any): any => ({ ...config }),
  reference: (config: ReferenceField): ReferenceField => ({ ...config }),
  array: (config: any): any[] => [config],
  custom: (config: CustomField): CustomField => ({ ...config }),
};

// Define the base collections interface
type CollectionType =
  | CollectionConfig
  | SingletonConfig
  | CustomCollectionConfig;

// Define the configuration object
const configObject = {
  ui: {
    navigation: {
      blogs: ["blogs"],
    },
    logo: () => <img src="/logo.png" alt="logo" width={32} height={32} />,
    name: "CMS2",
    theme: {
      defaultTheme: "system",
      storageKey: "vite-ui-theme",
    },
  },

  collections: {
    custom: fields.customCollection({
      Component: () => <div>Custom</div>,
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
          Component: () => <div>Custom</div>,
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
      fieldSlug: "name",
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
    onInit: async ({ config, req }: { config: any; req: any }) => {
      console.log("onInit", config, req);
      if (config.collections.blogs) {
      }
    },
    onUpdate: async ({ config }: { config: any }) => {
      console.log("onUpdate", config);
    },
    onDelete: async ({ config }: { config: any }) => {
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
    (config: any) => {
      if (config.auth.providers.length === 0) {
        config.auth.providers.push({
          provider: "local",
        });
      }
    },
  ],
};

// Extract collection types directly from the config using TypeScript inference
type Config = typeof configObject;
type CollectionsLiteral = Config["collections"];

// Determine collection type based purely on function return type
type GetCollectionType<T> = T;

// Fully dynamic collection map that uses function return types
type DynamicCollections = {
  [K in keyof CollectionsLiteral]: GetCollectionType<CollectionsLiteral[K]>;
} & {
  [key: string]: CollectionType;
};

// Define our full interface with dynamic typing for collections
interface IProps {
  ui: Record<string, any>;
  collections: DynamicCollections;
  db: Record<string, any>;
  i18n: Record<string, any>;
  hook: Record<string, any>;
  auth: Record<string, any>;
  baseUrl: string;
  cors: string;
  plugins: Array<(config: any) => void>;
}

// Export with the proper type assertion
export default defineConfig(configObject) as IProps;
