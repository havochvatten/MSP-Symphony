--
-- MSP-områden
--
-- Change the name for the current k-matrices and and n-matrices
-- Change the normalisation values if you know them. Normally they will be changed manually i db after percentile calculations.
--

SET search_path TO symphony, public;

do
$$
declare
	careaid integer;
	
	-- k-matrix names NOTE: Change when when new baseline with other matrices
	k_matrix_name_vasterhavet text := 'k_Matrix_West_Dec_2018';
	k_matrix_name_ostersjon text := 'k_Matrix_East_Dec_2018';
	k_matrix_name_bottniska_viken text := 'k_Matrix_North_Dec_2018';
	
	-- FOR NORMALIZATION
	max_vasterhavet double precision := 51897.5745;
	max_ostersjon double precision := 51406.5265;
	max_bottniska_viken double precision := 29117.311;
	
	-- MSP cursor
	c_msp cursor for
      select namn, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) jsonPoly ,
	  CASE 
		  WHEN namn = 'Västerhavet' THEN max_vasterhavet
		  WHEN namn = 'Östersjön'  THEN max_ostersjon
		  WHEN namn = 'Bottniska viken'  THEN max_bottniska_viken
		  ELSE null
	  END norm_maxvalue, 
	  CASE 
		  WHEN namn = 'Västerhavet' THEN k_matrix_name_vasterhavet
		  WHEN namn = 'Östersjön'  THEN k_matrix_name_ostersjon
		  WHEN namn= 'Bottniska viken' THEN k_matrix_name_bottniska_viken
		  ELSE null
	  END matrix_name
	from import.havsplaneomraden;

begin
  for r_msp in c_msp loop
  		careaid := nextval('carea_seq');
		insert into calculationarea (carea_id, carea_name, carea_default, carea_maxvalue, carea_atype_id) values (careaid, r_msp.namn, true, r_msp.norm_maxvalue, null);
		insert into capolygon (cap_id, cap_carea_id, cap_polygon) values (nextval('cap_seq'), careaid, r_msp.jsonPoly);
		
		update symphony.calculationarea set carea_default_sensm_id = (
			select sensm_id from symphony.sensitivitymatrix where sensm_name = r_msp.matrix_name
		)
		where carea_id = careaid;
  end loop;
	
end $$ LANGUAGE plpgsql;



--
-- n-områden
--
SET search_path TO symphony, public;

do
$$
declare
	-- n-matrix names NOTE: Change when when new baseline with other matrices
	n_matrix_name_vasterhavet text := 'n_Matrix_West_Dec_2018';
	n_matrix_name_ostersjon text := 'n_Matrix_East_Dec_2018';
	n_matrix_name_bottniska_viken text := 'n_Matrix_North_Dec_2018';

	careaid integer;
	natypeid integer;

	c_omr cursor for
      	select omrade As namn, ST_AsGeoJSON(ST_Buffer(geom, -0.0001)) jsonPoly,
		   CASE 
			  WHEN hplanomr = 'Västerhavet' THEN n_matrix_name_vasterhavet
			  WHEN hplanomr = 'Östersjön'  THEN n_matrix_name_ostersjon
			  WHEN hplanomr = 'Bottniska viken' THEN n_matrix_name_bottniska_viken
			  ELSE null
			END matrix_name
	    from import.omraden
		where right(karttext, 1) = 'n'
        order by omrade;

begin
	-- Id *** n-område ***
	select atype_id into natypeid
	 from symphony.areatype
	where atype_name='n-område';
	
  -- Insert into calculationarea/capolygon
  for r_omr in c_omr loop
  		careaid := nextval('carea_seq');
		insert into calculationarea (carea_id, carea_name, carea_default, carea_maxvalue, carea_atype_id) values (careaid, r_omr.namn, false, null, natypeid);
		insert into capolygon (cap_id, cap_carea_id, cap_polygon) values (nextval('cap_seq'), careaid, r_omr.jsonPoly);
		update symphony.calculationarea set carea_default_sensm_id = (
			select sensm_id from symphony.sensitivitymatrix where sensm_name = r_omr.matrix_name
		)
		where carea_id = careaid;
  end loop;
end $$ LANGUAGE plpgsql;


--
-- Kustområden
--
do
$$
declare
  careaid integer;
  natypeid integer;
  
   c_coast  cursor for
	  select 'Kustområde ' || namn as kname, sensm_id, polygon
		from (
		select namn, komrademsp, sensm_id, ST_AsGeoJSON(ST_Buffer("geom", -0.0001)) as polygon
		from import.kustomraden,
		(select sensm_id, sensm_name, CASE 
		WHEN sensm_name='k_Matrix_East_Dec_2018' THEN 'Östersjön' 
		WHEN sensm_name='k_Matrix_West_Dec_2018' THEN 'Västerhavet' 
		WHEN sensm_name='k_Matrix_North_Dec_2018' THEN 'Bottniska viken' 
		END as komrademsp
		from symphony.sensitivitymatrix
		where sensm_name in ('k_Matrix_East_Dec_2018','k_Matrix_North_Dec_2018','k_Matrix_West_Dec_2018')
		) sensm
		where namn=komrademsp
	  ) x;

begin
	-- Id *** Kustområde ***
	select atype_id  into natypeid
	  from symphony.areatype
	 where atype_name='Kustområde';
	 
	-- Insert into calculationarea/capolygon
	for r_coast in c_coast loop
		careaid := nextval('symphony.carea_seq');
		insert into symphony.calculationarea (carea_id, carea_name, carea_default, carea_default_sensm_id, carea_maxvalue, carea_atype_id) values (careaid, r_coast.kname, false, r_coast.sensm_id, null, natypeid);
		insert into symphony.capolygon (cap_id, cap_carea_id, cap_polygon) values (nextval('symphony.cap_seq'), careaid, r_coast.polygon);
	end loop;
end $$ LANGUAGE plpgsql;

