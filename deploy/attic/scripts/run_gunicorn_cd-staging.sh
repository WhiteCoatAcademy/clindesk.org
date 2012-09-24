#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/clindesk-staging.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=1
USER=staging
GROUP=staging
WORKER_CLASS="gevent"
BIND="127.0.0.1:8001"
cd /home/staging/clindesk/
exec gunicorn --bind $BIND --workers $NUM_WORKERS --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP --log-level=info \
    --log-file=$LOGFILE clindesk:app 2>>$LOGFILE
