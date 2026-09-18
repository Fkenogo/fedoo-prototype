# Fedoo — FEF-ERAS-001 Alignment

**Status:** Aligned  
**Date:** 18 September 2026  
**Framework reference:** FEF-ERAS-001 — Experience Reference & Assembly Standard

## Purpose

This repository is the Fedoo Experience Reference. It establishes how Fedoo should be experienced by organisations, participants and platform operators while preserving the main `Fkenogo/fedoo` repository as the authority for the Fedoo engine, governed semantics, architecture and implementation.

## Product Truth Authority

The main Fedoo repository remains authoritative for:

- canonical Measures, Questions, Question Sets and Instruments;
- Endpoint and feedback-evidence semantics;
- calculation rules, Measure Results, Service Signals and history;
- tenant/scope authority and evidence classes;
- language/version resolution;
- lifecycle, entitlement and governance rules;
- architecture, persistence and engineering decisions.

Prototype mock calculations, records or workflows must not become backend authority merely because they are visible in this repository.

## Experience Reference Authority

This repository may govern the intended experience for:

- organisation overview and scope selection;
- Feedback Points / Endpoints presentation;
- what the organisation tracks and how it changes that configuration;
- location context;
- participant feedback flow;
- activity/history and review surfaces;
- Operator experience;
- first-run organisation setup and human-facing terminology.

The implementation objective is to bind the real Fedoo engine into this experience, not to reconstruct engine semantics in the client.

## Material Assumptions

The current prototype deliberately separates client-side simulation from backend-engine responsibilities. Under FEF-ERAS-001, material assumptions should be treated as ADOPT / ADAPT / REFERENCE / REJECT / UNRESOLVED rather than silently implemented.

In particular:

- client-side analytics simulation is not authoritative calculation logic;
- prototype labels must map to governed Fedoo concepts before production persistence or mutation;
- Operator actions require real project authority and permission boundaries;
- participant flows consume configured Fedoo truth; they do not define the engine;
- generated IDs, canonical versions and system-managed configuration should remain system concerns unless there is a genuine user-facing need.

## Implementation Expectation

As production assembly proceeds:

1. keep building Fedoo engine authority in the main repository;
2. use this Experience Reference to establish shell, hierarchy and operating flows;
3. bind organisation and participant surfaces to real engine reads/commands only when those capabilities exist;
4. surface unresolved experience assumptions before implementation relies on them;
5. prefer vertical slices that connect configuration → participant action → evidence → governed result → organisation/operator visibility.

## Non-Effects

This alignment does not authorise new Fedoo engine behaviour, product policy, analytics semantics, permissions or implementation work. It records the intended use of this Experience Reference under FEF-ERAS-001.
