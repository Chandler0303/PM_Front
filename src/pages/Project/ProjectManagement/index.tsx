/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useState, useMemo } from "react";
import { useSetState, useMount } from "react-use";
import { useDispatch } from "react-redux";
import {
  Form,
  Button,
  Input,
  Table,
  message,
  Modal,
  Divider,
  Select,
  DatePicker,
} from "antd";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数

const { Option } = Select;

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
  CompanyInfo,
  ProjectInfo,
} from "./index.type";
import { Dispatch } from "@/store";

// ==================
// CSS
// ==================
import "./index.less";
import { ProcedureInfo } from "../ProcedureManagement/index.type";
import { ColumnsType } from "antd/lib/table";
import AuthWrapper from "@/components/AuthWrapper";
import pmApi from "@/api/pm";
import sysApi from "@/api/sys";
import { projectStatusDict, projectTypeDict } from "@/common/dict";
import { UserInfo } from "@/models/index.type";

// ==================
// 本组件
// ==================
function ProjectMgContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();

  let userList: UserInfo[] = [];

  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [companyList, setCompanyList] = useState<SelectData[]>([]);
  const [procedureList, setProcedureList] = useState<ProcedureInfo[]>();
  const [columns, setColumns] = useState<ColumnsType<TableRecordData>>([
    {
      title: "序号",
      dataIndex: "serial",
      key: "serial",
      width: 150,
    },
    {
      title: "工程编号",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "年度",
      dataIndex: "year",
      key: "year",
      width: 150,
    },
    {
      title: "工程名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "合同金额",
      dataIndex: "amount",
      key: "amount",
      width: 150,
    },
    {
      title: "项目类型",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (v: number): JSX.Element =>
        v === 1 ? (
          <span style={{ color: "green" }}>资本类</span>
        ) : (
          <span style={{ color: "red" }}>其他</span>
        ),
    },
    {
      title: "项目阶段",
      dataIndex: "stage",
      key: "stage",
      width: 150,
    },
    {
      title: "工程状态",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (v: number): JSX.Element =>
        v === 1 ? (
          <span style={{ color: "green" }}>未开工</span>
        ) : (
          <span style={{ color: "red" }}>施工中</span>
        ),
    },
    {
      title: "分公司",
      dataIndex: "companyName",
      key: "companyName",
      width: 150,
    },
    {
      title: "时间点",
      key: "durationLabel",
      dataIndex: "durationLabel",
      width: 150,
    },
    {
      title: "操作",
      key: "control",
      width: 200,
      render: (v: null, record: TableRecordData) => {
        return 1;
      },
    },
  ]);

  // 分页相关参数
  const [page, setPage] = useSetState<Page>({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  // 模态框相关参数
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // see查看，add添加，up修改
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  // 搜索相关参数
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    username: undefined, // 用户名
    conditions: undefined, // 状态
  });

  // 生命周期 - 组件挂载时触发一次
  useMount(async () => {
    onGetCompanyData();
    onGetUserData();
    onGetProcedureData();
    onGetData(page);
  });

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(page: {
    pageNum: number;
    pageSize: number;
  }): Promise<void> {
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
    };
    setLoading(true);
    try {
      const res = await pmApi.getProjectList(tools.clearNull(params));
      if (res && res.success) {
        setData([]);
        setPage({
          pageNum: page.pageNum,
          pageSize: page.pageSize,
          total: 0,
        });
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGetProcedureData(): Promise<void> {
    try {
      const res = await pmApi.getProcedureList();
      if (res && res.success) {
        setProcedureList(res.data);
        tableColumnsHanle();
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  // 分公司
  async function onGetCompanyData(): Promise<void> {
    try {
      const res = await pmApi.getCompanyList();
      if (res && res.success) {
        setCompanyList(
          res.data.map((item: CompanyInfo) => {
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

  // 用户
  async function onGetUserData(): Promise<void> {
    const params = {
      pageNum: 1,
      pageSize: 9999,
    };
    try {
      const res = await sysApi.getUserList(tools.clearNull(params));
      if (res && res.success) {
        userList = res.data;
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  // 搜索 - 名称输入框值改变时触发
  const searchUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.value.length < 20) {
      setSearchInfo({ username: e.target.value });
    }
  };

  // 搜索 - 状态下拉框选择时触发
  const searchConditionsChange = (v: number): void => {
    setSearchInfo({ conditions: v });
  };

  // 搜索
  const onSearch = (): void => {
    onGetData(page);
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
        });
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
      const params: ProjectInfo = {
        ...values,
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          params.stages = createStages();
          const res: Res | undefined = await pmApi.addProject(params);
          if (res && res.success) {
            message.success("添加成功");
            onGetData(page);
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
        params.id = modal.nowData?.id;
        try {
          const res: Res | undefined = await dispatch.sys.upUser(params);
          if (res && res.success) {
            message.success("修改成功");
            onGetData(page);
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

  const createStages = () => {
    const stages =
      procedureList && procedureList[0]
        ? JSON.parse(procedureList[0].config).stages
        : [];
    return stages.map((stage: any) => {
      return {
        name: stage.stageName,
        seq: stage.seq,
        nodes: stage.nodes.map((node: any) => {
          return {
            name: node.name,
            seq: node.seq,
          };
        }),
      };
    });
  };

  // 删除某一条数据
  const onDel = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.delUser({ id });
      if (res && res.status === 200) {
        message.success("删除成功");
        onGetData(page);
      } else {
        message.error(res?.message ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
  };

  /** 模态框关闭 **/
  const onClose = () => {
    setModal({
      modalShow: false,
    });
  };

  // 表格页码改变
  const onTablePageChange = (pageNum: number, pageSize: number): void => {
    onGetData({ pageNum, pageSize });
  };

  // ==================
  // 属性 和 memo
  // ==================

  function chineseToBase64Key(str: string) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  const tableColumnsHanle = () => {
    const stages =
      procedureList && procedureList[0]
        ? JSON.parse(procedureList[0].config).stages
        : [];

    const oneColumns = stages.map((stage: any) => {
      return {
        title: stage.stageName,
        children: stage.nodes.map((node: any) => {
          return {
            title: userHandle(node.participants),
            children: [
              {
                title: node.name,
                children: [
                  {
                    title: node.plannedDays || "--",
                    key: chineseToBase64Key(node.stageName),
                    dataIndex: chineseToBase64Key(node.stageName),
                    width: 150,
                  },
                ],
              },
            ],
          };
        }),
      };
    });
    setColumns([
      ...columns.slice(0, columns.length - 1),
      ...oneColumns,
      columns[columns.length - 1],
    ]);
  };

  const userHandle = (users: string[]) => {
    return users
      .map((name) => {
        const user = userList.find((u) => u.username === name);
        return user ? user.name : "";
      })
      .filter((u) => u)
      .join("，");
  };

  // table列表所需数据
  const tableData = useMemo(() => {
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (page.pageNum - 1) * page.pageSize,
        username: item.username,
        password: item.password,
        phone: item.phone,
        email: item.email,
        desc: item.desc,
        conditions: item.conditions,
        control: item.id,
        powers: item.powers,
      };
    });
  }, [page, data]);

  return (
    <div>
      <div className="g-search">
        <ul className="search-func">
          <li>
            <AuthWrapper code="1001">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => onModalShow(null, "add")}
              >
                添加项目
              </Button>
            </AuthWrapper>
          </li>
        </ul>
        <Divider type="vertical" />
        {
          <ul className="search-ul">
            <li>
              <Input
                placeholder="请输入用户名"
                onChange={searchUsernameChange}
                value={searchInfo.username}
              />
            </li>
            <li>
              <Select
                placeholder="请选择状态"
                allowClear
                style={{ width: "200px" }}
                onChange={searchConditionsChange}
                value={searchInfo.conditions}
              >
                <Option value={1}>启用</Option>
                <Option value={-1}>禁用</Option>
              </Select>
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
      <div className="diy-table">
        <Table
          columns={columns}
          loading={loading}
          dataSource={tableData}
          scroll={{ x: "max-content", y: 55 * 5 }}
          bordered
          pagination={{
            total: page.total,
            current: page.pageNum,
            pageSize: page.pageSize,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条数据`,
            onChange: onTablePageChange,
          }}
        />
      </div>

      {/* 新增&修改 模态框 */}
      <Modal
        title={{ add: "新增", up: "修改" }[modal.operateType]}
        open={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form
          form={form}
          initialValues={{
            type: 1,
          }}
        >
          <Form.Item
            label="工程编号"
            name="projCode"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input placeholder="请输入工程编号" />
          </Form.Item>

          <Form.Item
            label="年度"
            name="year"
            {...formItemLayout}
            rules={[{ required: true, message: "必填" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              picker="year"
              format="YYYY"
              placeholder="请选择年份"
            />
          </Form.Item>

          <Form.Item
            label="工程名称"
            name="name"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input placeholder="请输入工程名称" />
          </Form.Item>

          <Form.Item
            label="合同金额"
            name="amount"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input placeholder="请输入合同金额" />
          </Form.Item>

          <Form.Item
            label="项目类型"
            name="type"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择项目类型" }]}
          >
            <Select
              options={projectTypeDict}
              placeholder="请选择项目类型"
            ></Select>
          </Form.Item>

          <Form.Item
            label="工程状态"
            name="status"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select
              options={projectStatusDict}
              placeholder="请选择状态"
            ></Select>
          </Form.Item>

          <Form.Item
            label="分公司"
            name="company"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择分公司" }]}
          >
            <Select options={companyList} placeholder="请选择分公司"></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProjectMgContainer;
