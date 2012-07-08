import urlparse
from flask import Flask, redirect, render_template, url_for, request
app = Flask(import_name=__name__)

app.config['STATIC_ROOT'] = 'http://static.clindesk.org/'

# Set up logging in prod.
# TODO: Check this actually works w/ ec2 mail & firewall, etc.
ADMINS = ['semenko+ec2crash@clindesk.org']
if not app.debug:
    import logging
    from logging.handlers import SMTPHandler
    mail_handler = SMTPHandler('aspmx.l.google.com',
                               'ec2-crahes@clindesk.org',
                               ADMINS, 'ClinDesk Prod Failure')
    mail_handler.setLevel(logging.ERROR)
    app.logger.addHandler(mail_handler)

# Create a static() handler and send content to static.clindesk.org
def static(path):
    root = app.config.get('STATIC_ROOT', None)
    if root is None: # fallback on the normal way
        return url_for('static', filename=path)
    return urlparse.urljoin(root, path)

@app.context_processor
def inject_static():
    return dict(static=static)



# The main URL settings go here
@app.route("/")
def welcome():
    return render_template('index.html')




# Random-ish URL triggers a git pull for the staging deployment, only.
@app.route("/github-pull-on-commit-M9tmMWz4XI", methods=['POST'])
def github_pull_on_commit():
    if request.environ['HTTP_X_REAL_IP'] in ('207.97.227.253', '50.57.128.197', '108.171.174.178'):
        import os
        if os.environ['SUPERVISOR_PROCESS_NAME'] == 'clindesk-staging':
            os.system('git reset --hard HEAD; git clean -f -d; git pull')
            # TODO: Change the security permissions to make this less sketchy.
            os.system('supervisorctl restart clindesk-staging')
            return "Pulling."
    return "Access denied."

if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    app.config['STATIC_ROOT'] = None
    app.run(host='0.0.0.0', port=5000, debug=True)
