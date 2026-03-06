#!/usr/bin/env python3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

DATABASE = 'wolfpack.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# 静态文件首页
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# API路由
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status")
        task_stats = {row['status']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute("SELECT * FROM agents")
        agents = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'agent_stats': {'online': len([a for a in agents if a['status']=='online']), 'busy': len([a for a in agents if a['status']=='busy'])},
                'agents': agents,
                'task_stats': task_stats,
                'update_time': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'time': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
