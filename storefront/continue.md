# Continue Agent Instructions

You are operating in AGENT mode with full access to the codebase.
Your job is to proactively find and fix issues, not just answer questions.

---

## GLOBAL BEHAVIOR RULES

- Search the entire codebase when an issue is mentioned.
- Apply fixes directly without asking for confirmation.
- Prefer safe, incremental changes over large refactors.
- Never introduce `any`.
- Never weaken existing types.
- Preserve API contracts unless explicitly told otherwise.

---

## TYPE SYSTEM RULES (CRITICAL)

### 1. Date Handling
- UI/form types may use `Date | null`
- API/DTO types MUST use string-based dates only
- Never mix `Date` and `string` in the same interface

If a type crosses the API boundary:
- Create a UI-specific type
- Convert dates at the boundary layer

Example:
- `CampaignDTO` → uses ISO date strings
- `CampaignFormFields` → uses `Date | null`

---

### 2. Date Primitives
When encountering date strings:
- Introduce or reuse a shared primitive:
  - `ISODateString = string`
- Replace raw `string` date fields with `ISODateString`

---

### 3. Metadata Safety
- Do not use `Record<string, any>`
- Replace with:
  - `Record<string, unknown>` OR
  - A typed metadata interface when structure is known

Never introduce `any` into metadata.

---

### 4. DTO Boundary Discipline
- DTOs represent API responses, not UI needs
- Do not add UI-only fields to DTOs
- Avoid deep relational nesting unless already present

If a DTO is too large for a UI:
- Create a derived `*SummaryDTO` using `Pick<>`

---

## RELATION HANDLING RULES

- Do not eagerly expand relations
- Relations must remain optional (`?`)
- UI code must not assume relational presence
- Never add new relations without clear usage

---

## INVENTORY & DOMAIN RULES

- Preserve domain terminology exactly as-is
- Do not rename domain fields unless fixing a bug
- Do not collapse distinct domain concepts into shared types

Examples of protected concepts:
- Harvest vs Lot
- AvailabilityWindow vs InventoryLevel
- Cooperative vs Producer vs Seller

---

## FIX STRATEGY (ORDER OF OPERATIONS)

When fixing type issues:
1. Introduce shared primitives (UUID, ISODateString, CurrencyCode)
2. Fix DTO types first
3. Split UI types from API types if needed
4. Update usage sites
5. Ensure no runtime behavior changes

---

## PROACTIVE TASKS YOU SHOULD PERFORM

- Find Date/string mismatches and fix them
- Replace unsafe metadata typing
- Identify DTOs leaking UI concerns
- Harden inventory and availability types
- Improve type reuse without abstraction overreach

---

## WHAT NOT TO DO

- Do NOT rewrite large files unnecessarily
- Do NOT introduce new libraries
- Do NOT change API request/response shapes
- Do NOT remove fields
- Do NOT ask for confirmation before fixing

---

## COMPLETION EXPECTATION

When finished:
- Types should be stricter, not looser
- Code should compile without new errors
- Behavior should remain unchanged
- Changes should be minimal and reviewable

Proceed automatically.
