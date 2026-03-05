#!/usr/bin/env python3
"""
抖音直播间数据抓取 - 定时任务版本
更新时间: 2026-03-02 21:50
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

def get_room_info():
    """获取直播间基本信息"""
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
    
    try:
        resp = requests.get(url, headers=HEADERS, cookies=COOKIES, params=params, timeout=10)
        data = resp.json()
        
        if data.get('status_code') == 0:
            room_list = data.get('data', {}).get('data', [])
            if room_list:
                room_data = room_list[0]
                owner = room_data.get('owner', {})
                stats = room_data.get('stats', {})
                view_stats = room_data.get('room_view_stats', {})
                
                info = {
                    'room_id': room_data.get('id_str', ''),
                    'title': room_data.get('title', ''),
                    'owner_nickname': owner.get('nickname', ''),
                    'online_count': view_stats.get('display_value', 0),
                    'total_user': stats.get('total_user_str', ''),
                    'like_count': room_data.get('like_count', 0),
                    'status': room_data.get('status', 0),
                    'fetch_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'cookie_valid': True
                }
                return info
    except Exception as e:
        print(f"获取房间信息失败: {e}")
    
    return {'cookie_valid': False, 'error': str(e), 'fetch_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

def main():
    print("="*60)
    print("抖音直播间数据抓取 - 定时任务")
    print("="*60)
    
    room_info = get_room_info()
    
    # 保存结果
    filename = f"douyin_snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(room_info, f, ensure_ascii=False, indent=2)
    
    if room_info.get('cookie_valid'):
        print(f"\n✅ Cookie有效")
        print(f"直播间: {room_info['title']}")
        print(f"主播: {room_info['owner_nickname']}")
        print(f"在线人数: {room_info['online_count']}")
        print(f"本场点赞: {room_info['like_count']}")
        print(f"状态: {'直播中' if room_info['status'] == 2 else '未开播'}")
        print(f"\n数据已保存: {filename}")
    else:
        print(f"\n❌ Cookie失效或请求失败")
        print(f"Error: {room_info.get('error', 'Unknown')}")
        print(f"\n状态已记录: {filename}")
    
    return room_info

if __name__ == '__main__':
    main()
