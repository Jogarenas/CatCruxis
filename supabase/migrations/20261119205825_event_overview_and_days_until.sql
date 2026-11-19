
CREATE VIEW public.vw_event_overview
WITH (security_invoker = true)
AS
SELECT
    e.event_id,
    e.title,
    e.description,
    e.start_time,
    e.end_time,
    e.official_status,
    b.building_name,
    l.room_number,
    STRING_AGG(
        DISTINCT o.organizer_name,
        ', ' ORDER BY o.organizer_name
    ) AS organizers
FROM public.event AS e
LEFT JOIN public.location AS l
    ON e.location_id = l.location_id
LEFT JOIN public.building AS b
    ON l.building_id = b.building_id
LEFT JOIN public.event_organizer AS eo
    ON e.event_id = eo.event_id
LEFT JOIN public.organizer AS o
    ON eo.organizer_id = o.organizer_id
GROUP BY
    e.event_id,
    b.building_name,
    l.room_number;


CREATE OR REPLACE FUNCTION public.fn_days_until_event(
    p_start_time TIMESTAMPTZ,
    p_as_of DATE DEFAULT
        (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::DATE
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT
        CASE
            WHEN p_start_time IS NULL OR p_as_of IS NULL
                THEN NULL
            ELSE
                (p_start_time AT TIME ZONE 'America/New_York')::DATE
                - p_as_of
        END;
$$;
