create type user_state as enum ('onboarding', 'inprogress', 'completed', 'pending', 'ready', 'invited');
create type project_type as enum ('learning', 'competitive', 'collaborative');

create table if not exists users (
    user_id serial not null constraint users_pk primary key,

    display_name text,
    first_name text,
    last_name text,
    age integer,
    address text,
    phone text,
    email text not null,
    parent_email text,
    no_shipping boolean default false not null,
    referrer integer,

    created_at timestamp not null,
    updated_at timestamp not null,
    state user_state default 'onboarding' :: user_state not null,
    admin boolean default false,

    points int default 0 not null,
    current_week int default -1 not null,
    current_project int default -1 not null,
    prev_projects int[] default array[]::int[] not null,
    prev_modules int[] default array[]::int[] not null,
    project_pool int[] default array[]::int[] not null,
    badges int[] default array[]::int[] not null
);

create table if not exists projects (
	project_id serial not null constraint projects_pk primary key,

	title text not null,
	description text not null,
    type project_type default 'learning' :: project_type not null,
    enabled bool not null default false,
	thumbnail_url text not null
);

create table if not exists modules (
    module_id serial not null constraint modules_pk primary key,

    title text not null,
    enabled bool not null default false,
    description text not null,
    content text not null,
    points int not null,
    required bool not null default false,

    project_id serial not null,
    constraint project_fk
        foreign key (project_id) references projects(project_id)
        on update set null
        on delete set null
);

create table if not exists badges (
   badge_id serial not null constraint badges_pk primary key,

   title text not null,
   description text not null,
   enabled bool not null default false
);

create table config (
    key text not null constraint config_pk primary key,
    value text
);

create unique index if not exists users_user_id_uindex_2 on users (user_id);
create unique index if not exists projects_project_id_uindex on projects (project_id);
create unique index if not exists modules_module_id_uindex on modules (module_id);
create unique index if not exists badges_badge_id_uindex on badges (badge_id);
create unique index if not exists config_key_uindex on config (key);
