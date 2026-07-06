# First Tasks — Swayam Patel Portfolio v2 (3D Edition)

**Owner:** Swayam Patel (son of Komal Patel)
**Project:** A second, 3D-native portfolio site built with React + Vite, meant to visually and technically outclass the existing v1 site.
**Reference site (v1):** https://swayam-patel-v1.vercel.app
**Reference repo (v1):** https://github.com/sp2736/portfolio

This document is written for an autonomous coding agent ("Antigravity") to execute. It contains the baseline assignment requirements, the creative vision, the technical approach, and an ordered task list. Reference images described below should be placed in `/design-reference/` alongside this file before work begins.

---

## 0. Context: Why This Project Exists

Swayam already has a fully built, content-rich portfolio (v1) with a terminal/hacker aesthetic — boot sequence, command-line easter eggs, deployments, chronology timeline, certifications, blog, and music. That site is text-and-2D-driven with strong personality but conventional layout patterns.

This second portfolio (v2) is NOT a simplified rebuild. It is a showcase piece meant to demonstrate 3D web engineering skill. The bar is: people should stop scrolling because they're surprised, not because they're reading. Motion, depth, and interactivity carry the experience; text/content should be the same substance as v1 (projects, skills, certifications, chronology) but delivered through 3D scenes instead of static cards.

Baseline functional requirements (must never be broken while adding 3D flair):

- Built with **React + Vite**.
- At least 4 reusable components: `Header`, `About`, `Skills`, `Footer`.
- Each component is independently structured (own file, own styles/logic) and composed into a single-page layout (`App.jsx`).
- No JSX or logic duplicated across components — shared logic goes into hooks/utils, shared visual primitives go into a `common/` component folder.
- Props must be used to pass at least one piece of real data into a minimum of 2 components (e.g. `Header` receives `{ name, tagline }`, `Skills` receives `{ skillList }`).

Everything below this line is the creative/technical layer built on top of that baseline.

---

## 1. Design Reference Materials

Place these in `/design-reference/` before starting. Antigravity should treat them as the literal visual target, not loose inspiration.

| File | What it shows | Where it's used |
|---|---|---|
| `hero-3d-ui.png` (first attached image) | Dark, moody 3D UI composition — glowing neon (violet/blue/pink) geometric and organic shapes floating in negative space, glassy/metallic materials, soft volumetric lighting, high-contrast dark background | Overall art direction for the hero/landing scene and global color palette (near-black backgrounds, neon rim-lighting, glassmorphism panels for content cards) |
| `spin-object.png` (second attached image) | A single centerpiece 3D object with fluid, iridescent/liquid-metal material — meant to rotate continuously with smooth, physically-plausible motion | The hero centerpiece object (see Section 3.3) |
| Pinterest ref 1 (`https://pin.it/7hxBjnAYw`) | Scroll-triggered animation where content emerges from a black hole / vortex as the user scrolls | Certifications reveal scene (Section 3.4) |
| Pinterest ref 2 (`https://pin.it/3CZmTQ4Ld`) | Full-screen intro/loading animation built with 3D elements, plays once when the site is opened | Site entry/boot animation (Section 3.2) |

> Note for Antigravity: Pinterest pin pages could not be scraped programmatically (robots-disallowed). Swayam will paste static exports/screenshots of these pins into `/design-reference/` as `blackhole-ref.png` / `blackhole-ref-2.png` and `intro-anim-ref.png`. Treat the written descriptions above as the spec until those images are supplied, and re-check the folder before finalizing each corresponding scene.

---

## 2. Tech Stack

- **Build tool:** Vite (`npm create vite@latest` — React template)
- **3D rendering:** `three`, `@react-three/fiber` (R3F) — declarative Three.js in React
- **3D helpers:** `@react-three/drei` (OrbitControls, Environment, Html, useTexture, ScrollControls, Text3D, MeshTransmissionMaterial for glass/fluid look)
- **Post-processing:** `@react-three/postprocessing` (Bloom, Vignette, ChromaticAberration, Noise) — needed for the neon-glow look in the reference image
- **Scroll-driven animation:** `@react-three/drei`'s `ScrollControls`/`useScroll`, plus `framer-motion` for DOM-layer transitions and `gsap` + `ScrollTrigger` for fine-grained timeline choreography (black hole sequence needs frame-accurate control that GSAP handles better than pure R3F state)
- **Shaders:** Custom GLSL (via `shaderMaterial` from drei) for:
  - The dissolve-on-hover effect (noise-based alpha dissolve, common "Doctor Strange" portal-dissolve technique)
  - The black hole vortex distortion effect
- **State/data:** Plain React state/context; no need for Redux at this scale
- **Styling:** CSS Modules or Tailwind (Tailwind recommended for speed, matches v1 stack)
- **Deployment target:** Vercel (matches v1)

Install baseline:
```bash
npm create vite@latest swayam-portfolio-v2 -- --template react
cd swayam-portfolio-v2
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap framer-motion
```

---

## 3. Experience Design — Scene by Scene

### 3.1 Overall Structure

Single-page app, but "single page" now means a continuous 3D scroll experience, not a stack of DOM sections. Recommended structure:

```
<Canvas> (full-viewport, fixed, R3F)
  <ScrollControls pages={N} damping={0.25}>
    <Scene>            // orchestrates sub-scenes by scroll offset
      <HeroObject />       // 3.3
      <BlackHoleCertifications /> // 3.4
      <SkillsField />       // floating 3D skill nodes
      <ProjectGallery />    // 3D cards/panels for projects
    </Scene>
  </ScrollControls>
</Canvas>
<DomOverlay>          // HTML overlays via drei <Html> or plain absolutely-positioned React, synced to same scroll
  <Header />
  <About />
  <Footer />
</DomOverlay>
```

Keep the mandatory `Header`, `About`, `Skills`, `Footer` as real React components in `src/components/`. They can render mostly-HTML/CSS content that sits on top of or beside the WebGL canvas (glassmorphic panels), while the 3D visuals live in `src/three/`. This keeps the assignment's component/props requirements clean and easy to grade, while the "wow" layer is additive.

### 3.2 Entry / Boot Animation (plays once on load)

- Full-screen 3D intro that plays automatically when the site opens, before the main scroll experience is interactive.
- Sequence: dark screen → a single point of light expands into a rotating 3D form (an abstract wireframe or particle formation of "S" / "SP" initials) → camera pulls back → form resolves into the Hero scene and hands off control to scroll.
- Duration target: 2.5–4 seconds, skippable (click/tap anywhere or press any key to skip).
- Build with R3F for the 3D portion + GSAP timeline to sequence camera moves, opacity fades, and the handoff to the scrollable scene.
- Respect `prefers-reduced-motion`: if set, skip straight to a fast fade-in (no forced heavy animation).

### 3.3 Hero Centerpiece — Spinning Fluid Object with Dissolve Reveal

- A single 3D object (based on `spin-object.png`) sits center-stage on load, continuously rotating on its own axis with slow, fluid easing (avoid linear rotation — use a slight wobble/breathing scale via `useFrame` + sine easing so it feels alive, not mechanical).
- Material: use `MeshTransmissionMaterial` (drei) or a custom refractive/iridescent shader to get the liquid-metal/glass look from the reference image — high transmission, roughness near 0, chromatic aberration, and an environment map (`<Environment preset="studio" />` or a custom HDRI) for realistic reflections.
- **Hover interaction:** on pointer-over, trigger a dissolve transition:
  - Implement a custom shader (`shaderMaterial`) that uses a noise texture to progressively discard/fade fragments of the object mesh (edges glow with an emissive rim color as they dissolve — same visual language as portal/burn dissolve effects).
  - As the object dissolves out, cross-fade in a plane/card showing Swayam's name, title, and profile photo (`/profile.jpg`, reuse from v1 or new asset Swayam provides), using the inverse of the same dissolve shader so it materializes in rather than just fading.
  - On pointer-out, reverse the transition back to the spinning object.
- Keep this interaction available only on hover-capable devices; on touch devices, trigger the same transition via a tap, with a subtle prompt ("Tap to reveal").

### 3.4 Certifications — Black Hole Scroll Reveal

This is the signature scroll moment of the site, modeled on the black-hole reference animation.

- As the user scrolls into the certifications section, a black hole / vortex forms center-screen: a particle system (`InstancedMesh` or GPU particles via `three`'s `Points`) spiraling inward around a dark, light-bending core. Use a custom shader for gravitational-lensing-style distortion on anything behind/near it (a simple screen-space UV warp is sufficient — full physical lensing is not required).
- Certification items (pulled from the real content Swayam already has on v1 — see Section 4) emerge as small glowing 3D cards/shards that appear to be "pulled out of" or "ejected from" the black hole one at a time as scroll progresses, then settle into a readable layout (arc, grid, or orbit ring around the hole).
- Bind the entire sequence to scroll progress via `useScroll` (drei) so it's fully scrubbable — scrolling back should un-reveal certifications and pull them back toward the hole, not just replay forward.
- Each revealed card should show: issuing body, certificate name, and tag/category (see the certifications data list in Section 4). Clicking a card can open more detail (modal or expand-in-place).
- Performance note: cap particle count appropriately (test at ~5k–15k depending on device) and provide a reduced-particle fallback for low-end/mobile GPUs (detect via a simple FPS check or `navigator.hardwareConcurrency` heuristic).

### 3.5 Skills Section (3D)

- Represent skills as floating nodes/icons in 3D space (e.g., a loose sphere or helix distribution) that gently drift and respond to camera parallax/mouse movement.
- `Skills` component receives its data via props (`skillList` array of `{ name, category, icon }`) — this satisfies the props requirement and keeps content data-driven rather than hardcoded in JSX.
- Grouping by category (Languages, Frameworks, Cloud & DevOps, AI/LLMs, etc. — reuse categories already defined in v1's "Technical Arsenal" section) can be done via color-coding or spatial clustering.

### 3.6 Projects Gallery (3D)

- Present featured projects (FINIQ, ARCADE, Sukoon Developer, Counseling SWOT Portal, BrainBin, Wander-n-Wonder, AI Logic Commenter, Dark Angel, White Devil, etc. — full list in Section 4) as 3D panels/cards arranged along a curved path or carousel in depth (z-axis), scrubbed by scroll or drag.
- Each panel shows project thumbnail (texture-mapped onto a plane), title, tech tags, and links (Code/Visit/Architecture) as an HTML overlay (`<Html transform>` from drei) anchored to the 3D panel's position so links stay clickable.

### 3.7 Header, About, Footer

- `Header`: fixed/floating glass nav bar over the canvas; receives `{ name, tagline }` as props; nav links can smooth-scroll to scene sections (drive the R3F scroll offset programmatically) rather than jumping.
- `About`: HTML content panel (glassmorphic, matching the reference palette) layered over or beside the 3D scene rather than fully replacing it with 3D — this keeps About readable and accessible.
- `Footer`: standard footer with social links (GitHub, LinkedIn, Instagram, email — reuse from v1), no 3D needed here, keep it simple and performant.

---

## 4. Real Content to Reuse (pulled from v1 — do not invent placeholder content)

Antigravity should populate the 3D scenes with Swayam's actual data rather than lorem ipsum, sourced from the v1 site:

**Identity:** Swayam Patel — Full-Stack Architect · Web Security · Data Science & Analytics · Poetry & Writing. Based in Vadodara, IN.

**Certifications (for the black hole sequence):**
- Google/Vanderbilt — AI & Prompt Engineering: Prompt Engineering Specialization, ChatGPT Advanced Data Analysis, Trustworthy Generative AI, Google AI & Prompting Essentials
- Meta — Software Engineering: Meta Full-Stack Developer, Programming with JavaScript, HTML & CSS in Depth, Intro to Databases
- IBM — Data Science: Python for Data Science, Data Analysis & Visualization, Machine Learning Basics
- NPTEL/Coursera — Core Programming: Object-Oriented Hierarchies in Java, C Programming & Assembly, Modern C++
- Independent — Cyber Security: Ethical Hacking Foundations, Web Vulnerabilities & WAF, Hacking & Hardening
- Google/AWS — Leadership & Cloud: AWS Cloud Club Completion, Google People Management, Deloitte Technology Program

**Projects (for the gallery):** FINIQ, ARCADE, Sukoon Developer, Counseling SWOT Portal, BrainBin, Wander-n-Wonder, AI Logic Commenter, Dark Angel (VS Code theme), White Devil (VS Code theme), Suno AI Tracks, "Before I Learned Goodbye" (poetry book).

**Chronology (optional 3D timeline, stretch goal):** 2017 Open-Source Awakening → 2019 Script Kiddie & System Manipulation → 2020 Global Pause & Discovery → 2023 Organic Hiatus → 2024 Low-Level Mastery → 2025 Architectural Expansion → 2026 The Builder Phase.

**Links:** GitHub (github.com/Sp2736), LinkedIn (linkedin.com/in/swayam-patel-316ba5317), Instagram (instagram.com/sp_27.03), email (swayampatel2736@gmail.com).

Swayam: confirm whether you want the exact same content set as v1, or a curated subset for v2. Default assumption if not specified: reuse everything, reformatted for 3D presentation.

---

## 5. Project Structure

```
swayam-portfolio-v2/
├── design-reference/
│   ├── hero-3d-ui.png
│   ├── spin-object.png
│   ├── blackhole-ref.png
│   └── intro-anim-ref.png
├── public/
│   └── profile.jpg
├── src/
│   ├── components/           # mandatory DOM components
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   └── Header.module.css
│   │   ├── About/
│   │   ├── Skills/
│   │   └── Footer/
│   ├── three/                 # all 3D scene code
│   │   ├── Scene.jsx
│   │   ├── HeroObject.jsx
│   │   ├── DissolveMaterial.js       # custom shader
│   │   ├── BlackHoleCertifications.jsx
│   │   ├── BlackHoleShader.js
│   │   ├── SkillsField.jsx
│   │   └── ProjectGallery.jsx
│   ├── data/
│   │   ├── certifications.js
│   │   ├── projects.js
│   │   └── skills.js
│   ├── hooks/
│   │   ├── useScrollProgress.js
│   │   └── useReducedMotion.js
│   ├── App.jsx
│   └── main.jsx
└── vite.config.js
```

---

## 6. Ordered Task List for Antigravity

1. Scaffold Vite + React project; install dependencies listed in Section 2.
2. Build the mandatory baseline first, in plain HTML/CSS, with no 3D: `Header`, `About`, `Skills`, `Footer` composed in `App.jsx`, with props flowing into at least `Header` and `Skills`. Confirm this satisfies the base rubric before adding any 3D — this is the safety net.
3. Add `data/` files with real content from Section 4.
4. Set up the global `<Canvas>` + `ScrollControls` scaffold in `src/three/Scene.jsx`; get a placeholder rotating cube rendering to confirm the R3F pipeline works end-to-end with scroll.
5. Build the Hero centerpiece object (Section 3.3): geometry + transmission material + idle rotation animation first, dissolve shader second, name/photo reveal card last.
6. Build the boot/intro animation (Section 3.2) — do this after the hero object exists, since the intro should hand off into it.
7. Build the black hole certifications sequence (Section 3.4) — start with the particle vortex, then wire scroll-scrubbing, then add the certification card reveal/settle behavior.
8. Build the Skills 3D field (Section 3.5) and Projects gallery (Section 3.6).
9. Layer the DOM overlay components (`Header`, `About`, `Footer`) on top of the 3D scene with glassmorphic styling matching `hero-3d-ui.png`; wire nav-to-scroll behavior.
10. Add post-processing (Bloom/Vignette) globally for the neon look; tune bloom intensity so text stays legible.
11. Performance pass: test on a throttled/mobile profile, add reduced-motion and reduced-particle fallbacks, lazy-load heavy 3D chunks.
12. Accessibility pass: ensure all HTML overlay content (About text, project links, cert names) is reachable and readable without relying solely on 3D hover states — add a non-3D fallback list where feasible.
13. Deploy to Vercel; compare side-by-side with v1 before calling it done.

---

## 7. Open Questions for Swayam

- Should v2 replace v1, or live alongside it (e.g. as `/v2` or a separate domain)?
- Any preference between Tailwind vs. CSS Modules for the DOM layer?
- Do you have an HDRI/environment map preference for the reflective hero object, or should Antigravity source a free one (e.g. from Poly Haven)?
- Confirm certification/project content set (full list vs. curated subset) per Section 4.
