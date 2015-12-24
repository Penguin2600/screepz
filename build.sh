#!/bin/bash

BPATH="$1/Build"

if [ -e $BPATH/ ]; then
    rm -rf $BPATH/
fi

mkdir -p $BPATH

for file in $1/*.js; do (cat "${file}" | grep -v "//comp_out"; echo) >> $BPATH/main.js; done

grunt screeps --branch $2 --path $BPATH/*.js