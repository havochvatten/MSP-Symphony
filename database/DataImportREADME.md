# Instructions for data import

The input data is packaged in a so-called "baseline". A baseline consists of
1. Two multiband GeoTIFF files containing ecosystem and pressure components. 
2. One or more CSV file(s) containing sensitivity matrix constants:

   The CSV file should contain a matrix of dimensions $N \times M$, where $N$ is the number of pressure components and 
   $M$ is the number of ecosystem components. The first row and column contains the actual component names, hence 
   the CSV file should have $N+1$ rows and $M+1$ columns. The matrix coefficients are typically decimal values 
   between 0 and 1, using a period as decimal separator. 
3. Two CSV files containing metadata for ecosystem components and pressures components:
   
4. 
TODO: Describe CSV format
4. UTF8?

TODO Point to Swedish example data

## Create new baseline
- Run [createNewBaseLineVersion.sql](scripts/CreateNewBaseLineVersion.sql) in your SQL client of choice. Make sure to 
  change 
  the parameters at the top of the file.

## Import metadata
- Run commands in [MetadataImport.txt](scripts/MetadataImport.txt). Make sure to change the filenames following the _FROM_ 
  arguments, and possibly change the _baseLineVersionId_ SQL variable if there are previously imported baselines.

## Import matrix/matrices
1. See [MatrixImport.txt](scripts/MatrixImport.txt). Change the _FROM_ parameter filename, and perhaps _baseLineVersionId_ and 
   _matrix_name_ SQL variables.

## Import areas
0. The first time you import data, create an import schema table. (See [ImportTables.txt](scripts/ImportTables.txt)).
1. Run commands in Import_area_shape_files.txt for the .shp-files
2. Run post_fix_county_and_city.sql to remove counties and cities not located by the coast
3. Run CalculationAreas.sql (Change the matix names to the current n-matrices and k-matrices)
4. If you haven't changed the normalization values in CalculationAreas.sql
  (which you don't normally know at this stage) change them in the database manually after percentile calculation
5. Run NationalAreasImportToJSON.sql

## Import raster data
Make sure you have [GDAL](https://gdal.org/) command line utilities installed (in particular `gdal-translate`).

### Optional (but highly recommended)
- Run [scripts/preprocess-input.sh](/scripts/preprocess-input.sh) with your multiband GeoTIFF file as argument (once 
  for the ecoomponents and once for the pressures).

The script will optimize the rasters for production use by tiling them and converting them to 8-bit values (which is 
sufficient for the integer 0-100 data value range). This will decrease memory usage and increase performance, and is 
thus highly recommended.
