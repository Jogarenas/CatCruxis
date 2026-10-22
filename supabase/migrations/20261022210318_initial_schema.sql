-- 1. BUILDING
CREATE TABLE building (
    building_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_name TEXT NOT NULL UNIQUE,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    CONSTRAINT valid_latitude CHECK (
        latitude BETWEEN -90 AND 90
    ),
    CONSTRAINT valid_longitude CHECK (
        longitude BETWEEN -180 AND 180
    )
);

-- 2. ORGANIZER
CREATE TABLE organizer (
    organizer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizer_name TEXT NOT NULL UNIQUE,
    organizer_type TEXT,
    CONSTRAINT valid_organizer_type CHECK (
        organizer_type IN (
            'student_organization',
            'department',
            'campus_center',
            'student_community'
        )
    )
);

-- 3. CATEGORY
CREATE TABLE category (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE
);

-- 4. SOURCE
CREATE TABLE source (
    source_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL,
    CONSTRAINT valid_source_type CHECK (
        source_type IN (
            'platform',
            'website',
            'email',
            'student_submission'
        )
    )
);

-- 5. LOCATION
CREATE TABLE location (
    location_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_id INTEGER NOT NULL,
    room_number TEXT,
    CONSTRAINT fk_location_building
        FOREIGN KEY (building_id)
        REFERENCES building(building_id),
    CONSTRAINT unique_building_room
        UNIQUE (building_id, room_number)
);

-- 6. EVENT
CREATE TABLE event (
    event_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    location_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    official_status TEXT NOT NULL,
    CONSTRAINT fk_event_location
        FOREIGN KEY (location_id)
        REFERENCES location(location_id),
    CONSTRAINT valid_official_status CHECK (
        official_status IN (
            'official',
            'student_organized'
        )
    ),
    CONSTRAINT valid_event_times CHECK (
        end_time IS NULL OR end_time >= start_time
    )
);

-- ========================================
-- BRIDGE TABLES
-- ========================================

-- 7. EVENT_ORGANIZER
CREATE TABLE event_organizer (
    event_organizer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER NOT NULL,
    organizer_id INTEGER NOT NULL,
    CONSTRAINT fk_eo_event
        FOREIGN KEY (event_id)
        REFERENCES event(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_eo_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES organizer(organizer_id),
    CONSTRAINT unique_event_organizer
        UNIQUE (event_id, organizer_id)
);

-- 8. EVENT_CATEGORY
CREATE TABLE event_category (
    event_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT fk_ec_event
        FOREIGN KEY (event_id)
        REFERENCES event(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ec_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id),
    CONSTRAINT unique_event_category
        UNIQUE (event_id, category_id)
);

-- 9. EVENT_SOURCE
CREATE TABLE event_source (
    event_source_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER NOT NULL,
    source_id INTEGER NOT NULL,
    source_url TEXT,
    date_found TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_es_event
        FOREIGN KEY (event_id)
        REFERENCES event(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_es_source
        FOREIGN KEY (source_id)
        REFERENCES source(source_id),
    CONSTRAINT unique_event_source
        UNIQUE (event_id, source_id)
);
