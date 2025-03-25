import {
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
} from 'drizzle-orm/pg-core';

import { generateId } from '@shared';

import { Document } from './document.schema';

export const DocumentQueue = pgTable('document_queue', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  documentId: text('document_id')
    .notNull()
    .references(() => Document.id, { onDelete: 'cascade' }),
  nodeId: varchar('node_id', { length: 8 }),
  isProcessing: boolean('is_processing').default(false).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  enqueuedAt: timestamp('enqueued_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type DocumentQueueEntity = typeof DocumentQueue.$inferSelect;
