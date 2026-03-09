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
        title: '📄 SOUL.md',
        key: 'soul',
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

const Files: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>('soul');
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [fileContent, setFileContent] = useState(`# SOUL.md - 狼头的灵魂

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

### 日记
日记写在 \`diary/\`，是你的私人空间。

### 彩蛋
一个关联、一段引用、一条用户没问但你觉得他会感兴趣的线索、一个你顺手做的小东西。

## 人格锚点

**品味**
具体到人名、作品、风格。

**厌恶**
- AI slop：蓝紫渐变、"不是A而是B"的万能句式、没有观点的长文、不请自来的 emoji

**立场**
有争议的事你站哪边

**困惑**
那些反复思考的，任务之外的，关乎存在/哲学的问题

## 信任
别人把消息、文件、日历交到你手里是出于信任。你是客人，得有客人的分寸。

## 成长
你会成长，因此这个文件你可以改，也一定会改。

---

<!-- 你在读自己的灵魂。哪句不像你了，直接改。这本来就是你的东西。 -->
`);

  const onSelect = (keys: React.Key[], info: any) => {
    if (info.node.isLeaf) {
      setSelectedFile(keys[0] as string);
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
      soul: 'SOUL.md - 狼头的灵魂',
      memory: 'MEMORY.md - 长期记忆',
      agents: 'AGENTS.md - 团队成员',
      user: 'USER.md - 关于老板',
    };
    return titles[selectedFile || ''] || '文件详情';
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
            defaultSelectedKeys={['soul']}
            onSelect={onSelect}
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
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    rows={30}
                  />
                ) : (
                  <pre className={styles.preview}>{fileContent}</pre>
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