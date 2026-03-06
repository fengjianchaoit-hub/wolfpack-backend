#!/bin/bash
# PostgreSQL 安装与配置脚本
# 在服务器上执行

set -e

echo "=== 安装 PostgreSQL ==="
apt-get update
apt-get install -y postgresql postgresql-contrib

echo "=== 启动 PostgreSQL ==="
systemctl enable postgresql
systemctl start postgresql

echo "=== 创建数据库和用户 ==="
sudo -u postgres psql << EOF
-- 创建数据库
CREATE DATABASE wolfpack WITH ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TEMPLATE template0;

-- 创建用户
CREATE USER wolfpack WITH PASSWORD 'wolfpack123';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE wolfpack TO wolfpack;

-- 允许远程连接（如果需要）
ALTER SYSTEM SET listen_addresses = '*';
EOF

echo "=== 配置访问权限 ==="
cat >> /etc/postgresql/*/main/pg_hba.conf << EOF

# wolfpack应用访问
host    wolfpack    wolfpack    127.0.0.1/32    md5
host    wolfpack    wolfpack    ::1/128         md5
EOF

echo "=== 重启 PostgreSQL ==="
systemctl restart postgresql

echo "=== 验证安装 ==="
sudo -u postgres psql -c "\l" | grep wolfpack

echo "=== 安装完成 ==="
echo "数据库: wolfpack"
echo "用户名: wolfpack"
echo "密码: wolfpack123"
echo "连接: psql -U wolfpack -d wolfpack -h localhost"
