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