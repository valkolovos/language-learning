# Functional Product Brief — Theme‑able Gamification for Micro‑Lessons

## 1) Purpose
Make brief language practice feel engaging and personal by letting learners choose a **theme** (e.g., Sci‑Fi/Fantasy, Music, Movies). The theme changes the *metaphor, copy, visuals, and rewards* while the learning tasks remain the same (short listen → speak → read → translate activities).

## 2) Objectives & Success Measures
- **Primary outcomes**
  - More weekly lesson completion.
  - Better 7‑day and 28‑day retention.
- **Experience guardrails**
  - Typical session ≤ 10 minutes.
  - Low stress: learners can recover from failure without losing long streaks.
  - Clear, honest rewards; no manipulative loops.
- **What we’ll look at (functionally)**
  - % of users who complete 5+ daily quests per week.
  - Boss‑check participation and pass rates.
  - Use of power‑ups and their effect on completion (are they helpful, not required?).
  - Theme adoption and theme switching patterns.
  - Self‑reported enjoyment and perceived progress (lightweight periodic prompts).

## 3) Audience & Jobs‑to‑Be‑Done
- **Solo learners** who want consistent, meaningful practice without social pressure.
- **Motivational skins**: Learners pick a theme aligned to their interests so repetition feels less tedious.
- **JTBD**: “Help me practice in short, focused bursts that feel tailored to what I enjoy, and show me steady progress.”

## 4) Principles
- **Theme‑agnostic mechanics**: Only surface presentation changes; learning difficulty and grading remain fair and consistent.
- **Listening‑first**: Exercises start with audio before text to build ear and pronunciation.
- **Ethical design**: No loot boxes; rewards are clear. Purchasable boosters (if any later) are time‑savers, not shortcuts to proficiency.
- **Accessibility**: Full keyboard path, captions/subtitles, adjustable pacing; audio‑off paths exist.
- **Optional social**: Support cooperation and light comparison, but default to private, self‑referenced progress.

## 5) In‑Scope (MVP)
1. **Theme selection & switching** at any time (e.g., Sci‑Fi/Fantasy and Music at launch).
2. **Daily Quests** (2–5 minutes): short, focused practice that touches listening, speaking, and a quick check of reading/translation.
3. **Weekly Boss Check** (1–2 minutes): a brief mixed‑mode assessment that unlocks a weekly reward when passed.
4. **Power‑Ups** (2 types at launch): 
   - *Timer Extend* — grants more time on a task.
   - *Hint Peek* — reveals a single targeted hint.
5. **Collections**: Cosmetic, theme‑specific items earned through steady play (no purchase required).
6. **Weekly Event (optional)**: A one‑week twist (e.g., slight XP boost or thematic challenge) to refresh motivation.
7. **Calm Failure UX**: If a boss is failed, a short, clearly labeled review path enables one re‑attempt per day.
8. **Basic personalization**: Learners can name certain in‑theme elements (e.g., ship, band) and choose a color/style set.
9. **Privacy‑respecting social (optional)**: Private “vs. your past self” stats; small, opt‑in co‑op activities (e.g., pooled streak protection).

## 6) Out‑of‑Scope (MVP)
- Competitive public leaderboards.
- Licensed IP/brands.
- Real‑money purchases.
- Complex guild/clan systems.

## 7) Core User Flows

### 7.1 Onboarding & Theme Selection
- Learner sees a short explanation of themes and picks one.
- A preview shows how labels and rewards will appear in that theme.
- The learner can switch themes later without losing progress.

### 7.2 Daily Quest Loop
- Entry: “Daily quest” is always available once per local day.
- Flow: Hear → speak → quick confirm (read/translate). 
- Completion: If accuracy meets the threshold, learner earns XP (theme‑labeled), and may receive a collection item. If not, show a short, actionable tip and offer a retry or a quick review task.

### 7.3 Weekly Boss Check
- Availability: After any **4 completed dailies within a rolling 7‑day window**.
- Flow: Short sequence that samples the week’s skills.
- Outcome: Pass → weekly reward + visible advancement; Fail → unlock a short review path and allow one retry per day.

### 7.4 Power‑Ups
- When available, the learner can apply *Timer Extend* or *Hint Peek* to the current activity.
- Power‑ups are **helpful but not required** and are earnable through play; they are not a substitute for proficiency.

### 7.5 Collections
- Collections are cosmetic, theme‑specific sets (e.g., “spell sigils,” “track stems”). 
- Daily completions may grant an item; weekly passes guarantee a themed item.
- Completing a set triggers a satisfying reveal that does **not** unlock harder content by itself (purely motivational).

### 7.6 Events
- Some weeks introduce a gentle modifier (e.g., slight XP bonus, a special themed challenge).
- Events never punish non‑participation and remain replayable later in a solo mode.

### 7.7 Switching Themes
- Switching changes labels, visuals, copy, and collectible types.
- Progress in learning content is preserved; only the skin changes.

## 8) Functional Rules & Defaults (MVP)
- **Pass thresholds**: 
  - Daily quest completion requires roughly **80% accuracy** with limited hint usage.
  - Weekly boss pass also targets **80% accuracy** across its short sequence.
- **Timing**: Generous defaults; *Timer Extend* provides extra time without disabling scoring.
- **Streaks**: Streaks build via daily completions. Weekly boss does not affect streak directly. One weekly “streak shield” can prevent an unexpected break (earned, not bought).
- **Failure & Recovery**: Clear, one‑step review unlocks a new boss attempt the next day.
- **Transparency**: Always show why something was failed and how to improve.

## 9) Theme Examples (Functional Skins)

### 9.1 Sci‑Fi / Fantasy — “Campaign”
- **What XP feels like**: “Stardust” or “Mana.”
- **Daily quests**: “Patrols” or “Guild contracts.”
- **Weekly boss**: “Encounter” in a starship/dungeon room.
- **Collections**: Spell sigils, star charts, ship parts.
- **Power‑ups**: “Time Warp” (Timer Extend), “Clairvoyance” (Hint Peek).
- **Why this works**: Light story arc smooths repetition; clear chapter goals.

### 9.2 Music — “Studio & Stage”
- **What XP feels like**: “Fans.”
- **Daily quests**: “Studio sessions” (pronunciation lines, rhythm alignment).
- **Weekly boss**: “Audition” (deliver two lines cleanly).
- **Collections**: Track stems; assemble and “release” a short clip of your best lines.
- **Power‑ups**: “Metronome” (Timer Extend), “Backing Vocal” (Hint Peek).
- **Why this works**: Prosody practice maps naturally to rhythm and lines.

### 9.3 Movies / TV — “Director’s Cut”
- **XP**: “Audience Score.”
- **Daily**: Script reads, line shadowing, ADR‑style repeats.
- **Weekly**: “Table Read” (multi‑speaker comprehension).
- **Collections**: Props and stills tied to grammar milestones.

### 9.4 Explorer — “Travel & Food”
- **XP**: “Stamps” or “Miles.”
- **Daily**: City errands (ordering, directions, booking).
- **Weekly**: “Border Control” (rapid Q&A).
- **Collections**: Postcards, recipes.

### 9.5 Puzzle Lab — “Engineer It”
- **XP**: “Circuit Power.”
- **Daily**: Tile matches (audio → phrase), word‑order jigsaws.
- **Weekly**: “System Test” with planted traps.
- **Collections**: Components that visually assemble a gadget.

### 9.6 Speedrun — “Track Meet”
- **XP**: “Personal Best Index.”
- **Daily**: 30–90s sprints.
- **Weekly**: “Meet” (3 heats: listen, speak, read).
- **Collections**: Badges for beating your own baselines.

### 9.7 Habit Garden — “Cozy Growth”
- **XP**: “Growth Points.”
- **Daily**: Water/harvest cycles mapped to streaks and reviews.
- **Weekly**: “Bloom” event (pop‑quiz review).
- **Collections**: Plant varieties linked to vocab domains.
- **Power‑up**: “Sunshine” to delay streak decay once per week.

## 10) Example Arcs

### 10.1 Two‑Week Chapter (Sci‑Fi/Fantasy)
- **Goal**: “Survive the Outpost” (A1 travel & dining basics).
- **Structure**: 10 daily patrols + 2 weekly encounters.
- **Modifiers**: Week 2 can add a slight timer challenge with a small bonus.
- **Failure handling**: A single short review unlocks next‑day retry.

### 10.2 One‑Week Release (Music)
- **Goal**: Record a 10‑line chorus (greetings & introductions).
- **Structure**: 5 studio sessions + 1 audition.
- **Reward**: Completing four sessions assembles enough stems to “release” a short highlight clip.

## 11) Accessibility & Inclusion (Functional Requirements)
- Every audio cue offers captions; transcripts unlock after first attempt or when a hint is used.
- All actions are reachable via keyboard; focus order is predictable.
- Audio‑off path is available for each activity.
- Color choices include high‑contrast options; animations are calm and optional.
- Default pacing is generous, with a setting to slow down speech where appropriate.

## 12) Personalization & Safety
- Learners may name in‑theme entities (ship, band, garden) within safe word lists.
- Themes avoid copyrighted franchises; aesthetics are fan‑adjacent (e.g., “space opera,” “synthwave”).

## 13) Acceptance Criteria (Functional, Non‑Technical)
1. A learner can pick a theme during onboarding and switch it later without losing learning progress.
2. A daily quest is available once per local day and can be completed within about 2–5 minutes.
3. Completing **four** daily quests within any **seven‑day** window makes the weekly boss available.
4. Passing a boss grants a clear weekly reward and marks visible advancement in the current arc.
5. Failing a boss unlocks a brief, guided review and allows exactly one new attempt the next local day.
6. Power‑ups can be applied during an activity and meaningfully reduce difficulty without guaranteeing a pass.
7. Collections are earned through play; a weekly pass guarantees one themed item.
8. Event weeks apply a small, clearly described change without penalizing non‑participants.
9. Streak protection can be earned and used to prevent one unexpected streak break per week.
10. All core actions are achievable with keyboard only; captions and transcripts are available as described.
11. No surprise purchases or loot boxes; rewards and odds are clear when shown.
12. Typical session can be completed in ≤ 10 minutes.
13. Switching themes changes labels/visuals but does not alter grading or difficulty of the same tasks.

## 14) Future (Post‑MVP)
- Small co‑op activities (e.g., pooled streak protection “raids”/“jams”).
- Adaptive timers that tighten after demonstrated mastery and relax after misses.
- Lightweight shareables (image of a completed collection set; short audio snippet for Music).
- Additional themes (e.g., Nature, History, Mystery/Detective) that reuse the same mechanics.
