# CatCruxis

CatCruxis models campus events, activities, and opportunities across Davidson College by bringing information from multiple disconnected sources into one centralized database. Currently, students often have to search through platforms such as Handshake, WildcatSync, department emails, Hurt Hub announcements, and word of mouth just to find out what is happening on campus. Our database would store key information about these events, including their title, date, time, location, category, organizer, and original source.

The main users of CatCruxis would be Davidson students and event managers. Students would use the database to discover events and opportunities that match their interests without having to search across several different platforms. Event managers, student organizations, departments, and other campus groups could use it to make their events easier to find and ensure that event information is organized consistently in one place.

## Frontend prototype

The first CatCruxis frontend is built with React, TypeScript, Vite, Tailwind CSS, and React Router. All 30 seeded events are fictional development content. This version has no backend, authentication, or external event integrations.

### Run locally

Requires Node.js 22.19+ (or a supported newer release).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run test     # Data and DOM interaction checks
npm run build    # TypeScript check and production build
npm run preview  # Serve the production build locally
```

### Routes and interactions

- `/`: featured event rail, all seven discovery filters, search, interest exploration, and student-organized events.
- `/events/:id`: editorial details with multiple organizers, categories, and sources, related events, and a downloadable `.ics` calendar file. IDs and event slugs both work.
- `/this-week`: Monday–Sunday lineup for the fixed demo week, October 12–18, 2026.
- `/categories` and `/categories/:category`: interest directory and matching event listings.
- `/organizations`: searchable organizer directory linked to filtered discovery.
- `/submit`: validated event form with multiple categories and optional local image upload. Submitted events are added to in-memory application state and reset on refresh.

Site-wide search is available from the header or **Command/Ctrl + K**. Native modal dialogs support keyboard focus containment and Escape. Mobile navigation and filter sheets use the same pattern. The featured rail supports horizontal touch scrolling. Motion respects `prefers-reduced-motion`.

### Data architecture

- `src/data/types.ts`: event contracts with array relationships for organizers, categories, and sources.
- `src/data/`: centralized events and lookup fixtures.
- `src/lib/events.ts`: asynchronous repository boundary (`getEvents`, `getEventById`, `getFeaturedEvents`, `getEventsByCategory`, `searchEvents`, `addEvent`) and shared filtering.
- `src/lib/EventContext.tsx`: loading, errors, and session state consumed by components. Replace the repository implementation with API calls to integrate a future backend.
- `src/lib/format.ts`: Davidson timezone formatting, date conversion, and calendar export.
- `src/components/` and `src/pages/`: reusable interface components and route layouts.

All event times are entered, grouped, and displayed in **America/New_York**. The fixed demo week keeps the prototype reproducible; replace it with a current-week calculation when introducing live data.

### Assets and deployment

Event photography is bundled in `public/images` and is illustrative, not photography of the depicted Davidson events. Fonts are bundled locally with their open-source licenses. See `public/ASSETS.md` for sources.

`npm run build` produces a static `dist/` directory. Configure your eventual host to rewrite non-asset routes to `index.html` so direct links such as `/events/1` work. This task does not publish a deployment.

### Verification status

The TypeScript/production build and 17 automated data and DOM interaction checks pass. Main routes and representative bundled image/font assets returned HTTP 200 in local-server checks. Dependency installation reported zero known vulnerabilities.

Real browser visual verification remains incomplete: the in-app browser was unavailable and Chrome computer-use access was not approved. DOM tests simulate native dialog APIs; they do not prove browser focus containment, touch scrolling, or pixel layout. Those should receive a manual desktop/mobile review before a public demo.
