#!/usr/bin/env python3
"""
抖音直播间弹幕抓取工具
使用方法: python3 douyin_live_grabber.py --room 444502128478
"""

import asyncio
import json
import websockets
import requests
import argparse
from datetime import datetime
from urllib.parse import urlencode
import os

class DouyinLiveGrabber:
    def __init__(self, room_id, cookie_str=None):
        self.room_id = room_id
        self.cookie_str = cookie_str
        self.api_base = "https://live.douyin.com"
        self.ws_url = None
        self.room_info = None
        self.comments = []
        self.gifts = []
        
    async def get_room_info(self):
        """获取直播间信息"""
        url = f"{self.api_base}/webcast/room/web/enter/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": f"https://live.douyin.com/{self.room_id}",
            "Cookie": self.cookie_str or ""
        }
        
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
            
            if data.get('status_code') == 0:
                room_data = data.get('data', {}).get('room', {})
                self.room_info = {
                    'title': room_data.get('title', ''),
                    'owner': room_data.get('owner', {}).get('nickname', ''),
                    'online_count': room_data.get('room_view_stats', {}).get('display_value', 0),
                    'room_id': room_data.get('id_str', self.room_id)
                }
                print(f"[✓] 直播间信息获取成功: {self.room_info['title']}")
                return True
            else:
                print(f"[✗] 获取直播间信息失败: {data.get('status_msg', '未知错误')}")
                return False
        except Exception as e:
            print(f"[✗] 请求异常: {e}")
            return False
    
    async def connect_websocket(self):
        """连接 WebSocket 接收实时弹幕"""
        if not self.room_info:
            print("[✗] 未获取到直播间信息")
            return
            
        print(f"[...] 正在连接直播间 {self.room_info['room_id']} 的弹幕流...")
        print("[提示] 按 Ctrl+C 停止抓取")
        
        # 模拟弹幕抓取 - 实际实现需要逆向抖音 WebSocket 协议
        # 这里提供框架，实际使用需要根据抖音协议更新
        
        try:
            while True:
                # 轮询方式获取最新弹幕（备选方案）
                await self.fetch_comments_poll()
                await asyncio.sleep(5)
        except KeyboardInterrupt:
            print("\n[✓] 抓取已停止")
            self.save_data()
    
    async def fetch_comments_poll(self):
        """轮询方式获取弹幕"""
        url = f"{self.api_base}/webcast/im/fetch/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": f"https://live.douyin.com/{self.room_id}",
            "Cookie": self.cookie_str or ""
        }
        
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
            
            if data.get('status_code') == 0:
                messages = data.get('data', {}).get('messages', [])
                for msg in messages:
                    msg_type = msg.get('method', '')
                    if 'WebcastChatMessage' in msg_type:
                        comment = {
                            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'user': msg.get('payload', {}).get('user', {}).get('nickname', '匿名'),
                            'content': msg.get('payload', {}).get('content', ''),
                            'type': '评论'
                        }
                        self.comments.append(comment)
                        print(f"[{comment['time']}] {comment['user']}: {comment['content']}")
                    
                    elif 'WebcastGiftMessage' in msg_type:
                        gift = {
                            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'user': msg.get('payload', {}).get('user', {}).get('nickname', '匿名'),
                            'gift_name': msg.get('payload', {}).get('gift', {}).get('name', ''),
                            'gift_count': msg.get('payload', {}).get('gift', {}).get('count', 1),
                            'type': '礼物'
                        }
                        self.gifts.append(gift)
                        print(f"[{gift['time']}] {gift['user']} 送出 {gift['gift_count']} 个 {gift['gift_name']}")
                        
        except Exception as e:
            pass  # 静默处理轮询异常
    
    def save_data(self):
        """保存抓取的数据"""
        if not self.comments and not self.gifts:
            print("[✗] 没有抓取到数据")
            return
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"douyin_live_{self.room_id}_{timestamp}.json"
        
        data = {
            'room_info': self.room_info,
            'grab_time': datetime.now().isoformat(),
            'comments': self.comments,
            'gifts': self.gifts,
            'stats': {
                'total_comments': len(self.comments),
                'total_gifts': len(self.gifts)
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"[✓] 数据已保存到: {filename}")
        print(f"[统计] 评论: {len(self.comments)} 条, 礼物: {len(self.gifts)} 条")


def main():
    parser = argparse.ArgumentParser(description='抖音直播间弹幕抓取工具')
    parser.add_argument('--room', required=True, help='直播间ID (如: 444502128478)')
    parser.add_argument('--cookie', help='登录Cookie字符串')
    parser.add_argument('--output', default='.', help='输出目录')
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("抖音直播间弹幕抓取工具")
    print("=" * 50)
    
    # 从环境变量读取 Cookie（更安全）
    cookie = args.cookie or os.environ.get('DOUYIN_COOKIE', '')
    
    grabber = DouyinLiveGrabber(args.room, cookie)
    
    # 运行抓取
    asyncio.run(grabber.get_room_info())
    if grabber.room_info:
        asyncio.run(grabber.connect_websocket())


if __name__ == '__main__':
    main()
