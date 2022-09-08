--
-- Create new BaseLineVersion (change variables first)
--
do
$$
declare
	--Change to new version
    baselineName text := 'BASELINE2019';
	baselineDesc text := 'Levererad data för baseline 2019';
    baselineLocale text := 'sv_SWE';
	validFrom date := TO_DATE('2019-01-01', 'YYYY-MM-DD');
	eco_file_path text := '/app/data/symphony/Ekokomponenter-prod.tif';
	pres_file_path text := '/app/data/symphony/Belastningar-prod.tif';
begin
	INSERT INTO symphony.baselineversion (bver_id, bver_name, bver_desc, bver_name, bver_validfrom, bver_ecofilepath,
	                                      bver_presfilepath)
		VALUES (nextval('symphony.bver_seq'), baselineName, baselineDesc, baselineLocale, validFrom, eco_file_path,
		        pres_file_path);
end $$ LANGUAGE plpgsql;

commit;
