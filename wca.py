#!/usr/bin/env python

import logging
import os
import re
import subprocess
import urlparse
from flask import Flask, make_response, redirect, render_template, request, url_for
app = Flask(import_name=__name__, static_folder='s')


# Create a static() handler and send content to static.clindesk.org
def static(path):
    root = app.config.get('STATIC_ROOT', None)
    if root is None:  # Just use /s/ instead of CDN
        return url_for('static', filename=path)
    return urlparse.urljoin(root, path)


@app.context_processor
def inject_static():
    return dict(static=static)


@app.route("/")
@app.route("/index.html")  # TODO: Standardize toplevel url.
def page_index():
    return render_template('teaser.html', logopath=static('whitecoat-logo.png'))


if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    app.run(host='0.0.0.0', port=5001, debug=True)
else:
    # Used for logic in some templates
    app.config['apphost'] = "whitecoatacademy"

    # Man, I kinda' miss the days when we were on EC2 instead of just static.
    # We're probably being Frozen. Cool.
    app.config['FREEZER_DESTINATION'] = 'deploy/wca_frozen/'

    # Find the current git branch:
    #  master -> staging
    #  prod -> prod
    current_branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).strip()
    if current_branch == "master":
        pass
    elif current_branch == "prod":
        app.config['prod'] = True
        app.config['STATIC_ROOT'] = 'http://static.clindesk.org/s/'
    else:
        raise Exception('Unknown branch! Cannot deploy.')
