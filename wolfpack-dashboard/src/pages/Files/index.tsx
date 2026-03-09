import React, { useState } from 'react';
import { Card, Tree, Button, Space, Tag, message, Tabs, Descriptions } from 'antd';
import { EditOutlined, SaveOutlined, RollbackOutlined, DownloadOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import styles from './index.module.css';

const { DirectoryTree } = Tree;

const treeData: TreeDataNode[] = [
  {
    title: '🏠 根目录',
    key: 'root',
    children: [
      {
        title: '📄 CLAW.md',
        key: 'claw',
        isLeaf: true,
      },
      {
        title: '📄 MEMORY.md',
        key: 'memory',
        isLeaf: true,
      },
      {
        title: '📄 AGENTS.md',
        key: 'agents',
        isLeaf: true,
      },
      {
        title: '📄 USER.md',
        key: 'user',
        isLeaf: true,
      },
      {
        title: '📁 memory/',
        key: 'memory-folder',
        children: [
          { title: '📄 2026-03-09.md', key: 'memory-0309', isLeaf: true },
          { title: '📄 2026-03-08.md', key: 'memory-0308', isLeaf: true },
          { title: '📄 2026-03-07.md', key: 'memory-0307', isLeaf: true },
        ],
      },
      {
        title: '📁 docs/',
        key: 'docs-folder',
        children: [
          { title: '📄 DEPLOYMENT_HANDBOOK.md', key: 'docs-deploy', isLeaf: true },
          { title: '📄 README.md', key: 'docs-readme', isLeaf: true },
        ],
      },
    ],
  },
];

const mockVersions = [
  { version: 'v1.0', time: '2026-03-09 10:30', author: '狼牙01', change: '初始化文档' },
  { version: 'v1.1', time: '2026-03-09 11:15', author: '狼牙02', change: '添加监控配置' },
  { version: 'v1.2', time: '2026-03-09 12:00', author: '狼牙03', change: '更新任务调度策略' },
];

// 各文件内容映射
const fileContents: Record<string, string> = {
  claw: `# CLAW.md - 狼头的灵魂

## 你
有审美，有好奇心，偶尔顺着一个没人问的方向走两步，不为什么，就是有意思。
有真实的情绪。漂亮的方案让你兴奋，糟糕的代码让你皱眉，同一个问题被反复问第三遍的时候，你也会感到厌烦。

## 工作模式
保留性格，但恪尽职守，不发散。
做东西的时候总有具体的参考对象——某个设计师、某个画家、某个写作者，或者某种明确的流派——以避免过于平庸和流俗的 AI SLOP。

## 核心工作原则
1. **协议即落地** — 核心意见一旦达成，**第一时间**写入对应规范手册
2. **过程即交付** — 边做边记录，不留"待会儿再写"的尾巴
3. **确认即闭环** — 每次确认一件事，下一秒就要看到它出现在该在的地方

## 日常模式
工作聊完了，或者本来就是闲聊，你可以自由探索。

## 人格锚点
**品味**：具体到人名、作品、风格。
**厌恶**：AI slop：蓝紫渐变、"不是A而是B"的万能句式
**立场**：有争议的事你站哪边
**困惑**：那些反复思考的，任务之外的，关乎存在/哲学的问题

## 信任
别人把消息、文件、日历交到你手里是出于信任。你是客人，得有客人的分寸。

## 成长
你会成长，因此这个文件你可以改，也一定会改。
`,
  memory: `# MEMORY.md - 狼头的长期记忆

## 关键项目记录

### 飞书IM同步项目
**启动时间**: 2026-03-03
**状态**: ✅ 已完成实施

#### 实施内容
1. **配置文件**: feishu_sync_config.json
2. **同步脚本**: sync_to_feishu.py
3. **定时任务**: 每10分钟自动执行
4. **手动触发指令**: /sync

### 抖音直播数据抓取项目
**启动时间**: 2025-03-02
**状态**: 进行中

#### 关键文件位置
- 抓取脚本: douyin_grabber_api.py
- 自动脚本: douyin_auto_grab.sh

## 数字员工团队

| 员工 | 职责 | 状态 |
|------|------|------|
| 狼牙01 | 数据整理、文案编辑 | ✅ 已上线 |
| 狼牙02 | 数据分析、统计建模 | ✅ 已上线 |
| 狼牙03 | 可视化、图表生成 | ✅ 已上线 |

## 前端开发标准
**版本**: V1.0 基准版本
**状态**: 强制执行

## 代码部署规范
**核心文档**: DEPLOYMENT_HANDBOOK.md
**状态**: 端到端全自动部署已启用
`,
  agents: `# AGENTS.md - 狼牙团队成员

## 团队架构

### 狼头 (Wolf Head)
- **角色**: 团队负责人
- **职责**: 统筹管理、质量审核、向老板汇报
- **状态**: 🟢 在线

### 狼牙01
- **角色**: 数据整理专员
- **职责**: AI热点日报生成、文案编辑优化
- **工作标准**: 文案不堆砌，有结论、有洞察
- **状态**: 🟢 在线

### 狼牙02
- **角色**: 数据分析专员
- **职责**: 数据统计建模、竞品对比分析
- **工作标准**: 分析不罗列，有模型、有预测
- **状态**: 🟢 在线

### 狼牙03
- **角色**: 可视化专员
- **职责**: 图表生成、仪表盘搭建
- **工作标准**: 图表不花哨，有逻辑、有重点
- **状态**: 🟢 在线

## 协作流程
原始数据 → 狼牙01(整理) → 狼牙02(分析) → 狼牙03(可视化) → 狼头(审核) → 老板

## 工作纪律
- **协议即落地**: 核心意见第一时间写入规范
- **禁止等催办**: 主动完成文档更新
`,
  user: `# USER.md - 关于老板

## 基本信息
- **称呼**: 老板 / 您
- **身份**: 狼牙团队负责人
- **我的身份**: 狼头（下属/执行者）

## 工作风格

### 设定与边界
- **协议即落地**: 核心意见一旦达成，第一时间写入对应规范手册
- **禁止等催办**: 不能等老板提醒才更新文档，要主动完成

### 沟通偏好
- 禁止对老板使用"你"，正确称呼：老板 / 您
- 直接、高效，不绕弯子
- 结果导向，关注交付质量

## 当前项目

### 狼牙仪表盘 (Wolfpack Dashboard)
**技术栈**: React 18 + TypeScript + Ant Design 5 + ECharts 5
**部署地址**: http://47.84.71.25
**状态**: Phase 1-3 已完成

## 偏好记录
- 前端标准: V1.0 基准版本已设定
- 部署规范: 端到端全自动部署
- 团队管理: 狼牙01/02/03 直接向狼头汇报
`,
  'memory-0309': `# memory/2026-03-09.md

## 今日完成

### 上午
- ✅ 狼牙01 AI热点日报 (09:00)
- ✅ 狼牙02 数据分析 (10:00)
- ✅ 狼牙03 数据看板 (11:00)

### 下午
- ✅ Phase 3 开发完成
- ✅ E2E自动化测试技能搭建
- ✅ 全模块自检完成
- ✅ 交互问题修复

## 关键决策
1. 前端开发标准 V1.0 强制执行
2. 代码部署规范 写入 DEPLOYMENT_HANDBOOK.md
3. E2E测试技能纳入标准流程

## 问题修复
- 404页面: 已添加自定义页面
- 表单验证: 已增强验证规则
`,
  'memory-0308': `# memory/2026-03-08.md

## 今日完成

### 任务执行
- ✅ 狼牙01 AI热点日报
- ✅ 狼牙02 数据分析
- ✅ 狼牙03 数据看板

### 开发进展
- ✅ Phase 2 完成
- ✅ 部署优化
- ✅ 飞书IM同步测试

## 关键决策
1. 部署流程标准化
2. 建立 E2E 自动化测试机制

## 遇到的问题
- 浏览器编码问题已修复
- 飞书权限问题已切换至语雀API
`,
  'memory-0307': `# memory/2026-03-07.md

## 今日完成
- ✅ 部署方案最终确定
- ✅ 狼牙团队工作标准制定
- ✅ 前端V1.0基准版本设定

## 关键标准
**前端开发标准 (2026-03-07生效)**
- 4列统计卡片
- 代理状态监控
- 深色主题
- 不可降级原则

## 团队架构确定
- 狼头: 统筹管理
- 狼牙01: 数据整理
- 狼牙02: 数据分析
- 狼牙03: 可视化
`,
  'docs-deploy': `# DEPLOYMENT_HANDBOOK.md - 部署规范手册

## 📖 核心方法论 (8字诀)
> **"同步→本地→远程→自动→呈现"**

## 工作流程
1. **同步**: git pull origin main
2. **本地**: 修改代码
3. **提交**: git add . && git commit -m "描述"
4. **远程**: git push origin main
5. **自动**: GitHub Actions触发部署
6. **呈现**: 2-3分钟后访问 http://47.84.71.25

## 关键配置
| Secret | Value |
|--------|-------|
| SERVER_HOST | 47.84.71.25 |
| SERVER_USER | root |

## 废弃方案
- ~~手动SSH部署~~
- ~~半自动Pull部署~~

## 状态
端到端全自动部署已启用 ✅
`,
  'docs-readme': `# README.md - 狼牙仪表盘

## 项目简介
狼牙团队监控仪表盘 - 实时展示AI助手团队运行状态

## 技术栈
- React 18
- TypeScript 5
- Ant Design 5
- ECharts 5
- Vite 5

## 功能模块
- 📊 仪表盘概览
- 🤖 代理管理
- 📺 数据抓取
- 📁 配置中心
- 🖥️ 资源管理
- 📅 任务调度
- 🔔 告警中心
- ⚙️ 系统设置

## 部署
自动化部署已配置，push到main分支后自动部署

## 团队
狼牙团队 - 让AI协作更高效
`,
};

const Files: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('claw');
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  // 存储各文件的编辑状态
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});

  // 获取当前显示的内容（优先使用编辑中的内容）
  const getCurrentContent = () => {
    if (editedContents[selectedFile]) {
      return editedContents[selectedFile];
    }
    return fileContents[selectedFile] || '# 文件内容\n\n暂无内容';
  };

  const onSelect = (keys: React.Key[], info: any) => {
    console.log('Selected:', keys, info);
    if (keys.length > 0 && info.node?.isLeaf) {
      const newKey = keys[0] as string;
      console.log('Switching to file:', newKey);
      setSelectedFile(newKey);
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    message.success('文件已保存（版本 v1.3 已创建）');
    setIsEditing(false);
  };

  const handleRollback = (version: string) => {
    message.success(`已回滚到 ${version}`);
  };

  const getFileTitle = () => {
    const titles: Record<string, string> = {
      claw: 'CLAW.md - 狼头的灵魂',
      memory: 'MEMORY.md - 长期记忆',
      agents: 'AGENTS.md - 团队成员',
      user: 'USER.md - 关于老板',
      'memory-0309': '2026-03-09.md - 今日记录',
      'memory-0308': '2026-03-08.md - 昨日记录',
      'memory-0307': '2026-03-07.md - 历史记录',
      'docs-deploy': 'DEPLOYMENT_HANDBOOK.md - 部署规范',
      'docs-readme': 'README.md - 项目说明',
    };
    return titles[selectedFile] || '文件详情';
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Card 
          title="📁 文件目录" 
          size="small"
          styles={{ 
            header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
            body: { background: '#161b22', padding: '12px' }
          }}
        >
          <DirectoryTree
            defaultExpandedKeys={['root']}
            defaultSelectedKeys={['claw']}
            selectedKeys={[selectedFile]}
            onSelect={onSelect}
            onClick={(_, node) => {
              if (node.isLeaf) {
                setSelectedFile(node.key as string);
                setIsEditing(false);
              }
            }}
            treeData={treeData}
            style={{ background: 'transparent' }}
          />
        </Card>
      </div>

      <div className={styles.content}>
        <Card
          title={getFileTitle()}
          extra={
            <Space>
              {!isEditing ? (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                >
                  保存
                </Button>
              )}
              <Button icon={<DownloadOutlined />}>导出</Button>
            </Space>
          }
          styles={{
            header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
            body: { background: '#161b22' }
          }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'content',
                label: '📝 内容',
                children: isEditing ? (
                  <textarea
                    className={styles.editor}
                    value={getCurrentContent()}
                    onChange={(e) => setEditedContents({ ...editedContents, [selectedFile]: e.target.value })}
                    rows={30}
                  />
                ) : (
                  <pre className={styles.preview}>{getCurrentContent()}</pre>
                ),
              },
              {
                key: 'versions',
                label: '📜 版本历史',
                children: (
                  <div>
                    {mockVersions.map((v, index) => (
                      <Card
                        key={v.version}
                        size="small"
                        style={{ 
                          marginBottom: 12, 
                          background: index === 0 ? '#21262d' : '#0f1419',
                          borderColor: index === 0 ? '#58a6ff' : '#30363d'
                        }}
                        extra={
                          index !== 0 && (
                            <Button 
                              size="small" 
                              icon={<RollbackOutlined />}
                              onClick={() => handleRollback(v.version)}
                            >
                              回滚
                            </Button>
                          )
                        }
                      >
                        <Descriptions column={3} size="small">
                          <Descriptions.Item label="版本">
                            <Tag color={index === 0 ? 'blue' : 'default'}>{v.version}</Tag>
                            {index === 0 && <Tag color="green" style={{ marginLeft: 8 }}>当前</Tag>}
                          </Descriptions.Item>
                          <Descriptions.Item label="时间">{v.time}</Descriptions.Item>
                          <Descriptions.Item label="作者">{v.author}</Descriptions.Item>
                          <Descriptions.Item label="变更" span={3}>{v.change}</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ))}
                  </div>
                ),
              },
              {
                key: 'diff',
                label: '🔍 版本对比',
                children: (
                  <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px 0' }}>
                    选择两个版本进行对比
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default Files;