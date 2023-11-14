DO $$
<<importSensMxScript>>
DECLARE
	
	----------- Parameters to set -----------
	-- Corresponding baseline Id and calculation area Id
	baselineId integer := ?;
	calcAreaId integer := ?;

    -- if set, this will override the default locale set for the baseline
    alt_language char(2) := 'en';
    titlesLanguageFragment char(8);

	-- Sensitivity matrix name
	matrixName text := ?;

	-- Path to file. Check the file and containing directory's permissions for readability by Postgres process/user.
	-- (On MacOS, setting file ownership to Postgres user may be required)
	matrixFile VARCHAR(255) := '/path/to/file/matrix.csv';
	
	-- set to true for default matrix only
	isDefault boolean := false;
	
	-- optional "comment" for calculation area coupling
	smComment text := '';
	-----------------------------------------

	metaQuery char(360) :=  'SELECT mb.metaband_id FROM symphony.meta_bands mb ' ||
                                'JOIN symphony.baselineversion bl ON '           ||
                                        'mb.metaband_bver_id = bl.bver_id '      ||
                               'JOIN symphony.meta_values m '                    ||
                               'ON  m.metaval_band_id = mb.metaband_id '         ||
                               'AND m.metaval_language = %s '                    ||
                               'AND m.metaval_field = ''title'' '                ||
                            'WHERE '                            ||
                                  'mb.metaband_bver_id  = %s '  ||
                              'AND mb.metaband_category = ''%s'' '  ||
                              'AND m.metaval_value = ''%s''';
	casenId integer;
	ecoComponents text[];
	pressures text[];
	mxValues numeric[];
	tmp VARCHAR(100);
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
	titlesLanguageFragment = CASE WHEN alt_language IS NULL THEN 'bl.locale' ELSE '''' || alt_language || '''' END;

	SELECT sensm_id FROM symphony.sensitivitymatrix WHERE sensm_name = matrixName INTO nsensmId;

	IF NOT FOUND THEN
	    INSERT INTO symphony.sensitivitymatrix(sensm_name, sensm_bver_id) VALUES (matrixName, baselineId) RETURNING sensm_id INTO nsensmId;
  	END IF;

	IF isDefault THEN
		UPDATE symphony.calculationarea SET carea_default_sensm_id = nsensmId WHERE carea_id = calcAreaId;
	END IF;

	SELECT casen_id FROM symphony.calcareasensmatrix WHERE casen_carea_id = calcAreaId AND casen_sensm_id = nsensmId INTO casenId;
	IF NOT FOUND THEN
		INSERT INTO symphony.calcareasensmatrix(casen_carea_id, casen_sensm_id, casen_comment)
			VALUES (calcAreaId, nsensmId,
					CONCAT(smComment, CASE WHEN smComment = '' THEN '' ELSE ' ' END, CASE WHEN isDefault THEN '(default)' ELSE '' END))
            RETURNING casen_id INTO casenId;
	END IF;

	SET client_min_messages = warning; -- suppress inconsequential 'skipping' message.
	DROP TABLE IF EXISTS mxRows, mxImport;
	SET client_min_messages = notice;

	CREATE TEMP TABLE mxRows(rid serial, raw text);
	CREATE TEMP TABLE mxImport(pressure varchar(100));
	EXECUTE format('COPY mxRows(raw) FROM %L WITH (FORMAT csv, DELIMITER E''\b'')', matrixFile);
	ecoComponents := string_to_array((SELECT raw FROM mxRows LIMIT 1), ',');

	FOREACH tmp IN ARRAY ecoComponents LOOP
	    CONTINUE WHEN tmp = 'SENSITIVITY';
		EXECUTE format('ALTER TABLE mxImport ADD COLUMN %s NUMERIC DEFAULT 0;', quote_ident(tmp));
		EXECUTE format(metaQuery, titlesLanguageFragment, baselineId, 'Ecosystem', tmp) INTO ecoMetaId;
        IF ecoMetaId IS NULL THEN
            RAISE NOTICE '% not found', tmp;
            EXIT importSensMxScript;
        END IF;
		ecoId = array_append(ecoId, ecoMetaId);
	END LOOP;

	vCount = array_upper(ecoComponents, 1) - 1;

	FOR mRow IN (SELECT raw FROM mxRows WHERE rid > 1) loop
		tmp = (string_to_array(mRow, ','))[1];
	 	mxValues := (string_to_array(mRow, ','))[2:];
		EXECUTE format(metaQuery, titlesLanguageFragment, baselineId, 'Pressure', tmp) INTO presMetaId;
		IF presMetaId IS NULL THEN
		    RAISE NOTICE '% not found', tmp;
            EXIT importSensMxScript;
        END IF;
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

			INSERT INTO symphony.sensitivity (sens_sensm_id, sens_pres_band_id, sens_eco_band_id, sens_value)
  			 	   VALUES (nsensmId, presId[presIx], ecoId[ecoIx], mval);
  		END LOOP;
	END LOOP;

END $$;
