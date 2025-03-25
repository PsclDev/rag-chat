import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

import {
  DocumentStatusDto,
  DocumentStatusStep,
} from '@documents/dto/document.dto';
import { generateId } from '../../shared/helpers/generateId';

import { Document } from '../../documents/schema/document.schema';

export const DocumentStatus = pgTable(
  'document_status',
  {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
    documentId: text('document_id')
      .notNull()
      .references(() => Document.id, { onDelete: 'cascade' }),
    step: text('step', {
      enum: ['queued', 'processing', 'completed', 'failed'],
    })
      .notNull()
      .default(DocumentStatusStep.QUEUED),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    failed: boolean('failed').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.documentId, t.step)],
);

export const DocumentStatusRelations = relations(DocumentStatus, ({ one }) => ({
  document: one(Document, {
    fields: [DocumentStatus.documentId],
    references: [Document.id],
  }),
}));

export type DocumentStatusEntity = typeof DocumentStatus.$inferSelect;

export function toDocumentStatusDto(
  entity: DocumentStatusEntity,
): DocumentStatusDto {
  return {
    step: entity.step as DocumentStatusStep,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    failed: !!entity.failed,
  };
}
