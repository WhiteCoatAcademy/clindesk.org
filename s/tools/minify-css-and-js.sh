#!/bin/bash
# Minify script to shrink CSS and JS.

# Concatenate and compress the JS files.
echo "Minifying Shared Javascript"
java -jar yuicompressor-2.4.7.jar --type js -v -o '../js/shared.min.js' ../js/shared.js
echo ""

echo "Minifying Shared CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o '../css/shared.min.css' ../css/shared.css
