
do
$$
declare
	mspjson text;
	countyjson text;
	conservationjson text;
	boundaryjson text;
	apitypes text;
	all_areajson text;
begin

--
-- MSP
--
	with msparea as
	(
		select namn AS name, null code, namn AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.havsplaneomraden 
		order by namn collate "sv_SE"
	), area as (
		select omrade AS name, idnummer || karttext As code, omrade || ',' || idnummer || karttext AS searchdata,  area_km2 areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.omraden
		order by omrade collate "sv_SE"
	), marinearea as (
		select namn AS name, null code, null AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.havsomraden
		order by namn collate "sv_SE"
	),
	u as (
		select sv, en, z.areas areas from (
		select 'Havsplaneområden' As sv, 'Marine spatial planning area' As en,  array_agg(x.*) as areas
		from msparea x
		group by sv, en
		union all
		select 'Havsområden' As sv, 'Marine areas' As en,  array_agg(x.*) as areas
		from marinearea x
		group by sv,en 
		union all
		select 'Områden' As sv, 'Areas' As en,  array_agg(x.*) as areas
		from area x	
		group by sv,en 
		) z
	)
	-- Select
	select row_to_json(x.*) into mspjson
	from (
		select 'MSP' As type, 'Havsplanering' sv, 'Marine planning' en,array_to_json(array_agg(u.*)) as groups from u
	) x;



--
-- County/City
--
	WITH county as
	(select l."lansnamn" AS name, l."lanskod" code, l."lansnamn" AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
	 from import.lansytor l
	 order by l."lansnamn" collate "sv_SE"
	),
	city as
	(select k."kommunnamn" AS name, k."kommunkod" code, k."kommunnamn" AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
	 from import.kommunytor k
	 order by k."kommunnamn" collate "sv_SE"
	),
	u as
	(
	select sv, en, z.areas areas from (
		select 'Län' As sv, 'Counties' As en,  array_agg(x.*) as areas
		from county x
		group by sv, en
		union all
		select 'Kommuner' As sv, 'Cities' As en,  array_agg(y.*) as areas
		from city y
		group by sv, en
	) z
	order by sv collate "sv_SE" desc
	)
	-- Select
	select row_to_json(x.*) into countyjson
	from (
		select 'COUNTY' As type, 'Län och kommuner' sv, 'Counties and cities' en,array_to_json(array_agg(u.*)) as groups from u
	) x;
	
	
--
-- Conservation areas
--
	WITH nationalpark As (
		select namn AS name, null code, namn AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.nationalparker
		order by namn collate "sv_SE"
	), naturereserv As (
		select namn AS name, null code, namn AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.naturreservat
		order by namn collate "sv_SE"
	), sci As (
		select namn AS name, null code, namn AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.n2000sci
		order by namn collate "sv_SE"
	), spa As (
		select namn AS name, null code, namn AS searchdata,  null areaKm2, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) as polygon
		from import.n2000spa
		order by namn collate "sv_SE"
	),
	u As
	(
	select sv, en, z.areas areas from (
		select 'Nationalpark' As sv , 'National park' As en, array_agg(x.*) as areas
		from nationalpark x
		group by sv, en
		union all
		select 'Naturreservat' As sv, 'Nature reserve' As en, array_agg(x.*) as areas
		from naturereserv x
		group by sv, en
		union all
		select 'Art- och habitatdirektivet (SCI)' As sv, 'The species and habitats directive (SCI)' As en, array_agg(x.*) as areas
		from sci x
		group by sv, en
		union all
		select 'Fågeldirektivet (SPA)' As sv, 'The birds Directive (SPA)' As en, array_agg(x.*) as areas
		from spa x
		group by sv, en
	) z
	order by sv collate "sv_SE"
	)
	-- Select
	select row_to_json(x.*) from into conservationjson (
	select 'PROTECTED' As type, 'Skyddade områden' sv, 'Counservation areas' en,array_to_json(array_agg(u.*)) as groups from u
	) x;		
	
	
	--
	-- Boundary
	--
	With vh As (
		SELECT ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) polygon
		  FROM import.kalibreringsyta
		WHERE namn = 'Västerhavet'
	), bv As (
			SELECT ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) polygon
			FROM import.kalibreringsyta
			WHERE namn = 'Bottniska viken'
	), os As (
		SELECT ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) polygon
		  FROM import.kalibreringsyta
		 WHERE namn = 'Östersjön'
	),
	boundaries As (
	select name, x.polygon polygon from
	(
		select 'Area Väst' As name, polygon from vh
		union
		select 'Area Öst' As name, polygon from os
		union
		select 'Area Norr' As name, polygon from bv
	) x
	)
	-- Select
	select row_to_json(x.*)  into boundaryjson
	from (
		select array_to_json(array_agg(b.*)) as areas from boundaries b
	)x;
	
	

	
	select replace(mspjson,'\n','') into mspjson;
	select replace(mspjson,'\','') into mspjson;
	select replace(mspjson,'"[','[') into mspjson;
	select replace(mspjson,']"',']') into mspjson;
	select replace(mspjson,'"{','{') into mspjson;
	select replace(mspjson,'}"','}') into mspjson;
	
	select replace(countyjson,'\n','') into countyjson;
	select replace(countyjson,'\','') into countyjson;
	select replace(countyjson,'"[','[') into countyjson;
	select replace(countyjson,']"',']') into countyjson;
	select replace(countyjson,'"{','{') into countyjson;
	select replace(countyjson,'}"','}') into countyjson;

	select replace(conservationjson,'\n','') into conservationjson;
	select replace(conservationjson,'\','') into conservationjson;
	select replace(conservationjson,'"[','[') into conservationjson;
	select replace(conservationjson,']"',']') into conservationjson;
	select replace(conservationjson,'"{','{') into conservationjson;
	select replace(conservationjson,'}"','}') into conservationjson;
	
	select replace(boundaryjson,'\n','') into boundaryjson;
	select replace(boundaryjson,'\','') into boundaryjson;
	select replace(boundaryjson,'"[','[') into boundaryjson;
	select replace(boundaryjson,']"',']') into boundaryjson;
	select replace(boundaryjson,'"{','{') into boundaryjson;
	select replace(boundaryjson,'}"','}') into boundaryjson;
		
	
	insert into symphony.nationalarea (narea_id, narea_countryiso3, narea_type, narea_areas) select nextval('symphony.narea_seq'), 'SWE', 'MSP', mspjson;
	insert into symphony.nationalarea (narea_id, narea_countryiso3, narea_type, narea_areas) select nextval('symphony.narea_seq'), 'SWE', 'COUNTY', countyjson;
	insert into symphony.nationalarea (narea_id, narea_countryiso3, narea_type, narea_areas) select nextval('symphony.narea_seq'), 'SWE', 'PROTECTED', conservationjson;
	insert into symphony.nationalarea (narea_id, narea_countryiso3, narea_type, narea_areas) select nextval('symphony.narea_seq'), 'SWE', 'BOUNDARY', boundaryjson;

	select array_to_json(ARRAY['MSP', 'COUNTY', 'PROTECTED']) into apitypes;
	insert into symphony.nationalarea (narea_id, narea_countryiso3, narea_type, narea_types) select nextval('symphony.narea_seq'), 'SWE', 'TYPES', apitypes;


end $$ LANGUAGE plpgsql;
				   

