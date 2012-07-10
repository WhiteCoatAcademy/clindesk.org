# ClinDesk & White Coat Academy

This is the core repository, which holds all components necessary for both sites.

Be sure to use the staging branch!
----------------------------------
1. `git checkout staging`
2. Do some work.
3. `git add YOURFILES` and `git commit` then `git push`

When you're ready to push to master (e.g. your changes didn't break the main site), do:
1. `git checkout master`
2. `git merge -Xtheirs staging`
3. `git push`
4. And be sure to get back on staging! `git checkout staging`

I might change this, so that master is the "staging" site, and a "prod" branch is live.


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

