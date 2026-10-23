--
-- PostgreSQL database dump
--

\restrict OdXSTOZyobqQHsJUEMmxz0D55XTUWEOAEkefPisJDS46uFw6vIpK2D4kewDskci

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks (
    id integer NOT NULL,
    district_id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blocks_id_seq OWNED BY public.blocks.id;


--
-- Name: controllers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.controllers (
    id integer NOT NULL,
    controller_id character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'healthy'::character varying,
    fetch_interval integer DEFAULT 15,
    control character varying(10) DEFAULT 'ON'::character varying,
    dim integer DEFAULT 100,
    last_updated timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT controllers_status_check CHECK (((status)::text = ANY ((ARRAY['healthy'::character varying, 'faulty'::character varying])::text[])))
);


--
-- Name: controllers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.controllers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: controllers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.controllers_id_seq OWNED BY public.controllers.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- Name: fault_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fault_logs (
    id integer NOT NULL,
    light_id integer NOT NULL,
    fault_type character varying(100),
    reported_at timestamp without time zone DEFAULT now(),
    rectified_at timestamp without time zone,
    rectified_by integer
);


--
-- Name: fault_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fault_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fault_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fault_logs_id_seq OWNED BY public.fault_logs.id;


--
-- Name: fe_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fe_submissions (
    id integer NOT NULL,
    engineer_id integer NOT NULL,
    light_id integer,
    remarks text,
    photo_url character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    submitted_at timestamp without time zone DEFAULT now(),
    CONSTRAINT fe_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: fe_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fe_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fe_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fe_submissions_id_seq OWNED BY public.fe_submissions.id;


--
-- Name: light_working_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.light_working_days (
    id integer NOT NULL,
    light_id integer NOT NULL,
    work_date date NOT NULL,
    working_hours numeric(4,1) DEFAULT 0,
    energy_kwh numeric(8,2) DEFAULT 0
);


--
-- Name: light_working_days_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.light_working_days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: light_working_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.light_working_days_id_seq OWNED BY public.light_working_days.id;


--
-- Name: lights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lights (
    id integer NOT NULL,
    controller_id integer,
    customer_id integer,
    ward_id integer,
    pole_number character varying(50),
    latitude numeric(10,7),
    longitude numeric(10,7),
    status character varying(20) DEFAULT 'healthy'::character varying,
    is_plugged boolean DEFAULT true,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    installed_on date,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT lights_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT lights_status_check CHECK (((status)::text = ANY ((ARRAY['healthy'::character varying, 'faulty'::character varying])::text[])))
);


--
-- Name: lights_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lights_id_seq OWNED BY public.lights.id;


--
-- Name: panchayats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.panchayats (
    id integer NOT NULL,
    block_id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: panchayats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.panchayats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: panchayats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.panchayats_id_seq OWNED BY public.panchayats.id;


--
-- Name: swap_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swap_requests (
    id integer NOT NULL,
    light_id integer NOT NULL,
    old_controller_id integer,
    new_controller_id integer,
    requested_by integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT swap_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: swap_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.swap_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: swap_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.swap_requests_id_seq OWNED BY public.swap_requests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    parent_id integer,
    phone character varying(15),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'customer'::character varying, 'sub_user'::character varying, 'field_engineer'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wards (
    id integer NOT NULL,
    panchayat_id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: wards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wards_id_seq OWNED BY public.wards.id;


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);


--
-- Name: controllers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controllers ALTER COLUMN id SET DEFAULT nextval('public.controllers_id_seq'::regclass);


--
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- Name: fault_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_logs ALTER COLUMN id SET DEFAULT nextval('public.fault_logs_id_seq'::regclass);


--
-- Name: fe_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fe_submissions ALTER COLUMN id SET DEFAULT nextval('public.fe_submissions_id_seq'::regclass);


--
-- Name: light_working_days id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.light_working_days ALTER COLUMN id SET DEFAULT nextval('public.light_working_days_id_seq'::regclass);


--
-- Name: lights id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lights ALTER COLUMN id SET DEFAULT nextval('public.lights_id_seq'::regclass);


--
-- Name: panchayats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panchayats ALTER COLUMN id SET DEFAULT nextval('public.panchayats_id_seq'::regclass);


--
-- Name: swap_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests ALTER COLUMN id SET DEFAULT nextval('public.swap_requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards ALTER COLUMN id SET DEFAULT nextval('public.wards_id_seq'::regclass);


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blocks (id, district_id, name) FROM stdin;
\.


--
-- Data for Name: controllers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.controllers (id, controller_id, status, fetch_interval, control, dim, last_updated, created_at) FROM stdin;
1	SSL-1001	healthy	15	ON	100	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
2	SSL-1002	healthy	15	ON	80	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
3	SSL-1003	healthy	30	ON	100	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
4	SSL-1004	healthy	15	OFF	0	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
5	SSL-1005	healthy	30	ON	60	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
6	SSL-1006	healthy	15	ON	100	2026-10-19 12:43:06.704181	2026-10-19 12:43:06.704181
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, name) FROM stdin;
\.


--
-- Data for Name: fault_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fault_logs (id, light_id, fault_type, reported_at, rectified_at, rectified_by) FROM stdin;
1	1	Battery low	2026-10-16 16:55:08.028426	2026-10-17 16:55:08.028426	1
2	2	Panel dirty	2026-10-18 16:55:08.028426	2026-10-19 16:55:08.028426	1
3	3	Controller offline	2026-10-20 16:55:08.028426	\N	\N
\.


--
-- Data for Name: fe_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fe_submissions (id, engineer_id, light_id, remarks, photo_url, status, submitted_at) FROM stdin;
\.


--
-- Data for Name: light_working_days; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.light_working_days (id, light_id, work_date, working_hours, energy_kwh) FROM stdin;
1	1	2026-10-20	10.0	20.82
2	2	2026-10-20	10.0	20.82
3	3	2026-10-20	10.0	20.82
4	4	2026-10-20	10.0	20.82
5	5	2026-10-20	10.0	20.82
6	6	2026-10-20	10.0	20.82
\.


--
-- Data for Name: lights; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lights (id, controller_id, customer_id, ward_id, pole_number, latitude, longitude, status, is_plugged, approval_status, installed_on, created_at) FROM stdin;
1	1	1	\N	POLE-1	28.6149000	77.2100000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
2	2	1	\N	POLE-2	28.6159000	77.2110000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
3	3	1	\N	POLE-3	28.6169000	77.2120000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
4	4	1	\N	POLE-4	28.6179000	77.2130000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
5	5	1	\N	POLE-5	28.6189000	77.2140000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
6	6	1	\N	POLE-6	28.6199000	77.2150000	healthy	f	approved	\N	2026-10-19 12:43:06.704181
\.


--
-- Data for Name: panchayats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.panchayats (id, block_id, name) FROM stdin;
\.


--
-- Data for Name: swap_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.swap_requests (id, light_id, old_controller_id, new_controller_id, requested_by, status, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, username, password, role, parent_id, phone, is_active, created_at) FROM stdin;
1	NEW_PREMIER	new_premier	$2b$10$EaPYkXl1KxaKD0u3uj3xSe5rOhQOxnqBnRt7HBFAWmFPkAyOk4ati	customer	\N	\N	t	2026-10-19 12:43:06.704181
2	Ramesh	ramesh_fe	$2b$10$iXR0y7IZILvPzT.KL9FCwOZ/n7tvKI9vos7dmf5PJ2MgYSw6Uyhzm	field_engineer	1	9999999999	t	2026-10-21 17:18:47.193087
3	rohit nagar	boss	$2b$10$j6EN08kUKmmsz1M.Dnigwegbi8gkCkH2/Qpj3iJC4YhrjXF4PS4l6	sub_user	1	9090897977787	t	2026-10-21 17:22:41.564903
\.


--
-- Data for Name: wards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wards (id, panchayat_id, name) FROM stdin;
\.


--
-- Name: blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blocks_id_seq', 1, false);


--
-- Name: controllers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.controllers_id_seq', 6, true);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.districts_id_seq', 1, false);


--
-- Name: fault_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fault_logs_id_seq', 3, true);


--
-- Name: fe_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fe_submissions_id_seq', 1, false);


--
-- Name: light_working_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.light_working_days_id_seq', 6, true);


--
-- Name: lights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lights_id_seq', 6, true);


--
-- Name: panchayats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.panchayats_id_seq', 1, false);


--
-- Name: swap_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.swap_requests_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: wards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wards_id_seq', 1, false);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: controllers controllers_controller_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controllers
    ADD CONSTRAINT controllers_controller_id_key UNIQUE (controller_id);


--
-- Name: controllers controllers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controllers
    ADD CONSTRAINT controllers_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: fault_logs fault_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_logs
    ADD CONSTRAINT fault_logs_pkey PRIMARY KEY (id);


--
-- Name: fe_submissions fe_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fe_submissions
    ADD CONSTRAINT fe_submissions_pkey PRIMARY KEY (id);


--
-- Name: light_working_days light_working_days_light_id_work_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.light_working_days
    ADD CONSTRAINT light_working_days_light_id_work_date_key UNIQUE (light_id, work_date);


--
-- Name: light_working_days light_working_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.light_working_days
    ADD CONSTRAINT light_working_days_pkey PRIMARY KEY (id);


--
-- Name: lights lights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lights
    ADD CONSTRAINT lights_pkey PRIMARY KEY (id);


--
-- Name: panchayats panchayats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panchayats
    ADD CONSTRAINT panchayats_pkey PRIMARY KEY (id);


--
-- Name: swap_requests swap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- Name: fault_logs fault_logs_light_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_logs
    ADD CONSTRAINT fault_logs_light_id_fkey FOREIGN KEY (light_id) REFERENCES public.lights(id);


--
-- Name: fault_logs fault_logs_rectified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_logs
    ADD CONSTRAINT fault_logs_rectified_by_fkey FOREIGN KEY (rectified_by) REFERENCES public.users(id);


--
-- Name: fe_submissions fe_submissions_engineer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fe_submissions
    ADD CONSTRAINT fe_submissions_engineer_id_fkey FOREIGN KEY (engineer_id) REFERENCES public.users(id);


--
-- Name: fe_submissions fe_submissions_light_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fe_submissions
    ADD CONSTRAINT fe_submissions_light_id_fkey FOREIGN KEY (light_id) REFERENCES public.lights(id);


--
-- Name: light_working_days light_working_days_light_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.light_working_days
    ADD CONSTRAINT light_working_days_light_id_fkey FOREIGN KEY (light_id) REFERENCES public.lights(id);


--
-- Name: lights lights_controller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lights
    ADD CONSTRAINT lights_controller_id_fkey FOREIGN KEY (controller_id) REFERENCES public.controllers(id);


--
-- Name: lights lights_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lights
    ADD CONSTRAINT lights_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: lights lights_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lights
    ADD CONSTRAINT lights_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: panchayats panchayats_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panchayats
    ADD CONSTRAINT panchayats_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id);


--
-- Name: swap_requests swap_requests_light_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_light_id_fkey FOREIGN KEY (light_id) REFERENCES public.lights(id);


--
-- Name: swap_requests swap_requests_new_controller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_new_controller_id_fkey FOREIGN KEY (new_controller_id) REFERENCES public.controllers(id);


--
-- Name: swap_requests swap_requests_old_controller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_old_controller_id_fkey FOREIGN KEY (old_controller_id) REFERENCES public.controllers(id);


--
-- Name: swap_requests swap_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: users users_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id);


--
-- Name: wards wards_panchayat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_panchayat_id_fkey FOREIGN KEY (panchayat_id) REFERENCES public.panchayats(id);


--
-- PostgreSQL database dump complete
--

\unrestrict OdXSTOZyobqQHsJUEMmxz0D55XTUWEOAEkefPisJDS46uFw6vIpK2D4kewDskci

