# Instructions for data import

The input data is packaged in a so-called _baseline_. A baseline consists of:

1. Two multiband GeoTIFF files containing ecosystem and pressure components.

   Each band contains one layer of ecosystem (pressure) components. Data values should be in the range of 0&ndash;100. The rasters can given in any datatype, but 8 bits are recommended since 8 bits is enough to represent the data range. (This can be done automatically in the last data import step, see [below](#import-raster-data).)  

3. One or more CSV file(s) containing sensitivity matrix constants:

   The CSV file should contain a matrix of dimensions $N \times M$, where $N$ is the number of pressure components and 
   $M$ is the number of ecosystem components. The first row and column contains the actual component names, hence 
   the CSV file should have $N+1$ rows and $M+1$ columns. The matrix coefficients are should be decimal values 
   between 0 and 1, using a period as decimal separator. Fields should be separated with a semicolon.  

4. Two CSV files containing metadata for ecosystem components and pressures components:
   
   The CSV files should contain one row for each band in multiband GeoTIFF file. The first row is a header row with 
   field headers, of which there are 43. The below table illustrates a row of a pressure component file: (N.B: large table)

|Bandnumber|Multiband .tif name|Metadata filename|Name|Symphony Category|Symphony Theme|Symphony Theme (Swedish) |Symphony Data Type|Marine Plan Area|Title|Title (Swedish)|Date Created|Date  Published|Resource Type|Format|Summary|Swedish Summary|Limitations for Symphony|Recommendations|Lineage|Status|Author Organisation|Author Email|Data Owner|Data Owner (Swedish)|Owner Email|Topic Category|Descriptive Keywords|Theme|Temporal Period|Use Limitations|Access / Use Restrictions|OtherRestrictions|Map Acknowledgement|Security Classification|Maintenance Information|Spatial Representation|Spatial Reference System|Metadata date|Metadata Organisation|Metadata Organisation (Swedish)|Metadata Email|Metadata Language|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|0|Belastningar.tif|Abrasion_bottom_trawl.csv|Abrasion_bottom_trawl|Pressure|Fishing|Yrkesfiske|Normalised|East, West, North|Abrasion bottom trawl|Bottentrål skavning|2016-12-01||dataset |32-bit floating point Tagged Image File Format|This raster layer intends to show the predicted abrasion of benthic substrates as a consequence of bottom trawling in Swedish coastal and offshore waters. Underlying data are from two sources and consist of Surface Area Ratio (SAR) of trawling (OSPAR 2009-2013, and HELCOM 2009-2015) data. A cell value of 0 is equivalent to no benthic abrasion by bottom trawling and a cell value of 100 is equivalent to abrasion (SAR = 8.196288). The surface area ratios (SAR) of trawling are produced by summing total swept area of trawling within a measurement area and then normalize the swept area to the measurement area. Assuming that within the measurement area the trawling is evenly distributed the surface area ratio is interpreted as the number of times per unit of time the measurement area is trawled over. The swept area for a specific fishing vessel is estimated using modelled trawl door spread (for a specific fishery/gear) multiplied by the vms (vessel monitoring system) speed and vms ping interval for a vms signal/position representing benthic trawling. The total swept area within a measurement area is then the sum of all swept area positions, from all vessels within a measurement area.For these data a logarithmic relationship between trawl intensity SAR and benthic impact due to abrasion is assumed, however habitat specific susceptibility to trawling is not modelled so this is a simplistic assumption.  |Detta rasterskikt avser att visa beräknad störning av bentiska substrat som en konsekvens av bottentrålning i svenska kust- och havsvatten. Underlagsdata kommer från två källor och består av data över Surface Area Ratio (SAR) från trålning (OSPAR 2009-2013, och HELCOM 2009-2015). Ett cellvärde av 0 motsvarar ingen bentisk störning från bottentrålning, och ett cellvärde av 100 motsvarar störning (SAR = 8,196288). Denna data skapades som ett data input layer för ’Symphony’ verktyget utvecklat av enheten för havsplaneringen på Havs- och vattenmyndigheten (HaV). Symphony används av HaV för bedömning av den kumulativa miljöpåverkan av mänsklig aktivitet i svenska vatten och används vid havsplanering. Återanvändning av denna data för andra ändamål  är endast lämpligt efter vägledning och rådgivning av datakällorna. SAR för trålning skapas genom att summera den totala arean som trålats inom ett mätområde och sedan normaliseras det trålade området till mätområdet.  Det antas att trålningen inom mätområdet är jämnt fördelad, varvid SAR tolkas som antalet gånger per tidsenhet som området trålats. Det trålade området för ett specifikt fiskefartyg beräknas genom modellerad tråldörrsspridning (för ett specifikt fiske/redskap) multiplicerat med vms-hastighet (vessel monitoring system) och vms-pingintervall för en vms-signal/position som representerar bentisk trålning. Det totala trålade området inom mätområdet är då summan av alla trålade områden, från alla fartyg inom mätområdet. För dessa data antas ett logaritmiskt förhållande mellan trålningsintensitets-SAR och bentisk påverkan på grund av störning, dock är habitatspecifik känslighet inte modellerat så detta är ett förenklat antagande. Denna data skapades som ett data input layer för ’Symphony’ verktyget utvecklat av enheten för havsplaneringen på Havs- och vattenmyndigheten (HaV). Symphony används av HaV för bedömning av den kumulativa miljöpåverkan av mänsklig aktivitet i svenska vatten och används vid havsplanering. Återanvändning av denna data för andra ändamål  är endast lämpligt efter vägledning och rådgivning av datakällorna. |This bottom impact layer aims to describe the impact of bottom trawling on benthic habitats. This bottom-trawling index is used as a proxy for this impact and a logarithmic relationship between trawl intensity and benthic impact is used. This a is simplified assumption - habitat specific susceptibility to trawling is not modelled. |The source data for Symphony should continue to be based on international data. Work should continue to increase the availability of data volumes collected today by ICES within WGSFD. Current available data is not divided into pelagic / demersal species. Official landing statistics per ICES box could be used to weight trawl index for catches per box and, for example, per demersal / pelagic target species.New research (Benthis - 7th Framework Program and Trawling - Best Practice Project) is currently underway to develop indicators for use in, inter alia, the Marine Directive. These proposed indicators are based on a mechanistic link between trawl intensity and habitat specific benthic responses. This are therefore different from previous expert-based sensitivity estimates and the benefits of these kind of data have been highlighted in ICES advice. The indicator data being created in the Benthis project will have the advantage of being normalized to the interval [0.1] and will therefore be suitable for future Symphony updates. Work is also ongoing to include not only the direct physical impact (abrasion/mechanical damage) but also sedimentation. Future data products should, if possible, consist of the internationally produced indicators. In order to improve these indicators, it is primarily knowledge about habitats and bottom type that should be improved - funding support for participation in any research and development projects that would help to continue this development are recommended.|Data are internationally collected data on bottom trawling impact produced by the ICES working group on spatial fisheries data (ICES WGSFD). Standardized products on surface area ratio (SAR) of trawling were downloaded from the working group link on ICES homepage. The method is described in the working group reports (ICES Working Group Spatial Fisheries Data report 2016), but in short the SAR of trawling are produced by summing total swept area of trawling within a measurement area and then normalize the swept area to the measurement area. Assuming that within the measurement area the trawling is evenly distributed the SAR is interpreted as the number of times per unit of time the measurement area is trawled over. The swept area for a specific fishing vessel is estimated using modelled trawl door spread (for a specific fishery/gear) multiplied by the vms speed and vms ping interval for a vms signal/position representing fishery. The total swept area within a measurement area is then the sum of all swept area positions, from all vessels within a measurement area. The underlying data has been aggregated yearly on a geographic grid of resolution 0.05 degree (approximately 1.5 x 3 nm square at 57 N). Yearly data on total SAR are produced in the HELCOM (the Baltic including Kattegat) and OSPAR (North East Atlantic incl. Kattegat) region respectively. Data are available for the years 2009 – 2013 in the HELCOM region and 2009-2015 in the OSPAR region. Data are available as spatial polygons. Each year’s polygon dataset were projected into the Symphony projection ETRS1989 LAEA. Further the polygons were rasterized on the symphony grid using mean values if several polygons overlay the same raster grid cell. Averages of SAR values are calculated (introducing zero values in NA raster cells) over the time periods (2009-2015 for OSPAR and 2009-2013 for HELCOM) and the Kattegat area where masked from the HELCOM data set. Finally the two data sets were added and save as 'Bottom_trawling_intensity_mean_SAR.tif' The raster was normalized by dividing the data set by the maximum SAR value in the Swedish exclusive economic zone (EEZ): maxEEZ SAR = 8.196288From this underlying data set, representing swept area of bottom trawlers, a logarithmic response proxy was derived representing sedimentation impact from trawling and these data were rescaled on a 0-1 scale. Uncertainty of this layer is set to 0.5 representing a “good” model, in the whole region as the data are almost complete international data (representing vessels >12 m), they are averages over several years and thus represent a large part of the total trawling effort and resource outtake but aggregated into larger cells (0.05 degree resolution) and partly validated. Also compared to traditional proxies for bottom trawling like kW*fishing hours, the SAR values takes into account typical trawl widths for different fishing fleets.|Completed|Sveriges Lantbruksuniversitet Department of Aquatic Resources (SLU Aqua)|patrik.jonsson@slu.se|Swedish Agency for Marine and Water Management|Havs- och vattenmyndigheten|thomas.johansson@havochvatten.se|oceans, environment|fishery, environmental impact|oceanographic geographical features|2015|https://creativecommons.org/licenses/by/4.0/legalcode|Licence||SLU Aqua|no protection required|Not Planned||ETRS89LAEA - EPSG:3035|2017-12-01|Swedish Agency for Marine and Water Management|Havs- och vattenmyndigheten|Linus.hammar@havochvatten.se|eng|

  Most fields should be self-explanatory. Notably:
  - The _Bandnumber_ column maps to the (zero-based) band number in the GeoTIFF file.
  - The _Title_ column should map exactly to the corresponding row or column in matrix table file(s).
  - The contents of the _Multiband .tif name_ and _Metadata filename_ columns are ignored.

Fields are separated using semicolon.

[//]: # (*TODO* Link to example data)

## Create new baseline
- Run [createNewBaseLineVersion.sql](scripts/CreateNewBaseLineVersion.sql) in your SQL client of choice. Make sure to 
  change the parameters at the top of the file.

## Import metadata
- Run commands in [MetadataImport.txt](scripts/MetadataImport.txt). Make sure to change the filenames following the _FROM_ 
  arguments, and possibly change the _baseLineVersionId_ SQL variable if there are previously imported baselines.

## Import matrix/matrices
1. See [MatrixImport.txt](scripts/MatrixImport.txt). Change the _FROM_ parameter filename, and perhaps _baseLineVersionId_ and 
   _matrix_name_ SQL variables. 

**N.B**: The matrix import script currently expects that there is always 51 columns per row. If there are less than 50 ecosystem components the matrix files need to be semicolon-padded (yielding 50 semicolons in total per row).

## Import areas
0. The first time you import data, create an import schema table. (See [ImportTables.txt](scripts/ImportTables.txt)).
1. Run commands in Import_area_shape_files.txt for the .shp-files
2. Run post_fix_county_and_city.sql to remove counties and cities not located by the coast
3. Run CalculationAreas.sql (Change the matix names to the current n-matrices and k-matrices)
4. If you haven't changed the normalization values in CalculationAreas.sql
  (which you don't normally know at this stage) change them in the database manually after percentile calculation
5. Run NationalAreasImportToJSON.sql

## Import raster data
Make sure you have [GDAL](https://gdal.org/) command line utilities installed (in particular`gdal-translate`).

### Optional (but highly recommended)
- Run [scripts/preprocess-input.sh](/scripts/preprocess-input.sh) with your multiband GeoTIFF file as argument (once 
  for the ecoomponents and once for the pressures).

The script will optimize the rasters for production use by tiling them and converting them to 8-bit values (which is 
sufficient for the integer 0-100 data value range). This will decrease memory usage and increase performance, and is 
thus highly recommended.

## Precalculate normalization parameters

The default normalization method relies on having calculated the percentile values
of the calculation domains.

Having a dedicated REST endpoint for calculating these values is planned but for the time being the administrator
need to perform calculations manually (for instance using Swagger), and then set these values in the database manually.

The API call need to have, like so:
TODO: Create scenario first in GUI. Then calc from swagger?

```json
{
  "id": 742,
  "owner": "sympho1",
  "timestamp": 1656661997655,
  "baselineId": 1,
  "name": "Scenario Utsjöområde Storgrund till Södra Kvarken",
  "feature": {
    "type": "Feature",
    "properties": {
      "name": "Utsjöområde Storgrund till Södra Kvarken",
      "id": "Utsjöområde Storgrund till Södra Kvarken",
      "displayName": "Utsjöområde Storgrund till Södra Kvarken (B140G)",
      "statePath": ["area", "MSP", "groups", "Areas", "areas", "Utsjöområde Storgrund till Södra Kvarken"],
      "code": "B140G"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[...]]]
    }
  },
  "changes": {
    "type": "FeatureCollection",
    "features": []
  },
  "ecosystemsToInclude": [0, 1, ...],
  "pressuresToInclude": [0, 1, ...],
  "matrix": {
    "areaTypes": []
  },
  "normalization": {
    "type": "PERCENTILE",
    "userDefinedValue": 0
  },
  "latestCalculation": null
}
```

The server logs will contain the calculated value. The resulting value should be inserted into the _carea_maxvalue_
column of the corresponding default area row in the _calculationarea_ table.

[//]: # (TODO: describe how te set other percentile in props file)
