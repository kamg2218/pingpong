#!/bin/bash
set -e
export PGPASSWORD=$POSTGRES_PASSWORD;
psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER <<-EOSQL
	CREATE DATABASE $POSTGRES_DB;
EOSQL

echo "host all  all all trust" >> /var/lib/postgresql/data/pg_hba.conf
