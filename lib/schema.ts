import { pgTable, text, timestamp, integer, uuid, unique, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  clerkId: text('clerk_id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  githubInstallationId: text('github_installation_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const readingProgress = pgTable('reading_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  repoFullName: text('repo_full_name').notNull(),
  filePath: text('file_path').notNull(),
  scrollPercentage: integer('scroll_percentage').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  unique('reading_progress_unique_idx').on(t.clerkId, t.repoFullName, t.filePath)
]);

export const highlights = pgTable('highlights', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  repoFullName: text('repo_full_name').notNull(),
  filePath: text('file_path').notNull(),
  text: text('text').notNull(),
  color: text('color').notNull(),
  serializedRange: text('serialized_range').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('highlights_clerk_repo_file_idx').on(t.clerkId, t.repoFullName, t.filePath)
]);

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  repoFullName: text('repo_full_name').notNull(),
  filePath: text('file_path').notNull(),
  scrollPercentage: integer('scroll_percentage').notNull(),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('bookmarks_clerk_repo_file_idx').on(t.clerkId, t.repoFullName, t.filePath)
]);

export const likedDocuments = pgTable('liked_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  repoFullName: text('repo_full_name').notNull(),
  filePath: text('file_path').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique('liked_documents_unique_idx').on(t.clerkId, t.repoFullName, t.filePath)
]);
