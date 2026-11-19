# Migration Log

A running record of every schema change made to the live Supabase database after the initial deployment. Add a new entry each time you create a migration, newest at the bottom.

## 2026-10-22: Initial deployment

•⁠  ⁠*Migration file:* ⁠ supabase/migrations/`20261022210318_initial_schema.sql`
•⁠  ⁠*What changed:* Deployed Version 1 of the schema (every table in ⁠ schema/ ⁠).
•⁠  ⁠*Why:* Baseline for the future of the project

Migration #1, October 22, 20261022210318_initial_schema

## 2026-10-30: Adding metadata columns

•⁠  ⁠*Migration file:* ⁠ supabase/migrations/`20261030140653_created_modified_times.sql`
•⁠  ⁠*What changed:* Added the created and modified times to each column in our schema.
•⁠  ⁠*Why:* Needed to get started on the ETL process, aka sprint 4

## 2026-11-05: Reference rows for source

- *Migration file:* `supabase/migrations/20261105171601_reference_rows.sql`
- *What changed:* Inserted the 3 rows of the `source` table: WildcatSync (platform), Hurt Hub (website), Davidson College Events (website).
- *Why:* These rows are written by hand, not loaded from any dataset, and every `event_source` row depends on them. As a migration they exist in every copy of the database before the ETL runs, and the notebook never truncates them. Davidson College Events was added because we found davidson.edu/events while gathering data. Handshake isn't included yet because we have no data for it.

## 2026-11-19: Event Overview View

•⁠  *Migration file*: `supabase/migrations/20261119205825_event_overview_and_days_until_event_overview_and_days_until.sql`
•⁠ *What changed*: Created the `vw_event_overview view`, which joins the `event`, `location`, `building`, `event_organizer`, and `organizer` tables. The view displays event details, dates, locations, and organizers in one place. Multiple organizers are combined into a single field so each event appears only once.
•⁠  *Why*: To make it easier to retrieve complete event information without repeatedly writing complex joins. This allows students to find events and their locations more easily while also supporting historical event reporting. The view uses `security_invoker` = true to respect the querying user’s database permissions.

## 2026-11-19: Days Until Event Function

•⁠  *Migration file* : `supabase/migrations/20261119205825_event_overview_and_days_until_days_until_event_function.sql`
•⁠  *What changed* : Created the `fn_days_until_event` function, which calculates the number of calendar days between an event’s start date and a reference date. The function uses the America/New_York timezone and returns an integer representing the days until the event (positive for future events, negative for past events, and zero for events occurring today). NULL inputs return NULL.
•⁠  *Why*: To provide a reusable and consistent way to calculate how many days remain until an event. This simplifies event queries, avoids repeating date calculations, and ensures that all calculations use Davidson’s local timezone.

## 2026-11-19: Event Start Time Index

•⁠  *Migration file*: `supabase/migrations/20261119213543_event_start_time_index_event_start_time_index.sql`
•⁠  *What changed*: Created the ix_event_start_time index on the start_time column of the event table. This index allows PostgreSQL to efficiently locate events within a specified date range without necessarily scanning the entire table.
•⁠  *Why*: To improve the performance of queries that filter and order events by their start time. As CatCruxis continues to collect more events, this index may help PostgreSQL retrieve upcoming or historical events more efficiently.

•⁠  Performance comparison: Pending verification. The full EXPLAIN ANALYZE execution plans from before and after creating the index will be added here, along with the observed differences in scan type, sorting, and execution time.