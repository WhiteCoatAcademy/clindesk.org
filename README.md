# ClinDesk [![Build Status](https://travis-ci.org/WhiteCoatAcademy/clindesk.org.svg?branch=master)](https://travis-ci.org/WhiteCoatAcademy/clindesk.org) [![Dependency Status](https://david-dm.org/WhiteCoatAcademy/clindesk.org/status.svg?theme=shields.io)](https://david-dm.org/WhiteCoatAcademy/clindesk.org) [![Dev Dependency Status](https://david-dm.org/WhiteCoatAcademy/clindesk.org/dev-status.svg?theme=shields.io)](https://david-dm.org/WhiteCoatAcademy/clindesk.org#info=devDependencies)

## Getting started
1. Clone this repo: `git clone git@github.com:WhiteCoatAcademy/clindesk.org.git`
2. `cd clindesk.org`
3. Install required node packages: `npm install`
4. Install the bower dependencies (bootstrap, etc.) `bower install`
5. Build or run the app using: `grunt build` or `grunt serve`

## Seeing Things Live

Once you've seen & tested your changes locally (e.g. at localhost:9000), commit & push your changes.

Then, deploy to staging ( http://STAGING.example.com/ ) via: `grunt staging`

## Deploying to Production

Finally, after you've seen your changes in staging, and they seem to be working, you should push into production!

Production code comes from the "prod" branch of the repository. You need to switch to this branch, copy over your changes, then swith back, and push everything.

1. Make sure you're updated to the latest code: `git pull`
2. Run this: `git checkout prod ; git merge -Xtheirs master ; git push ; git checkout master`
3. Finally, push to prod: `grunt prod`

(This will auto-deploy to PROD.example.com, which is a backend for AWS CloudFront.)

## Copyright

Some shared libraries are available via an Apache License v2.0 (e.g. bootstrap)

All other work is Copyright 2012-2014, ClinDesk, Inc. All rights reserved.
