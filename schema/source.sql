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