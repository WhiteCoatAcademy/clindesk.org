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
cat ../css/bootstrap.css > ../css/_core.css
echo "" >> ../css/_core.css
cat ../css/bootstrap-responsive.css >> ../css/_core.css
echo "" >> ../css/_core.css
cat ../css/menu_layout.css >> ../css/_core.css
echo "" >> ../css/_core.css
cat ../css/menu_skin.css >> ../css/_core.css
echo "" >> ../css/_core.css
cat ../css/styles.css >> ../css/_core.css
echo "" >> ../css/_core.css
cat ../css/skin_blue.css >> ../css/_core.css

cat ../css/_core.css > ../css/cd.css
cat ../css/_core.css > ../css/wca.css

echo "ClinDesk CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o '../css/min.cd.css' ../css/cd.css

echo "WCA CSS"
java -jar yuicompressor-2.4.7.jar --type css -v -o '../css/min.wca.css' ../css/wca.css

