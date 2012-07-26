import jinja2
import logging
import os
import re
import urlparse
from flask import Flask, make_response, redirect, render_template, request, url_for
app = Flask(import_name=__name__, static_folder='s')

##########
# Internal setup functions & error logging.
#
# NOTE: You probably want to skip down to the section called "Blocks for URL Control"
#    where you'll see things like @app.route()
##########

def register_email_logger(subject_tag, log_level):
    """
    This sends e-mails to ec2-crashes when something fails in Prod or Staging.

    It took me a while to figure this out:
     ** The log hangler is basically *ignored* if debug=True **
    """
    ADMINS = ['ec2-prodlogs@clindesk.org']
    from logging import Formatter
    from logging.handlers import SMTPHandler
    mail_handler = SMTPHandler('email-smtp.us-east-1.amazonaws.com',
                               'ec2-crashes@clindesk.org',
                               ADMINS,
                               'ClinDesk %s Crash' % subject_tag,
                               # Only sorta-secret. We haven't requested SES prod bits, so we can only
                               # send to domains we own & addresses we verify. Little abuse potential. --semenko
                               ('AKIAIEBTTF4MLQZ3CPAQ', 'AsD8aexgu9TUcIRB1bHmfG/zF2YMyv3Bze5LTpQzw6p1'),
                               secure=())
    mail_handler.setFormatter(Formatter('''
Message type:       %(levelname)s
Location:           %(pathname)s:%(lineno)d
Module:             %(module)s
Function:           %(funcName)s
Time:               %(asctime)s

Message:

%(message)s
'''))
    mail_handler.setLevel(log_level)
    app.logger.addHandler(mail_handler)


###
# Configure our environment depending on if we're in prod vs staging vs local machine.
###
supervisor_name = os.environ.get('SUPERVISOR_PROCESS_NAME', False)
app.config['ON_EC2'] = False
app.config['STAGING'] = False

if supervisor_name:
    # supervisor_name is set by supervisord on our EC2 instances
    app.config['ON_EC2'] = True
    if supervisor_name == 'clindesk-prod':
        register_email_logger('Prod', logging.WARNING)
        app.config['STATIC_ROOT'] = 'http://static.clindesk.org/s/'
    elif supervisor_name == 'clindesk-staging':
        register_email_logger('Staging', logging.WARNING)
        app.config['STAGING'] = True
else:
    # We're not running under supervisord, so we're on a local machine.
    # e.g. someone just ran `python clindesk.py`
    pass


###
# Create a static() handler for templates.
# This serves static content from either:
#   /s/ --- If this is on staging, or a local instance
# or
#   static.clindesk.org --- For production.
# 
# static.clindesk.org is an AWS CloudFront endpoint that caches our content via the Amazon CDN.
###
def static(path):
    root = app.config.get('STATIC_ROOT', None)
    if root is None: # Just use /s/ instead of CDN
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

@app.route("/index.html") # TODO: Standardize toplevel url? Move to nginx?
def redirect_index():
    return redirect('/', code=302)

@app.route("/")
def page_index():
    if app.config['STAGING'] or not app.config['ON_EC2']:
        return render_template('index.html')
    return render_template('teaser.html', logopath=static('clindesk-logo.png'))

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

#@app.route("/conditions/<level1>/<level2>/")
#def page_conditions_level2(level1, level2):
#    return "%s %s" % (level1, level2)


#####
# *** Special Topics Pages (Diagnostics & Treatments)
#####

@app.route("/special-topics.html")
def page_special_topics():
    return render_template('special-topics.html')

@app.route("/diagnostics/")
def page_diagnostics():
    return render_template('diagnostics/index.html')

@app.route("/treatments/")
def page_treatments():
    return render_template('treatments/index.html')


######
# *** Odd URLs and support functions
######

@app.route("/setcookie", methods=['POST'])
def clicked_disclaimer():
    """ Give the user a cookie if they dismiss the disclaimer. """
    max_age = 60*60*24 # This is 24 hours
    if app.config['STAGING'] or not app.config['ON_EC2']:
        max_age = 60*10 # For staging, set a 10 minute TTL, so we don't forget the disclaimer.

    resp = make_response()
    resp.set_cookie(key='disclaimer',
                    value='MedEd_Should_Be_Open',
                    max_age=max_age,
                    expires=None,
                    path='/',
                    domain=None,
                    secure=None, # TODO: Switch to all SSL site? 
                    httponly=False, # TODO: Make cookie processing server-side?
                    )
    return resp


@app.errorhandler(404)
def page_not_found(error):
    """ Return our generic error page. """
    return render_template('errors/404.html'), 404


# Strip non-alnum characters.
pattern = re.compile('[^a-z0-9-]')
def is_safe_string(input):
    subbed_string = pattern.sub('', input)
    if (input == subbed_string):
        return True
    return False



if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    app.run(host='0.0.0.0', port=5000, debug=True)

