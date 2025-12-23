ALTER TABLE "profiles" ADD COLUMN "monthly_income_cents" bigint;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "currency" text DEFAULT 'IDR' NOT NULL;