/** Version 系统管理/版本管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useState } from "react";
import { useSetState, useMount } from "react-use";
import {
  Form,
  Button,
  Input,
  Table,
  message,
  Modal,
  Tooltip,
  Divider,
  Popconfirm,
  Upload,
} from "antd";
import {
  PlusCircleOutlined,
  SearchOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数
import sysApi from "@/api/sys";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};


// ==================
// 类型声明
// ==================
import {
  TableRecordData,
  operateType,
  ModalType,
  SearchInfo,
  VersionBasicInfoParam
} from "./index.type";

// ==================
// CSS
// ==================
import "./index.less";
import AuthWrapper from "@/components/AuthWrapper";
import { UploadChangeParam } from "antd/es/upload/interface";
import TextArea from "antd/es/input/TextArea";

const beforeUpload = (file: File) => {
  const isWgt = file.name.indexOf('.wgt') !== -1
  if (!isWgt) {
    message.error('请上传wgt文件!');
  }
  return isWgt;
};

// ==================
// 本组件
// ==================
function AppVersionContainer(): JSX.Element {
  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [wgtUrl, setWgtUrl] = useState<string | null>(null)
  // 模态框相关参数
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // add添加，up修改
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  // 搜索相关参数
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    name: undefined,
  });


  // 生命周期 - 组件挂载时触发一次
  useMount(() => {
    onGetData();
  });

    // 搜索 - 名称输入框值改变时触发
    const searchUsernameChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ): void => {
      setSearchInfo({ name: e.target.value });
    };


  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    const params = {
      name: searchInfo.name,
    };
    setLoading(true);
    try {
      const res = await sysApi.getVersionList(tools.clearNull(params));
      if (res && res.success) {
        res.data.forEach((item: any, index: number) => {
          item.index = index + 1
        })
        setData(res.data);
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  // 搜索
  const onSearch = (): void => {
    onGetData();
  };

  /**
   * 添加 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改/see查看
   * **/
  const onModalShow = (
    data: TableRecordData | null,
    type: operateType
  ): void => {
    setModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        form.resetFields();
      }
    });
  };

  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      if (!wgtUrl) {
          message.warning('请上传wgt包')
          return
        }
      setModal({
        modalLoading: true,
      });
      const params: VersionBasicInfoParam = {
        wgtUrl: wgtUrl as string,
        version: values.version,
        remark: values.remark,
        name: values.name
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Res | undefined = await sysApi.addVersion(params);
          if (res && res.success) {
            message.success("添加成功");
            onGetData();
            onClose();
          } else {
            message.error(res?.message ?? "操作失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      }
    } catch {
      // 未通过校验
    }
  };

  // 删除某一条数据
  const onDel = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await sysApi.delVersion({ id });
      if (res && res.success) {
        message.success("删除成功");
        onGetData();
      } else {
        message.error(res?.message ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
  };

  /** 模态框关闭 **/
  const onClose = () => {
    setWgtUrl(null)
    setModal({
      modalShow: false,
    });
  };



  // ==================
  // 属性 和 memo
  // ==================

  // table字段
  const tableColumns = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "版本名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "版本号",
      dataIndex: "version",
      key: "version",
    },
    {
      title: "描述",
      dataIndex: "remark",
      key: "remark",
      width: 300,
    },
    {
      title: "创建时间",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 180,
      render: (v: string) => {
        return tools.formatDate(v)
      }
    },
    {
      title: "操作",
      key: "control",
      width: 200,
      render: (v: null, record: TableRecordData) => {
        return (
          <>
            <AuthWrapper code="del">
              <Popconfirm
                key="3"
                title="确定删除吗?"
                onConfirm={() => onDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn">
                  <Tooltip placement="top" title="删除">
                    <DeleteOutlined
                      className="g-icon"
                      style={{ color: "red" }}
                    />
                  </Tooltip>
                </span>
              </Popconfirm>
            </AuthWrapper>
          </>
        );
      },
    },
  ];

  const handleChange = (info: UploadChangeParam) => {
    setModal({
      modalLoading: false
    })
    if (info.file.status === 'done' && info.file.response.success) {
      setWgtUrl(tools.getImageUrl(info.file.response.file.filePath));
    }
  };



  return (
    <div>
      <div className="g-search">
        <ul className="search-func">
          <li>
            <AuthWrapper code="add">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => onModalShow(null, "add")}
              >
                添加版本
              </Button>
            </AuthWrapper>
          </li>
        </ul>
        <Divider type="vertical" />
        {
          <ul className="search-ul">
            <li>
              <Input
                placeholder="请输入名称"
                onChange={searchUsernameChange}
                value={searchInfo.name}
              />
            </li>
            <li>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={onSearch}
              >
                搜索
              </Button>
            </li>
          </ul>
        }
      </div>
      <div className="div-table">
        <Table
          columns={tableColumns}
          rowKey="username"
          loading={loading}
          dataSource={data}
          bordered
          scroll={{ x: "max-content", y: "65vh" }}
          pagination={false}
        />
      </div>

      {/* 新增 模态框 */}
      <Modal
        title={{ add: "新增" }[modal.operateType]}
        open={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form form={form}>
          <Form.Item
            label="版本名称"
            name="name"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "请输入版本名称" }
            ]}
          >
            <Input
              placeholder="示例：1.0.0"
            />
          </Form.Item>
          <Form.Item
            label="版本号"
            name="version"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "请输入版本号" },
            ]}
          >
            <Input placeholder="示例：100" />
          </Form.Item>
          <Form.Item
            label="版本包"
            name="wgtUrl"
            {...formItemLayout}
            required
          >
            <Upload
              name="file"
              action="/api/common/upload"
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              <Button type="primary" icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="描述"
            name="remark"
            {...formItemLayout}
          >
            <TextArea placeholder="请输入描述" rows={6} maxLength={512} showCount />
          </Form.Item>
          
        </Form>
      </Modal>

    </div>
  );
}

export default AppVersionContainer;
