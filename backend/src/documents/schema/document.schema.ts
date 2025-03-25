import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { DocumentDto } from '@documents/dto/document.dto';
import { File, FileEntity, toFileDto } from '@file/schema/file.schema';
import { generateId } from '../../shared/helpers/generateId';

import {
  DocumentStatus,
  DocumentStatusEntity,
  toDocumentStatusDto,
} from './document-status.schema';

export const Document = pgTable('document', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  fileId: text('file_id')
    .notNull()
    .references(() => File.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const DocumentRelations = relations(Document, ({ many, one }) => ({
  status: many(DocumentStatus),
  file: one(File, {
    fields: [Document.fileId],
    references: [File.id],
  }),
  attachments: many(File),
}));

export type DocumentEntity = typeof Document.$inferSelect & {
  status: DocumentStatusEntity[];
  file: FileEntity;
  attachments: FileEntity[];
};

export function toDocumentDto(entity: DocumentEntity): DocumentDto {
  return {
    id: entity.id,
    file: toFileDto(entity.file),
    status: entity.status.map(toDocumentStatusDto),
    attachments: entity.attachments.map(toFileDto),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
