#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/clindesk-prod.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=prod
GROUP=prod
WORKER_CLASS="gevent"
BIND="127.0.0.1:8000"
cd /home/prod/clindesk/
exec gunicorn --bind $BIND --workers $NUM_WORKERS --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP --log-level=debug \
    --log-file=$LOGFILE clindesk:app 2>>$LOGFILE
