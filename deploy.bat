@echo off
call build.bat
cmd /c heroku container:push web --app stormmap
cmd /c heroku container:release web --app stormmap
heroku open --app stormmap