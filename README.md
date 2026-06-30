# ANA — Autonomous Negotiation Agent 🤝

> A full-stack platform where AI **buyer** and **seller** agents autonomously negotiate a product's price over multiple rounds using constraint-based strategies, with an optional LLM layer that explains each move — plus a human-in-the-loop approval workflow.

Built with **FastAPI · PostgreSQL · SQLAlchemy · React (Vite) · OpenAI**.

---

## ✨ Overview

ANA simulates a realistic price negotiation without either side acting irrationally. A **Buyer Agent** (bounded by a budget) and a **Seller Agent** (bounded by a floor price) exchange offers and counteroffers across a capped number of rounds until they reach an agreement, a final offer, or a cancellation.

On top of the deterministic negotiation engine, an **LLM strategy layer** generates recommended prices, reasoning, and human-friendly messages — with a rule-based fallback so the system keeps working even without an API key. The core stays **predictable and testable**, while generative AI is used only where natural language adds value.

---

## 🔑 Key Features

- **Two autonomous agents** — buyer and seller, each with their own goals, state, and decision logic.
- **Constraint-based negotiation** — buyers never exceed budget or listed price; sellers never drop below floor or raise price; concessions move by controlled steps.
- **Multi-round engine** — orchestrates rounds (default max 6), logs every offer, and detects when a seller has reached a firm price.
- **Human-in-the-loop** — Accept, Counter (custom price), or Cancel at any step; final deals require buyer/seller approval.
- **LLM strategy layer** — `gpt-4o-mini` suggests a next price and messages as JSON, with a **heuristic fallback**.
- **Configurable strategies** — aggressive / conservative / balanced (buyer) and strict / discount-heavy / balanced (seller).
- **JWT auth** — signup/login with bcrypt-hashed passwords.
- **Analytics & history** — per-user negotiation history and summaries.

## ⚙️ How the Negotiation Works

1. **Buyer opens** — a starting offer, or *listed price − target discount* (floored at ~80% of list), capped by budget and listed price.
2. **Seller responds** — **accepts** if the buyer meets its offer (or is within one step above floor); otherwise **counters** with a weighted midpoint, never below floor or above list.
3. **Buyer counters** — steps toward the seller by a bounded amount, never exceeding budget or listed price.
4. **Repeat** until: `AGREED` (a side accepts), `FINAL_OFFER` (rounds exhausted — last offer goes to the human), or `CANCELLED`.
5. **Approval** — final deals confirmed via `buyer_approved` / `seller_approved` flags in the database.

> Core negotiation = deterministic rules (predictable, testable). The LLM adds a reasoning layer with a heuristic fallback.
