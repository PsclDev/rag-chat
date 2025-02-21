CREATE TABLE "file_status" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"step" text DEFAULT 'queued' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"failed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_status_file_id_step_unique" UNIQUE("file_id","step")
);
--> statement-breakpoint
ALTER TABLE "file_status" ADD CONSTRAINT "file_status_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE CASCADE ON UPDATE no action;