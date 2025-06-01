#!/bin/sh
echo Updating the .env file with new encryption key...

# Node.js
node ./dist/app/makeComSK.js  # コンパイルされた .js ファイルを実行する
