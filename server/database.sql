BEGIN;

CREATE TABLE IF NOT EXISTS public.grocery_lists
(
    list_id serial NOT NULL,
    user_id integer NOT NULL,
    items character varying[] NOT NULL,
    route_order numeric[] NOT NULL,
    CONSTRAINT grocery_lists_pkey PRIMARY KEY (list_id)
);

CREATE TABLE IF NOT EXISTS public.item_categories
(
    category_id serial NOT NULL,
    category_name character varying NOT NULL,
    CONSTRAINT item_categories_pkey PRIMARY KEY (category_id)
);

CREATE TABLE IF NOT EXISTS public.item_types
(
    item_types_id serial NOT NULL,
    item_types_name character varying NOT NULL,
    category_id integer NOT NULL,
    CONSTRAINT item_types_pkey PRIMARY KEY (item_types_id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    user_id serial NOT NULL,
    user_name character varying NOT NULL,
    user_hash character varying NOT NULL,
    user_token character varying NOT NULL,
    user_expire character varying NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

ALTER TABLE IF EXISTS public.grocery_lists
    ADD CONSTRAINT grocery_lists_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.item_types
    ADD CONSTRAINT item_types_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.item_categories (category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;