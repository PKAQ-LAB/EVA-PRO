import { PageContainer } from '@ant-design/pro-components';
import {
  App,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Tabs,
} from 'antd';
import React, { useState } from 'react';
import ProjectMetaForm from './aoeform';
import ColumnTable from './columntable';
import type { ColumnItem, ProjectMeta, TablePane } from './data.d';

const MAIN_KEY = '0';

const initialMain: ColumnItem[] = [
  {
    key: '1',
    columnName: 'name',
    comment: '姓名',
    length: 100,
    columnType: 'varchar',
    nullAble: true,
    codeMapping: '姓名',
    sort: true,
    listShow: false,
    formShow: true,
    searchAble: false,
    componentType: 'input',
    showName: '姓名',
  },
  {
    key: '2',
    columnName: 'age',
    comment: '年龄',
    length: 100,
    columnType: 'int',
    nullAble: true,
    codeMapping: '年龄',
    sort: false,
    listShow: true,
    formShow: false,
    searchAble: true,
    componentType: 'input',
    showName: '年龄',
  },
];

const buildSubKey = (key: string) => `subItem${key}`;

const DevGeneratorPage: React.FC = () => {
  const { message: msg } = App.useApp();
  const [metaForm] = Form.useForm<ProjectMeta>();
  const [tableForm] = Form.useForm<{
    mainTableName?: string;
    [k: string]: unknown;
  }>();
  const [panes, setPanes] = useState<TablePane[]>([
    { key: MAIN_KEY, name: '主表配置' },
  ]);
  const [tabKey, setTabKey] = useState<string>(MAIN_KEY);
  const [items, setItems] = useState<Record<string, ColumnItem[]>>({
    mainItem: [],
  });

  const updateItems = (key: string, rows: ColumnItem[]) => {
    setItems((prev) => ({ ...prev, [key]: rows }));
  };

  // 获取主表（V5 demo: 模拟接口返回 mock 数据）
  const fetchMainColumns = () => {
    setItems((prev) => ({ ...prev, mainItem: initialMain }));
  };

  // 获取子表
  const fetchSubColumns = (subKey: string) => {
    if (items.mainItem.length === 0) {
      msg.error('请先获取主表信息');
      return;
    }
    const mock: ColumnItem[] = [
      {
        key: '1',
        columnName: 'subName',
        comment: `姓名${subKey}`,
        length: 100,
        columnType: 'varchar',
        nullAble: true,
        codeMapping: `姓名${subKey}`,
        sort: true,
        listShow: false,
        formShow: true,
        searchAble: false,
        componentType: 'input',
        showName: `姓名${subKey}`,
      },
    ];
    updateItems(buildSubKey(subKey), mock);
  };

  const handleAddSubList = () => {
    if (items.mainItem.length === 0) {
      msg.error('请先获取主表信息');
      return;
    }
    const newKey = `${panes.length}`;
    setPanes((prev) => [...prev, { key: newKey, name: `子表配置-${newKey}` }]);
    updateItems(buildSubKey(newKey), []);
  };

  const handleSubRemove = (key: string) => {
    if (key === MAIN_KEY) return;
    const filtered = panes
      .filter((p) => p.key !== key)
      .map((p, i) =>
        p.key === MAIN_KEY
          ? p
          : { key: `${i}`, name: i === 0 ? '主表配置' : `子表配置-${i}` },
      );
    setPanes(filtered);
    setTabKey(MAIN_KEY);
    setItems((prev) => {
      const next = { ...prev };
      delete next[buildSubKey(key)];
      return next;
    });
  };

  const currentRows =
    tabKey === MAIN_KEY ? items.mainItem : (items[buildSubKey(tabKey)] ?? []);

  const onCurrentChange = (rows: ColumnItem[]) => {
    if (tabKey === MAIN_KEY) {
      setItems((prev) => ({ ...prev, mainItem: rows }));
    } else {
      updateItems(buildSubKey(tabKey), rows);
    }
  };

  return (
    <PageContainer title="代码生成" subTitle="基于元数据的全栈代码生成">
      <ProjectMetaForm form={metaForm} />
      <Divider>数据库配置</Divider>
      <Form form={tableForm} style={{ padding: '0 35px' }}>
        <Row>
          <Col span={12}>
            <Form.Item
              label="主表名"
              name="mainTableName"
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              <Input placeholder="请输入主表表名" onBlur={fetchMainColumns} />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Button type="primary" onClick={handleAddSubList}>
              添加子表
            </Button>
          </Col>
        </Row>
        <Tabs
          defaultActiveKey={MAIN_KEY}
          activeKey={tabKey}
          onChange={setTabKey}
          items={panes.map((p) => ({
            key: p.key,
            label: p.name,
            children: (
              <>
                {p.key !== MAIN_KEY && (
                  <Row>
                    <Col span={12}>
                      <Form.Item
                        label="表名"
                        labelAlign="left"
                        name={`subName${p.key}`}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Input
                          placeholder="请输入子表表名"
                          onBlur={() => fetchSubColumns(p.key)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button danger onClick={() => handleSubRemove(p.key)}>
                        删除
                      </Button>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="支持导入"
                        labelAlign="left"
                        name={`uploadAble${p.key}`}
                        valuePropName="checked"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Checkbox />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <ColumnTable value={currentRows} onChange={onCurrentChange} />
              </>
            ),
          }))}
        />
      </Form>
    </PageContainer>
  );
};

export default DevGeneratorPage;
