# CatCruxis

CatCruxis models campus events, activities, and opportunities across Davidson College by bringing information from multiple disconnected sources into one centralized database. Currently, students often have to search through platforms such as Handshake, WildcatSync, department emails, Hurt Hub announcements, and word of mouth just to find out what is happening on campus. Our database would store key information about these events, including their title, date, time, location, category, organizer, and original source.

The main users of CatCruxis would be Davidson students and event managers. Students would use the database to discover events and opportunities that match their interests without having to search across several different platforms. Event managers, student organizations, departments, and other campus groups could use it to make their events easier to find and ensure that event information is organized consistently in one place.

DAT 153: Database Programming, Davidson College, Fall 2026

## Team

- Jonathan Arenas (`github-Jogarenas`)
- Rainul Hakim (`github-RainulHakim`)

## What's in this repository

| Path | What it holds |
|------|---------------|
| `documentation.md` | Project documentation: team, source data, design, reflections |
| `migration_log.md` | Why each schema change after the initial deployment was made |
| `schema/` | Your initial schema, one `CREATE TABLE` script per table |
| `etl/` | Your ETL pipeline notebook (Sprint 04) |
| `images/` | ER diagrams and any other images used in your documentation |
| `supabase/` | Created by `supabase init` (Sprint 03); holds your migrations |
|`website/` | The front end of the CatCruxis website which we have developed as a personal project

## Frontend prototype

The first CatCruxis frontend is built with React, TypeScript, Vite, Tailwind CSS, and React Router. All 30 seeded events are fictional development content. This version has no backend, authentication, or external event integrations.
