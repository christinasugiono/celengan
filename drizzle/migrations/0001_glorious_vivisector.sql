CREATE TYPE "public"."account_type" AS ENUM('bank', 'ewallet', 'cash');--> statement-breakpoint
CREATE TYPE "public"."budget_period" AS ENUM('monthly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."group_member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."ingestion_source_type" AS ENUM('bank_csv', 'bank_pdf', 'screenshot', 'manual_batch');--> statement-breakpoint
CREATE TYPE "public"."ingestion_status" AS ENUM('pending', 'processing', 'review', 'committed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."rule_match_type" AS ENUM('contains', 'starts_with');--> statement-breakpoint
CREATE TYPE "public"."transaction_direction" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."transaction_owner" AS ENUM('mine', 'shared', 'other');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" DEFAULT 'bank' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"limit_cents" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"period" "budget_period" DEFAULT 'monthly' NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"total_limit_cents" bigint,
	"created_by_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" "transaction_direction" DEFAULT 'expense' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"pattern" text NOT NULL,
	"match_type" "rule_match_type" DEFAULT 'contains' NOT NULL,
	"direction" "transaction_direction",
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "duplicate_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingestion_item_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"confidence" integer NOT NULL,
	"reasons" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" "group_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"default_currency" text DEFAULT 'IDR' NOT NULL,
	"created_by_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingestion_run_id" uuid NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" date,
	"amount_cents" bigint,
	"currency" text,
	"direction" "transaction_direction",
	"description" text,
	"suggested_category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"created_by_profile_id" uuid NOT NULL,
	"source_type" "ingestion_source_type" NOT NULL,
	"status" "ingestion_status" DEFAULT 'pending' NOT NULL,
	"file_path" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"occurred_at" date NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"direction" "transaction_direction" DEFAULT 'expense' NOT NULL,
	"description" text,
	"note" text,
	"category_id" uuid,
	"account_id" uuid,
	"created_by_profile_id" uuid NOT NULL,
	"owner" "transaction_owner" DEFAULT 'mine' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "magic_link_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "magic_link_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_suggestions" ADD CONSTRAINT "duplicate_suggestions_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_suggestions" ADD CONSTRAINT "duplicate_suggestions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD CONSTRAINT "ingestion_items_ingestion_run_id_ingestion_runs_id_fk" FOREIGN KEY ("ingestion_run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD CONSTRAINT "ingestion_items_suggested_category_id_categories_id_fk" FOREIGN KEY ("suggested_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_accounts_group_name" ON "accounts" USING btree ("group_id","name");--> statement-breakpoint
CREATE INDEX "idx_accounts_group" ON "accounts" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_budget_items_budget_category" ON "budget_items" USING btree ("budget_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_budget_items_budget" ON "budget_items" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_group_period" ON "budgets" USING btree ("group_id","period_start");--> statement-breakpoint
CREATE INDEX "idx_budgets_created_by_profile" ON "budgets" USING btree ("created_by_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_categories_group_name" ON "categories" USING btree ("group_id","name");--> statement-breakpoint
CREATE INDEX "idx_categories_group" ON "categories" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_category_rules_group" ON "category_rules" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_category_rules_category" ON "category_rules" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_duplicate_suggestions_item" ON "duplicate_suggestions" USING btree ("ingestion_item_id");--> statement-breakpoint
CREATE INDEX "idx_duplicate_suggestions_tx" ON "duplicate_suggestions" USING btree ("transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_group_members_group_profile" ON "group_members" USING btree ("group_id","profile_id");--> statement-breakpoint
CREATE INDEX "idx_group_members_group" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_group_members_profile" ON "group_members" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_groups_created_by_profile" ON "groups" USING btree ("created_by_profile_id");--> statement-breakpoint
CREATE INDEX "idx_ingestion_items_run" ON "ingestion_items" USING btree ("ingestion_run_id");--> statement-breakpoint
CREATE INDEX "idx_ingestion_items_norm" ON "ingestion_items" USING btree ("occurred_at","amount_cents");--> statement-breakpoint
CREATE INDEX "idx_ingestion_runs_group_created" ON "ingestion_runs" USING btree ("group_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_ingestion_runs_status" ON "ingestion_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_group_date" ON "transactions" USING btree ("group_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_group_amount_date" ON "transactions" USING btree ("group_id","amount_cents","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_by_profile" ON "transactions" USING btree ("created_by_profile_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_category" ON "transactions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_account" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_onboarding" ON "profiles" USING btree ("onboarding_completed");