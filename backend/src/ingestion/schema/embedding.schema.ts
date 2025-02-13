import { pgTable, serial, text, timestamp, vector } from 'drizzle-orm/pg-core';

export const Embedding = pgTable('embedding', {
  id: serial('id').primaryKey(),
  fileId: text('file_id').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EmbeddingEntity = typeof Embedding.$inferSelect;
