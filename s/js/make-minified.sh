#!/bin/bash
# 
# Minify JS files into single files.

cat src/shared.js > min.cd.js
cat src/shared.js > min.wca.js
echo "" >> min.cd.js
echo "" >> min.wca.js
cat src/cd.js >> min.cd.js
cat src/wca.js >> min.wca.js

# yui-compressor --nomunge