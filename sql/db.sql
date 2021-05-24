create table if not exists users (
    user_id serial not null constraint users_pk primary key,
    email text not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    admin boolean default false,
    state user_state default 'onboarding' :: user_state not null
);

create unique index if not exists users_user_id_uindex_2 on users (user_id);
