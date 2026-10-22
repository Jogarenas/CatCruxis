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