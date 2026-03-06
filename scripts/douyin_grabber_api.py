#!/usr/bin/env python3
"""
抖音直播间数据抓取 - 直接使用 API 请求
绕过浏览器登录限制
"""

import requests
import json
import time
import gzip
from datetime import datetime
from io import BytesIO

# 直播间信息
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
    
    try:
        resp = requests.get(url, headers=HEADERS, cookies=COOKIES, params=params, timeout=10)
        print(f"API Response status: {resp.status_code}, length: {len(resp.text)}")
        
        if len(resp.text) == 0:
            print("API 返回空数据，Cookie 可能已失效")
            return None
            
        data = resp.json()
        
        if data.get('status_code') == 0:
            # API 返回结构: data.data[0] 是房间信息
            room_list = data.get('data', {}).get('data', [])
            if not room_list:
                print("房间列表为空，直播间可能未开播")
                return None
                
            room_data = room_list[0]
            owner = room_data.get('owner', {})
            
            info = {
                'room_id': room_data.get('id_str', ROOM_ID),
                'title': room_data.get('title', ''),
                'owner_nickname': owner.get('nickname', ''),
                'owner_avatar': owner.get('avatar_thumb', {}).get('url_list', [''])[0] if owner.get('avatar_thumb') else '',
                'online_count': room_data.get('user_count_str', '0'),
                'total_user': room_data.get('user_count_str', '0'),
                'like_count': room_data.get('like_count', 0),
                'status': room_data.get('status', 0),
                'cover': room_data.get('cover', {}).get('url_list', [''])[0] if room_data.get('cover') else '',
                'fetch_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            return info
        else:
            print(f"API 错误: {data.get('status_code')} - {data.get('status_msg', '未知错误')}")
    except json.JSONDecodeError as e:
        print(f"JSON 解析失败: {e}")
    except Exception as e:
        print(f"获取房间信息失败: {e}")
    
    return None

def fetch_chat_messages(cursor=''):
    """获取聊天消息"""
    url = f"https://live.douyin.com/webcast/im/fetch/"
    params = {
        'aid': '6383',
        'app_name': 'douyin_web',
        'live_id': '1',
        'device_platform': 'web',
        'room_id': ROOM_ID,
        'cursor': cursor,
        'count': '50'
    }
    
    try:
        resp = requests.get(url, headers=HEADERS, cookies=COOKIES, params=params, timeout=10)
        data = resp.json()
        
        if data.get('status_code') == 0:
            return data.get('data', {})
    except Exception as e:
        print(f"获取消息失败: {e}")
    
    return None

def parse_messages(data):
    """解析消息数据"""
    messages = []
    gifts = []
    
    for msg in data.get('messages', []):
        method = msg.get('method', '')
        payload = msg.get('payload', {})
        
        if 'WebcastChatMessage' in method:
            # 聊天消息
            user = payload.get('user', {})
            comment = {
                'time': datetime.now().strftime('%H:%M:%S'),
                'user_id': user.get('id_str', ''),
                'nickname': user.get('nickname', '匿名'),
                'content': payload.get('content', ''),
                'type': '评论'
            }
            messages.append(comment)
            
        elif 'WebcastGiftMessage' in method:
            # 礼物消息
            user = payload.get('user', {})
            gift_info = payload.get('gift', {})
            gift = {
                'time': datetime.now().strftime('%H:%M:%S'),
                'user_id': user.get('id_str', ''),
                'nickname': user.get('nickname', '匿名'),
                'gift_name': gift_info.get('name', ''),
                'gift_id': gift_info.get('id', ''),
                'count': payload.get('combo_count', 1),
                'diamond_count': gift_info.get('diamond_count', 0),
                'type': '礼物'
            }
            gifts.append(gift)
    
    return messages, gifts

def main():
    print("="*60)
    print("抖音直播间数据抓取")
    print("="*60)
    
    # 获取房间信息
    room_info = get_room_info()
    if not room_info:
        print("获取直播间信息失败，可能需要更多 Cookie 字段")
        return
    
    print(f"\n直播间: {room_info['title']}")
    print(f"主播: {room_info['owner_nickname']}")
    print(f"在线人数: {room_info['online_count']}")
    print(f"本场点赞: {room_info['like_count']}")
    print(f"抓取时间: {room_info['fetch_time']}")
    
    # 抓取消息
    print("\n" + "="*60)
    print("开始抓取弹幕 (按 Ctrl+C 停止)")
    print("="*60 + "\n")
    
    all_comments = []
    all_gifts = []
    cursor = ''
    
    try:
        while True:
            data = fetch_chat_messages(cursor)
            if data:
                comments, gifts = parse_messages(data)
                all_comments.extend(comments)
                all_gifts.extend(gifts)
                
                for c in comments:
                    print(f"[{c['time']}] {c['nickname']}: {c['content']}")
                for g in gifts:
                    print(f"[{g['time']}] {g['nickname']} 送出 {g['count']} 个 {g['gift_name']}")
                
                cursor = data.get('cursor', '')
            
            time.sleep(5)  # 每5秒抓取一次
            
    except KeyboardInterrupt:
        print("\n\n抓取结束")
    
    # 保存数据
    output = {
        'room_info': room_info,
        'comments': all_comments,
        'gifts': all_gifts,
        'stats': {
            'total_comments': len(all_comments),
            'total_gifts': len(all_gifts),
            'duration': '手动停止'
        }
    }
    
    filename = f"douyin_data_{ROOM_ID}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n数据已保存到: {filename}")
    print(f"共抓取 {len(all_comments)} 条评论, {len(all_gifts)} 条礼物")

if __name__ == '__main__':
    main()
