# ベースイメージとしてNode.jsを使用
FROM node:18 AS build

# 作業ディレクトリの設定
WORKDIR /app

# package.json と yarn.lock のみをコピー
COPY package.json yarn.lock ./

# 依存関係のインストール
RUN yarn install

# プロジェクトのソースコードをコピー
COPY . .

# Vite 用の環境変数を設定（ビルドステージで注入）
ENV VITE_API_URL=http://localhost:3310
ENV VITE_TIMEOUT=7000
ENV NODE_ENV=production

# アプリケーションのビルド
RUN yarn build

# Nginxをベースにした公開ステージ
FROM nginx:stable-alpine

# ビルドしたファイルをNginxのデフォルト公開ディレクトリにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Nginxのポートを公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
