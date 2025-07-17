# 予約管理アプリ

Googleカレンダー風UIを持つシンプルな予約管理アプリケーション

## 技術スタック

- **フロントエンド**: React (TypeScript) + TailwindCSS + Vite
- **バックエンド**: Node.js + Hono + TypeScript
- **データベース**: PostgreSQL
- **外部API**: Google Calendar API
- **メール**: Gmail SMTP

## プロジェクト構成

```
schedule-app/
├── frontend/          # React アプリケーション
├── backend/           # Hono API サーバー
├── database/          # PostgreSQL設定・マイグレーション
└── docs/             # ドキュメント
```

## セットアップ手順

### Docker環境（推奨）

#### 1. Docker環境起動
```bash
# 全サービス起動
docker-compose up -d

# または Makefileを使用
make up
```

#### 2. アクセス先
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000
- **データベース管理**: http://localhost:8080 (Adminer)
- **PostgreSQL**: localhost:5432

#### 3. 開発用コマンド
```bash
# ログ確認
docker-compose logs -f
# または
make logs

# 環境停止
docker-compose down
# または
make down

# 完全クリーンアップ
make clean
```

### ローカル環境

#### 1. 環境変数設定
```bash
# フロントエンド
cp frontend/.env.sample frontend/.env
# バックエンド  
cp backend/.env.sample backend/.env
```

#### 2. 依存関係インストール
```bash
# フロントエンド
cd frontend && npm install

# バックエンド
cd backend && npm install
```

#### 3. データベースセットアップ
```bash
# PostgreSQLを起動後
cd database
# マイグレーション実行
```

#### 4. 開発サーバー起動
```bash
# フロントエンド（ポート3000）
cd frontend && npm run dev

# バックエンド（ポート8000）
cd backend && npm run dev
```

## 主要機能

- Googleカレンダー風UI
- 1時間単位の予約システム
- 営業時間設定（曜日ごと）
- Google Calendar連携
- メール通知機能
- キャンセル管理

## 開発者向け情報

詳細な開発ルールは `CLAUDE.md` を参照してください。