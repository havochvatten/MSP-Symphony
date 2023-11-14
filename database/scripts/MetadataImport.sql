DO $$
<<importMetaScript>>
DECLARE
	----------- Parameters to set -----------
	-- Path to file. Check the file and containing folder permissions for readability by Postgres process/user.
	-- (On MacOS, setting file ownership to Postgres user may be required)
metadataFile VARCHAR(255) := '';

	-- Corresponding baseline Id
	baselineId integer              := ?;

	-- Script settings
	-- updateExisting boolean      := false;	-- set to true to update existing metadata  -- TODO: reimplement
	winOS boolean               := true; 	-- set to true if host OS is Windows (assumes powershell is available)

	--------- Variables ------------
		----- Band table columns -----
	targetBandnumberColumn VARCHAR(64)	:= 'bandnumber';
	targetBaselineColumn   VARCHAR(64)	:= 'baseline_id';
	targetCategoryColumn   VARCHAR(64)  := 'symphonycategory';
	targetSelectedColumn   VARCHAR(64)	:= 'defaultselected';
		-----------------------------
	targetTitleColumn VARCHAR(64) 		:= 'title';
	targetLanguageColumn text	        := 'language';
	targetSourcesColumn text 			:= 'datasources';

    deselectedBands integer[] := '{}';
	------------------------------------------

	copycmd VARCHAR(300);
	formatcmd text;

	inputColumns text[];
	mappedColumns text[] := '{}';
	typedColumns text[] := '{}';
	unmappedColumns text[] := '{}';
	quotedColumns text[] := '{}';
	columnIndexes integer[] := '{}';
	currentIndex integer = 0;
	csvTitleColumn VARCHAR(50);
	foundColumn text;
	foundTargetColumn text;
	faultyCol integer;

	metaBandnumber integer;
	metaCategory VARCHAR(10);
	metaLanguage CHAR(2);
	metaSelected boolean;
	metaValue text;

	bandTbl_id integer;
	tempMetaId integer;
	insertClause_metaValues text = '';
	insertClause_meta VARCHAR(140) := 'INSERT INTO symphony.meta_values(metaval_band_id, metaval_language, metaval_field, metaval_value) VALUES';
    insertClause_meta_update VARCHAR(120) := 'ON CONFLICT (metaval_band_id, metaval_language, metaval_field) DO UPDATE SET metaval_field = EXCLUDED.metaval_field';
    inserted_band_ids integer[] = '{}';

    deleteValues_stmt text = 'DELETE from symphony.meta_values WHERE metaband_id IN (%s)';

BEGIN

	SET client_min_messages = warning; 			-- suppress inconsequential 'skipping' message.
    DROP TABLE IF EXISTS metaColumnsMap, 		-- Temporary tables are normally dropped at end of proc.
        suppliedColumns,                        -- They may linger if the script is interrupted by an error.
        deselectedBands,
        tempMetaTable;
    SET client_min_messages = notice;

	copycmd = format((CASE WHEN winOS THEN '''powershell Get-Content "%s" -Head 1''' ELSE '''head -1 "%s"''' END), metadataFile);

	CREATE TEMP TABLE metaColumnsMap(targetColumn varchar(100), csvColumn varchar(50));
    INSERT INTO metaColumnsMap (targetColumn, csvColumn) VALUES
        /* Default column headers mapping, change as necessary
           See DECLARE section for 'special' column headers    */
         (targetBandNumberColumn, 			'Bandnumber'),
         ('multifname', 					'Multiband .tif'),
         ('metadatafilename', 			 	'Metadata filename'),
         ('rasterfilename', 				'Name'),
         (targetCategoryColumn, 			'Symphony Category'),
         ('symphonytheme', 				 	'Symphony Theme'),
         ('symphonydatatype', 			 	'Symphony Data Type'),
         ('marineplanearea', 			 	'Marine Plan Area'),
         (targetTitleColumn, 			 	'Title'),
         ('datecreated', 				 	'Date Created'),
         ('datepublished', 				 	'Date  Published'),
         ('resourcetype', 				 	'Resource Type'),
         ('format', 						'Format'),
         ('summary', 					 	'Summary'),
         ('limitationsforsymphony', 		'Limitations for Symphony'),
         ('recommendations', 			 	'Recommendations'),
         ('lineage', 					 	'Lineage'),
         ('status', 						'Status'),
         ('authororganisation', 			'Author Organisation'),
         ('authoremail', 				 	'Author Email'),
         ('dataowner', 					 	'Data Owner'),
         ('owneremail', 					'Owner Email'),
         ('topiccategory', 				 	'Topic Category'),
         ('descriptivekeywords', 		 	'Descriptive Keywords'),
         ('theme', 						 	'Theme'),
         ('temporalperiod', 				'Temporal Period'),
         ('uselimitations', 				'Use Limitations'),
         ('accessuserestrictions', 		 	'Access / Use Restrictions'),
         ('otherrestrictions', 			 	'OtherRestrictions'),
         ('mapacknowledgement', 			'Map Acknowledgement'),
         ('securityclassification', 		'Security Classification'),
         ('maintenanceinformation', 		'Maintenance Information'),
         ('spatialrepresentation', 		 	'Spatial Representation'),
         ('rasterspatialreferencesystem', 	'Spatial Reference System'),
         ('metadatadate', 				 	'Metadata date'),
         ('metadataorganisation', 		 	'Metadata Organisation'),
         ('metadataemail', 				 	'Metadata Email'),
         (targetLanguageColumn, 		 	'Metadata Language'),
         ('methodsummary', 				 	'Method Summary'),
         ('valuerange', 				 	'Value Range'),
         ('dataprocessing', 			 	'Data Processing'),
         (targetSourcesColumn, 				'Data Sources');

    CREATE TEMP TABLE deselectedBands(symphonyCategory varchar(10), bandNumber integer);
        -- Specify bands to deselect by default in the UI by inserting its corresponding category+bandnumber into this table.
        -- Example usage:
        -- 	INSERT INTO deselectedBands (symphonyCategory, bandNumber) VALUES
        -- 	('Pressure', 37),
        -- 	('Pressure', 28);

    CREATE TEMP TABLE suppliedColumns(csvColumn text);

    EXECUTE format('COPY suppliedColumns(csvColumn) FROM PROGRAM %s', copycmd);
    inputColumns := string_to_array((SELECT csvColumn FROM suppliedColumns LIMIT 1), ';');


        FOREACH foundColumn IN ARRAY inputColumns LOOP

			currentIndex = currentIndex + 1;

            EXECUTE format('SELECT targetColumn FROM metaColumnsMap WHERE csvColumn = %L', foundColumn) into foundTargetColumn;
            IF foundTargetColumn IS NULL THEN
                unmappedColumns = array_append(unmappedColumns, foundColumn);
            ELSE
				columnIndexes = array_append(columnIndexes, currentIndex);
                quotedColumns = array_append(quotedColumns, '"""' || foundColumn || '"""');
                mappedColumns = array_append(mappedColumns, foundTargetColumn);
                typedColumns = array_append(typedColumns, foundTargetColumn || (CASE WHEN foundTargetColumn = targetBandnumberColumn THEN ' integer' ELSE ' text' END));
            END IF;
        END LOOP;

        -- check mandatory columns

    IF NOT targetBandnumberColumn = ANY(mappedColumns) THEN
        SELECT csvColumn FROM metaColumnsMap WHERE targetColumn = targetTitleColumn INTO csvTitleColumn;
        RAISE NOTICE E'The mandatory Bandnumber column ("%") is missing from the input file.\n'
                       'Check the file and the column mapping.\n'
                       'The procedure has been aborted.', csvTitleColumn;
                EXIT importMetaScript;
    END IF;

    IF NOT targetCategoryColumn = ANY(mappedColumns) THEN
        SELECT csvColumn FROM metaColumnsMap WHERE targetColumn = targetCategoryColumn INTO csvTitleColumn;
        RAISE NOTICE E'The mandatory Category column ("%") is missing from the input file.\n'
                      'Check the file and the column mapping.\n'
                      'Note that ''Category'' should say either "Ecosystem" or "Pressure" \n'
                      'The procedure has been aborted.', csvTitleColumn;
                EXIT importMetaScript;
    END IF;

    IF NOT targetLanguageColumn = ANY(mappedColumns) THEN
    SELECT csvColumn FROM metaColumnsMap WHERE targetColumn = targetLanguageColumn INTO csvTitleColumn;
    RAISE NOTICE E'The mandatory Language column ("%") is missing from the input file.\n'
                   'Check the file and the column mapping.\n'
                   'The procedure has been aborted.', csvTitleColumn;
            EXIT importMetaScript;
    END IF;

    IF NOT targetTitleColumn = ANY(mappedColumns) THEN
        SELECT csvColumn FROM metaColumnsMap WHERE targetColumn = targetTitleColumn INTO csvTitleColumn;
        RAISE NOTICE E'A component title column ("%") is missing from the input file.\n'
                      'Check the file and the column mapping.\n'
                      'The procedure has been aborted.', csvTitleColumn;
                EXIT importMetaScript;
    END IF;

    IF faultyCol > 0 THEN
        RAISE WARNING E'% unrecognised column% in the input file: %.\n'
                       'The procedure has been aborted.',
                       faultyCol, CASE WHEN faultyCol = 1 THEN '' ELSE 's' END,
                       array_to_string(unmappedColumns, ', ');
    ELSE
        formatcmd = format(
            (CASE WHEN winOS THEN
             '''chcp 65001 && powershell "Import-Csv """%1$s""" -Delimiter """;""" | Select-Object %2$s | '
                                         'ConvertTo-Csv -NoTypeInformation -Delimiter """;""" | Select-Object -Skip 1"'''
                 ELSE
                 '''cut -d ";" -f %3$s %1$s''' END),
                    metadataFile, array_to_string(quotedColumns, ', '), array_to_string(columnIndexes, ','));

        EXECUTE format('CREATE TEMP TABLE tempMetaTable(tempId integer GENERATED ALWAYS AS IDENTITY, %s)', array_to_string(typedColumns, ', '));
        EXECUTE format('COPY tempMetaTable(%s) FROM PROGRAM %s (FORMAT CSV, DELIMITER '';'', HEADER true, NULL '''')', array_to_string(mappedColumns, ', '), formatcmd);

        FOR tempMetaId, metaBandnumber, metaCategory, metaLanguage, metaSelected IN
            EXECUTE format('SELECT tempId, m.%1$I, m.%2$I, m.%3$I, (d.bandNumber IS NULL) FROM tempMetaTable m '
                           'LEFT JOIN deselectedBands d ON d.symphonyCategory = m.%2$I AND d.bandNumber = m.%1$I',
                            targetBandnumberColumn, targetCategoryColumn, targetLanguageColumn) LOOP

            SELECT metaband_id FROM symphony.meta_bands WHERE
                    metaband_bver_id = baselineId AND
                    metaband_category = metaCategory AND
                    (metaband_number + 1) = metaBandnumber
                INTO bandTbl_id;

            IF NOT FOUND THEN
                -- insert provided bands
                -- Note: band numbers are made zero-based by simply subtracting 1.
                -- (Input data bands is expected to start at 1).
                EXECUTE format('INSERT INTO symphony.meta_bands '
                               '(metaband_bver_id, metaband_category, metaband_number, metaband_default_selected) '
                               'VALUES (%L, ''%s'', %L, %L) RETURNING metaband_id',
                               baselineId, metaCategory, metaBandnumber - 1, metaSelected) INTO bandTbl_id;
            END IF;

            -- prepare metadata insert statement
            FOREACH foundColumn IN ARRAY mappedColumns LOOP
                IF NOT foundColumn IN (targetBandnumberColumn, targetLanguageColumn) THEN
                    EXECUTE format('SELECT %I FROM tempMetaTable WHERE tempId = %s', foundColumn, tempMetaId) INTO metaValue;
                    insertClause_metaValues = format('%s(%s, ''%s'', ''%s'', ''%s''), ',
                        insertClause_metaValues, bandTbl_id, metaLanguage, foundColumn, REPLACE(REPLACE(metaValue, '\;', ';'), '''' , ''''''));
                END IF;
            END LOOP;
    END LOOP;

    -- insert metadata values
    EXECUTE format('%s %s', format('%s %s', insertClause_meta, RTRIM(insertClause_metaValues, ', ')), insertClause_meta_update);
    END IF;

END $$;
