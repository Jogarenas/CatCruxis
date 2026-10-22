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