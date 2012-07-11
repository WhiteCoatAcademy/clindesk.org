# ClinDesk & White Coat Academy

This is the core repository, which holds all components necessary for both sites.

## Overview

The magic happens in:

* clindesk.py
* wca.py

They run on [Flask](http://flask.pocoo.org/).

If you want to run them on your machine, try `sudo pip install flask` then run `python clindesk.py`. Then visit http://localhost:5000/.

## Directories

* /s/
  * Static files. Served by nginx.
* /templates/
  * [Jinja2](jinja.pocoo.org) templates for Flask.
* /deploy/
  * Deploy scripts for EC2/AWS magic. Don't do things here.

## Pushing to Master
When you're ready to push to production (e.g. push your changes to the main site, not just staging):
1. `git checkout prod`
2. `git merge -Xtheirs master`
3. `git push`
4. And be sure to get back on the master branch with `git checkout master`


