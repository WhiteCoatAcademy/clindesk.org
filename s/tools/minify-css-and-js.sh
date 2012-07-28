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


#### Let's do the same for CSS! 
# Concatenate CSS into single files
# (Do newlines matter?)
mkdir ../css/.temp
cat ../css/_bootstrap.css > ../css/.temp/_shared.css
echo "" >> ../css/.temp/_shared.css
cat ../css/_bootstrap-responsive.css >> ../css/.temp/_shared.css
echo "" >> ../css/.temp/_shared.css
cat ../css/_menu_layout.css >> ../css/.temp/_shared.css
echo "" >> ../css/.temp/_shared.css
cat ../css/_menu_skin.css >> ../css/.temp/_shared.css
echo "" >> ../css/.temp/_shared.css
cat ../css/_styles.css >> ../css/.temp/_shared.css
echo "" >> ../css/.temp/_shared.css
cat ../css/_skin_blue.css >> ../css/.temp/_shared.css

cat ../css/.temp/_shared.css > ../css/.temp/cd.css
cat ../css/.temp/_shared.css > ../css/.temp/wca.css

echo "ClinDesk CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o '../css/min.cd.css' ../css/.temp/cd.css

echo "WCA CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o '../css/min.wca.css' ../css/.temp/wca.css

