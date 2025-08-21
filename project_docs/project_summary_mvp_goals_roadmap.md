# Project Summary — MVP Goals & Roadmap

## Executive Summary
We are building a web-based language learning product optimized for **fast conversational ability**. The guiding principle is **audio‑first, phrase‑first, intelligibility‑focused** practice delivered in **tiny loops** (30–60 seconds). The MVP will prove that a new learner can achieve a **“can‑do” moment in ≤5 minutes** with a single micro‑lesson and return for at least one short review the next day.

**Current status:** Deliverable 1 (Listen‑First Micro‑Lesson — Meet & Greet) has an implementation‑agnostic functional spec defined in this workspace. The product focus is on **small, incremental, valuable steps**, with a **local-first** operating mode that supports local development and testing.

**Note on Local-First**: This means the system can be fully developed, tested, and run locally using mocks for third-party services. While it may utilize cloud services when available, it gracefully degrades to local processing when they're unavailable. This enables developers to work offline and test without external dependencies.

---

## Product Vision
Help adults become conversational faster by prioritizing **ready‑to‑use phrases**, **ear training**, and **speaking clarity** over exhaustive grammar. Lessons feel like short missions with immediate, measurable wins.

---

## Target Users & Jobs-to-Be-Done
- **Beginners** starting a new language who want early momentum and confidence.
- **Returning learners** who stalled in traditional apps and want short, effective speaking‑oriented sessions.

**JTBD:** “When I’m starting a new language, I want a quick daily practice that lets me say useful things clearly and confidently, so I feel real progress from day one.”

---

## MVP Scope (What we will ship)
**One complete micro‑lesson:** *Meet & Greet* (3 phrases). The user:
1) Listens to a short greeting sequence (no text on first pass),
2) Replays and then reveals text and phrase chips (each replayable),
3) Sees lightweight progress and XP, and
4) Encounters basic analytics and accessibility.

**Local-first** operation is required - the system must support local development and testing with mocks, with graceful degradation when third-party services are unavailable.

---

## MVP Goals (Targets)
**North‑Star:** % of first‑time users who complete the micro‑lesson and reveal text within ≤5 minutes.

**Quantitative targets (initial):**
- NSM — **Can‑Do Proxy (Reveal Rate)**: ≥ **70%** of new users reveal text within 2 complete plays.
- **Phrase Replay Rate:** ≥ **60%** tap at least one phrase chip after reveal.
- **Day‑2 Return (soft target):** ≥ **25%** of first‑time users start a 60‑sec review within 24–48 hours.
- **A11y:** No critical keyboard traps; Lighthouse a11y ≥ **90** on the lesson page.

**Qualitative targets:** Users describe the experience as *clear*, *short*, and *encouraging* in lightweight feedback prompts.

---

## Non‑Goals (for MVP)
- No speech recording/scoring, no HVPT quiz, no shadowing or badges/streaks.
- No accounts, payments, social features, or teacher tools.
- No large curriculum; one micro‑lesson is sufficient to validate the loop.

---

## Deliverables (Incremental, demo‑ready)
1) **D1 — Listen‑First Micro‑Lesson (Meet & Greet)** *(defined)*
   - Audio‑first playback with text reveal after ≥2 plays, phrase chips (replay), basic analytics, a11y.

2) **D2 — Chunk Practice (Simulated Intelligibility) — Functional Spec** *(next)*
   - Speaking UX with immediate, lightweight feedback states (Clear/Almost/Try again) and one micro‑tip per phrase.
   - Still implementation‑agnostic; focus on user states, copy, and acceptance criteria.

3) **D3 — HVPT Mini (Ear Training) — Functional Spec**
   - Four fast A/B trials with immediate correctness; tiny XP drip; a11y and error states defined.

> Each deliverable stands alone and can be validated with usability checks and analytics.

---

## Success Criteria (MVP completion)
- A new learner can complete the Listen‑First micro‑lesson end‑to‑end **locally**, and developers can test the system locally with mocks.
- NSM (Reveal Rate) meets or exceeds **70%** with the baseline copy and flow.
- Phrase Replay Rate ≥ **60%**.
- Accessibility checks pass (keyboard operability, contrast, focus states).

---

## Risks & Mitigations
- **Expectation of rich scoring** → Set expectations in copy: this is a quick listen‑first exercise; deeper feedback comes later (Chunk Practice + HVPT).
- **Audio variability across devices** → Keep clips short and normalized; provide clear error/retry states.
- **Motivation drop after the first session** → Provide a visible “60‑sec review tomorrow” prompt and a small XP nudge; keep review copy minimal.

---

## Measurement Plan (MVP)
Track the following functional events (storage/implementation TBD):
- `lesson_started { lesson_code }`
- `audio_play { lesson_code, clip_id }`
- `text_revealed { lesson_code }`
- `phrase_replay { lesson_code, phrase_id }`
- (Post‑MVP) `review_started`, `review_completed`

Analyze funnel: start → first play → second play → reveal → phrase replay.

---

## Post‑MVP Roadmap (Where this goes next)
**v0.2 — Speaking & Coaching**
- **Chunk Practice**: user speaks phrases; app returns Clear/Almost/Try Again with one micro‑tip; XP becomes slightly more meaningful.
- **Minimal progress persistence** (anonymous) to support day‑2 review analytics.

**v0.3 — Ear Training & Can‑Do**
- **HVPT Mini**: four rapid A/B trials (multiple voices/speeds);
- **Shadowing (timing‑only)** + **Can‑Do check** (two‑line exchange) for a stronger success moment.

**v0.4 — Content Scale & Light Personalization**
- Add 1–2 more micro‑lessons (“I’d like…”, “Where is…?”)
- Simple review queue for yesterday’s phrases; surface a “weakest phrase” suggestion.

**Later Options** (hypotheses to test)
- Word‑level speech matching (cloud STT) behind a flag.
- Streaks/badges, lightweight social proof (shareable “day one” win).
- Advanced analytics dashboard for phrasing/timing patterns.

---

## Open Questions
- What daily reminder tone (copy/frequency) best supports day‑2 return without feeling pushy?
- Are the three phrases in the first lesson sufficient, or should we test four vs. three?
- Which micro‑tip wording best improves clarity without overwhelming the user?

---

## Decision Log (initial)
- **Local-first** is mandatory for MVP - the system must support local development and testing with mocks, with graceful degradation when third-party services are unavailable.
- **Listen‑first** is the first deliverable; speech/scoring come later.
- Success is defined by **Reveal Rate**, **Phrase Replay**, and **a11y quality** rather than raw time‑in‑app.

