from flask import Flask, request
import json
app = Flask(import_name=__name__)

# Random-ish URL triggers a git pull & gunicorn HUP
@app.route("/github-pull-on-commit-M9tmMWz4XI", methods=['POST'])
def github_pull_on_commit():
    # These are the github-provided IPs.
    if request.environ['HTTP_X_REAL_IP'] in ('207.97.227.253', '50.57.128.197', '108.171.174.178'):
        thejson = json.JSONDecoder().decode(request.values['payload'])
        commit_ref = thejson['ref']
        app.logger.warning('Commit ref is: %s' % (commit_ref,))
        # Not sure how this is parsed. Does this change to prod on prod pushes? We'll see.
        if commit_ref.endswith('master'):
            # We're got a staging push, probably. Maybe.
            app.logger.warning('Pulling in staging.')
            os.system('cd /home/clindesk-staging/')
            os.system('sudo -u clindesk-staging ./sudo-get-update.sh')
            os.system('supervisorctl status clindesk-staging | sed "s/.*[pid ]\([0-9]\+\)\,.*/\\1/" | xargs kill -HUP')
            return "Pulling."
        else:
            app.logger.warning('Pulling in PROD.')
            return "Not pulling. Prod."
    return "Access denied."

if __name__ == "__main__":
    # This is fine for prod purposes:
    #   The prod servers run via gunicorn & gevent, which won't invoke __main__
    print("You do NOT want to run this script on your local machine!")
