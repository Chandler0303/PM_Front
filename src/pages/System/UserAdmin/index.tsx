/** User 系统管理/用户管理 **/

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
  Select,
  Popconfirm,
  Upload,
} from "antd";
import {
  EditOutlined,
  ToolOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数
import { powers } from "@/router/mens";
import pmApi from "@/api/pm";
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
// 所需的组件
// ==================
import RoleTree from "@/components/TreeChose/RoleTree";

// ==================
// 类型声明
// ==================
import {
  TableRecordData,
  operateType,
  ModalType,
  SearchInfo,
  RoleTreeInfo,
  UserBasicInfoParam,
  OrgInfo,
} from "./index.type";

// ==================
// CSS
// ==================
import "./index.less";
import AuthWrapper from "@/components/AuthWrapper";
import { UploadChangeParam } from "antd/es/upload/interface";

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('请上传JPG/PNG文件!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('文件大小不能超过2MB!');
  }
  return isJpgOrPng && isLt2M;
};

// ==================
// 本组件
// ==================
function UserAdminContainer(): JSX.Element {
  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [orgData, setOrgData] = useState<SelectData[]>([]);
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [imageUrl, setImageUrl] = useState<string | null>(null)
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

  // 权限树相关参数
  const [role, setRole] = useSetState<RoleTreeInfo>({
    roleData: [],
    roleTreeLoading: false,
    roleTreeShow: false,
    roleTreeDefault: [],
  });

  // 生命周期 - 组件挂载时触发一次
  useMount(() => {
    console.log("UserAdminContainer mounted");
    onGetOrgData();
    onGetData();
  });

  // 查询部门
  async function onGetOrgData(): Promise<void> {
    try {
      const res = await pmApi.getOrgList();
      if (res && res.success) {
        setOrgData(
          res.data.map((item: OrgInfo) => {
            return {
              label: item.name,
              value: item.id,
            };
          })
        );
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    const params = {
      name: searchInfo.name,
    };
    setLoading(true);
    try {
      const res = await sysApi.getUserList(tools.clearNull(params));
      if (res && res.success) {
        setData(res.data);
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  // 搜索 - 名称输入框值改变时触发
  const searchUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchInfo({ name: e.target.value });
  };

  // 搜索
  const onSearch = (): void => {
    onGetData();
  };

  /**
   * 添加/修改/查看 模态框出现
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
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        form.setFieldsValue({
          ...data,
          org: data.org.id,
        });
        setImageUrl(data.avatar)
      }
    });
  };

  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setModal({
        modalLoading: true,
      });
      const params: UserBasicInfoParam = {
        avatar: imageUrl,
        username: values.username,
        password: values.password,
        name: values.name,
        org: values.org,
        permissions: "[]",
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Res | undefined = await sysApi.addUser(params);
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
      } else {
        // 修改
        const id = modal.nowData?.id;
        if (!id) {
          return;
        }
        try {
          const res: Res | undefined = await sysApi.upUser(id, params);
          if (res && res.success) {
            message.success("修改成功");
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
      const res = await sysApi.delUser({ id });
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
    setImageUrl(null)
    setModal({
      modalShow: false,
    });
  };

  /** 分配权限按钮点击，权限控件出现 **/
  const onTreeShowClick = (record: TableRecordData): void => {
    const permissions = record.permissions
      ? JSON.parse(record.permissions)
      : [];
    setModal({
      nowData: record,
    });
    setRole({
      roleData: powers.map((p) => {
        return {
          key: p.id,
          title: p.name,
        };
      }),
      roleTreeShow: true,
      roleTreeDefault: permissions,
    });
  };

  // 分配权限确定
  const onRoleOk = async (keys: string[]): Promise<void> => {
    if (!modal.nowData?.id) {
      message.error("未获取到该条数据id");
      return;
    }
    const params = {
      ...modal.nowData,
      permissions: JSON.stringify(keys.map((item) => Number(item))),
    };
    setRole({
      roleTreeLoading: true,
    });
    try {
      const res: Res = await sysApi.upUser(modal.nowData.id, params);
      if (res && res.success) {
        message.success("分配成功");
        onGetData();
        onRoleClose();
      } else {
        message.error(res?.message ?? "操作失败");
      }
    } finally {
      setRole({
        roleTreeLoading: false,
      });
    }
  };

  // 分配权限树关闭
  const onRoleClose = (): void => {
    setRole({
      roleTreeShow: false,
    });
  };

  // ==================
  // 属性 和 memo
  // ==================

  // table字段
  const tableColumns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "账号",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "昵称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "部门",
      dataIndex: "org",
      key: "org",
      render: (v: null, record: TableRecordData) => {
        return record.org.name;
      },
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
            <AuthWrapper code="edit">
              <span
                key="1"
                className="control-btn blue"
                onClick={() => onModalShow(record, "up")}
              >
                <Tooltip placement="top" title="修改">
                  <ToolOutlined
                    className="g-icon"
                    style={{ marginRight: "10px" }}
                  />
                </Tooltip>
              </span>
            </AuthWrapper>
            <AuthWrapper code="powers">
              <span
                key="2"
                className="control-btn blue"
                onClick={() => onTreeShowClick(record)}
              >
                <Tooltip placement="top" title="分配权限">
                  <EditOutlined
                    className="g-icon"
                    style={{ marginRight: "10px" }}
                  />
                </Tooltip>
              </span>
            </AuthWrapper>
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
      setImageUrl(tools.getImageUrl(info.file.response.file.filePath));
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none', cursor: 'pointer' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  );

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
                添加用户
              </Button>
            </AuthWrapper>
          </li>
        </ul>
        <Divider type="vertical" />
        {
          <ul className="search-ul">
            <li>
              <Input
                placeholder="请输入昵称"
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

      {/* 新增&修改&查看 模态框 */}
      <Modal
        title={{ add: "新增", up: "修改" }[modal.operateType]}
        open={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form form={form}>
          <Form.Item
            label="头像"
            name="imageUrl"
            {...formItemLayout}
          >
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              action="/api/common/upload"
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? <img src={imageUrl} alt="file" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item
            label="账号"
            name="username"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "请输入账号" },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input
              placeholder="请输入账号"
              disabled={modal.operateType === "up"}
            />
          </Form.Item>
          <Form.Item
            label="昵称"
            name="name"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "请输入昵称" },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "请输入密码" },
              { min: 6, message: "最少输入6位字符" },
              { max: 18, message: "最多输入18位字符" },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="部门"
            name="org"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择部门" }]}
          >
            <Select placeholder="请选择部门" options={orgData} />
          </Form.Item>
        </Form>
      </Modal>

      <RoleTree
        title={"分配权限"}
        data={role.roleData}
        visible={role.roleTreeShow}
        defaultKeys={role.roleTreeDefault}
        loading={role.roleTreeLoading}
        onOk={onRoleOk}
        onClose={onRoleClose}
      />
    </div>
  );
}

export default UserAdminContainer;
