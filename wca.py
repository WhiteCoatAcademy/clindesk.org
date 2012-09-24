import logging
import os
import re
import urlparse
from flask import Flask, make_response, redirect, render_template, request, url_for
app = Flask(import_name=__name__, static_folder='s')


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
                               'WCA %s Crash' % subject_tag,
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


app.config['FREEZER_DESTINATION'] = 'deploy/wca_frozen/'
    
# Settings based on prod/staging/dev
supervisor_name = os.environ.get('SUPERVISOR_PROCESS_NAME', False)
if supervisor_name == 'wca-prod':
    register_email_logger('Prod', logging.WARNING)
    app.config['STATIC_ROOT'] = 'http://static.clindesk.org/s/'
elif supervisor_name == 'wca-staging':
    register_email_logger('Staging', logging.WARNING)
    app.config['STAGING'] = True
else:
    # We're probably in a local dev instance.
    pass


# Create a static() handler and send content to static.clindesk.org
def static(path):
    root = app.config.get('STATIC_ROOT', None)
    if root is None: # Just use /s/ instead of CDN
        return url_for('static', filename=path)
    return urlparse.urljoin(root, path)

@app.context_processor
def inject_static():
    return dict(static=static)


@app.route("/")
@app.route("/index.html") # TODO: Standardize toplevel url.
def page_index():
    return render_template('teaser.html', logopath=static('whitecoat-logo.png'))


if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    app.run(host='0.0.0.0', port=5000, debug=True)

