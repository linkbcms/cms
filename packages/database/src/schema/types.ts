export type I18nField = {
  id: string;
  [key: string]: string;
};

export type BaseFieldDefinition = {
  name?: string;
  label: string;
  required?: boolean;
  i18n?: I18nField;
};

export interface TextField extends BaseFieldDefinition {
  type?: 'text'; // default type
  multiline?: boolean;
}

export interface RelationField extends BaseFieldDefinition {
  collection: string;
  db?: boolean;
}

export interface SchemaField extends BaseFieldDefinition {
  type?: string;
  multiline?: boolean;
  collection?: string;
  db?: boolean;
  [key: string]: any;
}

export type Schema = {
  [fieldKey: string]: SchemaField;
};

export type SchemaDefinition = {
  schema: Schema;
  [key: string]: any;
};
