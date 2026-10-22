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