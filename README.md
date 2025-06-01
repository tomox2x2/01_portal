# Portal App

## 概要
React + Node.js + TypeScript で作成したWebアプリです。
日記と 定期的な Todo チケットの作成、管理を行うアプリになっていて、
ログインによるユーザ単位の情報遮蔽を可能にしています。

## 技術スタック
- フロントエンド: React (Vite使用)
- バックエンド: Node.js + Express
- 言語: TypeScript
- データベース: MySQL
- その他: Axios, JWT など

## ディレクトリ構成
├─backend
│  ├─app
│  └─src
│      ├─helper
│      └─router
└─frontend
    └─src
        ├─api
        ├─assets
        ├─comp
        │  ├─diary
        │  ├─login
        │  ├─todo
        │  └─userChg
        ├─css
        ├─image
        ├─routes
        ├─state
        └─yup

## 必要環境
- Node.js v20 以上
- Raact v18 以上
- npm または yarn
- MySQL v8 以上

## インストール手順
1. frontend インストール
cd frontend
npm install

2. backend インストール
-- # バックエンド
cd ../backend
npm install
-- makeComSK.js をバックグラント側のコンテナ上で実行（引数なし ※）
-- mailerSetting.js をバックグラント側のコンテナ上で実行（引数アリ ※）
　　第１引数：smtpサーバアドレス / URL
　　第２引数：smtpサーバ ポートNo
　　第３引数：TLSの仕様有無。使用する場合はtrue
　　第４引数：メールアドレス
　　第５引数：アプリパスワード（アプリケーションパスワード）

　※：実行コマンド
　　A.bash 、sh にログインする:
　　　　docker exec -it <コンテナ名> [ bash / sh ]）
　　B.Docker のベース環境から直接実行:
　　　　docker exec -it <コンテナ名> node /app/dist/app/(js ファイル名)）

## test環境での起動手順
--bash
# フロントエンド
cd frontend
yarn dev 

# バックエンド
cd ../backend
yarn dev

## 環境変数
--bash
# フロントエンド
cd frontend
cp .env.example  .env

# バックエンド
cd ../backend
cp .env.example  .env

## ライセンス
このプロジェクトは MIT ライセンスのもとで公開されています。

## 作者
名前  :tomomsx2x2
GitHib:https://github.com/tomox2x2/01_portal.git
mail  :tomomsx2x2@gmail.com
