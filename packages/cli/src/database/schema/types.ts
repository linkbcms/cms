export interface I18nField {
  id: string;
  [key: string]: string;
}

export interface BaseFieldDefinition {
  name?: string;
  label: string;
  required?: boolean;
  i18n?: I18nField;
}

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

export interface Schema {
  [fieldKey: string]: SchemaField;
}

export interface SchemaDefinition {
  schema: Schema;
  [key: string]: any;
} 