CREATE TABLE "fundraising_activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action_type" text NOT NULL,
	"action_details" text,
	"performed_by" text,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundraising_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"foundation_id" text NOT NULL,
	"status" text NOT NULL,
	"requested_amount" integer,
	"project_focus" text,
	"customization_notes" text,
	"contact_date" text,
	"submission_date" text,
	"decision_expected" text,
	"decision_date" text,
	"awarded_amount" integer,
	"funding_period" text,
	"success_factors" text,
	"rejection_reason" text,
	"gesuch_version" text,
	"documents_sent" text,
	"assigned_to" text,
	"priority_level" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundraising_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"foundation_id" text NOT NULL,
	"contact_type" text,
	"contact_value" text NOT NULL,
	"contact_name" text,
	"contact_role" text,
	"validated" boolean DEFAULT false,
	"validation_date" text,
	"is_primary" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundraising_customization_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"foundation_id" text,
	"condition_type" text NOT NULL,
	"condition_value" text NOT NULL,
	"action_type" text NOT NULL,
	"action_value" text NOT NULL,
	"rationale" text,
	"priority" integer DEFAULT 50,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundraising_foundation_registry" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"uid" text,
	"official_purpose" text,
	"website_url" text,
	"region" text,
	"contact_email" text,
	"contact_phone" text,
	"accepts_applications" text,
	"application_method" text,
	"is_operative" boolean,
	"source" text,
	"registry_data" jsonb,
	"data_quality" integer,
	"last_verified" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundraising_foundations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"contact_email" text,
	"contact_phone" text,
	"fit_score" integer,
	"priority" integer,
	"focus_areas" jsonb,
	"geographic_scope" text,
	"organization_type" text,
	"grant_range_min" integer,
	"grant_range_max" integer,
	"typical_amount" integer,
	"funding_model" text,
	"application_method" text,
	"application_deadline" text,
	"decision_timeline" text,
	"strategic_fit" text,
	"application_notes" text,
	"past_grantees" jsonb,
	"board_members" jsonb,
	"research_depth" text,
	"research_date" text,
	"research_file_path" text,
	"data_quality" integer,
	"config_data" jsonb,
	"org_id" text DEFAULT 'revamp-it',
	"source" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "fundraising_gesuch_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"foundation_id" text NOT NULL,
	"org_id" text DEFAULT 'revamp-it' NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fundraising_applications" ADD CONSTRAINT "fundraising_applications_foundation_id_fundraising_foundations_id_fk" FOREIGN KEY ("foundation_id") REFERENCES "public"."fundraising_foundations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraising_contacts" ADD CONSTRAINT "fundraising_contacts_foundation_id_fundraising_foundations_id_fk" FOREIGN KEY ("foundation_id") REFERENCES "public"."fundraising_foundations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraising_customization_rules" ADD CONSTRAINT "fundraising_customization_rules_foundation_id_fundraising_foundations_id_fk" FOREIGN KEY ("foundation_id") REFERENCES "public"."fundraising_foundations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraising_gesuch_overrides" ADD CONSTRAINT "fundraising_gesuch_overrides_foundation_id_fundraising_foundations_id_fk" FOREIGN KEY ("foundation_id") REFERENCES "public"."fundraising_foundations"("id") ON DELETE no action ON UPDATE no action;