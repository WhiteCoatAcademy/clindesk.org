#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/autoupdate.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=1
USER=autoupdate
GROUP=autoupdate
WORKER_CLASS="gevent"
BIND="127.0.0.1:5000"
cd /home/autoupdate/
exec gunicorn --bind $BIND --workers $NUM_WORKERS --debug --worker-class $WORKER_CLASS \
    --user=$USER --group=$GROUP --log-level=debug \
    --log-file=$LOGFILE autoupdate:app 2>>$LOGFILE
