create temp table _u (id uuid, email text, name text, verified boolean, image text, created_at timestamptz, updated_at timestamptz);
copy _u from '/seed/auth_users.csv' csv header;
insert into auth.users (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
select id, name, email, verified, image, created_at, updated_at from _u;

create temp table _i (user_id uuid, google_sub text, created_at timestamptz, updated_at timestamptz);
copy _i from '/seed/auth_identities.csv' csv header;
insert into auth.account ("accountId", "providerId", "userId", "createdAt", "updatedAt")
select google_sub, 'google', user_id, created_at, updated_at from _i;