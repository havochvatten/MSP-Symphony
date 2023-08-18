DO $$
<<importScript>>
DECLARE
	----------- Parameters to set -----------
	-- Path to file. Check the file and containing folder permissions for readability by Postgres process/user.
	-- (On MacOS, setting file ownership to Postgres user may be required)
	metadataUpdateFile VARCHAR(255) := '/path/to/file/metadata.csv';
	
	-- Corresponding baseline Id
	baselineId integer              := ?;
	
	-- Script settings
	updateExisting boolean      := false;	-- set to true to update existing metadata
	winOS boolean               := false; 	-- set to true if host OS is Windows (assumes powershell is available)
	
	  ----- Additional parameters ---
		----- "special" columns -----
	targetTitleColumn VARCHAR(100) 		:= 'meta_title';
	targetBandnumberColumn VARCHAR(100)	:= 'meta_bandnumber';
	targetBaselineColumn VARCHAR(100)	:= 'meta_bver_id';
	targetSourcesColumn VARCHAR(100) 	:= 'meta_datasources';
	targetSelectedColumn VARCHAR(100)	:= 'meta_defaultselected';
		-----------------------------
	
	  -- components to be _de_selected by default in UI
	  -- (specify as array of titles)
	deselectedTitles text[]	:= '{}';
	  -- example usage:
	  -- 	deselectedTitles text[]	:= '{"Mesophotic coral","Sea birds","Coral reef fish","Deep fish squid",'
	  -- 								'"Demersal fish","Pelagic fish","Rays skates","Sharks","Tuna billfish",'
	  -- 								'"Whale shark","Infauna","Mobile epifauna","Baleen whales","Dolphins",'
	  -- 								'"Dugong","Fur seals","Toothed whales","Sea turtles","Shark control",'
	  -- 								'"Pelagic gillnet","Renewable energy","Research sampling","Invasive species",'
	  -- 								'"Infrastructure","Pelagic trawl","Sport fishing","Seabed mining",'
	  -- 								'"Impulsive noise","Oilspill risk","Seismic surveys","Ocean acidification",'
	  -- 								'"Storm surges"}';		
	  -----------------------------
	
	------------------------------------------
	
	copycmd VARCHAR(300);
	inputColumns text[];
	mappedColumns text[] := '{}';
	typedColumns text[] := '{}';
	unmappedColumns text[] := '{}';
	csvTitleColumn VARCHAR(50);
	foundColumn text;
	foundTargetColumn text;
	faultyCol integer;
	tempValue text;
	updateTemplate text;
	updateClause text;
	metaRowTitle text;

BEGIN

	SET client_min_messages = warning; 			-- suppress inconsequential 'skipping' message.
	DROP TABLE IF EXISTS metaColumnsMap, 		-- Temporary tables are normally dropped at end of proc. 
						 suppliedColumns,       -- They may linger if the script is interrupted by an error.
						 tempMetaTable;
	SET client_min_messages = notice;
	
	copycmd = format((CASE WHEN winOS THEN '''powershell Get-Content "%s" -Head 1''' ELSE '''head -1 "%s"''' END), metadataUpdateFile);
	
	CREATE TEMP TABLE metaColumnsMap(targetColumn varchar(100), csvColumn varchar(50));
	INSERT INTO metaColumnsMap (targetColumn, csvColumn) VALUES
		/* Default column headers mapping, change as necessary 
		   See DECLARE section for 'special' column headers    */
		(targetBandNumberColumn, 				'Bandnumber'),
		('meta_multifname', 					'Multiband .tif'),
		('meta_metadatafilename', 				'Metadata filename'),
		('meta_rasterfilename', 				'Name'),
		('meta_symphonycategory', 				'Symphony Category'),
		('meta_symphonytheme', 					'Symphony Theme'),
		('meta_symphonythemelocal', 			'Symphony Theme (Swedish)'),
		('meta_symphonydatatype', 				'Symphony Data Type'),
		('meta_marineplanearea', 				'Marine Plan Area'),
		(targetTitleColumn, 					'Title'),
		('meta_titlelocal', 					'Title (Swedish)'),
		('meta_datecreated', 					'Date Created'),
		('meta_datepublished', 					'Date  Published'),
		('meta_resourcetype', 					'Resource Type'),
		('meta_format', 						'Format'),
		('meta_summary', 						'Summary'),
		('meta_summarylocal', 					'Swedish Summary'),
		('meta_limitationsforsymphony', 		'Limitations for Symphony'),
		('meta_recommendations', 				'Recommendations'),
		('meta_lineage', 						'Lineage'),
		('meta_status', 						'Status'),
		('meta_authororganisation', 			'Author Organisation'),
		('meta_authoremail', 					'Author Email'),
		('meta_dataowner', 						'Data Owner'),
		('meta_dataownerlocal', 				'Data Owner (Swedish)'),
		('meta_owneremail', 					'Owner Email'),
		('meta_topiccategory', 					'Topic Category'),
		('meta_descriptivekeywords', 			'Descriptive Keywords'),
		('meta_theme', 							'Theme'),
		('meta_temporalperiod', 				'Temporal Period'),
		('meta_uselimitations', 				'Use Limitations'),
		('meta_accessuserestrictions', 			'Access / Use Restrictions'),
		('meta_otherrestrictions', 				'OtherRestrictions'),
		('meta_mapacknowledgement', 			'Map Acknowledgement'),
		('meta_securityclassification', 		'Security Classification'),
		('meta_maintenanceinformation', 		'Maintenance Information'),
		('meta_spatialrepresentation', 			'Spatial Representation'),
		('meta_rasterspatialreferencesystem', 	'Spatial Reference System'),
		('meta_metadatadate', 					'Metadata date'),
		('meta_metadataorganisation', 			'Metadata Organisation'),
		('meta_metadataorganisationlocal', 		'Metadata Organisation (Swedish)'),
		('meta_metadataemail', 					'Metadata Email'),
		('meta_metadatalanguage', 				'Metadata Language'),
		('meta_methodsummary', 					'Method Summary'),
		('meta_valuerange', 					'Value Range'),
		('meta_dataprocessing', 				'Data Processing'),
		(targetSourcesColumn, 					'Data Sources');
	
	CREATE TEMP TABLE suppliedColumns(csvColumn text);
	EXECUTE format('COPY suppliedColumns(csvColumn) FROM PROGRAM %s', copycmd);
	inputColumns := string_to_array((SELECT csvColumn FROM suppliedColumns LIMIT 1), ';');
	
	FOREACH foundColumn IN ARRAY inputColumns LOOP
		EXECUTE format('SELECT targetColumn FROM metaColumnsMap WHERE csvColumn = ''%s''', foundColumn) into foundTargetColumn;
		IF foundTargetColumn IS NULL THEN
			unmappedColumns = array_append(unmappedColumns, foundColumn);
		ELSE
			mappedColumns = array_append(mappedColumns, foundTargetColumn);
			typedColumns = array_append(typedColumns, foundTargetColumn || (CASE WHEN foundTargetColumn = 'meta_bandnumber' THEN ' integer' ELSE ' text' END));
		END IF;
	END LOOP;
	
	IF NOT targetTitleColumn = ANY(mappedColumns) THEN
		SELECT csvColumn FROM metaColumnsMap WHERE targetColumn = targetTitleColumn INTO csvTitleColumn;
		RAISE NOTICE E'A component title column ("%") is missing from the input file.\n' 
					  'Check the file and the column mapping.\n'
					  'The procedure has been aborted.', csvTitleColumn;
		EXIT importScript;
	END IF;
	
	faultyCol = array_length(unmappedColumns, 1);
	
	IF faultyCol > 0 THEN
		RAISE WARNING E'% unrecognised column% in the input file: %.\n'
					   'The procedure has been aborted.',
					   faultyCol, CASE WHEN faultyCol = 1 THEN '' ELSE 's' END, array_to_string(unmappedColumns, ', ');
	ELSE
		IF updateExisting THEN
			EXECUTE format('CREATE TEMP TABLE tempMetaTable(%s)', (array_to_string(typedColumns, ', ')));
			EXECUTE format('COPY tempMetaTable(%s) FROM %L DELIMITER '';'' CSV HEADER NULL ''''', 
						   array_to_string(mappedColumns, ', '), metadataUpdateFile);
			
			FOR metaRowTitle IN EXECUTE format(('SELECT %s FROM tempMetaTable'), targetTitleColumn) LOOP
				updateClause = '';
				FOREACH foundColumn IN ARRAY mappedColumns LOOP
					IF NOT foundColumn IN (targetTitleColumn, targetBandnumberColumn) THEN
						EXECUTE format('SELECT %s FROM tempMetaTable WHERE %s = ''%s''',
									   foundColumn, targetTitleColumn, metaRowTitle) INTO tempValue;
					    tempValue = REPLACE(tempvalue, '\;', ';'); 
						updateClause = format('%s%s = ''%s'',', updateClause, foundColumn, REPLACE(tempValue, '''' , ''''''));
					END IF;
				END LOOP;
				EXECUTE format('UPDATE symphony.metadata SET %s WHERE %I = ''%s'' AND %I = %s',
							   TRIM(TRAILING ',' FROM updateClause), targetTitleColumn, metaRowTitle, targetBaselineColumn, baselineId);
			END LOOP;
		ELSE
			EXECUTE format('COPY symphony.metadata(%s) FROM %L DELIMITER '';'' CSV HEADER NULL ''''', 
						   array_to_string(mappedColumns, ', '), metadataUpdateFile);
			EXECUTE format('UPDATE symphony.metadata SET %1$I = %1$I - 1, '
						   '%2$I = REPLACE(REPLACE(%2$I, '''', ''''''''), ''\;'', '';''), '
						   '%3$I = %4$s WHERE %3$I IS NULL', targetBandnumberColumn, targetSourcesColumn, targetBaselineColumn, baselineId);
		END IF;
		EXECUTE format('UPDATE symphony.metadata SET %I = false WHERE %I = ANY (%L)', targetSelectedColumn, targetTitleColumn,
					   deselectedTitles);
	END IF;
	
END $$;
