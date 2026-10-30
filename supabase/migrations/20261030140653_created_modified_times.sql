CREATE OR REPLACE FUNCTION fn_set_modified_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$;


-- building
ALTER TABLE building
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_building_set_modified_at ON building;

CREATE TRIGGER tr_building_set_modified_at
BEFORE UPDATE ON building
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- category
ALTER TABLE category
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_category_set_modified_at ON category;

CREATE TRIGGER tr_category_set_modified_at
BEFORE UPDATE ON category
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- event
ALTER TABLE event
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_event_set_modified_at ON event;

CREATE TRIGGER tr_event_set_modified_at
BEFORE UPDATE ON event
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- event_category
ALTER TABLE event_category
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_event_category_set_modified_at ON event_category;

CREATE TRIGGER tr_event_category_set_modified_at
BEFORE UPDATE ON event_category
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- event_organizer
ALTER TABLE event_organizer
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_event_organizer_set_modified_at ON event_organizer;

CREATE TRIGGER tr_event_organizer_set_modified_at
BEFORE UPDATE ON event_organizer
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- event_source
ALTER TABLE event_source
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_event_source_set_modified_at ON event_source;

CREATE TRIGGER tr_event_source_set_modified_at
BEFORE UPDATE ON event_source
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- location
ALTER TABLE location
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_location_set_modified_at ON location;

CREATE TRIGGER tr_location_set_modified_at
BEFORE UPDATE ON location
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- organizer
ALTER TABLE organizer
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_organizer_set_modified_at ON organizer;

CREATE TRIGGER tr_organizer_set_modified_at
BEFORE UPDATE ON organizer
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();


-- sources
ALTER TABLE source
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_sources_set_modified_at ON source;

CREATE TRIGGER tr_sources_set_modified_at
BEFORE UPDATE ON source
FOR EACH ROW
EXECUTE FUNCTION fn_set_modified_at();