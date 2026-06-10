set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

default:
    just --list

check:
    npm run check

build:
    npm run build

pack:
    npm run pack:check

ready:
    npm run check
    npm run build
    npm run pack:check

release kind="patch":
    npm version {{kind}}
    git push --follow-tags
