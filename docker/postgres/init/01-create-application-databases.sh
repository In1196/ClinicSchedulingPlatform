#!/bin/bash
set -e

psql --set ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=app_password="$POSTGRES_APP_PASSWORD" <<'SQL'
CREATE ROLE clinic_app WITH LOGIN PASSWORD :'app_password';
CREATE DATABASE clinic_scheduling OWNER clinic_app;
CREATE DATABASE clinic_scheduling_shadow OWNER clinic_app;
SQL
