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