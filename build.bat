@echo off
rm -rf "./public"
pushd client
@REM Prevent npm exiting the batch script
cmd /c npm run build --loglevel error
popd
cp -r "./client/build/" "./public"