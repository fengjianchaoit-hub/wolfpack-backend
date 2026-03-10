import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Space, Badge, Typography, Tooltip,
  Modal, Form, Input, Select, message, Popconfirm, Spin
} from 'antd';
import {
  GithubOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  CodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'TESTING' | 'MONITORING' | 'AUTOMATION' | 'INTEGRATION';
  status: 'ACTIVE' | 'INACTIVE' | 'DEVELOPMENT';
  version: string;
  codeUrl: string;
  lastUpdated: string;
  author: string;
  usageCount: number;
  tags: string;
}

const API_BASE = '/api/v1';

const SkillManagement: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form] = Form.useForm();
  const [syncLoading, setSyncLoading] = useState(false);

  // 获取技能列表
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/skills`);
      const result = await response.json();
      if (result.code === 200) {
        setSkills(result.data || []);
      } else {
        message.error('获取技能列表失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // 更新技能状态（启用/停用）
  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/skills/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('状态更新成功');
        fetchSkills();
      } else {
        message.error(result.message || '更新失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    }
  };

  // 删除技能
  const deleteSkill = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/skills/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('删除成功');
        fetchSkills();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    }
  };

  // 创建/更新技能
  const saveSkill = async (values: any) => {
    try {
      const url = editingSkill
        ? `${API_BASE}/skills/${editingSkill.id}`
        : `${API_BASE}/skills`;
      const method = editingSkill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success(editingSkill ? '更新成功' : '创建成功');
        setModalVisible(false);
        form.resetFields();
        setEditingSkill(null);
        fetchSkills();
      } else {
        message.error(result.message || '操作失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    }
  };

  // 从GitHub同步
  const syncFromGithub = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch(`${API_BASE}/skills/sync`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('同步任务已启动');
        setTimeout(fetchSkills, 2000);
      } else {
        message.error(result.message || '同步失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    } finally {
      setSyncLoading(false);
    }
  };

  // 打开编辑弹窗
  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    form.setFieldsValue({
      ...skill,
      tags: skill.tags || '',
    });
    setModalVisible(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setEditingSkill(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns: ColumnsType<Skill> = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Skill) => (
        <div>
          <div style={{ color: '#f0f6fc', fontWeight: 600 }}>{name}</div>
          <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: string) => (
        <Tag style={{ background: '#238636', color: '#fff', border: 'none' }}>v{version}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          ACTIVE: { color: '#3fb950', icon: <CheckCircleOutlined />, text: '生产中' },
          INACTIVE: { color: '#8b949e', icon: <PauseCircleOutlined />, text: '已停用' },
          DEVELOPMENT: { color: '#d29922', icon: <CodeOutlined />, text: '开发中' },
        };
        const { color, icon, text } = config[status] || config.INACTIVE;
        return (
          <Tag icon={icon} style={{ background: 'transparent', color, border: `1px solid ${color}` }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const labels: Record<string, string> = {
          TESTING: '测试',
          MONITORING: '监控',
          AUTOMATION: '自动化',
          INTEGRATION: '集成',
        };
        return <Tag style={{ background: '#1f6feb', color: '#fff', border: 'none' }}>{labels[category] || category}</Tag>;
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      sorter: (a, b) => a.usageCount - b.usageCount,
      render: (count: number) => (
        <Badge
          count={count || 0}
          style={{ backgroundColor: (count || 0) > 100 ? '#238636' : '#8b949e' }}
        />
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (date: string) => date ? date.replace('T', ' ').substring(0, 16) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record: Skill) => (
        <Space size="small">
          <Tooltip title="查看代码">
            <Button
              icon={<GithubOutlined />}
              size="small"
              onClick={() => window.open(record.codeUrl, '_blank')}
            >
              代码
            </Button>
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? '停用' : '启用'}>
            <Button
              icon={record.status === 'ACTIVE' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              type={record.status === 'ACTIVE' ? 'default' : 'primary'}
              danger={record.status === 'ACTIVE'}
              onClick={() => updateStatus(record.id, record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            >
              {record.status === 'ACTIVE' ? '停用' : '启用'}
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="删除后不可恢复，是否继续？"
            onConfirm={() => deleteSkill(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCount = skills.filter(s => s.status === 'ACTIVE').length;
  const devCount = skills.filter(s => s.status === 'DEVELOPMENT').length;
  const totalUsage = skills.reduce((sum, s) => sum + (s.usageCount || 0), 0);

  return (
    <div>
      <Title level={4} style={{ color: '#f0f6fc', marginBottom: 24 }}>
        <ToolOutlined /> 技能管理
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#3fb950', fontWeight: 'bold' }}>{activeCount}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>生产中技能</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#d29922', fontWeight: 'bold' }}>{devCount}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>开发中</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#58a6ff', fontWeight: 'bold' }}>{totalUsage}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>总调用次数</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#a371f7', fontWeight: 'bold' }}>{skills.length}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>技能总数</div>
          </div>
        </Card>
      </div>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>技能列表</span>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
              >
                新增技能
              </Button>
              <Button
                icon={<SyncOutlined spin={syncLoading} />}
                onClick={syncFromGithub}
                loading={syncLoading}
              >
                同步仓库
              </Button>
              <Button onClick={fetchSkills} loading={loading}>刷新</Button>
            </Space>
          </div>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={skills}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <div style={{ marginTop: 24, padding: 16, background: '#161b22', borderRadius: 8, border: '1px solid #30363d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#d29922' }} />
          <Text style={{ color: '#d29922', fontWeight: 600 }}>生产环境技能管理规范</Text>
        </div>
        <ul style={{ color: '#8b949e', margin: 0, paddingLeft: 24 }}>
          <li>所有生产技能必须在 GitHub 有对应仓库，代码需经过 Review</li>
          <li>技能发布前需通过 E2E 自动化测试</li>
          <li>生产技能版本号遵循 Semver 规范</li>
          <li>停用技能需提前通知使用方，保留至少 7 天过渡期</li>
        </ul>
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingSkill ? '编辑技能' : '新增技能'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSkill(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveSkill}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="技能名称"
            rules={[{ required: true, message: '请输入技能名称' }]}
          >
            <Input placeholder="例如：飞书IM同步" />
          </Form.Item>

          <Form.Item
            name="description"
            label="技能描述"
            rules={[{ required: true, message: '请输入技能描述' }]}
          >
            <TextArea rows={3} placeholder="描述技能的功能和用途" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="选择分类">
                <Option value="TESTING">测试</Option>
                <Option value="MONITORING">监控</Option>
                <Option value="AUTOMATION">自动化</Option>
                <Option value="INTEGRATION">集成</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="version"
              label="版本号"
              rules={[{ required: true, message: '请输入版本号' }]}
            >
              <Input placeholder="1.0.0" />
            </Form.Item>
          </div>

          <Form.Item
            name="codeUrl"
            label="代码仓库URL"
            rules={[{ required: true, message: '请输入代码仓库地址' }]}
          >
            <Input placeholder="https://github.com/..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '请输入作者' }]}
            >
              <Input placeholder="狼头" />
            </Form.Item>

            <Form.Item name="tags" label="标签">
              <Input placeholder="webhook, sync, 用逗号分隔" />
            </Form.Item>
          </div>

          {editingSkill && (
            <Form.Item name="status" label="状态">
              <Select>
                <Option value="ACTIVE">生产中</Option>
                <Option value="INACTIVE">已停用</Option>
                <Option value="DEVELOPMENT">开发中</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SkillManagement;
