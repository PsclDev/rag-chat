import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { FileDto } from 'files/dto/file.dto';

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

export type FileEntity = typeof File.$inferSelect;

export function toDto(entity: FileEntity): FileDto {
  return {
    id: entity.id,
    originalname: entity.originalname,
    mimetype: entity.mimetype,
    filename: entity.filename,
    size: entity.size,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
