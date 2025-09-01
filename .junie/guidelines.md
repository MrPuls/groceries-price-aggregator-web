# Project Guidelines — Groceries Price Aggregator Web (Vue 3 + TypeScript)

This document captures architecture, coding standards, testing strategy, and day-to-day practices for developing the SPA. Keep this updated as the project evolves.

## Stack

- Framework: Vue 3 (Composition API, `<script setup>`)
- Language: TypeScript (strict for src/)
- Bundler/Dev server: Vite
- Router: vue-router
- Unit/Component tests: Vitest + @vue/test-utils + jsdom
- E2E tests: Playwright
- Package manager: bun (scripts are npm-compatible)

## High-level goals

- Deliver a fast, accessible, mobile-first SPA to search groceries and display aggregated results from the backend.
- Provide a frictionless search UX with debounced input, robust error handling, and resilient network behavior.
- Keep the codebase maintainable, typed, and test-covered.

## Scope (UI only)

Core features:

- Search input with debounced querying
- Results list with images, prices, and merchants
- Sorting and basic filtering (if backend supports)
- Pagination or infinite scroll (confirm support)
- Responsive layout and accessible components
- Client-side routing for shareable search URLs

Non-functional:

- Type-safety (TypeScript)
- Unit, component, and E2E tests
- ESLint + Prettier compliance
- Solid performance and perceived performance (skeletons, lazy-loading)

## Architecture

- SPA using Vue 3 + TypeScript
- Routing with vue-router (primary route /search; optional detail route later)
- State management:
  - Prefer lightweight composables and provide/inject for shared concerns (e.g., useSearch)
  - Introduce Pinia only if state grows complex; document via ADR if adopted
- Data layer:
  - Thin fetch wrapper with base URL, timeouts, AbortController, and error normalization
  - Centralized API client exposing typed feature methods
  - DTOs (backend) mapped to UI/domain models

### Suggested folders

- src/
  - app/ (bootstrap, router, providers)
  - components/ (reusable UI)
  - features/search/ (SearchBar, ResultsList, composables, types)
  - pages/ (SearchPage.vue)
  - services/api/ (http client, endpoints)
  - styles/ (global.css, tokens)
  - utils/ (debounce, formatters)
  - assets/ (icons, images)
  - types/ (global types)
  - test/ (test utils, fixtures)
- public/ (static assets)

## Routing

- Primary route: `/search?q=milk&page=1&sort=price_asc`
- Keep search state in query for shareable links and history nav
- On input debounce and control changes, update query (use router.replace while typing, router.push for discrete actions like pagination or sort changes)

## API integration

- Base URL from env:
  - .env.development: `VITE_API_BASE_URL=http://localhost:xxxx`
  - .env.production: `VITE_API_BASE_URL=https://your.api.tld`
- Use AbortController to cancel in-flight requests when parameters change
- Debounce input (250–400ms)
- Edge cases:
  - Empty query: show guidance, don’t call backend
  - 0 results: show “No results” state
  - Network error: show error + Retry action
  - 429: backoff and clear UX messaging
- Pagination: prefer page-based if provided; otherwise infinite scroll with sentinel
- Filters/sorting: reflect server-provided options; avoid unsafe client-side re-sorting of partial data

### API client guidelines

Create a thin fetch wrapper:

- Base URL from `import.meta.env.VITE_API_BASE_URL`
- JSON handling, throw normalized errors with status, code, message
- Timeout + AbortController support
- Optional retry/backoff for 429/5xx (exponential with jitter; capped retries)

Export feature functions, e.g.:

- `searchGroceries({ q, page, sort, filters, signal })`

Example types (adjust to backend):

- `GroceryDTO { id, name, merchant, price, currency, imageUrl? }`
- `SearchResponseDTO { items: GroceryDTO[]; total; page; pageSize }`
- `SearchParams { q: string; page?; sort? }`

## State and side effects

- Single source of truth for search parameters is the route’s query
- Derived state: `isLoading`, `error`, `results`, `total`, `hasNextPage`
- Trigger side effects via watching `route.query`
- Cancel stale requests on parameter changes

### Composable contract (useSearch)

Input: reactive route query
Output:

- `results: Ref<GroceryDTO[]>`
- `total: Ref<number>`
- `isLoading: Ref<boolean>`
- `error: Ref<string | null>`
- `runSearch(params: SearchParams): Promise<void>`
- `loadNextPage(): Promise<void>` (if pagination)
  Behavior:
- Debounced `runSearch` on `q` changes
- Cancel previous request if new `runSearch` starts

## UX and accessibility

- Keyboard accessibility:
  - Search region has `role="search"`
  - Input has label or `aria-label`
  - Enter submits; Escape clears
  - Focus results heading on new results
- Announce loading/results via `aria-live="polite"`
- Visual:
  - Focus rings visible; color contrast AA
  - Mobile-first responsive layout
  - Loading skeletons to prevent layout shifts
- Images: `loading="lazy"`; placeholders for missing images
- Respect `prefers-reduced-motion`

## Performance

- Debounce input and cancel stale requests
- Lazy-load images; avoid re-render storms
- Efficient computed/derived data
- Cache last successful results to improve back/forward nav
- Consider route-based code splitting if more pages are added

## Testing strategy

- Unit & component (Vitest + @vue/test-utils + jsdom):
  - SearchBar: debounce, events, clear
  - ResultsList: render, empty/error states
  - Composables (useSearch): lifecycle, abort, mapping
  - Route sync: query <-> UI
- E2E (Playwright):
  - Happy path: visit /search, type, see results
  - Debounce limiting calls (stub API as needed)
  - Error scenarios: network failure, 429 retry
  - Pagination/infinite scroll behavior
- Coverage goal: ≥ 80% lines for feature modules

## Quality gates & standards

- ESLint + Prettier: no warnings on CI
- TypeScript strict recommended
- Conventional Commits: `feat:`, `fix:`, `test:`, `chore:`, etc.
- PRs must:
  - Include testing steps and screenshots/gifs for UI changes
  - Pass lint, typecheck, unit tests, and E2E smoke on main branches
- Definition of Done:
  - Feature implemented with tests
  - A11y checks (keyboard, labels, contrast)
  - Docs updated (README/notes)
  - Performance basics validated (cancel stale requests; no obvious layout shifts)

## Environment variables

- Required: `VITE_API_BASE_URL`
- Optional:
  - `VITE_LOG_LEVEL=debug|info|warn|error`
  - `VITE_FEATURE_INFINITE_SCROLL=true|false`

## Routing details

- `/search?q=<term>&page=<n>&sort=<key>`
- Use `router.replace` for debounced typing; `router.push` for explicit navigations (pagination, sort)

## Delivery plan & milestones

1. Project setup and scaffolding (Day 0–1)
   - Ensure scripts and lint/typecheck/test run
   - Add route /search and AppShell
   - Add .env.\* for API base URL
2. Search MVP (Day 2–4)
   - SearchBar with debounce and clear
   - API client + useSearch composable (abort, basic errors)
   - ResultsList with skeletons, empty/error states
   - Sync URL query with UI
3. Pagination and sorting (Day 5–6)
   - Sort dropdown using server-side sorting
   - Pagination controls or infinite scroll sentinel
   - A11y audit and fixes
4. Testing and hardening (Day 7–8)
   - Unit + component tests for main flows
   - E2E smoke including errors and pagination
   - Performance polish (lazy images, bundle check)
5. Docs and polish (Day 9)
   - README updates, architecture notes, ADRs as needed
   - Final a11y verification

## Risks & edge cases

- Rapid typing: debounce + abort; avoid flicker
- Empty query suppression
- Slow/429 backend: backoff + clear UX
- Missing images: placeholder
- Large totals: consider windowing if infinite scroll memory grows

## Day-to-day workflow

- Small, reviewable PRs per milestone
- Keep issue tracker updated; use checklists
- Maintain CHANGELOG if releasing
- Write ADRs for notable decisions (e.g., adopting Pinia)

## Coding standards

- Vue 3 with `<script setup>` and Composition API
- Strong typing, explicit interfaces for public contracts
- Keep DTOs separate from UI models; validate/guard nullables
- Module boundaries: `features/*` encapsulate their logic; shared code in `components`, `utils`, `services`
- Linting and formatting must pass locally before PR

## Example interfaces

```ts
export interface GroceryDTO {
  id: string
  name: string
  merchant: string
  price: number
  currency: string
  imageUrl?: string
}

export interface SearchResponseDTO {
  items: GroceryDTO[]
  total: number
  page: number
  pageSize: number
}

export interface SearchParams {
  q: string
  page?: number
  sort?: 'relevance' | 'price_asc' | 'price_desc'
}
```

## Implementation notes

- Debounce range: 250–400ms (prefer 300ms by default)
- Abort every in-flight request before sending a new one
- Normalize errors: `{ status, code?, message }`
- Map only required fields from DTOs; avoid leaking backend structure into UI
- Use `aria-live="polite"` to announce results count; manage focus on results update

## Observability & logging

- Non-PII logs for client errors (console.warn/error in dev)
- Feature flags via env (simple build-time checks)
- Keep an event emitter boundary if analytics may be added later

## Acceptance criteria for MVP

- Visiting `/search?q=milk`:
  - Input reflects `milk`
  - One fetch occurs; skeletons show while loading
  - Changing input triggers debounced fetch and cancels the previous one
  - Network error shows an error panel with “Retry”
  - Empty results show a friendly empty state
  - Lint, typecheck, unit tests pass; keyboard a11y verified
