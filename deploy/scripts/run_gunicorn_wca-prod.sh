#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/wca-prod.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=clindesk-prod
GROUP=clindesk-prod
WORKER_CLASS="gevent"
BIND="127.0.0.1:8002"
cd /home/clindesk-prod/clindesk/
exec gunicorn --bind $BIND --workers $NUM_WORKERS --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP --log-level=debug \
    --log-file=$LOGFILE wca:app 2>>$LOGFILE
