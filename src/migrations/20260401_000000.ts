import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`status\` text DEFAULT 'draft' NOT NULL,
    \`published_at\` text,
    \`category\` text,
    \`excerpt\` text,
    \`cover_image_id\` integer,
    \`content\` text,
    \`author\` text DEFAULT 'Andrii Dyshkantiuk',
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)

  await db.run(sql`CREATE UNIQUE INDEX \`news_slug_idx\` ON \`news\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`news_status_idx\` ON \`news\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`news_published_at_idx\` ON \`news\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`news_updated_at_idx\` ON \`news\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_created_at_idx\` ON \`news\` (\`created_at\`);`)

  // Add news_id to payload_locked_documents_rels
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`news_id\` integer REFERENCES \`news\`(\`id\`) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // SQLite doesn't support DROP COLUMN, so we recreate the table
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_news_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_slug_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_status_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_published_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_created_at_idx\`;`)
  await db.run(sql`DROP TABLE \`news\`;`)
}
