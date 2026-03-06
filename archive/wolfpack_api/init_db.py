#!/usr/bin/env python3
"""
数据库初始化脚本 - 创建SQLite数据库和表结构
"""

import sqlite3
import os

DATABASE = 'wolfpack.db'

def init_db():
    """初始化数据库"""
    # 如果数据库已存在，先删除
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
        print(f"已删除旧数据库: {DATABASE}")
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # 创建任务表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            assigned_to TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建代理表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'offline',
            last_seen TIMESTAMP,
            capabilities TEXT,
            current_task INTEGER,
            FOREIGN KEY (current_task) REFERENCES tasks(id)
        )
    ''')
    
    # 创建状态日志表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS status_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 插入一些示例数据
    cursor.executemany('''
        INSERT INTO tasks (title, description, status, priority, assigned_to)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        ('收集目标情报', '使用OSINT工具收集目标信息', 'pending', 'high', '狼牙-侦察'),
        ('扫描开放端口', '对目标进行端口扫描', 'in_progress', 'high', '狼牙-扫描'),
        ('漏洞检测', '检查已知漏洞', 'pending', 'medium', '狼牙-检测'),
        ('生成报告', '整理扫描结果生成报告', 'pending', 'low', None),
    ])
    
    cursor.executemany('''
        INSERT INTO agents (name, status, capabilities)
        VALUES (?, ?, ?)
    ''', [
        ('狼牙-侦察', 'online', 'osint,reconnaissance'),
        ('狼牙-扫描', 'busy', 'port_scan,vuln_scan'),
        ('狼牙-检测', 'offline', 'exploit_detection'),
        ('狼牙-报告', 'online', 'report_generation'),
    ])
    
    conn.commit()
    conn.close()
    print(f"✅ 数据库初始化成功: {DATABASE}")
    print("- 创建了 tasks 表")
    print("- 创建了 agents 表")
    print("- 创建了 status_logs 表")
    print("- 插入了示例数据")

if __name__ == '__main__':
    init_db()
