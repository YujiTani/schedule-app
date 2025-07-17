# Docker開発用Makefile

.PHONY: help build up down logs clean

# ヘルプ
help:
	@echo "利用可能なコマンド:"
	@echo "  make build  - Dockerイメージをビルド"
	@echo "  make up     - 開発環境を起動"
	@echo "  make down   - 開発環境を停止"
	@echo "  make logs   - ログを表示"
	@echo "  make clean  - コンテナとボリュームを削除"

# Dockerイメージビルド
build:
	docker-compose build

# 開発環境起動
up:
	docker-compose up -d

# 開発環境停止
down:
	docker-compose down

# ログ表示
logs:
	docker-compose logs -f

# クリーンアップ
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f