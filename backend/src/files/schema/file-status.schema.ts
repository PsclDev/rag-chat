import { FileStatusDto } from '@file/dto/file.dto';
import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

import { File } from './file.schema';

export enum FileStatusStep {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const FileStatus = pgTable(
  'file_status',
  {
    id: text('id').primaryKey(),
    fileId: text('file_id')
      .notNull()
      .references(() => File.id),
    step: text('step', {
      enum: ['queued', 'processing', 'completed', 'failed'],
    })
      .notNull()
      .default(FileStatusStep.QUEUED),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    failed: boolean('failed').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.fileId, t.step)],
);

export const FileStatusRelations = relations(FileStatus, ({ one }) => ({
  file: one(File, {
    fields: [FileStatus.fileId],
    references: [File.id],
  }),
}));

export type FileStatusEntity = typeof FileStatus.$inferSelect;

export function toFileStatusDto(entity: FileStatusEntity): FileStatusDto {
  return {
    step: entity.step as FileStatusStep,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    failed: entity.failed,
  };
}
