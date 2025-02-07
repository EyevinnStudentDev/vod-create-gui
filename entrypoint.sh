#!/bin/sh

BIND_PORT="${PORT:-8080}"
echo "server { listen $BIND_PORT; server_name _; root /usr/share/nginx/html;  location / { try_files \$uri /index.html; } }" > /etc/nginx/conf.d/default.conf

exec "$@"