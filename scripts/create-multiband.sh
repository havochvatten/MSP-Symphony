#!/bin/sh
#
# Script to merge single band files to multiband GeoTiff
#
# Depends on GDAL being installed (https://gdal.org/)
#

if [ $# == 0 ] ; then
    echo "Usage: $(basename "$0") <output.tif> <inputs.tif...>"
    exit 1;
fi

echo -n "Merging: "
gdal_merge -o "$1" -of GTiff -co "TILED=YES" -ot Byte -separate "$@"

