#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kimi对话同步到飞书IM
功能：
1. 读取本地对话记录
2. 格式化为飞书富文本消息
3. 发送到飞书webhook
4. 错误重试机制
5. 失败消息队列
"""

import json
import os
import time
import hashlib
import base64
import hmac
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any


class FeishuSync:
    """飞书同步主类"""
    
    def __init__(self, config_path: str = None):
        """初始化同步器"""
        self.config_path = config_path or "/root/.openclaw/workspace/feishu_sync_config.json"
        self.config = self._load_config()
        self.conversation_log_path = self.config["storage"]["conversation_log_path"]
        self.last_sync_path = self.config["storage"]["last_sync_timestamp_path"]
        self.failed_queue_path = self.config["storage"]["failed_queue_path"]
        
        # 确保存储目录存在
        self._ensure_storage_dirs()
    
    def _load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)["feishu_sync"]
        except Exception as e:
            print(f"[错误] 加载配置文件失败: {e}")
            return self._default_config()
    
    def _default_config(self) -> Dict:
        """默认配置"""
        return {
            "enabled": False,
            "webhook_url": "",
            "secret": "",
            "sync_interval_minutes": 10,
            "max_message_length": 9000,
            "retry_config": {"max_retries": 3, "retry_delays": [1, 2, 4]},
            "storage": {
                "conversation_log_path": "/root/.openclaw/workspace/memory/conversation_log.json",
                "last_sync_timestamp_path": "/root/.openclaw/workspace/memory/last_sync_timestamp.txt",
                "failed_queue_path": "/root/.openclaw/workspace/memory/failed_messages_queue.json"
            }
        }
    
    def _ensure_storage_dirs(self):
        """确保存储目录存在"""
        paths = [
            self.conversation_log_path,
            self.last_sync_path,
            self.failed_queue_path
        ]
        for path in paths:
            dir_path = os.path.dirname(path)
            if dir_path and not os.path.exists(dir_path):
                os.makedirs(dir_path, exist_ok=True)
    
    def _generate_sign(self, timestamp: int) -> str:
        """生成飞书签名（如果启用了安全验证）"""
        secret = self.config.get("secret", "")
        if not secret:
            return ""
        
        # 飞书签名校验算法
        string_to_sign = f"{timestamp}\n{secret}"
        hmac_code = hmac.new(
            string_to_sign.encode('utf-8'),
            digestmod=hashlib.sha256
        ).digest()
        sign = base64.b64encode(hmac_code).decode('utf-8')
        return sign
    
    def read_conversations(self, since_timestamp: float = None) -> List[Dict]:
        """
        读取对话记录
        从内存文件和日志中提取对话内容
        """
        conversations = []
        
        # 1. 读取专门的对话日志
        if os.path.exists(self.conversation_log_path):
            try:
                with open(self.conversation_log_path, 'r', encoding='utf-8') as f:
                    log_data = json.load(f)
                    if isinstance(log_data, list):
                        conversations.extend(log_data)
                    elif isinstance(log_data, dict) and "conversations" in log_data:
                        conversations.extend(log_data["conversations"])
            except Exception as e:
                print(f"[警告] 读取对话日志失败: {e}")
        
        # 2. 读取每日记忆文件
        memory_dir = "/root/.openclaw/workspace/memory"
        if os.path.exists(memory_dir):
            for filename in os.listdir(memory_dir):
                if filename.endswith('.md') and filename.startswith('2026-'):
                    filepath = os.path.join(memory_dir, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                            # 提取对话记录部分
                            conv = self._parse_memory_content(content, filename)
                            if conv:
                                conversations.append(conv)
                    except Exception as e:
                        print(f"[警告] 读取记忆文件 {filename} 失败: {e}")
        
        # 按时间过滤
        if since_timestamp:
            conversations = [
                c for c in conversations 
                if c.get("timestamp", 0) > since_timestamp
            ]
        
        # 排序
        conversations.sort(key=lambda x: x.get("timestamp", 0))
        
        return conversations
    
    def _parse_memory_content(self, content: str, filename: str) -> Optional[Dict]:
        """解析记忆文件内容，提取对话信息"""
        lines = content.strip().split('\n')
        
        # 提取日期
        date_str = filename.replace('.md', '')
        
        # 简单解析：查找对话标记
        user_messages = []
        assistant_messages = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('**用户**') or line.startswith('👤') or '用户：' in line:
                user_messages.append(line)
            elif line.startswith('**Kimi**') or line.startswith('🤖') or 'Kimi：' in line:
                assistant_messages.append(line)
        
        if user_messages or assistant_messages:
            # 获取文件修改时间作为时间戳
            filepath = os.path.join("/root/.openclaw/workspace/memory", filename)
            mtime = os.path.getmtime(filepath)
            
            return {
                "timestamp": mtime,
                "date": date_str,
                "user_messages": user_messages[:5],  # 限制数量
                "assistant_messages": assistant_messages[:5],
                "source": filename,
                "raw_content": content[:2000]  # 限制内容长度
            }
        
        return None
    
    def format_feishu_message(self, conversations: List[Dict]) -> Dict:
        """
        格式化为飞书富文本消息
        """
        if not conversations:
            return None
        
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        # 构建消息内容
        content_blocks = []
        
        # 标题块
        title_block = [
            {"tag": "text", "text": f"📅 同步时间：{now}\n"},
            {"tag": "text", "text": f"📊 对话数量：{len(conversations)} 条\n"},
            {"tag": "text", "text": "─────────────────\n\n"}
        ]
        content_blocks.append(title_block)
        
        # 对话内容块
        for i, conv in enumerate(conversations[-3:]):  # 最多显示最近3条
            conv_content = self._format_conversation(conv)
            if conv_content:
                content_blocks.append([{"tag": "text", "text": conv_content}])
                content_blocks.append([{"tag": "text", "text": "\n"}])
        
        # 添加查看链接
        content_blocks.append([
            {"tag": "a", "text": "【查看完整记录】", "href": "https://kimi.moonshot.cn/chat"}
        ])
        
        # 构建完整消息
        message = {
            "msg_type": "post",
            "content": {
                "post": {
                    "zh_cn": {
                        "title": "🤖 Kimi对话同步",
                        "content": content_blocks
                    }
                }
            }
        }
        
        return message
    
    def _format_conversation(self, conv: Dict) -> str:
        """格式化单条对话"""
        lines = []
        
        # 时间
        if "timestamp" in conv:
            time_str = datetime.fromtimestamp(conv["timestamp"]).strftime("%H:%M")
            lines.append(f"⏰ {time_str}")
        
        # 用户消息
        if "user_messages" in conv and conv["user_messages"]:
            for msg in conv["user_messages"][:2]:  # 最多2条
                lines.append(f"👤 {msg[:100]}")  # 限制长度
        
        # Kimi回复
        if "assistant_messages" in conv and conv["assistant_messages"]:
            for msg in conv["assistant_messages"][:2]:
                lines.append(f"🤖 {msg[:100]}")
        
        # 原始内容摘要
        if "raw_content" in conv and not lines:
            content = conv["raw_content"][:200].replace('\n', ' ')
            lines.append(f"📝 {content}...")
        
        return "\n".join(lines) if lines else ""
    
    def send_to_feishu(self, message: Dict) -> bool:
        """
        发送消息到飞书webhook
        包含重试机制
        """
        webhook_url = self.config.get("webhook_url", "")
        
        if not webhook_url:
            print("[错误] 未配置webhook_url")
            self._queue_failed_message(message)
            return False
        
        if not self.config.get("enabled", False):
            print("[信息] 同步功能未启用")
            return False
        
        # 生成签名
        timestamp = int(time.time())
        sign = self._generate_sign(timestamp)
        
        # 添加签名到消息
        if sign:
            message["timestamp"] = timestamp
            message["sign"] = sign
        
        # 重试配置
        max_retries = self.config.get("retry_config", {}).get("max_retries", 3)
        retry_delays = self.config.get("retry_config", {}).get("retry_delays", [1, 2, 4])
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    webhook_url,
                    json=message,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                result = response.json()
                
                if result.get("code") == 0:
                    print(f"[成功] 消息发送成功")
                    return True
                else:
                    error_msg = result.get("msg", "未知错误")
                    print(f"[警告] 发送失败 ({attempt+1}/{max_retries}): {error_msg}")
                    
                    if attempt < max_retries - 1:
                        delay = retry_delays[min(attempt, len(retry_delays)-1)]
                        print(f"[信息] {delay}秒后重试...")
                        time.sleep(delay)
                    else:
                        self._queue_failed_message(message)
                        return False
                        
            except requests.exceptions.RequestException as e:
                print(f"[警告] 网络错误 ({attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    delay = retry_delays[min(attempt, len(retry_delays)-1)]
                    time.sleep(delay)
                else:
                    self._queue_failed_message(message)
                    return False
            except Exception as e:
                print(f"[错误] 发送异常: {e}")
                self._queue_failed_message(message)
                return False
        
        return False
    
    def _queue_failed_message(self, message: Dict):
        """将失败的消息加入队列，稍后重试"""
        try:
            failed_messages = []
            if os.path.exists(self.failed_queue_path):
                with open(self.failed_queue_path, 'r', encoding='utf-8') as f:
                    failed_messages = json.load(f)
            
            failed_messages.append({
                "timestamp": time.time(),
                "message": message,
                "retry_count": 0
            })
            
            # 限制队列长度
            if len(failed_messages) > 100:
                failed_messages = failed_messages[-100:]
            
            with open(self.failed_queue_path, 'w', encoding='utf-8') as f:
                json.dump(failed_messages, f, ensure_ascii=False, indent=2)
            
            print(f"[信息] 消息已加入失败队列，当前队列长度: {len(failed_messages)}")
        except Exception as e:
            print(f"[错误] 保存失败队列时出错: {e}")
    
    def retry_failed_messages(self) -> int:
        """重试失败队列中的消息，返回成功数量"""
        if not os.path.exists(self.failed_queue_path):
            return 0
        
        try:
            with open(self.failed_queue_path, 'r', encoding='utf-8') as f:
                failed_messages = json.load(f)
        except:
            return 0
        
        if not failed_messages:
            return 0
        
        success_count = 0
        remaining = []
        
        for item in failed_messages:
            if item.get("retry_count", 0) >= 5:  # 最多重试5次
                continue
            
            message = item.get("message")
            if message:
                item["retry_count"] = item.get("retry_count", 0) + 1
                if self.send_to_feishu(message):
                    success_count += 1
                else:
                    remaining.append(item)
        
        # 保存剩余消息
        with open(self.failed_queue_path, 'w', encoding='utf-8') as f:
            json.dump(remaining, f, ensure_ascii=False, indent=2)
        
        return success_count
    
    def get_last_sync_timestamp(self) -> float:
        """获取上次同步时间戳"""
        if os.path.exists(self.last_sync_path):
            try:
                with open(self.last_sync_path, 'r') as f:
                    return float(f.read().strip())
            except:
                pass
        return 0
    
    def set_last_sync_timestamp(self, timestamp: float):
        """设置上次同步时间戳"""
        try:
            with open(self.last_sync_path, 'w') as f:
                f.write(str(timestamp))
        except Exception as e:
            print(f"[警告] 保存同步时间戳失败: {e}")
    
    def sync(self, force: bool = False) -> bool:
        """
        执行同步
        
        Args:
            force: 是否强制同步全部内容，忽略时间戳
        """
        print(f"\n{'='*50}")
        print(f"【Kimi-飞书同步】{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*50}\n")
        
        # 检查配置
        if not self.config.get("enabled", False):
            print("[信息] 同步功能未启用，跳过")
            return False
        
        if not self.config.get("webhook_url"):
            print("[错误] 未配置webhook_url，请在配置文件中设置")
            return False
        
        # 获取上次同步时间
        last_sync = 0 if force else self.get_last_sync_timestamp()
        
        # 读取对话记录
        print(f"[信息] 读取{'全部' if force else '新'}对话记录...")
        conversations = self.read_conversations(since_timestamp=last_sync)
        
        if not conversations:
            print("[信息] 没有新的对话记录需要同步")
            return True
        
        print(f"[信息] 找到 {len(conversations)} 条对话记录")
        
        # 格式化为飞书消息
        message = self.format_feishu_message(conversations)
        
        if not message:
            print("[警告] 消息格式化失败")
            return False
        
        # 检查消息长度
        message_str = json.dumps(message, ensure_ascii=False)
        max_length = self.config.get("max_message_length", 9000)
        
        if len(message_str) > max_length:
            print(f"[警告] 消息长度超过限制({len(message_str)} > {max_length})，需要截断")
            # 简化消息内容
            message = self._truncate_message(message, max_length)
        
        # 发送消息
        print(f"[信息] 正在发送到飞书...")
        success = self.send_to_feishu(message)
        
        if success:
            # 更新同步时间戳
            current_time = time.time()
            self.set_last_sync_timestamp(current_time)
            print(f"[成功] 同步完成，已更新同步时间戳")
            
            # 尝试重试之前失败的消息
            retry_count = self.retry_failed_messages()
            if retry_count > 0:
                print(f"[成功] 重发 {retry_count} 条失败消息")
        else:
            print(f"[错误] 同步失败，消息已加入队列稍后重试")
        
        return success
    
    def _truncate_message(self, message: Dict, max_length: int) -> Dict:
        """截断过长的消息"""
        # 简化内容
        content = message.get("content", {})
        post = content.get("post", {})
        zh_cn = post.get("zh_cn", {})
        
        # 只保留标题和简要信息
        zh_cn["content"] = [[
            {"tag": "text", "text": "⚠️ 对话内容过长，已截断显示\n"},
            {"tag": "text", "text": "请查看完整对话记录获取详细信息\n"},
            {"tag": "a", "text": "【查看完整记录】", "href": "https://kimi.moonshot.cn/chat"}
        ]]
        
        return message
    
    def test_connection(self) -> bool:
        """测试飞书连接"""
        webhook_url = self.config.get("webhook_url", "")
        
        if not webhook_url:
            print("[错误] 未配置webhook_url")
            return False
        
        test_message = {
            "msg_type": "text",
            "content": {
                "text": "【测试消息】\nKimi-飞书同步功能测试\n时间：" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
        print("[信息] 发送测试消息...")
        return self.send_to_feishu(test_message)


def main():
    """主函数"""
    import sys
    
    # 解析命令行参数
    force = "--force" in sys.argv or "-f" in sys.argv
    test = "--test" in sys.argv or "-t" in sys.argv
    
    # 创建同步器实例
    syncer = FeishuSync()
    
    if test:
        # 测试模式
        success = syncer.test_connection()
        sys.exit(0 if success else 1)
    else:
        # 正常同步
        success = syncer.sync(force=force)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()