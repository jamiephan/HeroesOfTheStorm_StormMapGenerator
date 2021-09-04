#!/usr/bin/env bash
rm -rf "./public"
pushd client
npm run build --loglevel error
popd
cp -r "./client/build/" "./public"