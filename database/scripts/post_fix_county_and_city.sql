--
-- Delete cities and counties not in import.havsnarakommuner
--


CREATE TABLE import.havsnarakommuner (
    knr bigint NOT NULL,
    namn text,
    lan text
);


ALTER TABLE import.havsnarakommuner OWNER TO postgres;

--
-- TOC entry 5429 (class 0 OID 60308)
-- Dependencies: 374
-- Data for Name: havsnarakommuner; Type: TABLE DATA; Schema: import; Owner: postgres
--

INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2409, 'Robertsfors kommun', 'Västerbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2132, 'Nordanstigs kommun', 'Gävleborgs län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1272, 'Bromölla kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2282, 'Kramfors kommun', 'Västernorrlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2182, 'Söderhamns kommun', 'Gävleborgs län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (882, 'Oskarshamns kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (127, 'Botkyrka kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2401, 'Nordmalings kommun', 'Västerbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (563, 'Valdemarsviks kommun', 'Östergötlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1435, 'Tanums kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2180, 'Gävle kommun', 'Gävleborgs län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2581, 'Piteå kommun', 'Norrbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (883, 'Västerviks kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2284, 'Örnsköldsviks kommun', 'Västernorrlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (136, 'Haninge kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2184, 'Hudiksvalls kommun', 'Gävleborgs län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2514, 'Kalix kommun', 'Norrbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (186, 'Lidingö kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (382, 'Östhammars kommun', 'Uppsala län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1080, 'Karlskrona kommun', 'Blekinge län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (840, 'Mörbylånga kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (120, 'Värmdö kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (138, 'Tyresö kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2580, 'Luleå kommun', 'Norrbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2482, 'Skellefteå kommun', 'Västerbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2480, 'Umeå kommun', 'Västerbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (182, 'Nacka kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (885, 'Borgholms kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1262, 'Lomma kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1415, 'Stenungsunds kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (188, 'Norrtälje kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1292, 'Ängelholms kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (187, 'Vaxholms kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1381, 'Laholms kommun', 'Hallands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1283, 'Helsingborgs kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1485, 'Uddevalla kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (181, 'Södertälje kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1231, 'Burlövs kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (184, 'Solna kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (980, 'Gotlands kommun', 'Gotlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (834, 'Torsås kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1261, 'Kävlinge kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1282, 'Landskrona kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1280, 'Malmö kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (163, 'Sollentuna kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (117, 'Österåkers kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (880, 'Kalmar kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1482, 'Kungälvs kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1264, 'Skurups kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1082, 'Karlshamns kommun', 'Blekinge län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (861, 'Mönsterås kommun', 'Kalmar län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (319, 'Älvkarleby kommun', 'Uppsala län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1081, 'Ronneby kommun', 'Blekinge län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2262, 'Timrå kommun', 'Västernorrlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (581, 'Norrköpings kommun', 'Östergötlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (488, 'Trosa kommun', 'Södermanlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1486, 'Strömstads kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1290, 'Kristianstads kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1407, 'Öckerö kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1484, 'Lysekils kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1421, 'Orusts kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (160, 'Täby kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (480, 'Nyköpings kommun', 'Södermanlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1284, 'Höganäs kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1427, 'Sotenäs kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1233, 'Vellinge kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1480, 'Göteborgs kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (162, 'Danderyds kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (582, 'Söderköpings kommun', 'Östergötlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1278, 'Båstads kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1380, 'Halmstads kommun', 'Hallands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1382, 'Falkenbergs kommun', 'Hallands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1419, 'Tjörns kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (180, 'Stockholms kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1430, 'Munkedals kommun', 'Västra Götalands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (481, 'Oxelösunds kommun', 'Södermanlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1383, 'Varbergs kommun', 'Hallands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1384, 'Kungsbacka kommun', 'Hallands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1287, 'Trelleborgs kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1286, 'Ystads kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2280, 'Härnösands kommun', 'Västernorrlands län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1291, 'Simrishamns kommun', 'Skåne län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2583, 'Haparanda kommun', 'Norrbottens län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (1083, 'Sölvesborgs kommun', 'Blekinge län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (192, 'Nynäshamns kommun', 'Stockholms län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (360, 'Tierps kommun', 'Uppsala län');
INSERT INTO import.havsnarakommuner (knr, namn, lan) VALUES (2281, 'Sundsvalls kommun', 'Västernorrlands län');


ALTER TABLE ONLY import.havsnarakommuner
    ADD CONSTRAINT havsnarakommuner_pkey PRIMARY KEY (knr);


-- Delete records from city where  city_code not in havsnarakommuner
delete from import.kommunytor where "kommunkod" not in (
	select knr from import.havsnarakommuner
);

-- Delete records from county where  cou_name not in havsnarakommuner
delete from import.lansytor where "lansnamn" not in
(
select lan from import.havsnarakommuner
);

drop table import.havsnarakommuner;

