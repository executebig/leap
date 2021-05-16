create table if not exists users (
    user_id text not null constraint users_pk primary key,
    email text not null,
    last_synced timestamp,
    avatar text,
    admin boolean default false
);

create unique index if not exists users_user_id_uindex on users (user_id);