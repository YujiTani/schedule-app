-- データベース初期化スクリプト
\i /docker-entrypoint-initdb.d/schema.sql

-- データベース初期化完了確認
SELECT 'Database initialized successfully' as status;