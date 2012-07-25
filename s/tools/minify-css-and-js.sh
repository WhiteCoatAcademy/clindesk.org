#!/bin/bash
# 


# Concatenate JS files into single files
cat ../js/src/shared.js > ../js/min.cd.js
cat ../js/src/shared.js > ../js/min.wca.js
echo "" >> ../js/min.cd.js
echo "" >> ../js/min.wca.js
cat ../js/src/cd.js >> ../js/min.cd.js
cat ../js/src/wca.js >> ../js/min.wca.js

# yui-compressor --nomunge