# Design Brief

> AI agents MUST read this file before generating any view, page, or component with visual/interaction decisions.
> If Layer 1 is empty, ask the user to fill it first — do not generate final UI without this context.

## Layer 1 — Core (MANDATORY)

### 1. User Job
> What does the user come here to do? What's the primary task?

<!-- Example: "Monitor investment portfolio performance" or "Find and buy shoes under $50" -->

### 2. User Profile
> Who is the real user? (role, expertise level, usage frequency)

<!-- Example: "Financial analyst, expert, daily 8hrs" or "Casual shopper, novice, monthly" -->

### 3. Error Cost
> What happens if the user makes a mistake? How costly/reversible is it?

<!-- Example: "Transfers wrong amount — loss of funds, irreversible" or "Wrong size in cart — easy to change" -->

### 4. Trust Model
> What does the user need to see to feel confident? (trust signals)

<!-- Example: "SOC2 badge, audit trail, confirmation steps" or "Reviews, easy returns, payment logos" -->

### 5. Information Density
> Should everything be visible at once, or revealed progressively?

<!-- Example: "Dense dashboard — power users want all data visible" or "Step-by-step wizard — guide the user" -->

### 6. Usage Context
> Where and how is this used? (device, environment, session length, stress level)

<!-- Example: "Desktop, office, long sessions, low stress" or "Mobile, on the go, 30-second sessions, hurried" -->

> **After filling Layer 1**, the `/start-new-project` skill will automatically generate a color palette based on your answers and apply it to `src/styles.css`. See the palette mapping table in the skill documentation.

## Layer 2 — Interaction Model

### 7. Flow Type
> Linear (wizard/steps) or exploratory (dashboard/free navigation)?

### 8. Primary Object
> What entity does the user manipulate? (tickets, products, campaigns, patients...)

### 9. Repetitive Actions
> What does the user do over and over? (needs shortcuts, bulk actions, templates)

### 10. Comparison Needs
> Does the user need to compare items side-by-side? (diff views, tables, A/B)

### 11. Collaboration & Roles
> Multi-user? Role-based permissions? Handoffs? Audit trail?

### 12. Domain Language
> Key terms the UI should use (buttons, labels, tooltips). Industry jargon or plain language?

## Layer 3 — Visual Expression (LAST, not first)

### 13. Brand Posture
> Sober/premium/human/technical/playful? What feeling should the UI convey?

### 14. Market Position
> Blend in with competitors or stand out? How creative can the visual design be?

### 15. References & Anti-references
> "Like Linear, not like SAP." Name 2-3 apps to emulate and 1-2 to avoid.

### 16. Dominant Emotion
> What should the user feel? (control / speed / accompaniment / delight / safety)

## Applied Palette

> Fill this section after running the color palette generation step.

| Token | Light | Dark | Hex | Use |
|-------|-------|------|-----|-----|
| primary | | | | CTAs, active nav, links |
| destructive | | | | Errors, alerts, delete |
| accent | | | | Highlights, hover states |

Generated from Design Brief on YYYY-MM-DD.

---

## Vertical Quick Reference

If you know your vertical, these are typical defaults (override as needed):

| Vertical | Prioritizes | Typical UI patterns |
|----------|------------|---------------------|
| Fintech / Legal / Health | Error cost, traceability, trust | Confirmations, audit trail, visible states, sober colors |
| E-commerce / Marketplaces | Discovery, comparison, conversion | Powerful filters, images, social proof, low friction |
| Analytics / B2B complex | Density, non-linear workflows | Dense tables, drill-down, saved views, shortcuts |
| SMB / No-code / Prosumer | Fast learning, sense of progress | Templates, useful empty states, contextual onboarding |
| CRM / Support / Service desks | Triage speed, unified context | Visible history, SLA, color-coded priority, clear handoffs |
