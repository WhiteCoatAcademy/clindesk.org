# White Coat Academy

## Getting started
1. Clone this repo: `git clone git@github.com:WhiteCoatAcademy/clindesk.org.git`
2. `cd clindesk.org`
3. Install required node packages: `npm install`
4. Install the bower dependencies (bootstrap, etc.) `bower install`
5. Build or run the app using: `grunt build` or `grunt serve`


## Directories
* /s/
  * Static files. Usually loaded via CloudFront
* /templates/
  * [Jinja2](http://jinja.pocoo.org/) templates for Flask.

## Seeing Things Live

Once you've seen & tested your changes locally (e.g. at localhost:500X), commit your changes and push.

This will auto-push changes to AWS for S3 and CloudFront, and your changes will appear at http://STAGING.example.com/

## Pushing to Production

Finally, after you've seen your changes in staging, and they seem to be working, you should push into production!

Production code comes from the "prod" branch of the repository. You need to switch to this branch, copy over your changes, then swith back, and push everything.

1. Make sure you're updated to the latest code: `git pull`
2. Run this: `git checkout prod ; git merge -Xtheirs master ; git push ; git checkout master`

(This will auto-deploy to PROD.example.com, which is a backend for AWS CloudFront.)

## Copyright

Some shared libraries are available via an Apache License v2.0 (e.g. bootstrap)

All other work is Copyright 2012-2014, ClinDesk, Inc. All rights reserved.
