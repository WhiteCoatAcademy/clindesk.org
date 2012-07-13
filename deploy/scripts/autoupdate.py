from flask import Flask, request
import json
import logging
import os
app = Flask(import_name=__name__)

# This autoupdate script should be triggered after a GitHub push.

stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.WARNING)
app.logger.addHandler(stream_handler)

# Random-ish URL triggers a git pull & gunicorn HUP
@app.route("/github-pull-on-commit-M9tmMWz4XI", methods=['POST'])
def github_pull_on_commit():
    # These are the github-provided IPs.
    if request.environ['HTTP_X_REAL_IP'] in ('207.97.227.253', '50.57.128.197', '108.171.174.178'):
        thejson = json.JSONDecoder().decode(request.values['payload'])
        commit_ref = thejson['ref']
        app.logger.warning('Commit ref is: %s' % (commit_ref,))
        if commit_ref.endswith('master'):
            app.logger.warning('Pulling in staging.')
            os.chdir('/home/staging/')
            os.system('sudo -u staging ./sudo-git-update.sh')
            # We can switch back to supervisord-based PID finding later:
            # supervisorctl status clindesk-staging | sed "s/.*[pid ]\([0-9]\+\)\,.*/\\1/"
            # TODO: Move to pkill
            os.system('pgrep -u staging -f "clindesk:app" -o | xargs sudo -u staging kill -HUP')
            os.system('pgrep -u staging -f "wca:app" -o | xargs sudo -u staging kill -HUP')
            return "Pulled in staging."
        else:
            app.logger.warning('Pulling in PROD!')
            os.chdir('/home/prod/')
            os.system('sudo -u prod ./sudo-git-update.sh')
            # We can switch back to supervisord-based PID finding later:
            # supervisorctl status clindesk-staging | sed "s/.*[pid ]\([0-9]\+\)\,.*/\\1/"
            # TODO: Move to pkill
            os.system('pgrep -u prod -f "clindesk:app" -o | xargs sudo -u prod kill -HUP')
            os.system('pgrep -u prod -f "wca:app" -o | xargs sudo -u prod kill -HUP')
            return "Pulled in PROD!"
    return "Access denied."

if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    print("You do NOT want to run this script on your local machine!")
