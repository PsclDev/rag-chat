CREATE TABLE "embedding" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE CASCADE ON UPDATE no action;