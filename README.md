# FlyScope

FlyScope is a project scoping wizard for freelancers and small agencies. You walk through 8 steps — project type, features, content readiness, integrations, team dynamics, constraints, and timeline — and get a live complexity score, risk assessment, budget range, and a scope document you can copy or download. All data is stored in localStorage; there is no backend or user account.

## Screenshot

<!-- Add a screenshot here -->

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What this is and isn't

**Is:** A structured way to turn a vague client brief into a written scope, rough timeline, and pricing range. Good for discovery calls and proposals.

**Isn't:** A billing or time-tracking tool. The budget and timeline estimates are indicative — they depend on the hourly rate and hours-per-week you configure in the rate settings. Change those numbers and the estimates change. Treat the output as a starting point for conversation, not a fixed quote.

## Data

Projects are saved to `localStorage` under `briefforge_projects`. Nothing is sent to any server. Clearing browser storage will delete all saved scopes.
