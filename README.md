# 🐷 Celengan

**Money, without the mystery.**

Celengan is a personal and shared money management app designed to make it effortless to understand where your money is going — without forcing daily discipline or complex bookkeeping.

It works just as well if you track things once a month as it does if you log transactions every day.

Because money doesn't track itself.

---

## ✨ What Celengan is (and isn't)

**Celengan is:**
- A source-agnostic money tracker (bank statements, screenshots, receipts, manual input)
- Built for real life (monthly catch-up or daily tracking — both are fine)
- Flexible for personal use or shared groups
- Calm, clean, and forgiving — not judgmental

**Celengan is not:**
- A hardcore accounting system
- A "log every cent or else" app
- A gamified finance app that stresses you out

---

## 🧠 Core ideas

### 1. Ingest first, organize later

**You can:**
- Upload a bank statement
- Upload screenshots (transfer, receipt, chat)
- Add transactions manually

**Celengan will:**
- Normalize the data
- Detect duplicates
- Suggest categories
- Let you review before committing

### 2. Budgets are guides, not rules
- Monthly budgets per category
- Editable anytime
- Designed to inform, not punish

### 3. Works for individuals and groups
- One "personal" group by default
- Shared groups supported
- Designed to expand into:
  - Split bills
  - Trip budgets
  - Cross-group sharing

---

## 🧱 Tech stack

Celengan is built to be fast to iterate on, but solid underneath.

- **Frontend / Full-stack:** Next.js (App Router)
- **State & Data:** TanStack Query
- **Styling:** Tailwind CSS + DaisyUI
- **Database:** PostgreSQL (Supabase)
- **ORM & Migrations:** Drizzle
- **Auth:** Supabase Auth (Magic Link)
- **Background jobs (planned):** Trigger.dev / Inngest
- **Storage (planned):** Supabase Storage

---

## 🔐 Authentication

- Magic link only (email)
- No passwords
- Supabase manages auth
- App-level user data stored in `profiles`

---

## 🗃️ Database overview (MVP)

**Key tables:**
- `profiles` – app user profile + onboarding state
- `groups` – workspaces (personal or shared)
- `group_members`
- `transactions`
- `categories`
- `budgets` + `budget_items`
- `accounts` (bank / wallet)
- `ingestion_runs` + `ingestion_items`
- `duplicate_suggestions`
- `category_rules`

All schema changes are versioned via migrations.

---

## 🚀 Getting started (local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...
```

### 3. Run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start dev server

```bash
npm run dev
```

---

## 🧭 Current flow

1. User signs in via magic link
2. Redirected to onboarding
3. User enters:
   - Monthly income (optional)
   - Monthly budget per category
4. Celengan creates:
   - Profile
   - Default group
   - Categories
   - Monthly budget
5. User lands on `/dashboard`

---

## 🔮 Planned features

- Transaction ingestion via OCR & PDFs
- Smarter duplicate detection
- Category learning ("Celengan remembers")
- Split bills with non-users
- Trip budgets shared across groups
- Dark mode (✅ implemented)
- Export & summaries

---

## 🎨 Design principles

- **Dark theme by default** (light theme available)
- **Green as primary** (#05C56D) — money
- **Pink as accent** (#F861A8) — piggy bank
- Clean, readable UI
- Dry humor, never condescending

---

## 📄 License

Private project (for now).

---

## 🤝 Contributing

Contributions welcome! If you'd like to contribute, please:

1. Check existing issues or create a new one
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

---

## 📚 Additional documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guidelines for contributors (coming soon)
- [CLAUDE.md](./CLAUDE.md) - AI coding guide (coming soon)
