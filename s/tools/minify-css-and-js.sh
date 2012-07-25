#!/bin/bash
# Minify script to shrink CSS and JS.

# Concatenate JS files into single files
cat ../js/src/shared.js > ../js/cd.js
cat ../js/src/shared.js > ../js/wca.js
echo "" >> ../js/cd.js
echo "" >> ../js/wca.js
cat ../js/src/cd.js >> ../js/cd.js
cat ../js/src/wca.js >> ../js/wca.js

# Concatenate and compress the JS files.
echo "ClinDesk JS"
java -jar yuicompressor-2.4.7.jar --type js -v -o '../js/min.cd.js' ../js/cd.js
echo ""

echo "WCA JS"
java -jar yuicompressor-2.4.7.jar --type js -v -o '../js/min.wca.js' ../js/wca.js


