CREATE TABLE "file_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"node_id" varchar(8),
	"is_processing" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"enqueued_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "file_queue" ADD CONSTRAINT "file_queue_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;