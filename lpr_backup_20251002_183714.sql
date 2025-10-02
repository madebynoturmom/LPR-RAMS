--
-- PostgreSQL database dump
--

\restrict Cpxj96Qey3BNDXSOzLCNbN7cNFgQeXnhMG1Z2YLStdNwCGSm8qT4pTLuaatUh5n

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: dev
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO dev;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: dev
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO dev;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: dev
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO dev;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: dev
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: admin; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.admin (
    id text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    name text,
    email text,
    phone text,
    profile_pic text
);


ALTER TABLE public.admin OWNER TO dev;

--
-- Name: event_log; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.event_log (
    id text NOT NULL,
    type text NOT NULL,
    user_id text,
    details text,
    "timestamp" integer NOT NULL
);


ALTER TABLE public.event_log OWNER TO dev;

--
-- Name: guard; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.guard (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    name text,
    phone text,
    guard_id text NOT NULL,
    profile_pic text
);


ALTER TABLE public.guard OWNER TO dev;

--
-- Name: guest_pass; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.guest_pass (
    id text NOT NULL,
    plate_number text NOT NULL,
    visit_time integer NOT NULL,
    duration_minutes integer NOT NULL,
    status text NOT NULL,
    user_id text NOT NULL,
    type text DEFAULT 'visitors'::text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL
);


ALTER TABLE public.guest_pass OWNER TO dev;

--
-- Name: guest_pass_history; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.guest_pass_history (
    id text NOT NULL,
    plate_number text NOT NULL,
    visit_time integer NOT NULL,
    duration_minutes integer NOT NULL,
    status text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    revoked_at integer NOT NULL,
    name text,
    phone text
);


ALTER TABLE public.guest_pass_history OWNER TO dev;

--
-- Name: otp; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.otp (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    expires_at integer NOT NULL
);


ALTER TABLE public.otp OWNER TO dev;

--
-- Name: session; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.session (
    id text NOT NULL,
    user_id text NOT NULL,
    expires_at integer NOT NULL
);


ALTER TABLE public.session OWNER TO dev;

--
-- Name: user; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public."user" (
    id text NOT NULL,
    age integer,
    username text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    name text,
    email text,
    phone text,
    car_number text,
    house_address text,
    profile_pic text
);


ALTER TABLE public."user" OWNER TO dev;

--
-- Name: vehicle; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.vehicle (
    id text NOT NULL,
    plate_number text NOT NULL,
    owner_id text NOT NULL,
    model text NOT NULL,
    make_year integer NOT NULL,
    access_time integer
);


ALTER TABLE public.vehicle OWNER TO dev;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: dev
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: dev
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	8c4a7d08c16243836902e89e6b14ce04f0189ecebc1d3007fdf55309d220cdc3	1758772512383
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.admin (id, username, password_hash, name, email, phone, profile_pic) FROM stdin;
ec6dac2c-4283-448f-8a01-8020da24e4a6	admin1	25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7	Karthikean Pathmanathan	pkartikean@gmail.com	\N	/uploads/admin_ec6dac2c-4283-448f-8a01-8020da24e4a6_1758780490889_Screenshot 2025-09-14 001345.png
\.


--
-- Data for Name: event_log; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.event_log (id, type, user_id, details, "timestamp") FROM stdin;
E1758777916945	resident_created	user1	Created resident Karthikean Pathmanathan (R001)	1758777916
\.


--
-- Data for Name: guard; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.guard (id, username, password_hash, name, phone, guard_id, profile_pic) FROM stdin;
\.


--
-- Data for Name: guest_pass; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.guest_pass (id, plate_number, visit_time, duration_minutes, status, user_id, type, name, phone) FROM stdin;
4315a55f-8014-4827-9687-dcc95100159c	JXY 2811	1758777900	60	active	ec6dac2c-4283-448f-8a01-8020da24e4a6	visitors	Karthikean Pathmanathan	0122095334
\.


--
-- Data for Name: guest_pass_history; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.guest_pass_history (id, plate_number, visit_time, duration_minutes, status, user_id, type, revoked_at, name, phone) FROM stdin;
\.


--
-- Data for Name: otp; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.otp (id, email, code, expires_at) FROM stdin;
a6d582eb-8763-47d2-aa31-d04b94dcce0a	pkartikean@gmail.com	947312	1758866361
f7e63b6a-bd78-467c-b4af-867a382a772d	pkartikean@gmail.com	176386	1758870428
240d542c-a606-45d6-9bc3-bfd3304d0d31	pkartikean@gmail.com	797814	1758870428
fef48889-62e6-4806-add8-26cd5b09e3d7	pkartikean@gmail.com	426952	1758870979
f6f613e0-4480-4daa-87ab-8bb08a653c2c	pkartikean@gmail.com	362861	1758870979
cd303c35-5893-4dc1-a6ae-6fed3e50020f	pkartikean@gmail.com	998976	1758871382
c58edf8c-b08d-4f3b-b343-9a2082c67ccd	pkartikean@gmail.com	881933	1758883949
2f425b22-e3f2-4c63-b8b1-880be8b10bd3	pkartikean@gmail.com	138253	1758884999
6e8d0ffc-fa82-4215-836c-5a9f2c2a2063	pkartikean@gmail.com	496722	1758885013
6961e713-55ca-48a9-a6a7-36eb3dc4deeb	pkartikean@gmail.com	747973	1758885226
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.session (id, user_id, expires_at) FROM stdin;
c3cd1aa3f53eab3505121fe1a8a554ec07cee0c5c3f6823a9098438fbe5a0da0	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761369333
d04cce47bb3a4de757a848c3ed0567b373b09031eaa5fa655b5c20322b1e1aab	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761370823
9b79200ee4aa32952d1d2835f6be3042f5d1659f71480d2cfd469c6d51dc5730	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761371537
5342b4a845e20b9e3d97ba2eebc8a77d56eee98373e21906e044ac327516388c	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761372469
27bb0eb26cb4a42f2e540f6c4410b0168eda1eebd9f88b15118ac0374412d044	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761372967
591b46548db44ff8461a9f33c0ed892d1def2222f71616482459253a646df5f4	687237b9-f493-43bc-bbd0-03d342b28353	1761373104
8e640bc9c7f8349bd233eb4b61a76ce448b08d8a914af5e42edee665988acabd	80286af8-7943-4dac-b335-d89fd0aa65a4	1761379279
5f457b0065750f9066d4a16afd3de1ce13f694aef5e60b59e3ad1a6cc9c07449	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761381953
b3a2359f03837358c61010c4729ff3bf5a5f0e894c68eecfed341b165a2617ad	80286af8-7943-4dac-b335-d89fd0aa65a4	1761382549
cc67fa40187916dcc4fc249cc0fd3fe9df1044a0c0310c51fec14772e644decd	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761476982
f74468d652733b798f4ccff52a5fabb3e1134c3056b06e104700e020fcc51a95	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761477070
635fe521a573b70f978bf5ae5fb314629fd790a2c73f1f2b4e5a61c18ea534cb	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761477364
17a4ba534987ba8dbb3362feac7733eac981641754ee4531959af3680972096b	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761477513
fe31a66a156d0ed654b3e114491e4ffbff38092352796ec1e4e494ffa8100db6	80286af8-7943-4dac-b335-d89fd0aa65a4	1761478376
7ca0c5a5706dd7229c71a467eebe6aa36b1091276bcd33505c0c6e883f054c63	80286af8-7943-4dac-b335-d89fd0aa65a4	1761478383
041d1758a36e98fa447b99e8401e6d93652cab957d69b4c2227608140beb0ea0	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761478420
e23d763cd9a5fb700d0b5a88079a743ebd878ed8e826883af81744385c70c2bd	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761481622
453e771099d3d99d14e47f9acc767e4b6e824d3f05bcdf22df2b5d3587cca613	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761965204
730c3e037adbabda9528885f254ad71861da300225c07abc808f7bacd4cdbe82	ec6dac2c-4283-448f-8a01-8020da24e4a6	1761989620
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public."user" (id, age, username, password_hash, role, name, email, phone, car_number, house_address, profile_pic) FROM stdin;
R001	\N	user1	0a041b9462caa4a31bac3567e0b6e6fd9100787db2ab433d96f6d178cabfce90	resident	Karthikean Pathmanathan	pkartikean@gmail.com	0122095334	BNF 2811	No 61 Jalan Hulubalang 37 Ks 7D	\N
687237b9-f493-43bc-bbd0-03d342b28353	\N	resident1	ec3fdcd8136188e3b476270894351cdc05dc44a4df50d1c4ed727294fb89430f	resident	\N	everythingdie2240@gmail.com	\N	\N	\N	\N
80286af8-7943-4dac-b335-d89fd0aa65a4	\N	guard1	ec3fdcd8136188e3b476270894351cdc05dc44a4df50d1c4ed727294fb89430f	guard	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: vehicle; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.vehicle (id, plate_number, owner_id, model, make_year, access_time) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: dev
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: dev
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: admin admin_username_unique; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_username_unique UNIQUE (username);


--
-- Name: event_log event_log_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.event_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (id);


--
-- Name: guard guard_guard_id_unique; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.guard
    ADD CONSTRAINT guard_guard_id_unique UNIQUE (guard_id);


--
-- Name: guard guard_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.guard
    ADD CONSTRAINT guard_pkey PRIMARY KEY (id);


--
-- Name: guard guard_username_unique; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.guard
    ADD CONSTRAINT guard_username_unique UNIQUE (username);


--
-- Name: guest_pass_history guest_pass_history_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.guest_pass_history
    ADD CONSTRAINT guest_pass_history_pkey PRIMARY KEY (id);


--
-- Name: guest_pass guest_pass_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.guest_pass
    ADD CONSTRAINT guest_pass_pkey PRIMARY KEY (id);


--
-- Name: otp otp_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT otp_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user user_username_unique; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_unique UNIQUE (username);


--
-- Name: vehicle vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.vehicle
    ADD CONSTRAINT vehicle_pkey PRIMARY KEY (id);


--
-- Name: vehicle vehicle_plate_number_unique; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.vehicle
    ADD CONSTRAINT vehicle_plate_number_unique UNIQUE (plate_number);


--
-- PostgreSQL database dump complete
--

\unrestrict Cpxj96Qey3BNDXSOzLCNbN7cNFgQeXnhMG1Z2YLStdNwCGSm8qT4pTLuaatUh5n

