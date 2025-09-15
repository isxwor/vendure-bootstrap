set -e

echo ">> Cleaning old build files"
rm -rf dist

echo ">> Compiling project"
npx tsc

echo '>> Compiling react dashboard'
npx vite build

echo '>> Compiling legacy admin ui [Angular]'
ts-node src/custom-admin-ui/compile-admin-ui.ts

echo '>> Copying files'
mkdir -p dist/src/custom-admin-ui/admin-ui dist/static/email

set +e

cp -r src/custom-admin-ui/admin-ui/dist dist/src/custom-admin-ui/admin-ui/dist
cp -r static/email/templates dist/static/email/

set -e
