# kushbot-web — Architecture Overview

## Stack

React + TypeScript (Create React App)

**Key Dependencies:**
- React 19.2.0 & React DOM 19.2.0
- TypeScript 4.9.5
- React Router DOM 7.9.4 (for routing)
- React Testing Library (for testing)
- XLSX 0.18.5 (for Excel file handling)
- Web Vitals (for performance monitoring)

**Repository Structure:**
- `public/` - Static assets
- `src/` - Application source
- `.env` - Environment variables
- `package.json`, `tsconfig.json` - Configuration files

## Goals

- Simple, typed React SPA scaffold for fast iteration
- Clear separation of UI components vs. app "glue" (hooks, utilities)
- Easy deploy to static hosts (Vercel/Netlify/GitHub Pages)

## Top-Level Layout

```
/ (repo root)
├─ public/              # Static assets served as-is (index.html, favicons, SVGs)
├─ src/                 # Application source
│  ├─ App.tsx           # Root component
│  ├─ index.tsx         # App bootstrap (ReactDOM render)
│  ├─ App.css           # App-level styles
│  ├─ index.css         # Global styles
│  ├─ BonusBuy.tsx      # BonusBuy component
│  ├─ MonthlyPromoPlan.tsx  # MonthlyPromoPlan component
│  ├─ Summit.tsx        # Summit component
│  ├─ logo.svg          # Logo asset
│  ├─ App.test.tsx      # App component tests
│  ├─ setupTests.ts     # Test setup configuration
│  ├─ reportWebVitals.ts    # Performance monitoring
│  └─ react-app-env.d.ts    # React app type definitions
├─ .env                 # Runtime env vars (prefixed with REACT_APP_)
├─ package.json         # Scripts & deps
├─ tsconfig.json        # TS compiler options
├─ ARCHITECTURE.md      # This file
└─ README.md
```

**Note:** The current structure is flat within `src/`. As the app grows, consider organizing into subdirectories like `components/`, `hooks/`, `lib/`, `types/`, and `styles/` for better maintainability.

## Data Flow & State

- **Local UI state:** managed via React `useState`, `useReducer`, and `useRef` inside components
- **Derived/UI logic:** colocate simple derived state with the component; extract reusables into `/hooks`
- **Side effects:** `useEffect` in components or reusable hooks (e.g., `useLocalStorage`, `useFetch`)
- **Global state (optional):** if/when the app grows, introduce a thin state layer (Zustand/Context) in `/lib/state`

## Components & Styling

- Components are currently located directly in `src/` (e.g., `BonusBuy.tsx`, `MonthlyPromoPlan.tsx`, `Summit.tsx`)
- Components should be presentational by default: props in, events out. Avoid API calls inside components.
- **Styling:** CSS files are colocated (`App.css`, `index.css`). The project structure supports moving to organized directories as it grows.

## Types & Safety

- TypeScript is enabled with strict mode
- React type definitions are included via `react-app-env.d.ts`
- As the project grows, consider creating a dedicated `/types` directory for shared models
- Prefer explicit prop types and narrow, composable interfaces

## API & Utilities

- Utility functions should be extracted into dedicated files or a `/lib` directory as the project grows
- If you add HTTP calls, keep them in `lib/api.ts` (or `lib/api/`) and return typed results. Never call fetch directly in components.
- Currently includes `reportWebVitals.ts` for performance monitoring

## Environment & Config

- CRA exposes only `REACT_APP_*` variables from `.env` (e.g., `REACT_APP_API_BASE_URL`)
- Do not commit real secrets; `.env` should be local or use environment config in your host

## Scripts

In the project directory:

- `npm start` — start dev server on :3000 with HMR
- `npm test` — run tests in watch mode
- `npm run build` — production build to `/build` (minified & hashed assets)

## Testing

- React Testing Library + Jest are included and configured (CRA pre-wired)
- Test setup is configured in `setupTests.ts`
- Example test file: `App.test.tsx`
- Run tests with `npm test`
- As you add more features, write unit tests for utilities and critical hooks; smoke tests for key components

## Linting & Formatting

ESLint is included with CRA sensible defaults. Consider adding Prettier for consistent formatting.

Example npm scripts to add:

- `lint`: `eslint "src/**/*.{ts,tsx}"`
- `format`: `prettier --write .`

## Routing

The project uses `react-router-dom` for routing. Route configuration is managed in `App.tsx`.

## Deployment

Any static host works:

- **Vercel/Netlify:** point to `npm run build`; serve `/build`
- **GitHub Pages:** use `gh-pages` or the CRA docs for homepage + deploy script

## Conventions

- One component per file; `index.ts` files only for barrel exports when helpful
- Keep components small and focused; extract logic to hooks/utilities early
- Absolute imports via `tsconfig.json` paths (optional) to avoid deep relative paths

## Roadmap (nice-to-haves)

- Add CI (GitHub Actions) for lint + typecheck + tests on PRs
- Add error boundary + basic telemetry (e.g., Sentry) if/when API calls are added
- Consider CSS tooling (Tailwind) if design surface grows