CREATE TABLE "embedding" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
