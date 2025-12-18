import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  bigint,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ------------------------------------
// Enums
// ------------------------------------
export const groupMemberRole = pgEnum("group_member_role", ["owner", "member"])

export const transactionDirection = pgEnum("transaction_direction", [
  "income",
  "expense",
  "transfer",
])

export const transactionOwner = pgEnum("transaction_owner", [
  "mine",
  "shared",
  "other",
])

export const ingestionStatus = pgEnum("ingestion_status", [
  "pending",
  "processing",
  "review",
  "committed",
  "failed",
])

export const ingestionSourceType = pgEnum("ingestion_source_type", [
  "bank_csv",
  "bank_pdf",
  "screenshot",
  "manual_batch",
])

export const accountType = pgEnum("account_type", ["bank", "ewallet", "cash"])

export const budgetPeriod = pgEnum("budget_period", ["monthly", "custom"])

export const ruleMatchType = pgEnum("rule_match_type", ["contains", "starts_with"])

// ------------------------------------
// Profiles (app-level user table)
// Tied to Supabase auth.users.id (UUID)
// ------------------------------------
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(), // equals Supabase auth user id

    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),

    onboardingCompleted: boolean("onboarding_completed")
      .notNull()
      .default(false),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    onboardingIdx: index("idx_profiles_onboarding").on(t.onboardingCompleted),
  })
)

// ------------------------------------
// Groups (workspace / “space”)
// ------------------------------------
export const groups = pgTable(
  "groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    defaultCurrency: text("default_currency").notNull().default("IDR"),

    createdByProfileId: uuid("created_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdByIdx: index("idx_groups_created_by_profile").on(t.createdByProfileId),
  })
)

// ------------------------------------
// Group members
// ------------------------------------
export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    role: groupMemberRole("role").notNull().default("member"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueMember: uniqueIndex("uidx_group_members_group_profile").on(
      t.groupId,
      t.profileId
    ),
    groupIdx: index("idx_group_members_group").on(t.groupId),
    profileIdx: index("idx_group_members_profile").on(t.profileId),
  })
)

// ------------------------------------
// Categories (scoped to a group)
// ------------------------------------
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    // Keeps budgets sane: categories can be income/expense/transfer-scoped
    kind: transactionDirection("kind").notNull().default("expense"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqName: uniqueIndex("uidx_categories_group_name").on(t.groupId, t.name),
    groupIdx: index("idx_categories_group").on(t.groupId),
  })
)

// ------------------------------------
// Accounts (recommended for imports)
// ------------------------------------
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    type: accountType("type").notNull().default("bank"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqAccountName: uniqueIndex("uidx_accounts_group_name").on(
      t.groupId,
      t.name
    ),
    groupIdx: index("idx_accounts_group").on(t.groupId),
  })
)

// ------------------------------------
// Transactions (canonical truth)
// ------------------------------------
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    occurredAt: date("occurred_at").notNull(),

    // Store minor units (cents). For IDR UX, you’ll likely convert.
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("IDR"),

    direction: transactionDirection("direction").notNull().default("expense"),

    description: text("description"),
    note: text("note"),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),

    createdByProfileId: uuid("created_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),

    owner: transactionOwner("owner").notNull().default("mine"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupDateIdx: index("idx_transactions_group_date").on(
      t.groupId,
      t.occurredAt
    ),
    groupAmountDateIdx: index("idx_transactions_group_amount_date").on(
      t.groupId,
      t.amountCents,
      t.occurredAt
    ),
    createdByIdx: index("idx_transactions_created_by_profile").on(
      t.createdByProfileId
    ),
    categoryIdx: index("idx_transactions_category").on(t.categoryId),
    accountIdx: index("idx_transactions_account").on(t.accountId),
  })
)

// ------------------------------------
// Budgets
// ------------------------------------
export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    period: budgetPeriod("period").notNull().default("monthly"),

    // Monthly: periodStart = first day of month
    periodStart: date("period_start").notNull(),
    // Custom/trip: set periodEnd
    periodEnd: date("period_end"),

    currency: text("currency").notNull().default("IDR"),
    totalLimitCents: bigint("total_limit_cents", { mode: "number" }),

    createdByProfileId: uuid("created_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupPeriodIdx: index("idx_budgets_group_period").on(
      t.groupId,
      t.periodStart
    ),
    createdByIdx: index("idx_budgets_created_by_profile").on(t.createdByProfileId),
  })
)

export const budgetItems = pgTable(
  "budget_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    limitCents: bigint("limit_cents", { mode: "number" }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqBudgetCategory: uniqueIndex("uidx_budget_items_budget_category").on(
      t.budgetId,
      t.categoryId
    ),
    budgetIdx: index("idx_budget_items_budget").on(t.budgetId),
  })
)

// ------------------------------------
// Ingestion pipeline
// ------------------------------------
export const ingestionRuns = pgTable(
  "ingestion_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    createdByProfileId: uuid("created_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),

    sourceType: ingestionSourceType("source_type").notNull(),
    status: ingestionStatus("status").notNull().default("pending"),

    filePath: text("file_path"),

    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupCreatedIdx: index("idx_ingestion_runs_group_created").on(
      t.groupId,
      t.createdAt
    ),
    statusIdx: index("idx_ingestion_runs_status").on(t.status),
  })
)

export const ingestionItems = pgTable(
  "ingestion_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ingestionRunId: uuid("ingestion_run_id")
      .notNull()
      .references(() => ingestionRuns.id, { onDelete: "cascade" }),

    rawPayload: jsonb("raw_payload").notNull().default({}),

    // normalized fields
    occurredAt: date("occurred_at"),
    amountCents: bigint("amount_cents", { mode: "number" }),
    currency: text("currency"),
    direction: transactionDirection("direction"),
    description: text("description"),

    suggestedCategoryId: uuid("suggested_category_id").references(
      () => categories.id,
      { onDelete: "set null" }
    ),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    runIdx: index("idx_ingestion_items_run").on(t.ingestionRunId),
    normalizedIdx: index("idx_ingestion_items_norm").on(t.occurredAt, t.amountCents),
  })
)

export const duplicateSuggestions = pgTable(
  "duplicate_suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ingestionItemId: uuid("ingestion_item_id")
      .notNull()
      .references(() => ingestionItems.id, { onDelete: "cascade" }),

    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),

    confidence: integer("confidence").notNull(), // 0..100
    reasons: jsonb("reasons").notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    itemIdx: index("idx_duplicate_suggestions_item").on(t.ingestionItemId),
    txIdx: index("idx_duplicate_suggestions_tx").on(t.transactionId),
  })
)

// ------------------------------------
// Categorization rules (“Celengan remembers”)
// ------------------------------------
export const categoryRules = pgTable(
  "category_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),

    pattern: text("pattern").notNull(),
    matchType: ruleMatchType("match_type").notNull().default("contains"),

    // optional scope by direction (expense/income/transfer)
    direction: transactionDirection("direction"),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupIdx: index("idx_category_rules_group").on(t.groupId),
    categoryIdx: index("idx_category_rules_category").on(t.categoryId),
  })
)
