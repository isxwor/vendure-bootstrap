#!/usr/bin/env sh

echo ">> Cleaning old build files"
rm -rf dist

set -e
echo ">> Compiling project"
bunx tsc

echo '>> Compiling react dashboard'
bunx vite build
set +e

echo '>> Copying files'
mkdir -p dist/static/email

cp -r static/email/templates dist/static/email/

