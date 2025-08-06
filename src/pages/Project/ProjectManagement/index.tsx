/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useState, useMemo } from "react";
import { useSetState, useMount } from "react-use";
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
  Tooltip,
  Popconfirm,
  Typography,
} from "antd";
const { Text } = Typography;

import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ToolOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数
import pmApi from "@/api/pm";
import sysApi from "@/api/sys";
import dayjs from "dayjs";
import { projectStatusDict, projectTypeDict } from "@/common/dict";
import AuthWrapper from "@/components/AuthWrapper";

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
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
import { UserInfo } from "@/models/index.type";
import { ColumnsType } from "antd/lib/table";
import { ProcedureInfo } from "../ProcedureManagement/index.type";

// ==================
// CSS
// ==================
import "./index.less";
import { useAuthPowers } from "@/hooks/useAuthPowers";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// ==================
// 本组件
// ==================
function ProjectMgContainer(): JSX.Element {
  let userList: UserInfo[] = [];

  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [companyList, setCompanyList] = useState<SelectData[]>([]);
  const [procedureInfo, setProcedureInfo] = useState<ProcedureInfo>();
  const [nodesData, setNodesData] = useState<SelectData[]>();
  const [taskPower, setTaskPower] = useState(false);
  const isEditTask = useAuthPowers("1003");
  const userinfo = useSelector((state: RootState) => state.app.userinfo);
  const [columns, setColumns] = useState<ColumnsType<TableRecordData>>([
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
      width: 100,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "工程编号",
      dataIndex: "projCode",
      key: "projCode",
      width: 150,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "年度",
      dataIndex: "year",
      key: "year",
      width: 100,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "工程名称",
      dataIndex: "name",
      key: "name",
      width: 150,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "合同金额",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "项目类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v: number, record: TableRecordData) => {
        const data = projectTypeDict.find((s) => s.value == v);
        return data ? data.label : "--";
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "项目阶段",
      dataIndex: "stage",
      key: "stage",
      width: 150,
      render: (v: number, record: TableRecordData) => {
        if (v === 0) {
          return "--";
        }
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "工程状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: number, record: TableRecordData) => {
        const data = projectStatusDict.find((s) => s.value == v);
        return data ? data.label : "--";
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "分公司",
      dataIndex: "companyName",
      key: "companyName",
      width: 100,
      render: (v: number, record: TableRecordData) => {
        return record.company ? record.company.name : "--";
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "时间点",
      key: "durationLabel",
      dataIndex: "durationLabel",
      width: 100,
    },
    {
      title: "操作",
      key: "control",
      dataIndex: "control",
      fixed: "right",
      width:100,
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
                  <ToolOutlined />
                </Tooltip>
              </span>
            </AuthWrapper>
            <span
              key="2"
              className="control-btn blue"
              onClick={() => onModalShow(record, "handle")}
            >
              <Tooltip placement="top" title="流程管理">
                <EditOutlined />
              </Tooltip>
            </span>
            <AuthWrapper code="del">
              <Popconfirm
                key="3"
                title="确定删除吗?"
                onConfirm={() => onDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red">
                  <Tooltip placement="top" title="删除">
                    <DeleteOutlined />
                  </Tooltip>
                </span>
              </Popconfirm>
            </AuthWrapper>
          </>
        );
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
  ]);


  // 模态框相关参数
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // see查看，add添加，up修改
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  // 搜索相关参数
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    name: undefined, // 用户名
    delayedStatus: undefined, // 状态
  });

  // 生命周期 - 组件挂载时触发一次
  useMount(async () => {
    onGetCompanyData();
    onGetUserData();
    onGetProcedureData();
    onGetData();
  });

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    setLoading(true);
    try {
      const res = await pmApi.getProjectList({
        ...searchInfo
      });
      if (res && res.success) {
        const list: TableRecordData[] = [];
        let sum = 0;
        let data = res.data
        if (searchInfo.delayedStatus) {
          data = filterDataHandle(data)
        }
        data.forEach((item: TableRecordData) => {
          list.push({
            ...item,
            newId: item.id + "-" + sum++,
            durationLabel: "计划时间",
          });
          list.push({
            ...item,
            newId: item.id + "-" + sum++,
            durationLabel: "实际时间",
          });
          list.push({
            ...item,
            newId: item.id + "-" + sum++,
            durationLabel: "偏差分析",
          });
          list.push({
            ...item,
            newId: item.id + "-" + sum++,
            durationLabel: "实际工期",
          });
        });
        setData(tools.processRowSpan(list, "id"));
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  function filterDataHandle (data: any[]) {
    data = data.filter(p => {
      let isDelay = searchInfo.delayedStatus === -1 ? false : true
      p.stages.forEach(s => {
          s.nodes.forEach(n => {
            if (n.plannedStart && n.plannedEnd && n.actualEnd && n.actualStart) {
              const pStart = new Date(tools.formatDate(n.plannedStart, 'YYYY-MM-DD')).getTime()
              const pEnd = new Date(tools.formatDate(n.plannedEnd, 'YYYY-MM-DD')).getTime()
              const aStart = new Date(tools.formatDate(n.actualStart, 'YYYY-MM-DD')).getTime()
              const aEnd = new Date(tools.formatDate(n.actualEnd, 'YYYY-MM-DD')).getTime()
              if ((aEnd - aStart) > (pEnd - pStart)) {
                isDelay = searchInfo.delayedStatus === -1 ? true : false
              }
            }
          })
      })
      return isDelay  
    }) 

    return data
  }

  async function onGetProcedureData(): Promise<void> {
    try {
      const res = await pmApi.getProcedureList();
      if (res && res.success) {
        const procedure = res.data[0];
        procedure.stages = JSON.parse(procedure.config).stages;
        setProcedureInfo(procedure);
        tableColumnsHanle(procedure);
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
    try {
      const res = await sysApi.getUserList(tools.clearNull({username: ''}));
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
    setSearchInfo({ name: e.target.value });
  };

  // 搜索 - 状态下拉框选择时触发
  const searchConditionsChange = (v: number): void => {
    setSearchInfo({ delayedStatus: v });
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
      } else if (type === "up") {
        // 修改，需设置表单各控件的值为当前所选中行的数据
        if (data) {
          form.setFieldsValue({
            amount: data.amount,
            company: data.company.id,
            name: data.name,
            projCode: data.projCode,
            status: data.status,
            type: Number(data.type),
            year: dayjs(data.year),
          });
        }
      } else {
        if (data) {
          const nodes: SelectData[] = [];
          data.stages.sort((a, b) => a.seq - b.seq)
          data.stages.forEach((stage) => {
            stage.nodes.sort((a, b) => a.seq - b.seq)
            stage.nodes.forEach((node) => {
              node.parent = {
                name: stage.name,
                seq: stage.seq,
              };
              nodes.push({
                label: node.name,
                value: node.id,
                data: node,
              });
            });
          });
          
          setNodesData(nodes);
          // 获取当前进度节点
          const node =
            nodes.find((n) => !n.data.plannedEnd || !n.data.actualEnd) || {};
          form.setFieldsValue({
            task: node.value,
            plannedStart: tools.formatAntDate(
              tools.formatDate(node.data.plannedStart),
              "YYYY-MM-DD"
            ),

            plannedEnd: tools.formatAntDate(
              tools.formatDate(node.data.plannedEnd),
              "YYYY-MM-DD"
            ),
            actualStart: tools.formatAntDate(
              tools.formatDate(node.data.actualStart),
              "YYYY-MM-DD"
            ),
            actualEnd: tools.formatAntDate(
              tools.formatDate(node.data.actualEnd),
              "YYYY-MM-DD"
            ),
          });

          setTaskPower(
            isEditTask || taskPowersCheck(node.data.participants || [])
          );
        }
      }
    });
  };

  const taskChange = (val: number) => {
    const findNode = nodesData ? nodesData.find((n) => n.value === val) : {};
    const node = findNode ? findNode.data : {};
    form.setFieldsValue({
      task: val,
      plannedStart: tools.formatAntDate(
        tools.formatDate(node.plannedStart),
        "YYYY-MM-DD"
      ),

      plannedEnd: tools.formatAntDate(
        tools.formatDate(node.plannedEnd),
        "YYYY-MM-DD"
      ),
      actualStart: tools.formatAntDate(
        tools.formatDate(node.actualStart),
        "YYYY-MM-DD"
      ),
      actualEnd: tools.formatAntDate(
        tools.formatDate(node.actualEnd),
        "YYYY-MM-DD"
      ),
    });

    const configStage =
      procedureInfo && procedureInfo.stages
        ? procedureInfo.stages.find((s) => s.stageName === node.parent.name)
        : {};
    const configNode =
      configStage && configStage.nodes
        ? configStage.nodes.find((n) => n.name === node.name)
        : {};

    setTaskPower(isEditTask || taskPowersCheck(configNode.participants || []));
  };

  const taskPowersCheck = (usernameList: string[]): boolean => {
    if (!userinfo) {
      return false;
    }
    return usernameList.some((c: string) => c.toString() === userinfo.username);
  };

  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setModal({
        modalLoading: true,
      });
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Res | undefined = await pmApi.addProject({
            ...values,
            year: Number(values.year.format("YYYY")),
            stage: 1,
            stages: createStages(),
          });
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
      } else if (modal.operateType === "up") {
        try {
          const res: Res | undefined = await pmApi.editProject({
            ...values,
            year: Number(values.year.format("YYYY")),
            id: modal.nowData?.id,
          });
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
      } else {
        // 修改
        try {
          const res: Res | undefined = await pmApi.editProjectNode({
            ...values,
            id: values.task,
            task: undefined,
          });
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
      const res = await pmApi.delProject({ id });
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

  const createStages = () => {
    const stages =
      procedureInfo && procedureInfo.stages ? procedureInfo.stages : [];
    return stages.map((stage: any) => {
      return {
        name: stage.stageName,
        seq: stage.seq,
        nodes: stage.nodes.map((node: any) => {
          return {
            name: node.name,
            seq: node.seq,
            principal: "",
          };
        }),
      };
    });
  };

  /** 模态框关闭 **/
  const onClose = () => {
    setModal({
      modalShow: false,
    });
  };


  // ==================
  // 属性 和 memo
  // ==================

  const tableColumnsHanle = (procedure: ProcedureInfo) => {
    const stages = procedure.stages || [];

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
                    children: [
                      {
                        title: "开始时间",
                        key: stage.seq + "-" + node.seq + "-" + "start",
                        dataIndex: stage.seq + "-" + node.seq + "-" + "tart",
                        align: 'center',
                        width: 100,
                        onCell: (record, index) => {
                          return {
                            colSpan:
                              record.durationLabel === "实际工期" ? 2 : 1,
                          };
                        },
                        render: (v: any, record: any) => {
                          const currentStage = record.stages.find(
                            (s) => s.seq === stage.seq
                          );
                          const currentNode = currentStage.nodes.find(
                            (n) => n.seq === node.seq
                          );
                          let val;
                          switch (record.durationLabel) {
                            case "计划时间":
                              val = tools.formatDate(
                                currentNode.plannedStart,
                                "YYYY/MM/DD"
                              );
                              break;
                            case "实际时间":
                              val = tools.formatDate(
                                currentNode.actualStart,
                                "YYYY/MM/DD"
                              );
                              break;
                            case "偏差分析":
                              val = tools.diffDays(
                                currentNode.actualStart,
                                currentNode.plannedStart
                              );
                              break;
                            case "实际工期":
                              val = tools.diffDays(
                                currentNode.actualStart,
                                currentNode.actualEnd
                              );
                              break;
                          }

                          if (record.durationLabel === "偏差分析" && Number(val) < 0) {
                            return <Text type="danger">{val}</Text>;
                          }
                          return val;
                        },
                      },
                      {
                        title: "结束时间",
                        key: stage.seq + "-" + node.seq + "-" + "end",
                        dataIndex: stage.seq + "-" + node.seq + "-" + "end",
                        width: 100,
                        align: 'center',
                        onCell: (record, index) => {
                          return {
                            colSpan:
                              record.durationLabel === "实际工期" ? 0 : 1,
                          };
                        },
                        render: (v: any, record: any) => {
                          const currentStage = record.stages.find(
                            (s) => s.seq === stage.seq
                          );
                          const currentNode = currentStage.nodes.find(
                            (n) => n.seq === node.seq
                          );
                          let val;
                          switch (record.durationLabel) {
                            case "计划时间":
                              val = tools.formatDate(
                                currentNode.plannedEnd,
                                "YYYY/MM/DD"
                              );
                              break;
                            case "实际时间":
                              val = tools.formatDate(
                                currentNode.actualEnd,
                                "YYYY/MM/DD"
                              );
                              break;
                            case "偏差分析":
                              val = tools.diffDays(
                                currentNode.actualEnd,
                                currentNode.plannedEnd
                              );
                              break;
                            case "实际工期":
                              val = tools.diffDays(
                                currentNode.actualStart,
                                currentNode.actualEnd
                              );
                              break;
                          }
                           if (record.durationLabel === "偏差分析" && Number(val) < 0) {
                            return <Text type="danger">{val}</Text>;
                          }
                          return val;
                        },
                      },
                    ],
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
      .join("，") || '--';
  };

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
                placeholder="请输工程名"
                onChange={searchUsernameChange}
                value={searchInfo.name}
              />
            </li>
            <li>
              <Select
                placeholder="请选择延期状态"
                allowClear
                style={{ width: "200px" }}
                onChange={searchConditionsChange}
                value={searchInfo.delayedStatus}
              >
                <Option value={-1}>延期</Option>
                <Option value={1}>正常</Option>
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
          dataSource={data}
          rowKey="newId"
          scroll={{ x: "max-content", y: '45vh' }}
          bordered
          size="small"
          pagination={false}
        />
      </div>

      {/* 模态框 */}
      <Modal
        title={
          { add: "新增", up: "修改", handle: "任务管理" }[modal.operateType]
        }
        open={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        okButtonProps={{
          disabled: modal.operateType === "handle" && !taskPower,
        }}
        confirmLoading={modal.modalLoading}
      >
        <Form
          form={form}
          initialValues={{
            type: 1,
          }}
        >
          {modal.operateType === "handle" ? (
            <>
              <Form.Item
                label="任务"
                name="task"
                {...formItemLayout}
                rules={[{ required: true, message: "请选择任务" }]}
              >
                <Select
                  options={nodesData}
                  placeholder="请选择任务"
                  onChange={taskChange}
                ></Select>
              </Form.Item>
              <Form.Item
                label="计划开始时间"
                name="plannedStart"
                {...formItemLayout}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!taskPower}
                  placeholder="请选择计划开始时间"
                />
              </Form.Item>
              <Form.Item
                label="计划结束时间"
                name="plannedEnd"
                {...formItemLayout}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!taskPower}
                  placeholder="请选择计划结束时间"
                />
              </Form.Item>
              <Form.Item
                label="实际开始时间"
                name="actualStart"
                {...formItemLayout}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!taskPower}
                  placeholder="请选择实际开始时间"
                />
              </Form.Item>
              <Form.Item
                label="实际结束时间"
                name="actualEnd"
                {...formItemLayout}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!taskPower}
                  placeholder="请选择实际结束时间"
                />
              </Form.Item>
            </>
          ) : (
            <>
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
                <Select
                  options={companyList}
                  placeholder="请选择分公司"
                ></Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default ProjectMgContainer;
