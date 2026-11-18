#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v old="$OLD_PREFIX" -v new='/files/' <<'SQL'
select format('update public.%I set %I = replace(%I, %L, %L) where %I like %L', c.table_name, c.column_name, c.column_name, :'old', :'new', c.column_name, '%' || :'old' || '%')
from information_schema.columns c join information_schema.tables t using (table_schema, table_name)
where c.table_schema = 'public' and t.table_type = 'BASE TABLE' and c.data_type in ('text', 'character varying')
\gexec
SQL