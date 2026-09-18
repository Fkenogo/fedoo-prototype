# FEDOO Experience Reference — Founder Adoption Decision

**Project:** Fedoo
**Document:** Experience Reference Adoption Decision
**Status:** APPROVED
**Decision date:** 18 September 2026
**Approval authority:** Founder
**Prototype repository:** `Fkenogo/fedoo-prototype`
**Approved prototype head:** `f0bf54dac08da4988a688bc35c93237b9e6e8d37`
**Fedoo Product Truth baseline used for review:** `acb054a1fc6bb5501fe123f988d55e77f1a71ea3`
**Related assessment:** `docs/FEDOO-EXPERIENCE-REFERENCE-ADOPTION-ASSESSMENT.md`

---

## 1. Founder decision

The Founder approves the realigned Fedoo prototype at the exact reviewed head above as:

**ADOPT AS FEDOO EXPERIENCE REFERENCE WITH SPECIFIED ADAPTATIONS.**

The prototype is the primary experience architecture for Fedoo production product-experience assembly.

Production implementation should preserve and substantially implement the approved shell, navigation, hierarchy, workflows, interaction patterns, responsive behaviour and presentation while binding governed Fedoo Product Truth behind that experience.

## 2. Authority boundary

Product Truth remains authoritative for:

- domain semantics and state;
- Measures, Instruments, scales and Question Set semantics;
- Endpoint/configuration/session/submission/evidence rules;
- Measure Results, Service Signals and Signal History;
- permissions, tenant/scope boundaries, security, privacy and integrity;
- lifecycle/versioning and commercial behaviour.

The Experience Reference governs how that truth is assembled into a coherent human-facing product.

Where an existing implementation document or technical assumption would unnecessarily degrade an approved experience without a substantive security, integrity, privacy or product-scope reason, the documentation/implementation should be amended rather than the experience degraded.

The Experience Reference must not itself invent domain authority, permissions, security policy, commercial policy, measurement semantics or material product scope.

## 3. Adopted with recorded adaptations

The adoption assessment classifications remain controlling for production assembly:

- **ADOPT** areas should be implemented substantially as represented.
- **ADAPT** areas retain the experience direction but must bind to governed Product Truth.
- **REFERENCE** areas are design/interaction inspiration only.
- **REJECT** areas must not be carried into production.
- **UNRESOLVED ASSUMPTION** areas require a later Founder/Product decision before production reliance.

The current Attention / flagged-for-review interaction is **REFERENCE / UNRESOLVED ASSUMPTION** and is excluded from the adopted default Organisation Overview.

## 4. Non-blocking unresolved matters

The following do not block Experience Reference adoption:

1. whether production eventually ships an organisation-visible Attention surface and, if so, under which governed semantics;
2. whether the production shell launches bilingual (English/French) or English-only, separate from measurement-language Instrument authority;
3. whether the bounded release exposes custom-question intake UX.

These remain future product decisions and must not be inferred from the prototype.

## 5. Production assembly rule

Fedoo production assembly should proceed from the approved Experience Reference into the real Fedoo product by vertical slice, using adapters/read models/application services where needed rather than allowing backend structures or legacy technical screens to determine the product experience.

No further broad prototype redesign is required before production experience assembly begins.

---

**Founder disposition:** APPROVE

**Effective:** 18 September 2026
