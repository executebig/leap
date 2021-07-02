create type user_state as enum ('onboarding', 'inprogress', 'completed', 'pending', 'ready', 'invited');
create type submission_state as enum ('pending', 'accepted', 'rejected');

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

    discord_id text,

    created_at timestamp not null,
    updated_at timestamp not null,
    state user_state default 'onboarding' :: user_state not null,
    admin boolean default false,
    banned boolean default false,

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
    type text not null,
	thumbnail_url text not null,

    enabled bool not null default false,
    hardware bool not null default false,

    completion_badges int[] default array[]::int[] not null
);

create table if not exists modules (
    module_id serial not null constraint modules_pk primary key,

    title text not null,
    enabled bool not null default false,
    description text not null,
    content text not null,
    rendered_content text not null,
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

    name text not null,
    description text not null,
    icon text not null,
    hidden bool not null default false,

    code text not null
);

create table if not exists submissions (
    submission_id serial not null constraint submissions_pk primary key,
    created_at timestamp not null,

    user_id serial not null,
    project_id serial not null,
    module_id serial not null,

    content text not null,
    state submission_state default 'pending' :: submission_state not null,
    comments text,

    constraint user_fk
        foreign key (user_id) references users(user_id)
            on update set null
            on delete set null,

    constraint project_fk
        foreign key (project_id) references projects(project_id)
            on update set null
            on delete set null,

    constraint module_fk
        foreign key (module_id) references modules(module_id)
            on update set null
            on delete set null
);

create table config (
    key text not null constraint config_pk primary key,
    value text
);

create table rewards (
    reward_id serial not null constraint rewards_pk primary key,
    name text not null,
    description text not null,
    image text not null,
    quantity integer not null,
    needs_shipping boolean default false not null,
    enabled boolean default false not null,
    price integer not null,
    delivery text not null
);

create table orders (
    order_id serial not null constraint orders_pk primary key,
    ordered_at timestamp not null,
    user_id serial not null,
    reward_id serial not null,
    reward_name text not null,
    email text,
    address text,
    status text not null,
    updated_at timestamp,
    constraint reward_fk 
        foreign key (reward_id) references rewards(reward_id)
            on update set null 
            on delete set null,
    constraint user_fk
		foreign key (user_id) references users(user_id)
			on update set null
            on delete set null
);

create unique index if not exists users_user_id_uindex_2 on users (user_id);
create unique index if not exists projects_project_id_uindex on projects (project_id);
create unique index if not exists modules_module_id_uindex on modules (module_id);
create unique index if not exists badges_badge_id_uindex on badges (badge_id);
create unique index if not exists submissions_submission_id_uindex on submissions (submission_id);
create unique index if not exists config_key_uindex on config (key);
create unique index if not exists rewards_reward_id_uindex on rewards (reward_id);
create unique index orders_order_id_uindex on orders (order_id);
