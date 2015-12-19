#!/bin/bash
if [ -e ./build/ ]; then
    rm -rf ./build/
    mkdir build
fi

for file in *.js; do (cat "${file}"; echo) >> ./build/uncomp_main.js; done
yui-compressor --type js ./build/uncomp_main.js > ./build/main.js
