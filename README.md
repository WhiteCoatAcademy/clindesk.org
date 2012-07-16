# ClinDesk & White Coat Academy

This is the core repository, which holds all components necessary for both sites.

## Overview

The magic happens in:

* clindesk.py
* wca.py

They run on [Flask](http://flask.pocoo.org/).

If you want to run them on your machine, try:

 `sudo pip install flask` then `python clindesk.py`

A local instance should then be running at: http://localhost:5000/

## Directories

* /s/
  * Static files. Served by nginx.
* /templates/
  * [Jinja2](http://jinja.pocoo.org/) templates for Flask.
* /deploy/
  * Deploy scripts for EC2/AWS magic. Don't do things here.

## Seeing Things Live

Once you've seen & tested your changes locally (e.g. at localhost:5000), commit your changes and push.

This will auto-HUP our [gunicorn](http://gunicorn.org/) instances on EC2, and your changes will appear at http://staging.clindesk.org/

## Pushing to Production
Finally, after you've seen your changes in staging, and they seem to be working, you should push into production!

Production code comes from the "prod" branch of the repository. You need to switch to this branch, copy over your changes, then swith back, and push everything.

1. Make sure you're updated to the latest code: `git pull`
2. Run this: `git checkout prod ; git merge -Xtheirs master ; git checkout master ; git push`


