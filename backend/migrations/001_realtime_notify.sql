-- Live updates: har write par Postgres ek NOTIFY bhejta hai, backend use SSE se browsers tak pahunchata hai.
-- Trigger DB level par hai, isliye psql se kiya gaya edit bhi live dikhega.

CREATE OR REPLACE FUNCTION ss_notify_change() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('ss_data_changed', TG_TABLE_NAME);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Idempotent: dobara chalane par duplicate trigger nahi banta.
DROP TRIGGER IF EXISTS ss_live_notify ON lights;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON lights
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON controllers;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON controllers
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON fault_logs;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON fault_logs
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON light_working_days;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON light_working_days
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON fe_submissions;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON fe_submissions
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON swap_requests;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON swap_requests
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();

DROP TRIGGER IF EXISTS ss_live_notify ON users;
CREATE TRIGGER ss_live_notify
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH STATEMENT EXECUTE FUNCTION ss_notify_change();
