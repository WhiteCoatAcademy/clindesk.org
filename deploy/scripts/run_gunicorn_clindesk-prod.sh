#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn-clindesk-prod/clindesk-prod.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=clindesk-prod
GROUP=clindesk-prod
WORKER_CLASS="gevent"
cd /home/clindesk-prod/
source bin/activate
test -d $LOGDIR || mkdir -p $LOGDIR
chown $USER:$GROUP $LOGDIR
cd clindesk/
exec ../bin/gunicorn --workers $NUM_WORKERS --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP --log-level=debug \
    --log-file=$LOGFILE clindesk:app 2>>$LOGFILE
