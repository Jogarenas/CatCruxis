-- Check metadata columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'event'
  AND column_name IN ('created_at', 'modified_at');


  -- Check existing triggers
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'event';