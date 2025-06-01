@echo off
echo Updating the .env file with new encryption key...

rem Node.js
node ./dist/app/makeComSK.js  # コンパイルされた .js ファイルを実行する
