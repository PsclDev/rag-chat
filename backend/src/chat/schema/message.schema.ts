import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { Thread } from './thread.schema';
import { MessageDto } from '../dto/message.dto';

export const Message = pgTable('message', {
  id: text('id').primaryKey(),
  threadId: text('thread_id')
    .notNull()
    .references(() => Thread.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  writtenAt: timestamp('written_at').notNull().defaultNow(),
});

export const ThreadMessageRelations = relations(Message, ({ one }) => ({
  thread: one(Thread, {
    fields: [Message.threadId],
    references: [Thread.id],
  }),
}));

export type MessageEntity = typeof Message.$inferSelect;

export function toMessageDto(entity: MessageEntity): MessageDto {
  return {
    id: entity.id,
    author: entity.author as 'user' | 'assistant',
    content: entity.content,
    writtenAt: entity.writtenAt,
  };
}
