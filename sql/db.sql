create table if not exists users (
    user_id uuid default uuid_generate_v4() not null constraint users_pk primary key,
    email text not null,
    created_at timestamp not null,
    avatar text,
    admin boolean default false
);

create unique index if not exists users_user_id_uindex on users (user_id);