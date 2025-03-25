CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"originalname" text NOT NULL,
	"mimetype" text NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_status" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"step" text DEFAULT 'queued' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"failed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_status_document_id_step_unique" UNIQUE("document_id","step")
);
--> statement-breakpoint
CREATE TABLE "document_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"node_id" varchar(8),
	"is_processing" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"enqueued_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "file_embedding" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"file_id" text NOT NULL,
	"content" text NOT NULL,
	"keywords" text[],
	"vector" vector(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"author" text NOT NULL,
	"content" text NOT NULL,
	"written_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_status" ADD CONSTRAINT "document_status_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_queue" ADD CONSTRAINT "document_queue_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_embedding" ADD CONSTRAINT "file_embedding_document_id_file_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_embedding" ADD CONSTRAINT "file_embedding_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;