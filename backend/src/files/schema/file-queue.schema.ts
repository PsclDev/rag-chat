import {
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
} from 'drizzle-orm/pg-core';

import { File } from '@file/schema/file.schema';

export const FileQueue = pgTable('file_queue', {
  id: text('id').primaryKey(),
  fileId: text('file_id')
    .notNull()
    .references(() => File.id, { onDelete: 'cascade' }),
  nodeId: varchar('node_id', { length: 8 }),
  isProcessing: boolean('is_processing').default(false).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  enqueuedAt: timestamp('enqueued_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type FileQueueEntity = typeof FileQueue.$inferSelect;
