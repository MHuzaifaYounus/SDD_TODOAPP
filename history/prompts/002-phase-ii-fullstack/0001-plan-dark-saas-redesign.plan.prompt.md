---
id: 0001
title: Plan Dark SaaS Redesign
stage: plan
date: 2026-01-15
surface: agent
model: gemini
feature: 001-web-app
branch: 001-web-app
user: '[USER]'
command: /sp.plan
labels: [planning, redesign, dark-saas]
links:
  spec: /mnt/d/Agentic AI/TodoApp/specs/001-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/d/Agentic AI/TodoApp/specs/001-web-app/plan.md
  - /mnt/d/Agentic AI/TodoApp/specs/001-web-app/research.md
  - /mnt/d/Agentic AI/TodoApp/specs/001-web-app/data-model.md
  - /mnt/d/Agentic AI/TodoApp/specs/001-web-app/contracts/openapi.yaml
  - /mnt/d/Agentic AI/TodoApp/specs/001-web-app/quickstart.md
tests:
  - none
---

## Prompt

/sp.plan 
Goal: Create a comprehensive implementation plan to redesign the entire application using the "Dark SaaS" aesthetic.
Context: The current UI is functional but uses default light-mode styles. We need to apply the @skills/frontend-designing.md to all pages.
Requirements for the plan:
1.  **Global Styles:**
    - Update `globals.css` and `layout.tsx` to set the base background (`bg-[#0f1117]`) and text colors (`text-slate-400`).
    - Configure fonts (Inter or similar sans-serif).

2.  **Landing Page (Home):**
    - Design a Hero section with a glowing gradient headline (Purple/Teal).
    - Create a "Features" grid using the dark card style (`bg-slate-900`, `border-white/10`).
    - Add a "Get Started" CTA button with neon hover effects.

3.  **Auth Pages (Login/Register):**
    - Center the forms on the screen.
    - Apply "Glassmorphism" to the form containers (`backdrop-blur`, `bg-slate-900/50`).
    - Style inputs with dark backgrounds (`bg-black/20`) and focus rings (`ring-indigo-500/50`).

4.  **Dashboard (Desktop View):**
    - Redesign the Navbar to be sticky, semi-transparent, with a bottom border (`border-white/5`).
    - Create a layout that supports a "Task Statistics" summary row (Total, Pending, Completed) using neon accent colors.
    - Ensure the Main Task List uses the full width efficiently with proper padding (`max-w-7xl`).

5.  **Task Components:**
    - **TaskItem:** Use border-left indicators for status (e.g., Orange for Pending, Green/Teal for Completed).
    - **Status Badges:** Use subtle background pills (`bg-purple-500/10 text-purple-400`).
    - **Animations:** Add `framer-motion` or CSS transitions for adding/deleting tasks.

## Response snapshot

The implementation plan for the "Dark SaaS" redesign has been created. The following artifacts were generated:
- `/mnt/d/Agentic AI/TodoApp/specs/001-web-app/plan.md`
- `/mnt/d/Agentic AI/TodoApp/specs/001-web-app/research.md`
- `/mnt/d/Agentic AI/TodoApp/specs/001-web-app/data-model.md`
- `/mnt/d/Agentic AI/TodoApp/specs/001-web-app/contracts/openapi.yaml`
- `/mnt/d/Agentic AI/TodoApp/specs/001-web-app/quickstart.md`

The agent context has also been updated.

## Outcome

- ✅ Impact: The plan for the redesign is complete.
- 🧪 Tests: No tests were run.
- 📁 Files: 5 files were created/modified.
- 🔁 Next prompts: /sp.tasks to break down the plan into tasks.
- 🧠 Reflection: The process of creating the plan was smooth. The provided script and templates were helpful.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null