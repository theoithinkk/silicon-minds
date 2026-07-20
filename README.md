<div align="center">

<img src="./docs/assets/dlsu-seal.png" alt="De La Salle University Seal" width="130" />

# Silicon Minds: The Evolution of the Mobile Microprocessor
### CSARCH2, Term 3 A.Y. 2025-2026
**De La Salle University - Manila**

Section S01, Group 5 &middot; Last updated July 13, 2026

</div>

---

## 1. Team and Contributions

| Member | GitHub | Role | Scope |
|--------|--------|------|-------|
| Theodore Rodolfo III Garcia | [@theoithinkk](https://github.com/theoithinkk) | Project Lead, Frontend Architecture and UI/UX | Architecture, all three interactive components, visual system, template integration, deployment, accessibility, final QA |
| Schuyler Garcia | [@SchuylerGYo](https://github.com/SchuylerGYo) | Content Research Lead | Era narratives, processor dataset, component refinement, proofreading |
| Maria Fides Bancoro | [@m-fides](https://github.com/m-fides) | Content Research and Visual Assets | Exhibit copy, era descriptions, SVG chip artwork |
| Nathaniel Singh | [@Redaw-t](https://github.com/Redaw-t) | Quiz Design and QA | Trivia question bank, explanations, testing |
| Marc Jared Sean Ercia | [@MarcErcia](https://github.com/MarcErcia) | UI/UX Draft and Background Component | Layout drafts, circuit background |

---

## 2. Proposal Phase

### 2.1 The Original Proposal

Our first proposal was *GPU Evolution: From Fixed-Function Pipelines to Massively Parallel AI Accelerators*. Same five-era structure we ended up reusing, but tracing GPUs. The centerpiece was a 3D GPU Viewer built on Three.js and React Three Fiber, loading GLTF models users could orbit.

### 2.2 Why We Pivoted

Two reasons.

**Another group had the same topic.** Overlapping would have meant two exhibits covering the same ground in one museum, so one of us had to move.

**The interactive components were going to be difficult to execute.** The 3D viewer was the main problem. Accurate 3D models of real GPUs are either commercial, licensed in ways that do not survive a public GitHub Pages deploy, or bad enough to hurt the exhibit, and modeling them ourselves was not realistic for one term. Three.js plus React Three Fiber plus model files is also heavy for a static exhibit that gets merged into a shared museum site. On top of that, a 3D orbit viewer is hard to make keyboard operable and meaningful to a screen reader. The original proposal handled that with `role="application"` and arrow-key controls, which passes a checklist without giving a non-visual user the content.

Mobile microprocessors solved both problems and gave us a better story. Every era is forced by a constraint you can feel in your own pocket: battery, heat, size. Schuyler pushed this hardest, and it is why the exhibit is framed around engineering tensions instead of spec tables.

We kept the five-era structure, the style guide, and the accessibility targets. The 3D viewer became the Evolution Simulator, which gives the same payoff with no 3D dependency.

### 2.3 The Five Eras

Era boundaries took a while because the real history does not have clean edges.

| Era | Period | Tension |
|-----|--------|---------|
| Birth of Mobile CPUs | Mid-1990s to early 2000s | Battery life vs. doing any computing at all |
| The ARM Revolution | 2007-2012 | ISA efficiency vs. the single-core ceiling |
| The Multicore Era | 2011-2014 | The frequency wall vs. multitasking demand |
| The System-on-Chip Era | 2015-2020 | Discrete components vs. integration |
| The AI & Efficiency Era | 2021-present | Raw speed vs. performance-per-watt |

The ARM Revolution and Multicore Era overlap on 2011-2012. We debated cutting it and kept it, because forcing a hard boundary would misrepresent the timeline. The eras are tensions, not date ranges. Schuyler's point was that a reader who notices the overlap has understood it.

### 2.4 The Three Components

We wanted three components that each did something the others could not:

- **Timeline Explorer for depth.** Be able to interrogate a single chip and compare two directly to get a better understanding of how different they are.
- **Evolution Simulator for scale.** Be able to run the same workload across eras so the generational gap is felt instead of read.
- **Trivia Quiz for retention.** Be able to close the loop after browsing, and show the visitor which eras they did not absorb.

We considered a fourth, a die-area visualizer showing how the CPU/GPU/NPU floorplan split changed over time. Cut for scope, and because floorplan data is not public for most of these chips. It survives as the die-size row in the spec cards.

---

## 3. Technical Decisions

### 3.1 Stack

Astro was required. It ships zero JavaScript by default and lets you hydrate individual components, which fits an exhibit that is mostly static prose with three heavy interactive pieces. The era narratives cost nothing. Only the components pay for their own interactivity.

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Astro | Required; islands fit a mostly-static exhibit |
| Interactive UI | React 18 | Team familiarity, good Astro integration |
| Styling | Tailwind CSS | Fast iteration, styling stays next to markup |
| Animation | Framer Motion | Declarative, handles `prefers-reduced-motion` cleanly |
| Icons | Lucide React | One icon system, tree-shakeable |
| Content | Astro content collections | Schema-validated data, separate from presentation |
| Hosting | GitHub Pages + Actions | Required, free static hosting with CI |

Tailwind was the one argument. Marc wanted plain CSS modules, saying utility classes would make the markup unreadable. He was partly right. The compromise shows up across the codebase: layout and spacing use Tailwind, but anything with design intent (buttons, cards, era accents) is a named class in the stylesheet. So there is one definition of a primary button instead of the same utility string repeated nine times.

### 3.2 Data Architecture

So far one of the most important decisions we made was to have the content and the presentation be separated. Processors, eras, and quiz questions live as JSON in `src/content/`, validated by Zod schemas in `src/content/config.ts`.

Processor schema:

```
id, name, eraId, cores, coreConfig, clockSpeedGHz,
dieSizeMm2, transistorCount, processNodeNm, notableFeature,
reference: { source, url }
```

Two payoffs we did not plan for:

**Updating the dataset was data-only.** Bringing it current through the Apple A19 Pro and Snapdragon 8 Elite Gen 5 changed zero component files. Six objects in a JSON array, and the Timeline, Simulator, and About page all updated themselves.

**The schema caught our mistakes.** Zod runs at build time, so a bad entry fails the build instead of rendering as `undefined`. When we added the `reference` field, we typed the URL as `z.string().url()`, so a typo'd citation link breaks the build instead of shipping a dead link.

### 3.3 Component Architecture

All three components are React islands mounted with `client:load`. Each gets its data as props from the Astro page, which reads the content collections at build time. Nothing fetches at runtime, which keeps the exhibit fully static.

One rule we mostly kept: components own interaction state, never content. The Timeline Explorer knows which chip is open and whether a comparison is running. It knows nothing about what a processor is beyond the shape of its props. That is why one component renders 36 chips it was never specifically told about.

### 3.4 Template Integration and Routing

The most frustrating work in the project, with the least to show for it visually.

The exhibit had to slot into a shared class template that gets merged with every other group's submission. The template ships two layouts, `HomepageLayout.astro` and `ExhibitLayout.astro`, both marked do not modify. The homepage layout globs the `pages/` directory and builds the exhibit list automatically.

Our first attempt was wrong in a useful way. We treated several template files as unused scaffolding, deleted them, and wired our pages in directly. The build passed and the site looked fine, which is why it took a while to notice the structure no longer matched what the merge expects. Those files were the contract. We restored them from git history and started over.

Final structure:

```
src/pages/
├── index.mdx              → hub, locked HomepageLayout, auto-lists exhibits
├── linux.mdx              → template's sample exhibit, kept intact
├── silicon-minds.mdx      → our entry point, the real homepage
└── silicon-minds/
    ├── explore.astro
    ├── timeline.astro
    └── about.astro
```

Two constraints shaped this:

**The locked layouts stay untouched.** They use CSS classes (`.titleheading`, `.toc__list`, `.header`, `.article`) our dark theme never defined, so the hub page rendered as unstyled text on black. We supplied the styling through the `styles/` directory, which is allowed, instead of editing the layout.

**Custom layouts need a group prefix.** Ours was `BaseLayout.astro`, which would almost certainly collide once five sections of groups merge into one repo. Renamed to `S01_Group5_BaseLayout.astro`.

### 3.5 Deployment

A GitHub Actions workflow runs on push to `main`: `npm ci`, build with Astro, upload artifact, deploy to Pages.

The part that took longest to understand: the workflow overrides the site and base path at build time using the repo's own Pages settings, not `astro.config.mjs`. That is why the same commit deploys correctly to two repos with two different base paths without editing a config. We only worked this out while debugging why a test deploy succeeded with a config we expected to be wrong.

Before that, the base path cost us real time. It was set without a trailing slash, which broke every internal link and image on the site. No error, clean build, every URL quietly concatenated wrong. One character.

### 3.6 Accessibility

We targeted WCAG 2.1 AA and treated it as a requirement, though we still needed a remediation pass, which is its own lesson.

Built in from the start:
- Visible 2px focus rings on every interactive element
- `aria-label` on every icon-only control
- `role="region"` and live-region summaries on the Simulator, since its output is a visual animation
- Full keyboard operability on all three components
- `prefers-reduced-motion` honored throughout

Caught in the remediation pass:
- Several elements used reduced opacity for hierarchy and fell below 4.5:1 once measured. Computing the real ratios was the only way to find these.
- The mobile menu toggle used `display: none`, which drops an element out of the tab order entirely. Replaced with a visually hidden but focusable pattern, and excluded from the tab order on desktop where the hamburger is not rendered.
- The Simulator's metrics table was missing `scope="col"`, so screen readers could not tie headers to data.

### 3.7 Citations and Accuracy

Late on, we added a `reference` field to every processor. It shows as a source link on each Timeline card and is collected by era into a References section on the About page.

Adding citations turned into an accuracy audit, which was not the plan. Cross-checking each chip against its source surfaced errors that had been sitting in the dataset:

| What the data said | Correction |
|---|---|
| Cortex-A8 was out-of-order | It is in-order dual-issue. Out-of-order came with the Cortex-A9 |
| The original 2007 iPhone used a Cortex-A8 | It used an ARM11. The Cortex-A8 debuted in the iPhone 3GS |
| Snapdragon S1 MSM7227 used a Scorpion core | It is ARM11. Scorpion shipped in the QSD8250 |
| StrongARM SA-110 powered early iPAQs | It powered the Apple Newton MessagePad. The iPAQ used the SA-1110 |
| MSM3100 paired an ARM9 with a baseband DSP | It is ARM7TDMI-based |
| Helio X30 was the first 10nm mobile SoC | Snapdragon 835 and Exynos 8895 hit 10nm production first |
| Exynos 2400 was the first Exynos GPU with ray tracing | The Exynos 2200's Xclipse 920 had it first |

Each had to be fixed in two places, since the quiz repeated several of them. One was worse than a bad description. The iPhone error was baked into a quiz question whose correct answer was wrong, which actively teaches a visitor something false.

---

## 4. Creative Decisions

### 4.1 Visual Direction

The look settled early and barely moved. References were system diagnostic tools, chip datasheets, and the interfaces engineers actually use with hardware, plus some borrowing from VS Code dark themes and Cyberpunk 2077.

The reasoning: an exhibit about processors should feel like its subject. A bright, rounded, friendly design would have been easier and would have felt like a website about processors instead of something that shares their aesthetic.

What we committed to:
- Near-black background (`#0A0A0F`) instead of mid-grey
- JetBrains Mono for every number, spec, and technical value
- Cyan as the interface accent, standing in for a powered state
- Glow instead of drop shadow. Drop shadows read as paper, glow reads as emitting light

### 4.2 The SVG Chip

Early prototypes used photos of real processors, and it was hard to make them work. Only stock images were available rather than anything we shot ourselves, and 36 different processors pulled from a grab-bag of stock photography, each with its own lighting, angle, and background, never looked consistent or good side by side.

The replacement is one parametric SVG component, `ChipFloat`. It draws a tilted die with a metallic gradient, gold pins on each edge, four mounting holes, and optional connector traces. Props are color, size, rotation, variant, and animation delay.

It beat the photos:
- All 36 processors and 5 era colors come from one file instead of dozens of images
- It recolors per era for free
- It scales to any size with no asset pipeline and costs almost nothing to load
- It animates natively, since it is markup

Fides and Marc both worked on the artwork with Theodore. Getting the pin spacing and die proportions to read as a processor at 22px and at 420px took more iteration than expected.

### 4.3 Era Colors

Each era owns an accent: cyan, emerald, amber, violet, pink. The rule is that the color follows the era everywhere. Timeline stations and chip cards, era filter buttons, the Simulator's lane, the quiz era badge, the per-era result bars.

The point is that a visitor can tell which era they are in without reading a label, and that amber in the quiz results connects back to the amber section of the timeline. Small thing, but it holds a five-section exhibit together.

We changed one. The Multicore Era was originally a second blue and read as the same as era one at a glance.

### 4.4 Timeline Layout

The Timeline Explorer was rebuilt visually late in the project. Worth documenting, because the first version was not broken, it was just flat.

The original was small uniform tiles wrapping in rows under a thin era heading. It worked. It just did not read as a timeline. No spine, no progression, and every tile used the same generic chip icon, so 36 processors looked like 36 identical buttons.

The rebuild added:
- A left rail with numbered era stations, joined by connectors that fade from one era's color into the next, so progression reads top to bottom
- Richer chip cards with the era accent as a top border, a process-node badge, cores, and clock
- A per-chip performance bar showing relative compute against the newest chip

The performance bar justified the rebuild. It runs from about 5% on a 1990s part to over 90% on a 2025 flagship, so a visitor sees thirty years of scaling before opening a single card.

### 4.5 Motion

The rule: animation has to communicate something or it does not ship.

All components that move have a job: progress bars show magnitude, simulator lanes show relative speed, spec cards rise on entry to show they sit above the timeline, background pulses travel along traces to suggest a powered board, and scroll reveals stagger to guide reading order.

Everything respects `prefers-reduced-motion` and jumps to its end state, with one exception. In the Simulator the animation is the content, so for reduced-motion users it completes instantly and announces the result through the live region. That keeps the finding even though it drops the experience.

The circuit background's blinking nodes and travelling pulses are off by default and sit behind a toggle in the corner of the page, so a visitor who finds ambient motion distracting never has to see it, and the choice is remembered across pages.

### 4.6 Team Card Reveal

Just for fun we made the team member cards boot their photo like a CRT. Hovering or focusing a card flashes the screen on from a thin line, sweeps a scanline down, and flickers a LOADING indicator before the photo resolves.

It ties the one page about people back into the hardware language of the rest of the exhibit. It also degrades honestly, falling back to a NO SIGNAL panel with initials if a photo is missing.

---

## 5. Aha Moments

**Separating data from UI paid off more than expected.** We did it for tidiness. We got a dataset we could update through 2026 by editing one file, and a schema that catches bad entries at build time instead of at grading time.

**One missing character can break a whole deployed site.** The base path without a trailing slash gave no error and no warning, just a broken site. Anything that builds a URL by concatenation deserves suspicion.

**SVG beat every raster option.** We moved to vectors because stock photos of real chips never looked consistent together, and it felt like a compromise at the time. It was an upgrade.

**A chart's number and its shape have to use the same math.** A spec bar was drawn on a log scale while its label printed a linear percentage. A value reading 61.5% looked about 80% full. Both were fine alone. Side by side it was obviously lying.

**Astro islands need explicit hydration or they are decorative.** Without `client:load` a component renders perfectly and responds to nothing. No error, because nothing is wrong. Astro was just never asked to ship the JavaScript.

**Server and client output have to match or React notices.** The quiz shuffled once at build and again on load. Both random, so they almost never matched, and the first question visibly swapped after the page settled.

**Unused and not yet wired up are different things.** Deleting the template files we assumed were scaffolding cost real time. The build stayed green the whole way, which is why it was hard to catch.

**Reading a working implementation beats re-reading instructions.** The template routing did not click from the written guide. It clicked in five minutes of looking at a repo that already did it right.

**Adding citations audits your content whether you want it to or not.** We added sources for credibility. Checking against them found seven factual errors, including a quiz question whose correct answer was wrong.

**Small navigation aids matter more on long pages than they look like they will.** The Explore page runs past 13,000 pixels. Without the progress bar and back-to-top button it is easy to lose your place.

---

## 6. Challenges

### 6.1 Stacking Contexts Hid the Circuit Background

The animated background was invisible for a day despite a negative z-index. Nothing was wrong with the SVG. An opaque background color on a wrapper several levels up was painting over it. The fix meant checking every layer between the background and the viewport, then making the body and its wrapper transparent.

### 6.2 Inline Styles Beat `:hover`

The quiz answer buttons set colors inline, and inline styles outrank stylesheet rules, so the hover state never appeared. Instead of forcing it with `!important`, we moved the unanswered state into a CSS class so the cascade could work. The same bug showed up later in the Timeline rebuild, where an inline `transform` blocked a hover lift, and was fixed the same way.

### 6.3 The Simulator Ran Backwards

An early build had the timing inverted, so the fastest era's bar took the longest to fill. Internally consistent and completely wrong, since a race means faster finishes sooner. We rebuilt it so the slowest selected era anchors the duration and every faster era finishes proportionally earlier.

### 6.4 Quiz Hydration Mismatch

Covered above. The fix was shuffling only on the client inside `useEffect`, so exactly one random draw happens. Try Again was upgraded at the same time to deal a genuinely new set of fifteen instead of reshuffling the same fifteen.

### 6.5 A Nav Refactor Broke a CSS Selector

The mobile menu animation depended on two elements being direct siblings. A refactor moved one. The animation stopped silently, with no error pointing anywhere near the cause. CSS that depends on structure is only as stable as that structure.

### 6.6 Deployment Failures Pointing at the Wrong File

Two Actions builds failed after a working deploy, with an unresolved import that looked like the template files were at fault. Those files were needed and were kept. The real cause was routing not correctly referencing both the template structure and our MDX content after transformation.

A subtler version of the same thing: `npm ci` failing because `package.json` and `package-lock.json` had drifted apart. A local `npm install` succeeds in that state. The CI's clean install does not. We now verify with the same command the pipeline uses.

### 6.7 Undisclosed Specifications

Several recent chips have never had figures like transistor counts published. Instead of guessing, those fields are marked undisclosed and estimates are flagged as estimates. Less satisfying than a full table, and the only honest option.

### 6.8 Two Interaction Models Fighting

The Timeline originally used one click to open a chip and a second click on any other chip to enter compare mode. The same gesture did two things depending on hidden state, so a visitor reading specs could trigger a comparison by accident, and nobody found compare mode until they stumbled into it.

We separated the two intents. A click always opens one chip. Compare is opt-in through a button on the open card, which pins that chip and drops the interface into a labelled pick mode with a banner and a cancel control. Nathaniel found this in testing. He kept getting a comparison when he only wanted to read, which is basically the whole bug report.

### 6.9 An Animation That Would Not Unmount

While rebuilding the compare view, clearing a comparison left the old panel in the DOM at zero height and zero opacity. Invisible on screen, still in the accessibility tree, so a screen reader would announce a comparison that was not there. A Framer Motion exit animation was never finishing. Replacing the animated exit with a plain conditional render fixed it, trading a bit of polish for correctness.

---

## 7. Testing

Mostly manual, mostly Nathaniel, with Theodore on build verification and accessibility audits.

| Area | Method |
|------|--------|
| Build integrity | `npm ci` + `npm run build` before every push, matching CI |
| Content validation | Zod schemas at build time |
| Interaction flows | Manual pass on all three components after every significant change |
| Keyboard | Tab-only navigation through every page and component |
| Contrast | Computed luminance ratios instead of visual judgement |
| Responsive | 375px, tablet, desktop; verified no horizontal overflow anywhere |
| Routing | Every internal link followed after the restructure |

What we did not do: there is no automated test suite. For a static exhibit this size the tradeoff did not clearly favor writing one, but it means every regression was caught by a person looking at a screen.

---

## 8. Timeline

| Phase | Focus |
|-------|-------|
| 1. Proposal | GPU Evolution drafted and submitted, feedback received |
| 2. Pivot | Re-scoped to mobile microprocessors, components redesigned without the 3D viewer |
| 3. Foundation | Astro set up, content schemas defined, datasets researched and entered |
| 4. Components | Timeline Explorer, Evolution Simulator, and Trivia Quiz built and hydrated |
| 5. Visual Design | Theme, SVG chip artwork, circuit background, era colors |
| 6. Deployment | Actions pipeline, base path debugging, first live build |
| 7. Accessibility | WCAG 2.1 AA remediation, keyboard and contrast fixes |
| 8. Template Integration | Routing restructured, locked layouts styled without modification, layout renamed |
| 9. Sourcing | Citations added, specification audit and corrections across data and quiz |
| 10. Refinement | Timeline interaction separated, Timeline rebuilt as a connected visual timeline |

---

## 9. Individual Contributions

### Theodore Rodolfo III Garcia: Project Lead, Frontend Architecture and UI/UX

- System architecture, including the content-collection data model and island component structure
- Built all three interactive components
- Designed and implemented the visual system: theme, era colors, `ChipFloat` SVG component, page layouts
- Owned template integration and the routing restructure, including recovery after the first wrong approach
- Set up and debugged the Actions pipeline; diagnosed the base path, `npm ci` sync, and MDX routing failures
- Ran the WCAG 2.1 AA remediation, including contrast auditing and the keyboard-accessible mobile menu
- Implemented the citation system and led the specification audit
- Rebuilt the Timeline Explorer twice, once for interaction and once for visual design
- Final QA, cross-page verification, responsive testing

### Schuyler Garcia: Content Research Lead

- Led research on the five-era structure and argued the framing around engineering tensions, which shaped the whole exhibit
- Researched and compiled the processor dataset
- Wrote the era descriptions and narrative connective tissue
- Assisted with refining Astro components and page composition
- Technical proofreading across era descriptions and processor notes

### Maria Fides Bancoro: Content Research and Visual Assets

- Wrote a large share of the visitor-facing copy
- Researched era context and supporting detail
- Contributed to the `ChipFloat` artwork, particularly proportions and pin detailing
- Reviewed content for tone consistency across pages

### Nathaniel Singh: Quiz Design and QA

- Authored the full trivia question bank across all five eras, including every option
- Wrote the answer explanations, which teach instead of just confirming right or wrong
- Designed the per-era scoring breakdown for the results screen
- Primary manual tester, and the one who caught the Timeline's view-versus-compare confusion
- Regression testing after each major change

### Marc Jared Sean Ercia: UI/UX Draft and Background Component

- Produced the initial layout drafts that set the direction the final design follows
- Proposed and helped build the animated circuit background
- Contributed to the SVG chip artwork
- Argued for named component classes over raw utility strings, which shaped how the stylesheet is organized

---

## 10. What We Would Do Differently

**Build accessibility in from the first component.** Every fix in the remediation pass took longer than doing it right the first time. The mobile menu had to be restructured instead of adjusted.

**Deploy early to catch environment-only bugs.** The base path bug only existed in production. One early deploy would have found it before it broke every link.

**Attach sources while entering data.** Doing citations last turned into an audit that found seven errors. Doing them during entry would have stopped most of them being written down at all.

**Read a working reference before writing integration code.** We spent real time interpreting template requirements from prose. Looking at a repo that already satisfied them was faster and unambiguous.

**Question interaction models out loud earlier.** The Timeline's overloaded click survived for weeks because the person who built it knew how it worked. It took a tester who did not.

---

## 11. AI Declaration

ChatGPT and Claude were used as supplementary learning and development tools:

- **Learning Astro.** None of us had used it before. Used early to understand island architecture, in particular why a component renders but does not respond until `client:load` is added.
- **Prototyping the SVG chip artwork.** The initial structure of `ChipFloat`, including gradient definitions and the parametric props, was drafted with assistance and then tuned by hand.
- **Developing the circuit background.** Used to work out the repeating SVG trace tile, staggered node blink timing, and `animateMotion` for the traveling pulses, plus diagnosing why the layer was invisible at first.
- **Debugging deployment failures.** Reading Actions build logs and tracing failures back to the actual cause instead of the file the error named.
- **Diagnosing specific bugs**, including the CSS sibling selector, the React hydration mismatch, and computing WCAG contrast ratios.
- **Matching the site to the class template**, including how the hub and nested-page routing maps onto our four-page site, and how to style the locked layouts without modifying them.
- **Fact-checking processor specifications**, cross-checking specs against their sources and surfacing figures that were wrong or overstated, which members then verified and corrected.

All final implementation decisions, customization to fit our design and content, testing, and verification were carried out by the project members.

## 12. References

References are grouped into three sets: the general and industry sources used while researching and writing the exhibit, the per-processor sources that back every chip's spec card and the About page's citation list, and the documentation for the tools the site is built on.

### 12.1 General and Industry Sources

Beebom. (2024). *Qualcomm Snapdragon 8 Elite announced: Custom Oryon cores, up to 4.32GHz clock speed*. https://beebom.com/qualcomm-snapdragon-8-elite-announced/

Beebom. (2024). *MediaTek Dimensity 9400 announced with all-new Cortex-X925 core*. https://beebom.com/mediatek-dimensity-9400-announced/

Furber, S. (2000). *ARM system-on-chip architecture* (2nd ed.). Addison-Wesley.

Gizmochina. (2025). *Snapdragon 8 Elite Gen 5 vs Dimensity 9500 vs Apple A19 Pro: Benchmarks and specs*. https://www.gizmochina.com/2025/10/20/snapdragon-8-elite-gen-5-vs-dimensity-9500-vs-apple-a19-pro-benchmarks-and-specs/

GSMArena. (2024). *Fastest mobile chipsets ranked: Compare smartphone processor performance*. https://www.gsmarena.com/fastest_mobile_chipsets_ranked_compare_smartphone_processor_performance-news-73072.php

Notebookcheck. (2024). *Apple A18 Pro processor: Benchmarks and specs*. https://www.notebookcheck.net/Apple-A18-Pro-Processor-Benchmarks-and-Specs.891556.0.html

Notebookcheck. (2024). *Qualcomm Snapdragon 8 Elite processor: Benchmarks and specs*. https://www.notebookcheck.net/Qualcomm-Snapdragon-8-Elite-Processor-Benchmarks-and-Specs.908499.0.html

Notebookcheck. (2024). *MediaTek Dimensity 9400 processor: Benchmarks and specs*. https://www.notebookcheck.net/Mediatek-Dimensity-9400-Processor-Benchmarks-and-Specs.921380.0.html

Patterson, D. A., & Hennessy, J. L. (2021). *Computer organization and design: The hardware/software interface* (6th ed.). Morgan Kaufmann.

### 12.2 Per-Processor Sources

The same 22 sources cited inline on each processor's spec card in the Timeline Explorer and collected on the About page, listed here once each.

Wikipedia contributors. (n.d.). *Apple A4*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A4

Wikipedia contributors. (n.d.). *Apple A6*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A6

Wikipedia contributors. (n.d.). *Apple A7*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A7

Wikipedia contributors. (n.d.). *Apple A9*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A9

Wikipedia contributors. (n.d.). *Apple A10*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A10

Wikipedia contributors. (n.d.). *Apple A15 (Apple A15 Bionic)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A15

Wikipedia contributors. (n.d.). *Apple A17 (Apple A17 Pro)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A17

Wikipedia contributors. (2024). *Apple A18 (Apple A18 Pro)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A18

Wikipedia contributors. (2025). *Apple A19 (Apple A19 Pro)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A19

Wikipedia contributors. (n.d.). *ARM7 (ARM7TDMI)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/ARM7

Wikipedia contributors. (n.d.). *ARM Cortex-A8*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/ARM_Cortex-A8

Wikipedia contributors. (n.d.). *DragonBall (Motorola DragonBall EZ)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/DragonBall

Wikipedia contributors. (n.d.). *Exynos (Samsung Hummingbird / S5PC110, Exynos 5 Dual, Exynos 8890, Exynos 2400)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Exynos

Wikipedia contributors. (n.d.). *HiSilicon (Kirin 960)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/HiSilicon

Wikipedia contributors. (n.d.). *List of Qualcomm Snapdragon systems on chips*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/List_of_Qualcomm_Snapdragon_systems_on_chips

Wikipedia contributors. (n.d.). *MediaTek (MT6589)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/MediaTek

Wikipedia contributors. (n.d.). *MediaTek Dimensity (9300, 9400, 9500)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/MediaTek_Dimensity

WikiChip. (n.d.). *Qualcomm MSM3100*. https://en.wikichip.org/wiki/qualcomm/msm3100

Wikipedia contributors. (n.d.). *OMAP (OMAP1, OMAP3430)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/OMAP

Wikipedia contributors. (n.d.). *StrongARM (Intel StrongARM SA-110)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/StrongARM

Wikipedia contributors. (n.d.). *Tegra (Nvidia Tegra, Tegra 2)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Tegra

Wikipedia contributors. (n.d.). *XScale (Intel XScale PXA250)*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/XScale

### 12.3 Technology and Documentation

Astro. (n.d.). *Astro documentation*. https://docs.astro.build/

GitHub, Inc. (n.d.). *GitHub Actions documentation*. https://docs.github.com/en/actions

GitHub, Inc. (n.d.). *GitHub Pages documentation*. https://docs.github.com/en/pages

Lucide. (n.d.). *Lucide icon library*. https://lucide.dev/

McDonnell, C. (n.d.). *Zod documentation*. https://zod.dev/

Meta Platforms, Inc. (n.d.). *React documentation*. https://react.dev/

MDX. (n.d.). *MDX documentation*. https://mdxjs.com/

Motion (Framer). (n.d.). *Motion for React documentation*. https://www.framer.com/motion/

Tailwind Labs. (n.d.). *Tailwind CSS documentation*. https://tailwindcss.com/docs

World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

---

## Original Proposal

*Preserved exactly as submitted, as the historical record of what was originally pitched.*

# Silicon Minds: The Evolution of the Mobile Microprocessor
### Virtual Exhibit Proposal — CSARCH2, Term 3 A.Y. 2025-2026
**De La Salle University - Manila**

---

### 1. Group Information

#### 1.1 Proposed Title
Silicon Minds: The Evolution of the Mobile Microprocessor

#### 1.2 Member Roster

| # | Full Name | GitHub Handle |
|---|-----------|----------------|
| 1 | Maria Fides Bancoro | [@m-fides](https://github.com/m-fides) |
| 2 | Marc Jared Sean Ercia | [@MarcErcia](https://github.com/MarcErcia) |
| 3 | Theodore Rodolfo III Garcia | [@theoithinkk](https://github.com/theoithinkk) |
| 4 | Theon Schuyler Garcia | [@SchuylerGYo](https://github.com/SchuylerGYo) |
| 5 | Nathaniel Singh | [@Redaw-t](https://github.com/Redaw-t) |

#### 1.3 Detailed Project Description

**Silicon Minds: The Evolution of the Mobile Microprocessor** is an immersive, interactive virtual museum tracing the architectural journey of the mobile microprocessor. From their origins as simple processors designed for mobile communication devices to their current role as the engines powering smartphones, tablets, and other everyday mobile devices, the museum explores how mobile processors have evolved and improved over the years to meet modern computing demands.

Visitors are guided through five landmark eras in mobile microprocessor development: **The Birth of Mobile CPUs**, **the ARM Revolution**, **the Multicore Era**, **the System-on-Chip Era**, and **the AI & Efficiency Era**. Each era is framed around a compelling narrative arc of the limitations that drove innovation, the architectural breakthroughs that followed, and the ripple effects these advancements had on mobile device performance, power efficiency, and user experience. Rather than presenting history as a sequence of technical specifications, the exhibit tells the story of how the constantly increasing demands for speed, battery life, and multitasking influenced the design of mobile microprocessors.

To make these concepts tangible, the exhibit integrates three core interactive experiences. The **Microprocessor Timeline Explorer** serves as the center of the exhibit, allowing users to explore major mobile microprocessor generations and examine their specifications. The **Mobile Processor Evolution Simulator** will help users visually analyze how processors from different generations handle the same workloads, revealing the improvements in performance. Lastly, the **Mobile Microprocessor Trivia Quiz** will test the visitors on their understanding of the presented key concepts in an engaging, low-stakes format.

At the end of the exhibit, visitors would have developed a clear, intuitive understanding of not only how mobile microprocessors evolved, but also why the innovations that emerged through the years led to the powerful processors modern mobile devices have. They will gain insight into how advancements improved and transformed devices from simple communication tools to powerful and heavily functional computing platforms used in everyday life today.

---

### 2. Topic Theme

#### 2.1 Overview

The mobile microprocessor stands as one of the most consequential innovations in computing history. Beginning as a modest, low-power adaptation of desktop RISC designs, it has grown into a highly integrated, AI-capable system-on-chip that fits in the palm of a hand, yet rivals laptop-class performance. This exhibit traces that evolution across five distinct eras, each defined by a breakthrough in architecture, manufacturing, or capability that permanently changed what mobile devices could do. The narrative is organized around the engineering tensions that drove each transition — from battery-life constraints that forced creative core design to consumer demand for richer applications that pushed transistor counts into the billions.

#### 2.2 Five Eras of Mobile Microprocessor Evolution

| Era | Period | Key Milestone |
|-----|--------|----------------|
| **Birth of Mobile CPUs** | Mid-1990s–Early 2000s | Early low-power RISC processors adapted for mobile phones. E.g., ARM7TDMI, Intel StrongARM, Motorola DragonBall. |
| **The ARM Revolution** | 2007–2012 | ARM architecture dominates smartphones; dedicated ISPs and DSPs emerge. E.g., ARM Cortex-A8, Apple A4, Qualcomm Snapdragon S1. |
| **The Multicore Era** | 2011–2014 | Dual- and quad-core mobile CPUs arrive, boosting multitasking and app performance. E.g., NVIDIA Tegra 2, Apple A6, Qualcomm Snapdragon 600. |
| **The System-on-Chip Era** | 2015–2020 | Highly integrated SoCs combine CPU, GPU, modem, and memory on a single die. big.LITTLE heterogeneous cores improve power efficiency. E.g., Apple A9, Qualcomm Snapdragon 820, Samsung Exynos 8890. |
| **The AI & Efficiency Era** | 2021–Present | Dedicated NPUs enable on-device AI; TSMC 3nm/4nm nodes push performance-per-watt to new heights. E.g., Apple A17 Pro, Qualcomm Snapdragon 8 Gen 3, MediaTek Dimensity 9300. |

---

### 3. Tech Stack Plan

#### 3.1 Core Technologies

The following table summarizes the full technology stack, aligned to the project requirements (Node.js 26, Astro 6) and optimized for seamless integration into the central museum website.

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 26 | Required per project specs; LTS stability. |
| Framework | Astro 6 | Static-site generation with island architecture; forked from provided template. |
| Content | .mdx files | MDX (Markdown + JSX) for rich, component-embedded content pages. |
| Interactive UI | React 18 (.jsx) | All interactive components built as React islands embedded in .mdx. |
| Styling | Tailwind CSS v4 | Utility-first CSS; follows the central museum template style guide. |
| Version Control | Git / GitHub | Repository forked from template; all docs, plans, and feedback tracked via commits. |
| Responsive | CSS Grid / Flexbox | Mobile-first breakpoints; timeline scrolls horizontally on desktop, vertically on mobile. |
| Animation | Framer Motion | Handles smooth animations, transitions, and interactive feedback. |
| Icons | Lucide React | Consistent icon system for UI controls, era tags, and tooltip pins. |
| Hosting | GitHub Pages | Static output deployed via `astro build`; automated via GitHub Actions on push to main. |

#### 3.2 Mobile Responsiveness

All components are built mobile-first:

- **Mobile Microprocessor Trivia Quiz:** Question cards stack vertically and fill the screen width on mobile (<640px). Answer buttons expand to full width for easy tap targets (min-height: 48px). Score card collapses to a single centered summary panel.
- **Microprocessor Timeline Explorer:** Horizontal scroll on desktop (≥768px); switches to a vertical stacked card layout on mobile. Expanded spec cards go full-width. Era filter buttons collapse into a horizontally scrollable pill row.
- **Mobile Processor Evolution Simulator:** On mobile (<640px), selected era panels are stacked vertically so each simulation is visible on the screen. The Era Highlights (information) and Performance Metrics sections are collapsible and can be expanded when the user chooses to do so. On desktop, simulation panels are displayed side by side, while Era Highlights and Performance Metrics panels remain visible below the simulation for easy comparison.

---

### 4. Interactive Components

| # | Component | Type | Summary |
|---|-----------|------|---------|
| 1 | **Mobile Microprocessor Trivia Quiz** | Quiz | Knowledge check supporting what users have learned after browsing through the five eras of mobile microprocessor evolution. Each question is tagged to a specific era. Incorrect responses reveal a short explanation clarifying the right answer. |
| 2 | **Microprocessor Timeline Explorer** | Interactive Timeline | The central feature of the museum; allows users to trace the evolution of mobile microprocessors across different eras, present key generations, examine specifications, and differentiate developments across eras. |
| 3 | **Mobile Processor Evolution Simulator** | Simulation | Helps users visualize the evolution of mobile microprocessors by running the same task workload across processors from different eras. Users compare performances through real-time workload animations demonstrating how each generation's architectural innovations improved speed, efficiency, and task management over time. |

#### 4.1 Mobile Microprocessor Evolution Trivia Quiz

**Purpose:** To test the user's understanding after browsing the exhibit.

**Interaction Details:**
- **Era-tagged questions:** Each question is labeled with its microprocessor era so users know what concept is being tested.
- **Multiple choice format:** 4 choices per question; wrong answers show a short explanation why.
- **Score Card:** Shows how many per era the users got right, motivating them to revisit weak spots in the exhibit.
- **Randomized Question Pool:** The bank contains 30 questions (6 per era). Each session presents 15 randomly selected questions (3 per era minimum guaranteed), shuffled on every load. Answer options within each question are also randomized.

#### 4.2 Microprocessor Timeline Explorer

**Purpose:** To allow users to visually trace the progression of mobile microprocessor architectures across all five eras, giving them a concrete sense of how dramatically performance, efficiency, and capability have evolved over the decades.

**Interaction Details:**
- **Era Nodes:** Each landmark mobile microprocessor generation is represented as a clickable node along the timeline. Clicking a node expands a spec card displaying transistor count, core configuration, speed, efficiency improvements, and other notable architectural features.
- **Era Filter Buttons:** Users can filter the timeline to focus on a single era, dimming all other nodes to reduce visual clutter and highlight one generation at a time.
- **Spec Card Animations:** Expanded cards appear with entrance animations (500ms, cubic-bezier ease-out) consistent with the style guide, and collapse smoothly when another node is selected or the card is dismissed.
- **Comparative View:** Users can select two nodes simultaneously to display their spec cards side by side, making cross-era comparisons immediately readable.
- **Responsive Layout:** On desktop (≥768px), the timeline scrolls horizontally with nodes laid out left to right. On mobile (<640px), the layout switches to a vertical stacked card view for easier single-thumb navigation.

#### 4.3 Mobile Microprocessor Evolution Simulator

**Purpose:** To help users better visualize and compare the performance of mobile microprocessors across eras through a simple simulation of how different processors handle identical workloads. After selecting processor eras, users can observe how processing speed, power efficiency, and task management capabilities differed across generations.

**Interaction Details:**
- **Era Selection:** Before simulation starts, users are given the option to select two or more mobile microprocessor eras to compare performance. These selected eras serve as the basis for the side-by-side comparison.
- **Identical Workload Simulation:** All selected eras are given a standardized workload, and each will simulate how their microprocessors would handle the task using visuals. Simple animations show differences in completion time, smoothness, and efficiency of each microprocessor based on predefined processor behavior.
- **Comparative View:** The simulation is displayed in a side-by-side layout so users can see and compare performances handling the same workload in real-time.
- **Microprocessor Highlights:** A panel beside the simulation displays important information of the microprocessor introduced in the chosen eras — name, core count, speed, and significant architectural innovations.
- **Performance Metrics and Feedback Panel:** After the simulation, performance metrics are displayed showing how each era handled the task differently in terms of processing speed, power efficiency, etc. This panel summarizes results so users can better compare the microprocessors.
- **Replay Simulation Option:** After the simulation, users can restart it or select different processor eras to compare.

---

### 5. Style Guide Snapshot

#### 5.1 Design Philosophy

The exhibit uses a high-contrast dark palette to evoke the aesthetic of system diagnostics, chip datasheets, and performance monitoring interfaces — the visual language engineers use when working with hardware itself. The design is inspired by VSCode and futuristic games like Cyberpunk 2077. Monospace typography for technical data, layered surface cards, and a structured grid system reference the precision and density of silicon design. This creates a focused, professional museum atmosphere that lets each generational leap in mobile processor capability speak for itself, without unnecessary decoration.

All color and spacing decisions below are finalized and serve as the source of truth for all component implementations.

#### 5.2 Style Tokens

| Element | Value | Usage |
|---------|-------|-------|
| Primary Color | `#00E5FF` / cyan-400 | Era highlights, active states, key callouts |
| Secondary Color | `#7B61FF` / violet-500 | AI & Efficiency era accent, interactive hover, quiz feedback |
| Background | `#0A0A0F` | Page-level background, deep space feel |
| Surface Cards | `#141420` | Era cards, quiz panels, viewer container |
| Primary Text | `#F0F0F5` | Body copy, headings, labels on dark surfaces |
| Secondary Text | `#8888A0` | Metadata, dates, captions, disabled states |
| Typography (Headings) | Space Grotesk 500/700 | Era titles, section headers, component names; geometric sans to echo silicon aesthetics |
| Typography (Body) | Inter 400/500, 16px / 1.7 | Exhibit copy, descriptions, quiz questions |
| Typography (Technical Data) | JetBrains Mono 400, 13px | Spec numbers, benchmark values, table data, transistor counts, clock speed figures |
| Border Radius | sm: 4px / md: 8px / lg: 16px | sm for tags/chips; md for cards, inputs; lg for major panels, simulator container |
| Grid System | 12-col, 24px gutter, 40px margin | Timeline: full-width scroll; components: 6-col or 12-col spans on desktop |
| Spacing Scale | 4 · 8 · 16 · 24 · 40 · 64 px | 4px intra-element, 16–24px intra-card, 40–64px between major sections |
| Shadows | `0 0 0 1px rgba(0,229,255,0.12)` | Subtle cyan glow-border on cards; no traditional drop shadows on dark bg |
| Animation Duration | fast: 150ms / standard: 300ms / entrance: 500ms | fast → hover feedback; standard → transitions; entrance → era card reveal, quiz score |
| Animation Easing | `cubic-bezier(0.16, 1, 0.3, 1)` | Snappy ease-out for all transitions; conveys precision and responsiveness |
| Component Borders | 1px solid rgba(255,255,255,0.08) | Default card borders; inactive timeline nodes |
| Interactive Feedback | Cyan glow + scale(1.02) | Hover on era cards, quiz options, simulator panels; correct answer → green glow; wrong → red flash |
| Timeline Accent | Gray → Cyan gradient | Horizontal timeline track; past eras desaturate, current/active era glows cyan |
| Responsive Breakpoints | mobile: <640px / tablet: 640–1024px / desktop: ≥1024px | Matches Tailwind sm/md/lg; timeline switches axis at 768px per spec |

#### 5.3 Accessibility

The exhibit targets WCAG 2.1 AA compliance throughout. The following requirements are binding for all component implementations:

- **Contrast Ratios:** Primary text (`#F0F0F5`) on background (`#0A0A0F`) yields 16.9:1, well above the 4.5:1 AA minimum. Secondary text (`#8888A0`) on background achieves 5.1:1.
- **Focus States:** All interactive elements have a visible 2px solid `#00E5FF` focus ring with 2px offset, replacing the browser default.
- **ARIA Labels:** All icon-only buttons carry descriptive `aria-label` attributes. The simulator component exposes `role="region"` with a text alternative summarizing the currently selected processor era and workload result.
- **Reduced Motion:** All animations respect `prefers-reduced-motion: reduce` — entrance animations and transitions are disabled, replaced with instant state changes.
- **Keyboard Navigation:** The timeline, quiz, and era navigator are fully operable via keyboard. The simulator supports Tab-key navigation between era panels and Enter to trigger or restart the simulation.

#### 5.4 Style Guide Mockup

| Desktop Layout | Mobile Layout |
|----------------|----------------|
| ![Desktop Mockup](./docs/assets/mockup-desktop.png) | ![Mobile Mockup](./docs/assets/mockup-mobile.png) |

*Figure 1. Desktop Layout Mockup of Virtual Exhibit Landing Page*
*Figure 2. Mobile Layout Mockup of Virtual Exhibit Landing Page*

---

### 6. Revisions from Original Proposal

> Full revision comments/attachment: [`/docs/revisions.pdf`](./docs/revisions.pdf)

**Summary of key changes from the original GPU Evolution proposal:**

- **Topic change:** Pivoted from *GPU Evolution: From Fixed-Function Pipelines to Massively Parallel AI Accelerators* to *Silicon Minds: The Evolution of the Mobile Microprocessor*, shifting the five eras from GPU architecture (Fixed-Function Hardware → AI Accelerator Era) to mobile CPU/SoC architecture (Birth of Mobile CPUs → AI & Efficiency Era).
- **Interactive components reworked:** Replaced the **3D GPU Viewer** (Three.js / React Three Fiber, GLTF/GLB models) with the **Mobile Processor Evolution Simulator**, removing the 3D rendering dependency entirely.
- **Tech stack:** Removed Three.js / React Three Fiber from the stack (no longer needed without the 3D Viewer); added Framer Motion for animation, which was implicit but unlisted in the original.
- **Timeline Explorer renamed and re-scoped:** *GPU Spec Timeline Explorer* → *Microprocessor Timeline Explorer*; spec card fields updated from GPU-specific metrics (VRAM, memory bus, TDP) to mobile CPU/SoC metrics (transistor count, core configuration, clock speed, die size).
- **Trivia Quiz re-scoped:** *GPU Architecture Trivia Quiz* → *Mobile Microprocessor Trivia Quiz*; same structure (30-question bank, 15 per session, 3 per era minimum) retained, content updated to mobile microprocessor eras.
- **Accessibility spec updated:** Removed the 3D viewer–specific ARIA `role="application"` and arrow-key orbit/zoom controls (no longer applicable); simulator now exposes `role="region"` with a text alternative summarizing the selected era and workload result.
- **Style guide retained:** Color palette, typography, spacing scale, border radii, animation durations/easing, and WCAG 2.1 AA accessibility targets carried over unchanged from the original proposal.
- **Branding/copy updated:** Landing page headline changed from "GPU Evolution / From Pixels to Intelligence" to "Silicon Minds / From Feature Phone to AI Powerhouse"; nav label "GPU MUSEUM" → "SILICON MINDS".

---

### 7. Repository Structure

```
/
├── README.md                  # This file — full proposal write-up (incremental)
├── docs/
│   ├── revisions.pdf          # Final proposal with all revisions
│   └── assets/                # Mockup images (Figures 1 & 2)
├── src/
│   ├── pages/                 # Astro pages (.astro/.mdx)
│   ├── components/            # React islands (Timeline, Simulator, Quiz)
│   ├── content/                # Era data, quiz question bank
│   └── styles/                # Tailwind config & global styles
├── public/
│   └── assets/                # Icons, processor images
└── .github/workflows/         # GitHub Actions deploy config
```
---

### 8. Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
