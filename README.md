# Silicon Minds: The Evolution of the Mobile Microprocessor
### Incremental README — CSARCH2, Term 3 A.Y. 2025-2026
*De La Salle University - Manila*

This README is structured in two parts, per the incremental-documentation requirement:

- **Part 1:** the new incremental development report recording what has been **done** since the original proposal, the **aha moments** and **things learned** along the way, the **challenges** encountered, and what remains **to be done** for final submission.
- **Part 2:** the **original proposal document**, preserved exactly as submitted, as the historical record of what was originally pitched.

---
---

# PART 1 — INCREMENTAL DEVELOPMENT REPORT

**Completed by Group 5:**
Bancoro, Maria Fides
Ercia, Marc Jared Sean
Garcia, Theodore Rodolfo III
Garcia, Theon Schuyler
Singh, Nathaniel

**Last updated:** July 13, 2026

---

This section documents the progress made since the initial project proposal.

## 1. Development Progress

The project has progressed into a fully functional prototype with four completed pages (Home, Explore, Timeline, About) and all three planned interactive exhibits working end to end.

### 1.1 Completed Core Features

**Microprocessor Timeline Explorer.** The Timeline Explorer is now fully integrated, letting users trace the evolution of 36 mobile microprocessors across all 5 historical eras. It was rebuilt to read as an actual timeline: a left rail of numbered era "stations" joined by color-fading connectors runs down the page, and each processor sits beside its era as a card carrying that era's accent color, a process-node badge, its core count and clock, and a small performance bar that grows from roughly 5% on the oldest chips to over 90% on the newest, so the scale of the evolution is legible at a glance before any card is even opened. Clicking a chip opens a full spec card with its process node, transistor count, core configuration, clock speed, and die size, a "Relative to Latest" bar, and a link to the real source its figures were checked against.

The comparison flow was reworked to remove a point of confusion. Previously, clicking a second chip silently hijacked the view into compare mode, so a user just reading specs could trigger a comparison by accident. Now a single click always just opens one chip's data; comparison is an explicit opt-in. The open card has a "Compare" button that pins that chip and drops the timeline into a clearly labelled pick mode (a banner names the pinned chip and every other tile is relabelled), and choosing a second chip shows the two side by side with a "VS" divider and directional indicators of which chip wins each spec, plus a "Clear" control to exit. Era filter buttons still isolate a single generation, and every node, filter, and control is fully operable by keyboard. The dataset was also brought current through the 2025-2026 generation, including chips like the Apple A19 Pro and the Snapdragon 8 Elite Gen 5, so the AI & Efficiency era reflects the newest hardware rather than stopping a generation or two behind.

**Mobile Processor Evolution Simulator.** The simulator is now fully integrated, letting users compare how different mobile processors handle the same workload through a visual, timed simulation. Users check off two or more eras from a list, then press Simulate to start an animated race where each era's progress lane fills at a rate based on a relative performance score assigned to that generation. The slowest of the selected eras anchors the total run time, so faster eras visibly finish sooner rather than the whole animation running on a single fixed clock. Once the race finishes, an Era Highlights panel summarizes each selected era's core count, clock speed range, and key architectural innovation, while a Performance Metrics table lists the exact relative performance multiplier and completion time for each era, sorted fastest to slowest. A Replay control lets users rerun the same eras or pick a new combination, and the whole component exposes a live text summary of the result for screen reader users, since the animation itself is a purely visual cue.

**Mobile Microprocessor Trivia Quiz.** The trivia quiz is now fully integrated, drawing from a 32-question bank spread across the 5 historical eras. Each session draws 15 questions while guaranteeing at least 3 questions from every era, and shuffles both the question order and each question's four answer options independently. Answering triggers an immediate visual reaction, a short bounce and green glow on a correct answer, or a shake and red flash on an incorrect one, followed by a brief explanation of the correct answer either way. The end screen breaks the final score down per era with individual progress bars, grades the overall score with a color gradient, and includes a Share button that copies a short text summary of the results to the clipboard.

### 1.2 User Experience and Accessibility Enhancements

- Designed the "Deep Space Circuit" visual theme, including custom animated SVG processor artwork built as a single reusable component rather than individual images.
- Added an animated circuit background, glowing UI accents, page transitions, count-up statistics, and small interactive feedback touches throughout, to make browsing the exhibit feel more alive.
- Implemented an animated hamburger-to-close (☰ → ✕) navigation icon using CSS, giving users clear visual confirmation when the mobile menu opens and closes.
- Added a scroll progress bar beneath the navigation so users always have a sense of how far through a page they are.
- Added a floating back-to-top button that appears once a user has scrolled far enough down a long page.
- Added descriptive tooltips to the Timeline's era filter buttons.
- Improved keyboard accessibility of the mobile navigation menu by replacing a `display: none` toggle with a visually hidden but still focusable one, so the menu can now be opened with a keyboard, shows a visible focus ring while doing so, and is automatically excluded from the tab order on desktop where the hamburger icon isn't shown at all.
- Improved text contrast throughout the site to meet WCAG 2.1 AA guidelines. Several elements (footer text, timeline node labels, simulator status text, and quiz answer-option letters) had been styled with reduced opacity for visual hierarchy, but a few of those combinations fell below the required 4.5:1 contrast ratio once actually measured. Opacity was removed or reduced wherever it failed.
- Improved the accessibility of the Evolution Simulator's performance metrics table by adding `scope="col"` to its column headers, so screen readers can correctly associate each header with its data.

### 1.3 Technical Improvements

**Quiz Functionality Improvements.** The quiz previously shuffled its questions twice: once while the page was being generated on the server, and again once the page loaded in the browser. Since both shuffles were random, they almost never produced the same order, which caused React hydration warnings and meant the very first question a user saw would sometimes visibly change right after the page finished loading. The fix was to only shuffle in the browser, so there's now only ever one random draw. The "Try Again" button was also improved so it now deals a completely new set of 15 questions instead of just reshuffling the same 15 from the previous attempt.

**Repository and Build Reliability.** The initial deployment of the exhibit was working correctly, built directly on top of the starter template's existing files and structure. The two GitHub Actions failures surfaced afterward, once the routing was being updated to bring the new Silicon Minds pages in alongside the template after its content had gone through MDX transformation. The template files themselves were not the problem and were kept as-is; the routing configuration needed to be reworked so it correctly referenced both the existing template structure and the newly transformed MDX content instead of assuming one or the other. Once the routing was corrected, `package.json` and `package-lock.json` were regenerated to match, and verified locally using the exact same install command the deployment pipeline uses, before pushing again.

**Routing aligned to the shared class template.** To merge cleanly into the umbrella museum site, the routing was reworked to match the pattern the class template expects: a hub page that auto-lists each group's exhibit and links out to it, with the full four-page Silicon Minds site nested underneath its own entry (`/silicon-minds`, then `/silicon-minds/explore`, `/timeline`, and `/about`). The two locked template layouts (`HomepageLayout.astro` and `ExhibitLayout.astro`) were left unmodified as required; the styling they expect was supplied through the `styles/` directory instead. Our own custom layout was renamed with the required `S01_Group5_` prefix so it cannot collide with another group's layout when everything is combined.

**Per-processor citations.** Every processor in the dataset now carries a real reference to the source its specifications were checked against. That source appears as a link on the chip's card in the Timeline Explorer and is also collected, grouped by era, in a References section on the About page, so any figure on the site can be traced back to where it came from.

**Specification accuracy pass.** With the citations in place, each processor's specs were cross-checked against its source and several errors that had slipped in were corrected, keeping the processor data and the quiz consistent with each other. Examples include the ARM Cortex-A8 being an in-order design rather than out-of-order, the original 2007 iPhone using an older ARM11 while the Cortex-A8 first appeared in the iPhone 3GS, and a few "first on this process node" claims that were overstated being softened. Figures that manufacturers have never officially disclosed are labelled as undisclosed or estimated rather than presented as confirmed.

---

## 2. Aha Moments / Key Realizations

- **Separating data from UI made adding processors and quiz content significantly easier.** The moment the newest 2024-2025 chips needed adding, only a data file had to change, not a single page or component.
- **A single missing character in a deployment setting can break an entire live site.** The site's base path was set without a trailing slash, and that one character silently broke every internal link and image across the whole site.
- **SVG artwork proved more flexible than raster images for animation and theming.** Once the goal became processor "chips" that glow in different colors per era and visually connect into an animated background, no photograph could have pulled that off the way a hand-built vector graphic could.
- **A chart's number and its drawn shape have to come from the same math.** A performance bar was drawn on a logarithmic scale while its label printed a plain linear percentage, so a value that read 61.5% visually looked more like 80% full. Both looked correct on their own; the mismatch only became obvious once they were compared side by side.
- **Interactive React components inside Astro pages need to be explicitly told to load on the client.** Without adding `client:load`, a component would render visually but every button on it would be completely unresponsive, since Astro doesn't ship any JavaScript for a component unless you ask it to.
- **Server-rendered and client-rendered output have to match exactly, or React notices.** This was the direct cause of the quiz's hydration issue described above.
- **Small UX additions like a reading progress bar and a back-to-top button matter more on long pages than they seem to at first.** The Explore page runs well over 13,000 pixels tall once all five eras are laid out, and without those small navigation aids it would be easy for a visitor to lose their place.

## 3. Lessons Learned

- **Data-driven architecture improves maintainability.** Content changes stopped requiring code changes once the two were properly separated.
- **CSS specificity and structure can unexpectedly affect component behavior.** A CSS selector that depends on two elements being direct siblings will silently stop working the moment one of them gets moved during a refactor, with no error to point at what broke.
- **Animation should support understanding rather than just decoration.** Every animated element on the site (progress bars, spec card transitions, the racing lanes in the simulator) was built to communicate something specific, not just to look busy.
- **Estimated technical specifications need to be clearly distinguished from officially disclosed values.** Some of the newest processors haven't had every spec publicly confirmed by their manufacturer, so undisclosed figures are explicitly labeled as such rather than presented as fact.
- **Continuous testing and deployment catch issues earlier, but only if you test with the same command the pipeline actually uses.** A local install can quietly succeed in a way that the deployment pipeline's stricter clean-install command won't.
- **Accessibility should be treated as a core requirement, built in from the first draft of a component rather than checked at the end.** Every accessibility fix made during a dedicated review pass took noticeably longer than it would have taken to get right the first time.

## 4. Challenges Encountered

- **CSS stacking contexts hid background animations.** The animated circuit background was originally invisible, hidden behind the page's own background color despite being placed at a negative z-index. This took checking each layer individually to find the actual element sitting on top of it, and required making both the page body and its wrapper transparent so the circuit layer underneath could show through.
- **Hover effects conflicted with inline styles.** Some interactive elements (like the quiz's answer buttons) had their colors set with inline styles, and inline styles in React take priority over a stylesheet's `:hover` rule, so the intended hover effect simply never appeared. Rather than force it with `!important`, the unanswered button state was moved into a CSS class instead, letting the normal `:hover` rule apply cleanly.
- **The simulator required several redesigns before becoming intuitive.** An early version of the race animation had its timing backwards, with the fastest era's progress bar taking the longest to fill rather than the shortest. The timing logic was reworked so the slowest selected era anchors the animation's total duration, and every faster era finishes proportionally earlier, which is the behavior a "race" is actually supposed to show.
- **Some processors lacked official specifications.** A few of the newest chip generations haven't had every figure (particularly transistor counts) publicly disclosed by their manufacturer yet. Rather than guess, those fields are explicitly marked as undisclosed, and any estimated figures are clearly flagged as estimates.
- **Licensing restrictions required replacing stock images with custom SVG artwork.** Early prototyping used photographs of real processors, but licensing and reuse concerns made that impractical for a public exhibit, which led directly to building the parametric SVG chip component used across the site instead.
- **React hydration mismatches initially caused quiz content to change after page load.** As detailed above, the server and the browser were each shuffling the question set independently, so their outputs differed and the visible question would swap right after the page finished loading. Moving the shuffle to run client-side only resolved this.
- **Restructuring the navigation required updating CSS selectors carefully.** As the navigation component evolved, small structural changes to its HTML unexpectedly broke a CSS selector that depended on a specific parent-child relationship, disabling the mobile menu's open and close animation until the relationship was restored. This was a clear reminder that CSS relying on document structure is only as stable as that structure.
- **The Explore page's extensive content required dedicated navigation aids.** With five full eras of content laid out on one page, totaling more than 13,000 pixels in height, the page risked feeling overwhelming or difficult to navigate efficiently. A reading progress bar, a back-to-top button, and a skip-to-content link were added specifically to address this.
- **A deployment failure can point at the wrong culprit if you don't check what it's actually complaining about.** Two separate build failures on GitHub Actions surfaced after the initial working deployment, once the routing was being updated to slot the new pages in alongside the template following MDX transformation. It initially looked like the template files themselves were the problem, but they were needed and were kept; the actual fix was reworking the routing so it correctly referenced both the template structure and the transformed MDX content.

## 5. Creative Development

- **Custom animated SVG processor illustrations.** Rather than photographing or sourcing images of real chips, every processor on the site is represented by a hand-built vector graphic: a tilted chip package with gold pins along each edge, a metallic die with a gradient sheen, four mounting holes, and optional connector traces radiating outward. The whole thing is a single parametric component that takes a color, size, rotation, and a small "variant" number as inputs, so all 36 processors and every era's accent color are drawn from one reusable piece of markup instead of dozens of separate image files.
- **Era-specific color palettes.** Each of the five eras was assigned its own accent color (cyan, emerald, amber, violet, and pink), and that color is carried consistently through everything tied to that era: the timeline nodes, the era filter buttons, the simulator's racing lane, the quiz's era badge, and the results screen's per-era score bars. The intent was to make each era feel visually distinct at a glance, not just distinguishable by reading a label.
- **A connected timeline layout.** The Timeline Explorer was designed to feel like a timeline rather than a grid of buttons: numbered era "stations" sit on a vertical rail joined by connectors that fade from one era's color into the next, and each processor card carries its era's accent plus a small performance bar, so a visitor can see the generational leap in compute before opening a single card.
- **A living, animated circuit background.** The page background isn't a flat color. It's a repeating SVG circuit-trace pattern with small junction nodes that blink on staggered timers and tiny pulse dots that travel along the traces, meant to give the site the feel of a powered circuit board rather than a static dark theme.
- **A "boot-up screen" reveal on team member cards.** On the About page, hovering or focusing a team member's card causes their photo to power on like a CRT display, with a brief scanline sweep, rather than just fading in, tying the About page back into the same hardware-inspired visual language as the rest of the exhibit.
- **Slide-fill button hover effect.** Primary buttons fill with color from one side on hover rather than snapping to a new color instantly, meant to feel closer to a piece of hardware powering on than a typical flat web button.
- **Page transitions and scroll-triggered reveals.** Navigating between pages fades smoothly rather than hard-cutting, and content sections fade and rise into view as the user scrolls down a page, both of which respect a user's reduced-motion preference and skip straight to the end state if that preference is set.
- **An animated navigation icon.** The mobile menu's hamburger icon morphs into an X when the menu opens and back again when it closes, giving a small but clear piece of visual feedback that a static icon wouldn't.
- **A reading progress indicator and a floating back-to-top button**, both aimed specifically at the Explore page, which is long enough that visitors benefit from a sense of how far they've scrolled and a fast way back to the top.
- **Descriptive tooltips on the Timeline's era filters**, showing an era's full name on hover instead of requiring users to remember what each abbreviated filter button stands for.
- **Enhanced quiz feedback and processor comparison visuals**, covering the correct and incorrect answer animations, the graded score screen, and the Timeline Explorer's side-by-side compare view described in section 1.1.

## 6. AI Declaration

ChatGPT and Claude were used as supplementary learning and development tools throughout the project, in the following areas:

- **Learning Astro.** None of us had used Astro before this project, so ChatGPT was used early on to understand its island architecture, in particular why an interactive component would render visually but not respond to clicks until we learned about the `client:load` directive.
- **Prototyping the SVG chip artwork.** The initial structure of the floating processor graphic (the gradient definitions for the pins and die, the path layout for the connector traces, the parametric color and rotation props) was drafted with Claude's help and then tuned by hand, adjusting proportions, colors, and animation timing until it matched the look we wanted for the exhibit.
- **Developing the animated circuit background.** Claude helped work out how to build the repeating trace pattern as an SVG tile, how to get the small junction nodes blinking on staggered timers instead of all at once, and how to use SVG's `animateMotion` to move small pulse dots along the trace paths so they looked like they were traveling through a live circuit rather than just fading in and out in place. We also used it to figure out why the background wasn't showing up at all early on, since it turned out to be sitting behind an opaque page background rather than an issue with the SVG itself.
- **Debugging deployment failures.** When GitHub Actions failed with errors like an unresolved `marked` import, ChatGPT was used to help read through the build logs and trace the failure back to its actual source: the routing update needed after the template's content went through MDX transformation, not a problem with the template files themselves, which were kept as part of the exhibit.
- **Diagnosing specific bugs**, including the CSS sibling selector that broke the mobile menu after a refactor, the React hydration mismatch in the quiz's question shuffle, and computing the actual WCAG contrast ratios that flagged several accessibility failures we wouldn't have caught by eye.
- **Matching the site to the class template's structure.** Claude helped work out how the hub-and-nested-page routing the shared template expects should map onto our four-page site, and how to style the locked template layouts through the allowed `styles/` directory without modifying them.
- **Fact-checking processor specifications.** As sources were attached to each chip, Claude was used to cross-check the specs against them and surface figures that were wrong or overstated, which the members then verified against the sources and corrected.

All final implementation decisions, customization of the generated code to fit our own design and content, testing, and verification of the finished site were carried out by the project members.

## 7. Remaining Work Before Final Submission

- Verify every processor citation link resolves and, where an instructor prefers primary sources over encyclopedic ones, upgrade the reference to the manufacturer or a technical die analysis.
- Run a full Lighthouse and axe DevTools audit as a final accessibility and performance check, in addition to the manual WCAG review already completed.
- Perform a cross-browser QA pass, with particular attention to Safari, since it handles page transitions and SVG animation slightly differently from Chromium-based browsers.
- Final proofread of all era descriptions, processor notes, and quiz explanations for tone and technical accuracy.
- Confirm the deployed GitHub Pages URL and the site's base path configuration are correctly matched before the final submission link is shared.

The routing rework and the per-processor citation pass listed here in the previous revision are now complete and are described in section 1.3.

## 8. References

Beebom. (2024). *Qualcomm Snapdragon 8 Elite announced: Custom Oryon cores, up to 4.32GHz clock speed*. https://beebom.com/qualcomm-snapdragon-8-elite-announced/

Beebom. (2024). *MediaTek Dimensity 9400 announced with all-new Cortex-X925 core*. https://beebom.com/mediatek-dimensity-9400-announced/

Furber, S. (2000). *ARM system-on-chip architecture* (2nd ed.). Addison-Wesley.

Gizmochina. (2025). *Snapdragon 8 Elite Gen 5 vs Dimensity 9500 vs Apple A19 Pro: Benchmarks and specs*. https://www.gizmochina.com/2025/10/20/snapdragon-8-elite-gen-5-vs-dimensity-9500-vs-apple-a19-pro-benchmarks-and-specs/

GSMArena. (2024). *Fastest mobile chipsets ranked: Compare smartphone processor performance*. https://www.gsmarena.com/fastest_mobile_chipsets_ranked_compare_smartphone_processor_performance-news-73072.php

Notebookcheck. (2024). *Apple A18 Pro processor: Benchmarks and specs*. https://www.notebookcheck.net/Apple-A18-Pro-Processor-Benchmarks-and-Specs.891556.0.html

Notebookcheck. (2024). *Qualcomm Snapdragon 8 Elite processor: Benchmarks and specs*. https://www.notebookcheck.net/Qualcomm-Snapdragon-8-Elite-Processor-Benchmarks-and-Specs.908499.0.html

Notebookcheck. (2024). *MediaTek Dimensity 9400 processor: Benchmarks and specs*. https://www.notebookcheck.net/Mediatek-Dimensity-9400-Processor-Benchmarks-and-Specs.921380.0.html

Patterson, D. A., & Hennessy, J. L. (2021). *Computer organization and design: The hardware/software interface* (6th ed.). Morgan Kaufmann.

Wikipedia contributors. (2024). *Apple A18*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A18

Wikipedia contributors. (2025). *Apple A19*. Wikipedia, The Free Encyclopedia. https://en.wikipedia.org/wiki/Apple_A19

World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

---
---

# PART 2 — ORIGINAL PROPOSAL DOCUMENT

# Silicon Minds: The Evolution of the Mobile Microprocessor
### Virtual Exhibit Proposal — CSARCH2, Term 3 A.Y. 2025-2026
**De La Salle University - Manila**

---

## 1. Group Information

### 1.1 Proposed Title
Silicon Minds: The Evolution of the Mobile Microprocessor

### 1.2 Member Roster

| # | Full Name | GitHub Handle |
|---|-----------|----------------|
| 1 | Maria Fides Bancoro | [@m-fides](https://github.com/m-fides) |
| 2 | Marc Jared Sean Ercia | [@MarcErcia](https://github.com/MarcErcia) |
| 3 | Theodore Rodolfo III Garcia | [@theoithinkk](https://github.com/theoithinkk) |
| 4 | Theon Schuyler Garcia | [@SchuylerGYo](https://github.com/SchuylerGYo) |
| 5 | Nathaniel Singh | [@Redaw-t](https://github.com/Redaw-t) |

### 1.3 Detailed Project Description

**Silicon Minds: The Evolution of the Mobile Microprocessor** is an immersive, interactive virtual museum tracing the architectural journey of the mobile microprocessor. From their origins as simple processors designed for mobile communication devices to their current role as the engines powering smartphones, tablets, and other everyday mobile devices, the museum explores how mobile processors have evolved and improved over the years to meet modern computing demands.

Visitors are guided through five landmark eras in mobile microprocessor development: **The Birth of Mobile CPUs**, **the ARM Revolution**, **the Multicore Era**, **the System-on-Chip Era**, and **the AI & Efficiency Era**. Each era is framed around a compelling narrative arc of the limitations that drove innovation, the architectural breakthroughs that followed, and the ripple effects these advancements had on mobile device performance, power efficiency, and user experience. Rather than presenting history as a sequence of technical specifications, the exhibit tells the story of how the constantly increasing demands for speed, battery life, and multitasking influenced the design of mobile microprocessors.

To make these concepts tangible, the exhibit integrates three core interactive experiences. The **Microprocessor Timeline Explorer** serves as the center of the exhibit, allowing users to explore major mobile microprocessor generations and examine their specifications. The **Mobile Processor Evolution Simulator** will help users visually analyze how processors from different generations handle the same workloads, revealing the improvements in performance. Lastly, the **Mobile Microprocessor Trivia Quiz** will test the visitors on their understanding of the presented key concepts in an engaging, low-stakes format.

At the end of the exhibit, visitors would have developed a clear, intuitive understanding of not only how mobile microprocessors evolved, but also why the innovations that emerged through the years led to the powerful processors modern mobile devices have. They will gain insight into how advancements improved and transformed devices from simple communication tools to powerful and heavily functional computing platforms used in everyday life today.

---

## 2. Topic Theme

### 2.1 Overview

The mobile microprocessor stands as one of the most consequential innovations in computing history. Beginning as a modest, low-power adaptation of desktop RISC designs, it has grown into a highly integrated, AI-capable system-on-chip that fits in the palm of a hand, yet rivals laptop-class performance. This exhibit traces that evolution across five distinct eras, each defined by a breakthrough in architecture, manufacturing, or capability that permanently changed what mobile devices could do. The narrative is organized around the engineering tensions that drove each transition — from battery-life constraints that forced creative core design to consumer demand for richer applications that pushed transistor counts into the billions.

### 2.2 Five Eras of Mobile Microprocessor Evolution

| Era | Period | Key Milestone |
|-----|--------|----------------|
| **Birth of Mobile CPUs** | Mid-1990s–Early 2000s | Early low-power RISC processors adapted for mobile phones. E.g., ARM7TDMI, Intel StrongARM, Motorola DragonBall. |
| **The ARM Revolution** | 2007–2012 | ARM architecture dominates smartphones; dedicated ISPs and DSPs emerge. E.g., ARM Cortex-A8, Apple A4, Qualcomm Snapdragon S1. |
| **The Multicore Era** | 2011–2014 | Dual- and quad-core mobile CPUs arrive, boosting multitasking and app performance. E.g., NVIDIA Tegra 2, Apple A6, Qualcomm Snapdragon 600. |
| **The System-on-Chip Era** | 2015–2020 | Highly integrated SoCs combine CPU, GPU, modem, and memory on a single die. big.LITTLE heterogeneous cores improve power efficiency. E.g., Apple A9, Qualcomm Snapdragon 820, Samsung Exynos 8890. |
| **The AI & Efficiency Era** | 2021–Present | Dedicated NPUs enable on-device AI; TSMC 3nm/4nm nodes push performance-per-watt to new heights. E.g., Apple A17 Pro, Qualcomm Snapdragon 8 Gen 3, MediaTek Dimensity 9300. |

---

## 3. Tech Stack Plan

### 3.1 Core Technologies

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

### 3.2 Mobile Responsiveness

All components are built mobile-first:

- **Mobile Microprocessor Trivia Quiz:** Question cards stack vertically and fill the screen width on mobile (<640px). Answer buttons expand to full width for easy tap targets (min-height: 48px). Score card collapses to a single centered summary panel.
- **Microprocessor Timeline Explorer:** Horizontal scroll on desktop (≥768px); switches to a vertical stacked card layout on mobile. Expanded spec cards go full-width. Era filter buttons collapse into a horizontally scrollable pill row.
- **Mobile Processor Evolution Simulator:** On mobile (<640px), selected era panels are stacked vertically so each simulation is visible on the screen. The Era Highlights (information) and Performance Metrics sections are collapsible and can be expanded when the user chooses to do so. On desktop, simulation panels are displayed side by side, while Era Highlights and Performance Metrics panels remain visible below the simulation for easy comparison.

---

## 4. Interactive Components

| # | Component | Type | Summary |
|---|-----------|------|---------|
| 1 | **Mobile Microprocessor Trivia Quiz** | Quiz | Knowledge check supporting what users have learned after browsing through the five eras of mobile microprocessor evolution. Each question is tagged to a specific era. Incorrect responses reveal a short explanation clarifying the right answer. |
| 2 | **Microprocessor Timeline Explorer** | Interactive Timeline | The central feature of the museum; allows users to trace the evolution of mobile microprocessors across different eras, present key generations, examine specifications, and differentiate developments across eras. |
| 3 | **Mobile Processor Evolution Simulator** | Simulation | Helps users visualize the evolution of mobile microprocessors by running the same task workload across processors from different eras. Users compare performances through real-time workload animations demonstrating how each generation's architectural innovations improved speed, efficiency, and task management over time. |

### 4.1 Mobile Microprocessor Evolution Trivia Quiz

**Purpose:** To test the user's understanding after browsing the exhibit.

**Interaction Details:**
- **Era-tagged questions:** Each question is labeled with its microprocessor era so users know what concept is being tested.
- **Multiple choice format:** 4 choices per question; wrong answers show a short explanation why.
- **Score Card:** Shows how many per era the users got right, motivating them to revisit weak spots in the exhibit.
- **Randomized Question Pool:** The bank contains 30 questions (6 per era). Each session presents 15 randomly selected questions (3 per era minimum guaranteed), shuffled on every load. Answer options within each question are also randomized.

### 4.2 Microprocessor Timeline Explorer

**Purpose:** To allow users to visually trace the progression of mobile microprocessor architectures across all five eras, giving them a concrete sense of how dramatically performance, efficiency, and capability have evolved over the decades.

**Interaction Details:**
- **Era Nodes:** Each landmark mobile microprocessor generation is represented as a clickable node along the timeline. Clicking a node expands a spec card displaying transistor count, core configuration, speed, efficiency improvements, and other notable architectural features.
- **Era Filter Buttons:** Users can filter the timeline to focus on a single era, dimming all other nodes to reduce visual clutter and highlight one generation at a time.
- **Spec Card Animations:** Expanded cards appear with entrance animations (500ms, cubic-bezier ease-out) consistent with the style guide, and collapse smoothly when another node is selected or the card is dismissed.
- **Comparative View:** Users can select two nodes simultaneously to display their spec cards side by side, making cross-era comparisons immediately readable.
- **Responsive Layout:** On desktop (≥768px), the timeline scrolls horizontally with nodes laid out left to right. On mobile (<640px), the layout switches to a vertical stacked card view for easier single-thumb navigation.

### 4.3 Mobile Microprocessor Evolution Simulator

**Purpose:** To help users better visualize and compare the performance of mobile microprocessors across eras through a simple simulation of how different processors handle identical workloads. After selecting processor eras, users can observe how processing speed, power efficiency, and task management capabilities differed across generations.

**Interaction Details:**
- **Era Selection:** Before simulation starts, users are given the option to select two or more mobile microprocessor eras to compare performance. These selected eras serve as the basis for the side-by-side comparison.
- **Identical Workload Simulation:** All selected eras are given a standardized workload, and each will simulate how their microprocessors would handle the task using visuals. Simple animations show differences in completion time, smoothness, and efficiency of each microprocessor based on predefined processor behavior.
- **Comparative View:** The simulation is displayed in a side-by-side layout so users can see and compare performances handling the same workload in real-time.
- **Microprocessor Highlights:** A panel beside the simulation displays important information of the microprocessor introduced in the chosen eras — name, core count, speed, and significant architectural innovations.
- **Performance Metrics and Feedback Panel:** After the simulation, performance metrics are displayed showing how each era handled the task differently in terms of processing speed, power efficiency, etc. This panel summarizes results so users can better compare the microprocessors.
- **Replay Simulation Option:** After the simulation, users can restart it or select different processor eras to compare.

---

## 5. Style Guide Snapshot

### 5.1 Design Philosophy

The exhibit uses a high-contrast dark palette to evoke the aesthetic of system diagnostics, chip datasheets, and performance monitoring interfaces — the visual language engineers use when working with hardware itself. The design is inspired by VSCode and futuristic games like Cyberpunk 2077. Monospace typography for technical data, layered surface cards, and a structured grid system reference the precision and density of silicon design. This creates a focused, professional museum atmosphere that lets each generational leap in mobile processor capability speak for itself, without unnecessary decoration.

All color and spacing decisions below are finalized and serve as the source of truth for all component implementations.

### 5.2 Style Tokens

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

### 5.3 Accessibility

The exhibit targets WCAG 2.1 AA compliance throughout. The following requirements are binding for all component implementations:

- **Contrast Ratios:** Primary text (`#F0F0F5`) on background (`#0A0A0F`) yields 16.9:1, well above the 4.5:1 AA minimum. Secondary text (`#8888A0`) on background achieves 5.1:1.
- **Focus States:** All interactive elements have a visible 2px solid `#00E5FF` focus ring with 2px offset, replacing the browser default.
- **ARIA Labels:** All icon-only buttons carry descriptive `aria-label` attributes. The simulator component exposes `role="region"` with a text alternative summarizing the currently selected processor era and workload result.
- **Reduced Motion:** All animations respect `prefers-reduced-motion: reduce` — entrance animations and transitions are disabled, replaced with instant state changes.
- **Keyboard Navigation:** The timeline, quiz, and era navigator are fully operable via keyboard. The simulator supports Tab-key navigation between era panels and Enter to trigger or restart the simulation.

### 5.4 Style Guide Mockup

| Desktop Layout | Mobile Layout |
|----------------|----------------|
| ![Desktop Mockup](./docs/assets/mockup-desktop.png) | ![Mobile Mockup](./docs/assets/mockup-mobile.png) |

*Figure 1. Desktop Layout Mockup of Virtual Exhibit Landing Page*
*Figure 2. Mobile Layout Mockup of Virtual Exhibit Landing Page*

---

## 6. Revisions from Original Proposal

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

## 7. Repository Structure

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

## 8. Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```