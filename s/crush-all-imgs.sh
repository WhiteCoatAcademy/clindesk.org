#!/bin/bash
#
# I brutally crush and **losslessly** optimize all PNGs and JPGs.

find . -type f -name "*.png" -print0 | xargs -0 optipng -o7 

find . -type f -name "*.jpg" -print0 | xargs -0 jpegoptim -t --strip-all 
