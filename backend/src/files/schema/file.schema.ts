import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { FileDto } from 'files/dto/file.dto';

import {
  FileStatus,
  FileStatusEntity,
  toFileStatusDto,
} from './file-status.schema';

export const File = pgTable('file', {
  id: text('id').primaryKey(),
  originalname: text('originalname').notNull(),
  mimetype: text('mimetype').notNull(),
  filename: text('filename').notNull(),
  path: text('path').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const FileRelations = relations(File, ({ many }) => ({
  status: many(FileStatus),
}));

export type FileEntity = typeof File.$inferSelect & {
  status?: FileStatusEntity[];
};

export function toFileDto(entity: FileEntity): FileDto {
  return {
    id: entity.id,
    originalname: entity.originalname,
    mimetype: entity.mimetype,
    filename: entity.filename,
    size: entity.size,
    status: entity.status?.map(toFileStatusDto) || [],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
