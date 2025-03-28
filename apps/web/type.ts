// import { defineConfig, fields } from 'cms';

import type { ReactElement, ReactNode } from 'react';

/**
 * Collection configuration type that defines the schema and structure of a collection
 * @template Schema - Schema type that extends Record with CollectionType values
 * @template SlugField - Field to use as the slug/identifier
 * @example
 * ```ts
 * type BlogSchema = {
 *   title: TextField
 *   content: TextField
 *   author: ReferenceField
 * }
 *
 * const blogCollection: Collection<BlogSchema, 'title'> = {
 *   label: 'Blog Posts',
 *   fieldSlug: 'title',
 *   schema: {
 *     title: { label: 'Title', required: true },
 *     content: { label: 'Content', multiline: true },
 *     author: { label: 'Author', collection: 'authors' }
 *   }
 * }
 * ```
 */
export type Collection<
  Schema extends Record<string, CollectionType>,
  SlugField extends string,
> = {
  /** Display label for the collection */
  label?: string;
  /** Field to use as the slug/identifier */
  fieldSlug?: SlugField;
  /** Schema definition for the collection's fields */
  schema?: Schema;
};

/**
 * Configuration type for singleton collections that have only one entry
 * @template Schema - Schema type that extends Record with CollectionType values
 * @example
 * ```ts
 * type SettingsSchema = {
 *   siteName: TextField
 *   logo: ImageField
 * }
 *
 * const settings: Singleton<SettingsSchema> = {
 *   label: 'Site Settings',
 *   schema: {
 *     siteName: { label: 'Site Name' },
 *     logo: { label: 'Site Logo' }
 *   }
 * }
 * ```
 */
export type Singleton<Schema extends Record<string, CollectionType>> = {
  /** Display label for the singleton */
  label?: string;
  /** Schema definition for the singleton's fields */
  schema?: Schema;
};

/**
 * Map of collections with their configuration
 * @template Collections - Collections configuration mapping collection names to their configs
 */
export type CollectionsMap = {
  /** Schema definition for the singleton's fields */
  [key: string]:
    | Collection<Record<string, CollectionConfig>, string>
    | Singleton<Record<string, SingletonConfig>>
    | CustomCollectionConfig;
};

/**
 * Main configuration type for the CMS
 * @template Collections - Collections configuration mapping collection names to their configs
 * @example
 * ```ts
 * const config: Config<{
 *   blogs: Collection<BlogSchema, 'title'>
 *   settings: Singleton<SettingsSchema>
 *   custom: CustomCollectionConfig
 * }> = {
 *   collections: {
 *     blogs: blogCollection,
 *     settings: settings,
 *     custom: { Component: CustomComponent }
 *   },
 *   ui: {
 *     theme: 'light',
 *     logo: '/logo.png'
 *   },
 *   db: {
 *     type: 'postgres',
 *     url: process.env.DATABASE_URL
 *   }
 * }
 * ```
 */
export type Config<Collections extends CollectionsMap> = {
  /** Collection configurations */
  collections?: Collections;
  collectionsArray?: (
    | Collection<Record<string, CollectionConfig>, string>
    | Singleton<Record<string, SingletonConfig>>
    | CustomCollectionConfig
  )[];
  /** UI configuration options */
  ui?: Record<string, any>;
  /** Database configuration */
  db?: Record<string, any>;
  /** Internationalization configuration */
  i18n?: Record<string, any>;
  /** Hook configuration for lifecycle events */
  hook?: Record<string, any>;
  /** Authentication configuration */
  auth?: Record<string, any>;
  /** Base URL for the CMS */
  baseUrl?: string;
  /** CORS configuration */
  cors?: string;
  /** Plugin configuration array */
  plugins?: Array<(config: any) => void>;
};

/**
 * Helper function to define the CMS configuration with proper typing
 * @typeParam Collections - Collections configuration mapping collection names to their configs
 * @param {Config<Collections>} config - The CMS configuration object
 * @returns The typed configuration object
 * @example
 * ```ts
 * const config = defineConfig({
 *   collections: {
 *     blogs: {
 *       label: 'Blog Posts',
 *       fieldSlug: 'title',
 *       schema: {
 *         title: fields.text({ label: 'Title' }),
 *         content: fields.text({ label: 'Content', multiline: true })
 *       }
 *     }
 *   },
 *   ui: {
 *     theme: 'dark'
 *   }
 * })
 * ```
 */
export const defineConfig = <Collections extends CollectionsMap>(
  config: Config<Collections>,
) => {
  // Recursively sanitize an object to make it serializable
  const sanitizeValue = (value: any): any => {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle functions by converting to null
    if (typeof value === 'function') {
      return null;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    // Handle objects
    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)]),
      );
    }

    // Return primitive values as-is
    return value;
  };

  // Create a sanitized copy of the config
  const sanitizedConfig = sanitizeValue(config);

  return sanitizedConfig;
};

/**
 * Interface for text field configuration
 * @example
 * ```ts
 * const titleField: TextField = {
 *   label: 'Title',
 *   required: true,
 *   multiline: false,
 *   i18n: {
 *     es: 'Título',
 *     fr: 'Titre'
 *   }
 * }
 * ```
 */
interface TextField {
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field supports multiple lines */
  multiline?: boolean;
  /** Whether the field is hidden in the UI */
  hidden?: boolean;
  /** Internationalization options for the field */
  i18n?: Record<string, string>;
  /** Whether the field is stored in the database */
  db?: boolean;
}

/**
 * Interface for image field configuration
 * @example
 * ```ts
 * const imageField: ImageField = {
 *   label: 'Featured Image',
 *   name: 'featuredImage'
 * }
 * ```
 */
interface ImageField {
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
}

/**
 * Interface for reference field configuration
 * @example
 * ```ts
 * const authorField: ReferenceField = {
 *   label: 'Author',
 *   name: 'author',
 *   collection: 'authors'
 * }
 * ```
 */
interface ReferenceField {
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
  /** Referenced collection name */
  collection: string;
}

/**
 * Interface for custom field configuration
 * @example
 * ```ts
 * const CustomComponent = () => <div>Custom Field</div>
 *
 * const customField: CustomField = {
 *   Component: CustomComponent
 * }
 * ```
 */
interface CustomField {
  /** React component to render the custom field */
  Component: () => ReactElement;
}

/**
 * Configuration interface for collections
 * @example
 * ```ts
 * const blogConfig: CollectionConfig = {
 *   label: 'Blog Posts',
 *   fieldSlug: 'title',
 *   i18n: {
 *     locales: ['en', 'es'],
 *     defaultLocale: 'en'
 *   },
 *   canCreate: true,
 *   canDelete: true,
 *   schema: {
 *     title: fields.text({ label: 'Title' }),
 *     content: fields.text({ label: 'Content' })
 *   }
 * }
 * ```
 */
export interface CollectionConfig {
  /** Display label for the collection */
  label: string;
  /** Field to use as the slug/identifier */
  fieldSlug: string;
  /** Internationalization settings */
  i18n?: {
    /** Available locales */
    locales: string[];
    /** Default locale */
    defaultLocale: string;
  };
  /** Whether items can be created */
  canCreate?: boolean;
  /** Whether items can be deleted */
  canDelete?: boolean;
  /** Whether items can be updated */
  canUpdate?: boolean;
  /** Whether items can be read */
  canRead?: boolean;
  /** Schema definition for the collection */
  schema: Record<string, any>;
}

/**
 * Configuration interface for singleton collections
 * @example
 * ```ts
 * const settingsConfig: SingletonConfig = {
 *   label: 'Site Settings',
 *   schema: {
 *     siteName: fields.text({ label: 'Site Name' }),
 *     description: fields.text({ label: 'Site Description' })
 *   }
 * }
 * ```
 */
export interface SingletonConfig {
  /** Display label for the singleton */
  label: string;
  /** Schema definition for the singleton */
  schema: Record<string, any>;
}

/**
 * Configuration interface for custom collections
 * @example
 * ```ts
 * const CustomCollectionComponent = () => <div>Custom Collection View</div>
 *
 * const customConfig: CustomCollectionConfig = {
 *   Component: CustomCollectionComponent
 * }
 * ```
 */
export interface CustomCollectionConfig {
  /** React component to render the custom collection */
  Component: () => ReactElement;
}

/**
 * Field configuration helpers
 * @example
 * ```ts
 * const blogSchema = {
 *   title: fields.text({
 *     label: 'Title',
 *     required: true
 *   }),
 *   image: fields.image({
 *     label: 'Featured Image'
 *   }),
 *   author: fields.reference({
 *     label: 'Author',
 *     collection: 'authors'
 *   }),
 *   tags: fields.array(
 *     fields.text({ label: 'Tag' })
 *   ),
 *   customField: fields.custom({
 *     Component: CustomFieldComponent
 *   })
 * }
 * ```
 */
export const fields = {
  /**
   * Creates a custom collection configuration
   * @param config - Custom collection configuration
   */
  customCollection: (config: {
    Component: () => ReactElement;
  }): CustomCollectionConfig => ({ ...config }),

  /**
   * Creates a collection configuration
   * @param config - Collection configuration
   */
  collection: (config: CollectionConfig): CollectionConfig => ({ ...config }),

  /**
   * Creates a singleton configuration
   * @param config - Singleton configuration
   */
  singleton: (config: SingletonConfig): SingletonConfig => ({ ...config }),

  /**
   * Creates a text field configuration
   * @param config - Text field configuration
   */
  text: (config: TextField): TextField => ({ ...config }),

  /**
   * Creates an image field configuration
   * @param config - Image field configuration
   */
  image: (config: ImageField): ImageField => ({ ...config }),

  /**
   * Creates a group field configuration
   * @param config - Group field configuration
   */
  group: (config: any): any => ({ ...config }),

  /**
   * Creates a reference field configuration
   * @param config - Reference field configuration
   */
  reference: (config: ReferenceField): ReferenceField => ({ ...config }),

  /**
   * Creates an array field configuration
   * @param config - Array field configuration
   */
  array: (config: any): any[] => [config],

  /**
   * Creates a custom field configuration
   * @param config - Custom field configuration
   */
  custom: (config: CustomField): CustomField => ({ ...config }),
};

/**
 * Union type for all possible collection types
 */
export type CollectionType =
  | CollectionConfig
  | SingletonConfig
  | CustomCollectionConfig;
