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