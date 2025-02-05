import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const File = pgTable('file', {
  id: text('id').primaryKey(),
  fieldname: text('fieldname').notNull(),
  originalname: text('originalname').notNull(),
  encoding: text('encoding').notNull(),
  mimetype: text('mimetype').notNull(),
  filename: text('filename').notNull(),
  path: text('path').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
