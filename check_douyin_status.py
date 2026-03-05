#!/usr/bin/env python3
"""
检查抖音直播间状态
"""

import requests
import json
from datetime import datetime

ROOM_ID = "444502128478"

# 测试多种方式获取数据
def test_room_api():
    """测试房间 API"""
    url = "https://live.douyin.com/webcast/room/web/enter/"
    params = {
        'aid': '6383',
        'app_name': 'douyin_web',
        'live_id': '1',
        'device_platform': 'web',
        'enter_from': 'web_live',
        'room_id': ROOM_ID,
        'web_rid': ROOM_ID
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': f'https://live.douyin.com/{ROOM_ID}',
        'Accept': 'application/json, text/plain, */*',
    }
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('Content-Type', 'unknown')}")
        print(f"Content length: {len(resp.text)}")
        if len(resp.text) < 500:
            print(f"Response: {resp.text[:200]}")
        else:
            try:
                data = resp.json()
                print(f"JSON status: {data.get('status_code')}")
                if data.get('status_code') == 0:
                    room = data.get('data', {}).get('room', {})
                    owner = room.get('owner', {})
                    print(f"Room title: {room.get('title', 'N/A')}")
                    print(f"Owner: {owner.get('nickname', 'N/A')}")
                    print(f"Status: {room.get('status', 'N/A')}")
            except:
                print(f"Not JSON: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

def test_without_cookie():
    """无 Cookie 测试"""
    print("\n=== 无 Cookie 测试 ===")
    test_room_api()

def test_with_old_cookie():
    """使用旧 Cookie 测试"""
    print("\n=== 使用旧 Cookie 测试 ===")
    url = "https://live.douyin.com/webcast/room/web/enter/"
    params = {
        'aid': '6383',
        'app_name': 'douyin_web',
        'live_id': '1',
        'device_platform': 'web',
        'enter_from': 'web_live',
        'room_id': ROOM_ID,
        'web_rid': ROOM_ID
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': f'https://live.douyin.com/{ROOM_ID}',
        'Accept': 'application/json, text/plain, */*',
    }
    cookies = {
        'sessionid': '2cdd4d6f3cb3ad584f498ed753d653b7',
        'sessionid_ss': '2cdd4d6f3cb3ad584f498ed753d653b7',
    }
    
    try:
        resp = requests.get(url, headers=headers, cookies=cookies, params=params, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response preview: {resp.text[:300]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"直播间: {ROOM_ID}")
    print("="*50)
    test_without_cookie()
    test_with_old_cookie()
