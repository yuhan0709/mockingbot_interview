#!/bin/sh

. /home/tiger/.nvm/nvm.sh
# nvm install v8.11.1
nvm install v8.11.1
nvm use v8.11.1

PROJ_PATH=`pwd`
OUTPUT_PATH="${PROJ_PATH}/output"

# 如果不删除node_modules scm上的编译会失败
rm -rf node_modules
rm -rf $OUTPUT_PATH

npm install --registry "http://bnpm.byted.org/" -f
npm run build
npm run build-server
chmod +x ./bootstrap.sh

#npm run prestart
mv ./node_modules $OUTPUT_PATH
mv ./settings.py $OUTPUT_PATH
mv ./beta2 $OUTPUT_PATH
cp ./bootstrap.sh $OUTPUT_PATH
cp ./package.json $OUTPUT_PATH
