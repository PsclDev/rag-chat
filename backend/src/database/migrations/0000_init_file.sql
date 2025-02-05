CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"fieldname" text NOT NULL,
	"originalname" text NOT NULL,
	"encoding" text NOT NULL,
	"mimetype" text NOT NULL,
	"filename" text NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
