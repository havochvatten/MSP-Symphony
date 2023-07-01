DO $$ 
DECLARE
	
	----------- Parameters to set -----------
	-- Corresponding baseline Id and calculation area Id
	baselineId integer := ?;
	calcAreaId integer := ?;
	
	-- Sensitivity matrix name
	matrixName text := ?;
	
	-- Path to file. Check the file and containing folder permissions for readability by Postgres process/user.
	-- (On MacOS, setting file ownership to Postgres user may be required)
	matrixFile VARCHAR(255) := '/path/to/file/matrix.csv';
	
	-- set to true for default matrix only
	isDefault boolean := false;
	
	-- optional "comment" for calculation area coupling
	smComment text := '';
	-----------------------------------------
	
	metaQuery char(118) := 'SELECT meta_id FROM symphony.metadata WHERE meta_title = ''%s'' AND meta_bver_id = %s AND meta_symphonycategory=''%s''';
	casenId integer;
	ecoComponents text[];
	pressures text[];
	mxValues numeric[];
	tmp VARCHAR(50);
	mRow text;
	rn integer;
	mval numeric;
	vCount integer;
	nsensmId integer;
	ecoId integer[] := '{}';
	presId integer[] := '{}';
	ecoMetaId integer;
	presMetaId integer;
	ecoIx integer;
	presIx integer;
BEGIN
 
	EXECUTE format('SELECT sensm_id FROM symphony.sensitivitymatrix WHERE sensm_name=''%s''', matrixName) INTO nsensmId;
    IF nsensmId IS null THEN
		select nextval('symphony.sensm_seq') into nsensmId;
		insert into symphony.sensitivitymatrix(sensm_id, sensm_name, sensm_bver_id) values (nsensmId, matrixName, baselineId);
  	END IF;
	
	IF isDefault THEN
		UPDATE symphony.calculationarea SET carea_default_sensm_id = nsensmId WHERE carea_id = calcAreaId;
	END IF;

	EXECUTE format('SELECT casen_id FROM symphony.calcareasensmatrix WHERE casen_carea_id = %s AND casen_sensm_id = %s', calcAreaId, nsensmId) INTO casenId;
	IF casenId IS NULL THEN
		INSERT INTO symphony.calcareasensmatrix(casen_id, casen_carea_id, casen_sensm_id, casen_comment)
			VALUES (nextval('casen_seq'), calcAreaId, nsensmId, 
					CONCAT(smComment, CASE WHEN smComment = '' THEN '' ELSE ' ' END, CASE WHEN isDefault THEN '(default)' ELSE '' END));
	END IF;
	
	SET client_min_messages = warning; -- suppress inconsequential 'skipping' message.
	DROP TABLE IF EXISTS mxRows, mxImport;
	SET client_min_messages = notice;
	
	CREATE TEMP TABLE mxRows(rid serial, raw text);
	CREATE TEMP TABLE mxImport(pressure varchar(50));
	EXECUTE format('COPY mxRows(raw) FROM %L WITH (FORMAT csv, DELIMITER E''\b'')', matrixFile);
	ecoComponents := string_to_array((SELECT raw FROM mxRows LIMIT 1), ',');
	
	FOREACH tmp IN ARRAY ecoComponents LOOP
	    CONTINUE WHEN tmp = 'SENSITIVITY';
		EXECUTE format('ALTER TABLE mxImport ADD COLUMN %s NUMERIC DEFAULT 0;', quote_ident(tmp));
		EXECUTE format(metaQuery, tmp, baselineId, 'Ecosystem') INTO ecoMetaId;
		ecoId = array_append(ecoId, ecoMetaId);
	END LOOP;
	
	vCount = array_upper(ecoComponents, 1) - 1;
	
	FOR mRow IN (SELECT raw FROM mxRows WHERE rid > 1) loop
		tmp = (string_to_array(mRow, ','))[1];
	 	mxValues := (string_to_array(mRow, ','))[2:];
		EXECUTE format(metaQuery, tmp, baselineId, 'Pressure') INTO presMetaId;
		presId = array_append(presId, presMetaId);
		pressures = array_append(pressures, tmp);
		INSERT INTO mxImport(pressure) SELECT tmp;
		FOR rn in 1..(vCount) LOOP
			EXECUTE format('UPDATE mxImport SET %s = %L WHERE pressure = ''%s''', quote_ident(ecoComponents[rn + 1]), mxValues[rn], tmp);
		END LOOP;
	END LOOP;
	
	FOR ecoIx IN SELECT generate_subscripts(ecoId, 1) LOOP
		FOR presIx IN SELECT generate_subscripts(presId, 1) LOOP
			EXECUTE format('SELECT %s FROM mxImport WHERE pressure = ''%s''', quote_ident(ecoComponents[ecoIx + 1]), pressures[presIx]) INTO mval;
			INSERT INTO symphony.sensitivity (sens_id, sens_sensm_id, sens_pres_meta_id, sens_eco_meta_id, sens_value) 
  			 	   VALUES (nextval('symphony.sens_seq'), nsensmId, presId[presIx], ecoId[ecoIx], mval);
  		END LOOP;
	END LOOP;
	
END $$;
