CREATE TYPE "public"."inventory_item" AS ENUM('first_aid_kit', 'fire_extinguisher', 'emergency_blanket', 'water_bottles', 'food_rations', 'flashlight', 'radio', 'batteries', 'medical_supplies', 'rescue_equipment');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'in_progress', 'resolved', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('medical', 'fire', 'accident', 'crime', 'natural_disaster', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'volunteer', 'admin');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_name" "inventory_item" NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"center_location" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "report_type" NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;