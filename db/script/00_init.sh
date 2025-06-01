#!/bin/bash
set -e

echo "Start custom SQL execution with --force..."

# 1. 環境変数で接続情報を取得（MySQL公式イメージから注入される）
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-}
MYSQL_DATABASE=${MYSQL_DATABASE:-}

# 2. SQLファイルを順番に実行（--force付き）
for file in /docker-entrypoint-initdb.d/sql/*.sql; do
  echo "Running $file..."
  mysql --user="$MYSQL_USER" --password="$MYSQL_PASSWORD" --database="$MYSQL_DATABASE" --force < "$file"
done

echo "All SQL scripts executed (errors skipped where applicable)."