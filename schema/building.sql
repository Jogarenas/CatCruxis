CREATE TABLE building( 
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
)