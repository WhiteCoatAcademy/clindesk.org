#!/bin/bash
# This script updates a git repo, brutally.

cd clindesk/
git reset --hard HEAD
git clean -f -d
git pull
