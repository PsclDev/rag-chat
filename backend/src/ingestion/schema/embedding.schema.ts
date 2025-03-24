import { pgTable, serial, text, timestamp, vector } from 'drizzle-orm/pg-core';

import { File } from '../../files/schema/file.schema';

export const Embedding = pgTable('embedding', {
  id: serial('id').primaryKey(),
  documentId: text('document_id')
    .notNull()
    .references(() => File.id, { onDelete: 'cascade' }),
  fileId: text('file_id')
    .notNull()
    .references(() => File.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  keywords: text('keywords').array(),
  embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EmbeddingEntity = typeof Embedding.$inferSelect;
