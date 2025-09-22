/**
 * This file re-exports all types and utilities from drizzle-orm
 * so users don't need to import directly from drizzle-orm
 */

// Re-export core functionality from drizzle-orm
export {
  InferModel,
  // Type utilities
  Placeholder,
  SQL,
  // Query building
  SQLWrapper,
  // SQL builder
  sql,
} from 'drizzle-orm';

// Re-export specifically from PostgreSQL package
export {
  AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  numeric,
  PgColumn,
  PgTable,
  pgEnum,
  pgTable,
  pgTableCreator,
  real,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Re-export from drizzle-orm/mysql-core
// export * from 'drizzle-orm/mysql-core';

// Re-export from drizzle-orm/sqlite-core
// export * from 'drizzle-orm/sqlite-core';

// Re-export commonly used operators and utilities
export {
  and,
  asc,
  avg,
  between,
  // Aggregate functions
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  max,
  min,
  ne,
  not,
  notBetween,
  notIlike,
  notInArray,
  notLike,
  or,
  sum,
} from 'drizzle-orm';
