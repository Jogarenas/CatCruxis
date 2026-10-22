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