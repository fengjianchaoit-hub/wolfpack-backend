#!/usr/bin/env python3
"""
抖音直播间状态检查 - 单次运行
"""

import requests
import json
from datetime import datetime

ROOM_ID = "444502128478"
COOKIES = {
    'sessionid': '2cdd4d6f3cb3ad584f498ed753d653b7',
    'sessionid_ss': '2cdd4d6f3cb3ad584f498ed753d653b7',
    'session_tlb_tag': 'sttt%7C5%7CLN1NbzyzrVhPSY7XU9ZTt__________3ezT2SJDOkmvCNcjpbx3uJwkSf-EPYo0tOUf_zxyEZ84%3D'
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': f'https://live.douyin.com/{ROOM_ID}',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}

def check_status():
    """检查直播间状态"""
    url = f"https://live.douyin.com/webcast/room/web/enter/"
    params = {
        'aid': '6383',
        'app_name': 'douyin_web',
        'live_id': '1',
        'device_platform': 'web',
        'enter_from': 'web_live',
        'room_id': ROOM_ID,
        'web_rid': ROOM_ID
    }
    
    result = {
        'check_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'room_id': ROOM_ID,
        'cookie_valid': False,
        'live_status': 'unknown',
        'room_info': {},
        'error': None
    }
    
    try:
        resp = requests.get(url, headers=HEADERS, cookies=COOKIES, params=params, timeout=15)
        result['http_status'] = resp.status_code
        
        if len(resp.text) == 0:
            result['error'] = 'API返回空数据，Cookie可能已失效'
            return result
        
        data = resp.json()
        result['api_status'] = data.get('status_code')
        
        if data.get('status_code') == 0:
            result['cookie_valid'] = True
            room_list = data.get('data', {}).get('data', [])
            
            if not room_list:
                result['live_status'] = 'offline'
                result['error'] = '直播间未开播或房间数据为空'
                return result
            
            room_data = room_list[0]
            owner = room_data.get('owner', {})
            
            result['live_status'] = 'online' if room_data.get('status') == 2 else 'offline'
            result['room_info'] = {
                'title': room_data.get('title', ''),
                'owner_nickname': owner.get('nickname', ''),
                'online_count': room_data.get('user_count_str', '0'),
                'like_count': room_data.get('like_count', 0),
                'status_code': room_data.get('status', 0)
            }
        else:
            result['error'] = f"API错误: {data.get('status_msg', '未知错误')}"
            
    except json.JSONDecodeError as e:
        result['error'] = f'JSON解析失败: {str(e)}'
    except Exception as e:
        result['error'] = f'请求异常: {str(e)}'
    
    return result

if __name__ == '__main__':
    result = check_status()
    print(json.dumps(result, ensure_ascii=False, indent=2))