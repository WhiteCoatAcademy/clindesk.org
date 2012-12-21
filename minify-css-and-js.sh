#!/bin/bash
# Minify script to shrink CSS and JS.

# Concatenate and compress the JS files.
echo "CD: Minifying Shared Javascript"
java -jar yuicompressor-2.4.7.jar --type js -v -o 'clindesk/s/js/shared.min.js' clindesk/s/js/shared.js
echo ""

echo "CD: Minifying Shared CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o 'clindesk/s/css/shared.min.css' clindesk/s/css/shared.css
echo ""

### SAME FOR WCA
echo "WCA: Minifying Shared Javascript"
java -jar yuicompressor-2.4.7.jar --type js -v -o 'whitecoatacademy/s/js/shared.min.js' whitecoatacademy/s/js/shared.js
echo ""

echo "WCA: Minifying Shared CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o 'whitecoatacademy/s/css/shared.min.css' whitecoatacademy/s/css/shared.css
echo ""
