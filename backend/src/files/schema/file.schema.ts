import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  timestamp,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';

import { FileDto } from 'files/dto/file.dto';

import { Document } from '../../documents/schema/document.schema';
import { generateId } from '../../shared/helpers/generateId';

export const File = pgTable('file', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId()),
  documentId: text('document_id').references((): AnyPgColumn => Document.id),
  originalname: text('originalname').notNull(),
  mimetype: text('mimetype').notNull(),
  path: text('path').notNull(),
  size: integer('size').notNull(),
  type: text('type', { enum: ['attachment', 'document'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const FileRelations = relations(File, ({ one }) => ({
  document: one(Document, {
    fields: [File.documentId],
    references: [Document.id],
  }),
}));

export type FileEntity = typeof File.$inferSelect & {};

export function toFileDto(entity: FileEntity): FileDto {
  return {
    id: entity.id,
    originalname: entity.originalname,
    mimetype: entity.mimetype,
    size: entity.size,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
