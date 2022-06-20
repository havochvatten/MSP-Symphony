#!/bin/sh
#
# Script to preprocess input images to a format suitable for production use in Geoserver
#
# Depends on GDAL being installed (https://gdal.org/)
#

if [ $# == 0 ] ; then
    echo "Usage: `basename $0` <inputs.tif>"
    exit 1;
fi

output_name=`basename -s .tif $1`-production.tif

# Tile:
echo -n "Tiling: "
# Data range is 0-100, hence Byte size suffices. NODATA could be encoded as -1=255=0xff.
# Perhaps add -co "BLOCKXSIZE=512" -co "BLOCKYSIZE=512" to specify desired tile size
gdal_translate -ot Byte -of GTiff -co "TILED=YES" $1 $output_name

# Create overviews (pyramid)
#echo -n "Creating overviews: "
#gdaladdo -r average $output_name 2 4 8 16
