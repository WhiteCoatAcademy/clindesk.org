#!/usr/bin/env python

import jinja2
import logging
import os
import re
import subprocess
import urlparse
from flask import Flask, make_response, redirect, render_template, send_from_directory, url_for
app = Flask(import_name=__name__, static_folder='s')


###
# Create a static() handler for templates.
# This serves static content from either:
#   /s/ --- If this is on staging, or a local instance
# or
#   static.clindesk.org --- For production.
#
# static.clindesk.org is an AWS CloudFront endpoint.
###
def static(path):
    root = app.config.get('STATIC_ROOT', None)
    if root is None:  # Just use /s/ instead of CDN
        return url_for('static', filename=path)
    return urlparse.urljoin(root, path)


@app.context_processor
def inject_static():
    return dict(static=static)


#################################
# Blocks for URL Control
#################################

######
# *** Static-ish Pages
######

@app.route("/index.html")  # TODO: Standardize toplevel url? Move to nginx?
def redirect_index():
    return redirect('/', code=302)


@app.route("/")
def page_index():
    return render_template('index.html')


# Donate
@app.route("/donate.html")
def page_donate():
    return render_template('donate.html')


# Help & FAQ
@app.route("/help.html")
def page_help():
    return render_template('help.html')


# About Us
@app.route("/about.html")
def page_about():
    return render_template('about.html')


# Search
@app.route("/search.html")
def search_results():
    return render_template('search.html')

######
# *** Condition Pages
######


@app.route("/conditions/")
def page_conditions_index():
    return render_template('conditions/index.html')


@app.route("/conditions/<level1>/")
def page_conditions_toplevel(level1):
    # TODO: Does Flask provide a similar function?
    # I see safe_join ...

    # TODO: This 404 logic sucks. Fix it.
    if (is_safe_string(level1)):
        try:
            return render_template('conditions/%s/index.html' % (level1,))
        except jinja2.exceptions.TemplateNotFound:
            return render_template('errors/404.html'), 404
    else:
        return render_template('errors/404.html'), 404


@app.route("/conditions/<level1>/<level2>.html")
def page_conditions_level2(level1, level2):
    if (is_safe_string(level1) and is_safe_string(level2)):
        try:
            return render_template('conditions/%s/%s.html' % (level1, level2))
        except jinja2.exceptions.TemplateNotFound:
            return render_template('errors/404.html'), 404
    else:
        return render_template('errors/404.html'), 404




#####
# *** Special Topics Pages (Diagnostics & Treatments)
#####

#@app.route("/special-topics.html")
#def page_special_topics():
#    return render_template('special-topics.html')


#@app.route("/diagnostics/")
#def page_diagnostics():
#    return render_template('diagnostics/index.html')


#@app.route("/treatments/")
#def page_treatments():
#    return render_template('treatments/index.html')


######
# *** Odd URLs and support functions
######

# Return favicon from the root path
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 's'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Return favicon from the root path
@app.route('/robots.txt')
def robots():
    robot_path = 'robots.staging.txt'
    if app.config.get('prod', False):
        robot_path = 'robots.prod.txt'
    return send_from_directory(os.path.join(app.root_path, 's'),
                               robot_path, mimetype='text/plain')

# This doesn't really do anything. It renders error.html for Flask.
# error.html is a special S3 endpoint custom error page.
@app.route("/error.html")
def error_handler_for_flask():
    return render_template('errors/404.html')

# A more generic handler, only for live Flask deployments.
@app.errorhandler(404)
def page_not_found(error):
    """ Return our generic error page. """
    return render_template('errors/404.html'), 404


# Strip non-alnum characters.
pattern = re.compile('[^a-z0-9-]')
def is_safe_string(unsafe_string):
    subbed_string = pattern.sub('', unsafe_string)
    return unsafe_string == subbed_string


if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # Used for logic in some templates
    app.config['apphost'] = "clindesk"

    # Man, I kinda' miss the days when we were on EC2 instead of just static.
    # We're probably being Frozen. Cool.
    app.config['FREEZER_DESTINATION'] = '../deploy/cd_frozen/'

    # Find the current git branch:
    #  master -> staging
    #  prod -> prod
    current_branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).strip()
    if current_branch == "master":
        pass
    elif current_branch == "prod":
        app.config['prod'] = True
        # We don't really support SSL given Cloudfront, but ...
        # app.config['STATIC_ROOT'] = '//static.clindesk.org/s/'
        app.config['STATIC_ROOT'] = '//d10ka1woaw849g.cloudfront.net/s/'
    else:
        raise Exception('Unknown branch! Cannot deploy.')
