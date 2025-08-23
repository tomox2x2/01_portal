# Node.jsイメージを使用
FROM node:18

# 作業ディレクトリの作成
WORKDIR /app

# package.json、yarn.lock をコピー
COPY package.json yarn.lock ./

# 依存関係のインストール
RUN yarn install

# ソースコードをコピー
COPY . .

# 環境変数を設定（ビルドステージで注入）
ENV ENC_ID=S0001
ENV ENC_KEY=qgeUeomTk9aJVkORdcfGGOf3245bn0VP
ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_USER=portalUser
ENV DB_PASS=0kb09jO_0506
ENV DB_NAME=portal
ENV FRONTPASS=http://localhost:3002
ENV PORT=3000
ENV NODE_ENV=production


# TypeScriptのビルド
RUN yarn build

# ポートを公開
EXPOSE 3301

# アプリケーションを実行
CMD ["yarn", "start"]
