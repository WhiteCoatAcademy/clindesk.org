#!/bin/bash
#
# I brutally crush and optimize all PNG files.

find . -type f -name "*.png" -print0 | xargs -0 optipng -o7 
