#!/bin/bash

. /usr/local/nvm/nvm.sh

# scm上的版本是8.1.3, tce上是8.2.1/8.1.4
# nvm install v8.11.1
nvm use stable

# 这个地方需要等待nvm切换版本完成
#pm2 start --no-daemon apps.json
#node ./server/index.js
npm run start
