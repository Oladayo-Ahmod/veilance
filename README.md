# Veilance

**Veilance** is a privacy-first freelancing platform built on **Aleo**, enabling trustless, milestone-based escrow between clients and freelancers without exposing sensitive financial or contractual details on-chain.

Veilance combines:

* **Aleo private smart contracts** for escrow, milestones, and balances
* **Record-based state** instead of global mutable storage
* **Supabase** as an off-chain indexer & query layer for UX
* **Next.js frontend** for interaction and wallet integration

The result is a system where *funds, milestones, and identities remain private*, while the UI stays responsive and user-friendly.

---

## ✨ Core Concepts

### Privacy by Default

All user balances, escrow amounts, milestone structures, and descriptions are stored as **Aleo records**, not public mappings. Only the rightful owner can spend or update them.

### Record-Oriented Design

Veilance avoids Solidity-style global state mutation. Instead:

* Each action **consumes records** and **emits new records**
* Ownership is enforced via `self.caller`
* State transitions are explicit and auditable

### Off-chain Indexing (Supabase)


* Index transaction metadata
* Track record ownership (non-sensitive)
* Power dashboards and history views

> Supabase **never replaces on-chain truth** — it mirrors it for UX only.

---

## 🏗️ Architecture Overview

```
┌────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Next.js   │ ───▶ │  Aleo Wallet SDK │ ───▶ │ Aleo Blockchain  │
│  Frontend  │ ◀─── │ (execute tx)     │ ◀─── │ (Private Records)│
└─────┬──────┘      └──────────────────┘      └─────────┬────────┘
      │                                                    │
      │                    Indexing                       │
      ▼                                                    ▼
┌──────────────────┐      ┌──────────────────┐
│  Supabase DB     │ ◀─── │ Event Listener   │
│  (Read Layer)   │      │ / Sync Script    │
└──────────────────┘      └──────────────────┘
```

---

## 📦 Smart Contract Overview

### Records

#### Client

```leo
record Client {
    owner: address,
    escrow_balance: u64,
    rating: u8,
    completed_projects: u32,
}
```

#### Freelancer

```leo
record Freelancer {
    owner: address,
    earned_balance: u64,
    rating: u8,
    skills: [field; 5],
    completed_projects: u32,
}
```

#### Escrow

```leo
record Escrow {
    owner: address,        // Client
    payee: address,        // Freelancer
    amount: u64,
    milestone: u8,
    total_milestones: u8,
    milestone_amounts: [u64; 2], 
    description: field,
    status: u8,            // 0: Active, 1: Completed, 2: Disputed
    client_approved: bool,
    freelancer_approved: bool,
}
```

---

## 🔁 Core Flows

### 1. Client Registration

* User calls `register_client`
* Receives a `Client` record
* Stored privately in wallet

### 2. Freelancer Registration

* User calls `register_freelancer(skills)`
* Skills are fixed-size `[field; 5]`
* Receives a `Freelancer` record

### 3. Funding Escrow

* Client deposits funds via `deposit_funds`
* Funds remain private inside the `Client` record

### 4. Escrow Creation

* Client calls `create_escrow`
* Inputs:

  * Payee address
  * Total amount
  * Milestone breakdown
  * Description
  * Client record
* Outputs:

  * New `Escrow` record
  * Updated `Client` record

### 5. Milestone Submission

* Freelancer submits work via `submit_milestone`
* Marks `freelancer_approved = true`

### 6. Milestone Approval

* Client approves via `approve_milestone`
* Marks `client_approved = true`

### 7. Milestone Release

* Client calls `release_milestone`
* Funds released incrementally
* Escrow progresses until completion

---

## 🧩 Supabase Integration

### Why Supabase?

Aleo does not allow querying records on-chain. Supabase is used to:

* Index **transaction IDs**
* Associate records with wallet addresses
* Power UI views like dashboards & history

### What Supabase Stores

✅ Stored:

* Transaction hash
* Program name
* Transition name
* Caller address
* Timestamp

❌ Not Stored:

* Private balances
* Escrow amounts
* Descriptions
* Milestone values

> All sensitive data stays encrypted on-chain.

---

## 🔐 Security Model

* Ownership enforced via `assert_eq(record.owner, self.caller)`
* No global mutable balances
* No trusted admin keys
* Escrow logic is deterministic and transparent

Supabase is **non-authoritative** — corrupting it does not affect contract correctness.

---

## 🖥️ Frontend Responsibilities

The frontend must:

* Query wallet records (Client, Freelancer, Escrow)
* Pass full record literals (including `_nonce` and `_version`)
* Sync public metadata to Supabase
* Never attempt to "recreate" records manually

---

## 🧪 Development Notes

* CLI is more permissive than frontend SDK
* Frontend requires full record literals
* Arrays must be fixed-size
* `field` used for hashed strings
* Block properties only allowed inside async functions

---

## 🚧 Limitations & Future Work

* Dispute resolution
* Arbitrator records
* Time-locked milestones
* Partial approvals
* Multi-currency support
* Reputation proofs

---

## 🏁 Conclusion

Veilance demonstrates how **private-by-default smart contracts** can power real-world applications like freelancing platforms.

It embraces Aleo’s model instead of fighting it — records over storage, privacy over convenience, correctness over shortcuts.

---

**Veilance**

> *Private work. Honest milestones. Zero trust.*
