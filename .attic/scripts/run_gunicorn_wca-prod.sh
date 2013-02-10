#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/wca-prod.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=prod
GROUP=prod
WORKER_CLASS="gevent"
BIND="127.0.0.1:8002"
cd /home/prod/clindesk/
exec gunicorn --bind $BIND --workers $NUM_WORKERS --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP \
    --log-file=$LOGFILE wca:app 2>>$LOGFILE
