#!/bin/bash

BPATH="./$1_BUILD"

echo $BPATH

if [ -e $BPATH/ ]; then
    rm -rf $BPATH/
fi

mkdir $BPATH

for file in $1/*.js; do (cat "${file}"; echo) >> $BPATH/uncomp_main.js; done
yui-compressor --type js $BPATH/uncomp_main.js > $BPATH/main.js
