#!/usr/bin/env sh

# Fix gcloud keyboard 
mv /usr/share/X11/xkb/symbols/inet /usr/share/X11/xkb/symbols/inet.backup

# Start
nohup /bin/sh -c /usr/bin/supervisord -c /etc/supervisord.conf >/dev/null 2>&1 &
node /app/src/index.js