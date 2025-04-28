/**
 * This file re-exports all types and utilities from drizzle-orm
 * so users don't need to import directly from drizzle-orm
 */

// Re-export core functionality from drizzle-orm
export {
  // SQL builder
  sql,
  SQL,
  // Query building
  SQLWrapper,
  // Type utilities
  Placeholder,
  InferModel,
} from 'drizzle-orm';

// Re-export specifically from PostgreSQL package
export {
  pgTable,
  pgTableCreator,
  pgEnum,
  text,
  varchar,
  integer,
  bigint,
  serial,
  bigserial,
  timestamp,
  boolean,
  jsonb,
  json,
  uuid,
  date,
  time,
  numeric,
  real,
  doublePrecision,
  PgColumn,
  PgTable,
  AnyPgColumn,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';

// Re-export from drizzle-orm/mysql-core
// export * from 'drizzle-orm/mysql-core';

// Re-export from drizzle-orm/sqlite-core
// export * from 'drizzle-orm/sqlite-core';

// Re-export commonly used operators and utilities
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  between,
  notBetween,
  like,
  notLike,
  ilike,
  notIlike,
  and,
  or,
  not,
  asc,
  desc,
  // Aggregate functions
  count,
  sum,
  avg,
  min,
  max,
} from 'drizzle-orm';
