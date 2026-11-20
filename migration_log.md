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

## 2026-11-19: Event overview view

- **Migration file:** `supabase/migrations/20261119205825_event_overview_and_days_until.sql`
- **What changed:** Created `vw_event_overview`, which joins `event`, `location`, `building`, `event_organizer` and `organizer`. Each row is one event, with its time, building, room and all its organizers combined into one text field.
- **Why:** Students browsing events, and anyone writing a weekly events report, need this same five-table join every time. The view is created `WITH (security_invoker = true)`, so it runs with the permissions of whoever queries it.

## 2026-11-19: Days until event function

- **Migration file:** `supabase/migrations/20261119205825_event_overview_and_days_until.sql` (same file as the view)
- **What changed:** Created `fn_days_until_event(p_start_time TIMESTAMPTZ, p_as_of DATE)`, which returns an `INTEGER`: the calendar days from `p_as_of` (default: today in Davidson) to the event's start date, in America/New_York time. Positive means the event is in the future, 0 means today, negative means it's past. NULL input returns NULL.
- **Why:** It saves everyone from writing the same time-zone-aware date arithmetic by hand, and it keeps "days until" consistent by always using Davidson's local date.

## 2026-11-19: Event start time index

- **Migration file:** `supabase/migrations/20261119213543_event_start_time_index.sql`
- **What changed:** Created `ix_event_start_time` on `event(start_time)`.
- **Why:** The most common question is "what's on this week?", which filters and sorts events by `start_time`.

**Query tested (on TEST):**

```sql
EXPLAIN ANALYZE
SELECT event_id, title, start_time FROM event
WHERE start_time BETWEEN '2026-11-19' AND '2026-11-26'
ORDER BY start_time;
```

**Before the index** (dropped inside a transaction, then rolled back):

```
Sort  (cost=16.53..16.57 rows=14 width=55) (actual time=0.135..0.139 rows=14 loops=1)
  Sort Key: start_time
  Sort Method: quicksort  Memory: 25kB
  ->  Seq Scan on event  (cost=0.00..16.27 rows=14 width=55) (actual time=0.036..0.098 rows=14 loops=1)
        Filter: ((start_time >= '2026-11-19 00:00:00+00'::timestamp with time zone) AND (start_time <= '2026-11-26 00:00:00+00'::timestamp with time zone))
        Rows Removed by Filter: 137
Planning Time: 0.288 ms
Execution Time: 0.196 ms
```

**After the index:**

```
Index Scan using ix_event_start_time on event  (cost=0.14..11.76 rows=14 width=55) (actual time=0.096..0.115 rows=14 loops=1)
  Index Cond: ((start_time >= '2026-11-19 00:00:00+00'::timestamp with time zone) AND (start_time <= '2026-11-26 00:00:00+00'::timestamp with time zone))
Planning Time: 0.591 ms
Execution Time: 0.169 ms
```

**Comparison:** Before the index, PostgreSQL ran a `Seq Scan` over all 151 rows of `event`, threw away 137 of them with the filter, and sorted the remaining 14 in a separate `Sort` step (Execution Time: 0.196 ms). With `ix_event_start_time`, it switched to an `Index Scan` that reads only the 14 rows in the date range and returns them already ordered by `start_time`, so the sort step disappears and the estimated cost drops from 16.57 to 11.76 (Execution Time: 0.169 ms). At 151 rows the time saved is tiny and within normal variation. The real gain is the plan: a sequential scan has to read every event, so it grows as events pile up over semesters, while the index scan only touches the week being asked for.
