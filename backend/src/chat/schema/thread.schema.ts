import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { generateId } from '../../shared/helpers/generateId';

import { Message, MessageEntity, toMessageDto } from './message.schema';
import { ThreadDto } from '../dto/thread.dto';

export const Thread = pgTable('thread', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
});

export const ThreadRelations = relations(Thread, ({ many }) => ({
  messages: many(Message),
}));

export type ThreadEntity = typeof Thread.$inferSelect & {
  messages: MessageEntity[];
};

export function toThreadDto(entity: ThreadEntity): ThreadDto {
  return {
    id: entity.id,
    title: entity.title,
    messages: entity.messages.map(toMessageDto),
    messageCount: entity.messages.length,
    createdAt: entity.createdAt,
    lastMessageAt: entity.lastMessageAt,
  };
}
