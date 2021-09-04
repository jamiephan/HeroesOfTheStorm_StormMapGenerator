#!/usr/bin/env sh
nohup /bin/sh -c /usr/bin/supervisord -c /etc/supervisord.conf >/dev/null 2>&1 &
node /app/src/index.js