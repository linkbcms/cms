import type { JSX, ReactElement } from 'react';

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

export type NavigationItem = {
  name: string;
  url: string;
  icon?: ReactElement;
  children?: NavigationItem[];
};

export type Theme = 'light' | 'dark' | 'system';

export type UIConfig = {
  name?: string;
  logo?: (props: any) => JSX.Element; // Remove string from the type, only allow function
  theme?: {
    defaultTheme?: Theme;
    storageKey?: string;
  };
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
export type Config<Collections extends CollectionsMap = CollectionsMap> = {
  /** Collection configurations */
  collections?: Collections;
  collectionsArray?: (
    | Collection<Record<string, CollectionConfig>, string>
    | Singleton<Record<string, SingletonConfig>>
    | CustomCollectionConfig
  )[];
  /** UI configuration options */
  ui?: UIConfig;
  /** Database configuration */
  db?: Record<string, any>;
  /** Base URL for the CMS */
  baseUrl?: string;
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
  config: Config<Collections>
): Config<Collections> => config;

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
type TextField = {
  /** Type of the field */
  type: 'text';
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
  /** Whether the field is stored in the database */
  db?: boolean;
  /** Validation rules for the field */
  validation?: {
    /** Whether the field is required */
    required?: boolean;
    /** Minimum length of the text */
    minLength?: number;
    /** Maximum length of the text */
    maxLength?: number;
    /** Regular expression pattern the text must match */
    pattern?: RegExp;
    /** Custom validation function */
    validate?: (value: string) => boolean | string;
  };
};

/**
 * Interface for number field configuration
 * @example
 * ```ts
 * const priceField: NumberField = {
 *   label: 'Price',
 *   required: true,
 *   validation: {
 *     min: 0,
 *     max: 1000
 *   }
 * }
 * ```
 */
type NumberField = {
  /** Type of the field */
  type: 'number';
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
  /** Whether the field is stored in the database */
  db?: boolean;
  /** Validation rules for the field */
  validation?: {
    /** Whether the field is required */
    required?: boolean;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Custom validation function */
    validate?: (value: number) => boolean | string;
  };
};

/**
 * Interface for select field configuration
 * @example
 * ```ts
 * const statusField: SelectField = {
 *   label: 'Status',
 *   options: ['Draft', 'Published', 'Archived'],
 *   required: true
 * }
 * ```
 */
type SelectField = {
  /** Type of the field */
  type: 'select';
  /** Display label for the field */
  label: string;
  /** Field name */
  name?: string;
  /** Whether the field is stored in the database */
  db?: boolean;
  /** Available options for selection */
  options: {
    /** Value of the option. This data will be stored. */
    value: string;
    /** Label of the option. This data will be displayed in the UI. */
    label: string;
  }[];
  /** Validation rules for the field */
  validation?: {
    /** Whether the field is required */
    required?: boolean;
    /** Custom validation function */
    validate?: (value: string) => boolean | string;
  };
};

/**
 * Configuration interface for collections
 * @example
 * ```ts
 * const blogConfig: CollectionConfig = {
 *   label: 'Blog Posts',
 *   fieldSlug: 'title',
 *   schema: {
 *     title: fields.text({ label: 'Title' }),
 *     content: fields.text({ label: 'Content' })
 *   }
 * }
 * ```
 */
export type CollectionConfig = {
  /** Type of the collection */
  type: 'collection';
  /** Display label for the collection */
  label: string;
  /** Field to use as the slug/identifier */
  fieldSlug: string;
  /** Schema definition for the collection */
  schema: Record<string, any>;
};

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
export type SingletonConfig = {
  /** Type of the collection */
  type: 'singleton';
  /** Display label for the singleton */
  label: string;
  /** Schema definition for the singleton */
  schema: Record<string, any>;
};

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
export type CustomCollectionConfig = {
  /** React component to render the custom collection */
  Component: () => JSX.Element;
  /** Display label for the custom collection */
  label: string;

  /** Type of the collection */
  type: 'customCollection';
};

/**
 * Field configuration helpers
 * @example
 * ```ts
 * const blogSchema = {
 *   title: fields.text({
 *     label: 'Title',
 *     required: true
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
    label: string;
    Component: () => ReactElement;
  }): CustomCollectionConfig => ({ ...config, type: 'customCollection' }),

  /**
   * Creates a collection configuration
   * @param config - Collection configuration
   */
  collection: (config: Omit<CollectionConfig, 'type'>): CollectionConfig => ({
    ...config,
    type: 'collection',
  }),

  /**
   * Creates a singleton configuration
   * @param config - Singleton configuration
   */
  singleton: (config: Omit<SingletonConfig, 'type'>): SingletonConfig => ({
    ...config,
    type: 'singleton',
  }),

  /**
   * Creates a text field configuration
   * @param config - Text field configuration
   */
  text: (config: Omit<TextField, 'type'>): TextField => ({
    ...config,
    type: 'text',
  }),

  /**
   * Creates a number field configuration
   * @param config - Number field configuration
   */
  number: (config: Omit<NumberField, 'type'>): NumberField => ({
    ...config,
    type: 'number',
  }),

  /**
   * Creates a select field configuration
   * @param config - Select field configuration
   */
  select: (config: Omit<SelectField, 'type'>): SelectField => ({
    ...config,
    type: 'select',
  }),
};

/**
 * Union type for all possible collection types
 */
export type CollectionType =
  | CollectionConfig
  | SingletonConfig
  | CustomCollectionConfig;
