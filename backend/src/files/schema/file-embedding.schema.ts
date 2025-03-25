import { pgTable, text, timestamp, vector } from 'drizzle-orm/pg-core';

import { File } from './file.schema';
import { generateId } from '../../shared/helpers/generateId';

export const FileEmbedding = pgTable('file_embedding', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId()),
  documentId: text('document_id')
    .notNull()
    .references(() => File.id, { onDelete: 'cascade' }),
  fileId: text('file_id')
    .notNull()
    .references(() => File.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  keywords: text('keywords').array(),
  vector: vector('vector', { dimensions: 1024 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FileEmbeddingEntity = typeof FileEmbedding.$inferSelect;
