# Node.js 最新LTS版を使用
FROM node:20-alpine

# 作業ディレクトリ設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# 開発サーバー起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]