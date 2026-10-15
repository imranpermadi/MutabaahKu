---
target: landing showcase
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:D:\\Project\\MutabaahKu\\src\\components\\landing\\GuestLandingHero.tsx"
target_fingerprint: "sha256:d932a66a6789776b31b1b98a6ca2870e9a80443f6d3091b233af1ad91c9e13d1"
target_path: "D:\\Project\\MutabaahKu\\src\\components\\landing\\GuestLandingHero.tsx"
timestamp: 2026-10-15T09-15-32Z
slug: src-components-landing-guestlandinghero-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 2 | Header displays active mock counters (streak/stars) even for unauthenticated visitors, creating ambiguity about session state. |
| 2 | Match System & Real World | 3 | Culturally fluent in SDIT mutaba'ah terms (muroja'ah, paraf, rukun sholat). Minor technical jargon leaks ("FSRS-6", "Offline-First"). |
| 3 | User Control and Freedom | 3 | Provides dual conversion routes ("Daftar/Masuk" vs "Coba Demo Interaktif"). Lacks sticky anchor to return or convert once scrolled deep. |
| 4 | Consistency & Standards | 2 | Feature cards fall back to raw system emojis (🕌, 📖, 🌴, 🛡️) instead of styled Lucide vector icons, creating OS-dependent rendering. |
| 5 | Error Prevention | 2 | Guest actions in demo write to local IndexedDB without notice that clearing browser cache erases unlinked progress. |
| 6 | Recognition Rather Than Recall | 3 | High verbal clarity of SDIT features, but lacks visual illustrations or screenshot cues to recognize features. |
| 7 | Flexibility & Efficiency of Use | n/a | *Persuade surface mode:* Accelerators and shortcuts are inapplicable to top-of-funnel guest landing evaluation. |
| 8 | Aesthetic & Minimalist Design | 2 | Card grid condenses 4 feature cards and 3 footer badges into text-[11px] dense copy, causing visual fatigue on mobile. |
| 9 | Help Users with Errors | 3 | Login and role modals dismiss cleanly with clear inputs and error boundaries. |
| 10 | Help & Documentation | n/a | *Persuade surface mode:* Landing hero is self-contained marketing showcase; documentation docs are not applicable. |
| **Total** | | **20/32** | **Acceptable (62.5%)** |

*(Maximum renormalized to 32 points because Heuristics 7 and 10 are n/a for Persuade surfaces).*

### Design Specificity Verdict

**LLM Assessment**: High verbal authenticity with a generic visual archetype. The copy is exceptionally tailored to Indonesian SDIT Islamic elementary schools (referencing Kitab Sifat Shalat Nabi ﷺ by Syaikh Al-Albani, 7 points of sujud, FSRS-6 spaced repetition for Juz 30, and digital parent paraf). However, the visual presentation falls back to a standard SaaS marketing container with emoji icons and static text walls, lacking visual previews of the faceless chibi mascot or the date palm tree.

**Deterministic Scan**: 6 findings detected (1 warning, 5 advisory):
- `border-accent-on-rounded` (warning, line 46): Asymmetric `border-b-4` on `rounded-2xl` CTA button.
- `design-system-font-size` (advisory, lines 71, 84, 97, 110, 117): Repeated use of arbitrary `text-[11px]` off the documented DESIGN.md type ramp.

**Visual Overlays**: Headless CLI environment. Browser script injection was not executed; fallback deterministic CLI evidence used.

### Overall Impression
The hero excels at theological and pedagogical credibility for SDIT parents, but relies heavily on "telling rather than showing". Replacing text walls with animated mascot art, converting raw emojis to consistent Lucide icons, and clarifying guest vs logged-in state will dramatically lift conversion and user joy.

### What's Working
1. **Theological & Educational Accuracy**: Explicitly cites authentic salaf references and SDIT curriculum needs rather than generic ed-tech slogans.
2. **Tactile 3D Primary Button**: Bold amber CTA gives a tactile Duolingo-style click affordance.
3. **Low-Commitment Demo Route**: Allows cautious parents and teachers to test features before creating an account.

### Priority Issues
- **[P1] "Show, Don't Tell" Visual Deficit**: The hero describes faceless chibi animations and the date palm garden but shows none visually.
  - *Why it matters*: Kids and parents are visual decision-makers; text walls reduce emotional engagement.
  - *Fix*: Adopt a split hero layout with a live illustration of Si Hafiz / Si Hafizah on the right.
  - *Suggested command*: `$impeccable delight src/components/landing/GuestLandingHero.tsx`
- **[P1] Ambiguous Guest Session State in TopBar**: Unauthenticated visitors see active streak/star counts in the header.
  - *Why it matters*: Confuses users regarding whose account or session is currently active.
  - *Fix*: Display an explicit "Mode Tamu (Eksplorasi)" badge when `!currentUser`.
  - *Suggested command*: `$impeccable onboard src/App.tsx`
- **[P2] Raw System Emojis in Feature Grid**: Raw Unicode emojis (🕌, 📖, 🌴, 🛡️) clash with the tactile design system.
  - *Why it matters*: Emojis render inconsistently and harshly across OS platforms.
  - *Fix*: Replace with styled Lucide vector icons (`BookOpen`, `Compass`, `Sparkles`, `ShieldCheck`).
  - *Suggested command*: `$impeccable polish src/components/landing/GuestLandingHero.tsx`
- **[P2] Micro-Typography & Information Overload**: Dense paragraphs in `text-[11px]` crowd the 4-column grid.
  - *Why it matters*: Hard to read on mobile screens; causes cognitive fatigue.
  - *Fix*: Distill card copy into concise 1-line value points and elevate to `text-xs` (12px).
  - *Suggested command*: `$impeccable distill src/components/landing/GuestLandingHero.tsx`

### Persona Red Flags
- **Umi Maryam (SDIT Parent)**: Wants to verify that the mascot is genuinely faceless and syar'i before letting her children use it, but sees no visual preview.
- **Zaid (9yo 3rd Grader)**: Bounces from the text-heavy circular-letter look. Clicks the inviting yellow button only to be blocked by an email/password login modal.

### Minor Observations
- Unused Lucide imports (`BookOpen`, `Heart`, `Compass`, `Award`, `Users`) in `GuestLandingHero.tsx`.
- Emojis lack accessible `role="img"` and `aria-label` tags.

### Questions to Consider
1. *What if the hero featured an animated Si Hafiz waving or performing takbiratul ihram on the right side, proving the syar'i art style within 2 seconds?*
2. *What if the primary yellow button was "Coba Demo Sekarang" and "Masuk Akun" was secondary, honoring the Offline-First PWA philosophy?*
3. *What if the 4 static feature cards were replaced with interactive preview pills linked to the demo sections below?*
