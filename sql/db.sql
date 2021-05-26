create type user_state as enum ('onboarding', 'inprogress', 'completed', 'idle');
create type project_type as enum ('learning', 'competitive', 'collaborative');

create table if not exists users (
    user_id serial not null constraint users_pk primary key,
    email text not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    admin boolean default false,
    state user_state default 'onboarding' :: user_state not null,
    display_name text,
    first_name text,
    last_name text,
    age integer,
    no_shipping boolean default false not null,
    address text,
    phone text,
    parent_email text
);

create table if not exists projects (
	project_id serial not null constraint projects_pk primary key,
    type project_type default 'learning' :: project_type not null,
	title text not null,
	description text not null,
	thumbnail_url text not null,
	modules_required int not null,
	modules_available int not null
);

create unique index if not exists users_user_id_uindex_2 on users (user_id);
create unique index if not exists projects_project_id_uindex on projects (project_id);
