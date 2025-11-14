set -e

echo ">> Cleaning old build files"
rm -rf dist

echo ">> Compiling project"
npx tsc

echo '>> Compiling react dashboard'
npx vite build

echo '>> Copying files'
mkdir -p dist/static/email

set +e

cp -r static/email/templates dist/static/email/

set -e
