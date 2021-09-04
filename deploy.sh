#!/usr/bin/env bash
./build.sh
heroku container:push web --app stormmap
heroku container:release web --app stormmap
heroku open --app stormmap