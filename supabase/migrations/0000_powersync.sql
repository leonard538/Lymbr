-- PowerSync replication setup (data-model.md section 8).

-- PowerSync requires this exact publication name. FOR ALL TABLES also covers
-- tables created by later migrations.
create publication powersync for all tables;

-- Role the hosted PowerSync instances connect as. It is created without a
-- password: set one by hand once per hosted environment (see README), so the
-- secret never lands in a migration (rules.md section 3).
create role powersync_role with replication bypassrls login;
grant select on all tables in schema public to powersync_role;
alter default privileges in schema public grant select on tables to powersync_role;
