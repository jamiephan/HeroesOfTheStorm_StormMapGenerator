#!/usr/bin/env bash
./build.sh
docker build . -t stormmap
docker run -it --rm -p 8080:8080 stormmap