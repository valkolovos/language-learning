# Deliverable — Chunk Practice (Pronunciation)

**Type:** Functional Specification (implementation‑agnostic)

## Purpose
Add a focused **pronunciation practice loop** that fits after the Listen‑First reveal in a micro‑lesson. The learner records a short **chunk** (1–4 words, ~1–3 seconds), receives **simple, actionable feedback** (Clear / Almost / Try again + 1 micro‑tip), and can replay/retake quickly. The slice must ship **local-first** with an optional cloud scoring flag that can be toggled per environment.

## Local-First Architecture
**Local-first** means the system can be fully developed, tested, and run locally using mocks for third-party services. While it may utilize cloud services when available, it gracefully degrades to local processing when they're unavailable. This enables developers to work offline and test without external dependencies.

## Definition of Done (DoD)
A new learner can complete at least one pronunciation attempt for a target chunk and see feedback without confusion or setup beyond granting microphone access. All core flows are keyboard/screen‑reader accessible. The system can be developed and tested locally with mocks, and gracefully degrades when third-party services are unavailable.

---

## In Scope
- **Single‑chunk practice** within an existing lesson (post‑reveal)
- **Mic capture** and **attempt lifecycle** (idle → recording → processing → feedback)
- **Local-first scoring** using intelligibility proxies (see *Scoring Model*)
- **Optional managed scoring** behind a feature flag (environment toggle)
- **Feedback UI:** state (Clear / Almost / Try again), one micro‑tip, and per‑word highlighting when available
- **Controls:** Record, Stop, Play back attempt, Retake, Next
- **A11y:** keyboard operability, focus order, ARIA live regions for status changes
- **Privacy copy:** clear statement that audio stays on device in base mode

## Out of Scope (for this deliverable)
- Phoneme‑by‑phoneme drill pages
- Leaderboards, XP awards beyond existing lesson hooks
- Long free‑speech prompts (>5 seconds)
- Account creation, cloud storage of audio

---

## User Story & Acceptance Criteria
**User story**
> As a learner, I want to practice saying a short phrase chunk and get simple guidance so I can improve and move on without stalling the lesson.

**Acceptance criteria (functional)**
1. **Mic permission request** appears only when the user first taps **Record**; denial shows a clear fallback message and link to system settings.
2. **Recording cap**: Attempts are hard‑limited to **≤4 seconds**; auto‑stop at cap with a chime and status text.
3. **Attempt feedback**: After processing, the user sees one of three states:
   - **Clear** (green): may proceed; **Next** is enabled.
   - **Almost** (amber): may proceed; **Retake** is encouraged.
   - **Try again** (red): **Next** disabled until a Clear/Almost is achieved.
4. **One micro‑tip** appears beneath the state (e.g., “Shorter final vowel in *καλημέρα*”).
5. **Playback**: The user can play their last attempt and the model reference audio.
6. **Retry**: Retake replaces the last attempt and recomputes feedback.
7. **A11y**: Status changes announce via ARIA live region; all controls tabbable with visible focus.
8. **Local-first**: With feature flag **off**, all feedback derives from on‑device processing; no network calls are required to complete the loop.
9. **Telemetry (local or deferred)**: The app records attempt result (Clear/Almost/TryAgain), duration, and whether user proceeded.

---

## Scoring Model (implementation‑agnostic)
The system computes **intelligibility** using a reference chunk and the user’s audio. Two interchangeable backends:

- **Local-first backend** (default): on‑device speech recognition in the browser (WASM) to obtain a best‑effort transcript and word timings; simple acoustic cues (duration, energy) for stressed syllables; VAD to trim silences.
- **Managed backend** (feature‑flagged): cloud scoring API returning word/phoneme accuracy, fluency/timing, and completeness. The UI and thresholds remain the same regardless of backend.

**Derived metrics (conceptual definitions):**
- **Coverage**: % of reference tokens recognized in order (ignores articles/clitics flagged as optional by content).
- **Timing conformity**: Share of tokens whose duration falls within an expected tolerance band for the chunk.
- **Intelligibility proxy**: Combined score from Coverage and Timing; optionally boosted when stressed syllables meet duration/energy expectations.

**State thresholds (initial):**
- **Clear**: Coverage ≥ **85%** **and** Timing conformity ≥ **60%**
- **Almost**: Coverage ≥ **60%** (or Clear metrics not met but close)
- **Try again**: otherwise

> **Note:** Thresholds are product‑level constants for QA; backend implementations map raw outputs to these metrics.

---

## UX & Content Requirements
- **Chunk card** shows: target text, transliteration toggle, and **reference audio** (playable).
- **During first attempt**: emphasize speaking **after** reference playback; show an animated cue (e.g., simple pulsing dot) while recording.
- **Feedback block**: colored state label, micro‑tip, and optional per‑word highlight (underlines words that were unclear).
- **Micro‑tip bank** (content handoff): 1–2 concise tips per chunk, focusing on one feature (vowel length, stress, aspiration, consonant cluster).
- **Copy tone**: neutral and supportive; avoid “correct/incorrect accent” framing; prefer “clearer / easier to understand.”
- **Localization**: UI copy provided in English; content team supplies target‑language text, transliteration, and stress marks.

---

## A11y & Performance
- Meets **WCAG 2.2 AA** for controls and focus; status messages delivered via **aria‑live="polite"**.
- **Latency target**: feedback within **≤800 ms** after stop on modern laptops; graceful messaging if processing exceeds 2 s.
- **Resource limits**: in‑memory only; audio buffers ≤ 5 s; no persistent mic recording.

---

## Error & Edge Cases
- **Mic denied**: Show inline guidance and a link to OS/browser instructions; provide a **Skip speaking** option that still allows lesson progress.
- **Noisy environment**: If speech not detected (low SNR), show “We couldn’t catch that—try moving closer or a quieter spot.”
- **Silence / over‑long**: Auto‑stop at 4 s; if silence, mark as Try again with a tip.
- **Offline**: Managed backend flag off; feature silently falls back to local metrics.
- **Backend error** (when flag on): Retry with local backend; show non‑blocking banner.

---

## Instrumentation (local or batched)
Capture the following **event fields** for analytics (local buffer; upload optional):
- `attempt_started`, `attempt_stopped`, `attempt_scored`
- `result_state` (Clear | Almost | TryAgain)
- `attempt_duration_ms`
- `proceeded_next` (boolean)
- `backend_used` (local | managed)

---

## Non‑Functional & Privacy
- **Local-first** operation is mandatory - the system must support local development and testing with mocks. Managed scoring is optional.
- **Privacy statement** (visible near Record): "Audio stays on your device for this practice. Nothing is saved or sent unless you opt in."
- No PII collected; attempts are ephemeral.

---

## Handoffs
- **Design**: microcopy for tips and error states; focus states; iconography for states; a single responsive layout.
- **Content**: 3–4 chunks per first lesson; reference audio; stress/transliteration; 2 tips per chunk.
- **QA**: run BDD scenarios and a11y checks on desktop Chrome/Safari; include mic‑denied and offline cases.

---

## Success Criteria (for this deliverable)
- ≥**85%** of first‑time users complete one Clear/Almost within **2 attempts**
- ≥**75%** play back their own attempt at least once
- Zero critical a11y blockers; keyboard path fully usable

---

## BDD Scenarios (high‑level, tech‑agnostic)

**Feature: Pronunciation Chunk Practice**

**Background:**
Given a micro‑lesson with a revealed chunk and available reference audio
And the pronunciation practice feature is enabled

**Scenario: First recording with permission**
Given I am on the chunk practice card
When I tap Record and grant microphone permission
And I speak the chunk within 4 seconds
Then I see a feedback state (Clear | Almost | Try again)
And I can tap Play to hear my attempt

**Scenario: Mic permission denied**
Given I am on the chunk practice card
When I tap Record and deny microphone access
Then I see guidance on enabling the mic and a Skip speaking option
And I cannot proceed until I either enable the mic or choose Skip

**Scenario: Progress gating**
Given I have attempted the chunk and received Try again
When I tap Next
Then I am prevented from leaving until I achieve Clear or Almost

**Scenario: Local-first fallback**
Given managed scoring is unavailable or disabled
When I complete an attempt
Then I receive a state and micro‑tip computed locally without network access
And the system gracefully degrades to local processing

---

## Open Questions
- Do we allow **Next** on “Almost” by default, or require one Clear per lesson?
- Should we expose **per‑word highlights** only when confidence is high?
- What is the right copy for the privacy statement in languages other than English?



## Technology Options & Recommendation

### Option sets
**A) Local / On‑device ASR (browser‑first)**
- **Vosk (WASM, “vosk-browser”)** — small acoustic/language models; works offline; easy MVP. *Pros:* private, no vendor lock, instant. *Cons:* accuracy varies by language/model quality; no phoneme scores. *Greek:* community model available; quality acceptable for short chunks.
- **Whisper in browser (whisper.cpp via WASM/WebGPU)** — higher accuracy than Vosk; heavier compute; may require modern GPUs and careful quantization. *Pros:* strong multilingual; *Cons:* bundle size/latency trade‑offs; more engineering.
- **Picovoice Leopard (WASM)** — commercial on‑device STT; clean SDK; per‑device licensing. *Pros:* good latency; *Cons:* licensing, language coverage.

**B) Cloud ASR + heuristic scoring (no vendor scoring)**
- **Google Cloud STT (v2)**, **Azure STT**, **Deepgram**, **AssemblyAI** — send audio → get transcript + word timings → compute coverage/timing/energy heuristics locally. *Pros:* flexible, multilingual; *Cons:* network dependency, per‑use cost, privacy impact. *Greek:* Google/Deepgram support is generally strong.

**C) Managed Pronunciation Scoring APIs (turn‑key)**
- **Azure Speech – Pronunciation Assessment** — returns overall + per‑word/phoneme scores (accuracy, fluency, completeness). *Pros:* fast to ship, rich metrics; *Cons:* language coverage constraints; vendor lock, cost.
- **Speechace** — education‑focused scoring, lexical stress, per‑phoneme diagnostics. *Pros:* detailed feedback, education docs; *Cons:* primarily optimized for English (and limited other locales), vendor lock.

**D) Alignment‑based (research/transparent) back‑end**
- **Montreal Forced Aligner (Kaldi)** or **Gentle** for forced alignment; **WhisperX** for modern Whisper+alignment; add **GOP** (Goodness‑of‑Pronunciation) scoring from acoustic model likelihoods. *Pros:* full control, auditable; *Cons:* server compute, ops complexity.

---

### Decision factors (for this product)
- **Primary languages:** Greek first, others later → favors **multilingual ASR**, de‑prioritizes managed scorers if they lack Greek.
- **Local-first requirement:** MVP must support local development and testing with mocks → favors **Vosk/Whisper in-browser** with graceful fallback to local processing.
- **Feedback shape:** Our UX needs only **Clear / Almost / Try again + one micro‑tip** → phoneme‑level isn’t mandatory in v1.
- **Privacy:** Avoid sending audio by default → local first; cloud is opt‑in behind a flag.

---

### Recommendation (phased)
**Phase 1 — MVP (2–3 weeks scope): Local-first intelligibility**
- **Backend:** `vosk-browser` (Greek model) with simple VAD; compute **Coverage** + **Timing** heuristics and gate to three states using the thresholds already defined.
- **Why:** Supports local development with mocks, minimal cost, sufficient for chunk‑level practice, fastest to integrate.
- **Risk & Mitigation:** If accuracy is borderline for some chunks, (a) shorten chunks, (b) relax Coverage tolerance for function words, (c) add “Play reference → then Record” guardrails.

**Phase 2 — Accuracy bump (feature‑flag): Cloud ASR for Greek**
- Enable **Google STT** (or Deepgram) as an optional back‑end; keep the same **Clear/Almost/Try again** thresholds by mapping vendor confidence and word timings into our proxies. Only used when the user is online and has opted in to cloud processing.

**Phase 3 — Richer tips (if needed): Alignment on server**
- For high‑value lessons, run **WhisperX alignment** on a small CPU/GPU instance to get robust word/phone timings and surface **per‑word highlights**. Keep it behind a flag and cache nothing by default.

**Phase 4 — English or languages covered by vendor scoring**
- If/when we ship English (or another supported locale), expose **Azure Pronunciation Assessment** as an alternate managed scorer to unlock phoneme‑level diagnostics, but keep our UI identical.

---

### Buy vs Build summary
- **Ship now (low risk):** Vosk (WASM) + our heuristics → satisfies core learning loop and privacy.
- **Upgrade path:** Toggle to cloud ASR per locale to improve accuracy; later add alignment for granular tips.
- **Defer:** Managed scoring vendors until they cover our priority languages (or we add English), to avoid lock‑in and uneven learner experience across locales.

### Success guardrails
- Keep UI + thresholds **backend‑agnostic** so we can swap engines with zero design churn.
- Instrument per‑backend **attempt_to_clear rate**; if local backend underperforms, auto‑switch to cloud for that lesson when online (with explicit consent).

