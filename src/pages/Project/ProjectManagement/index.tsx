/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useState, useMemo, useRef, Children } from "react";
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
  Switch,
  Cascader,
} from "antd";

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
import ProcessHandlerFactory from '@/util/processHandler'

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


const processHandler = ProcessHandlerFactory.create('A');

// ==================
// 类型声明
// ==================
import {
  TableRecordData,
  operateType,
  ModalType,
  SearchInfo,
  CompanyInfo,
} from "./index.type";
import { UserInfo } from "@/models/index.type";
import { ColumnsType } from "antd/lib/table";
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
  const [nodesData, setNodesData] = useState<SelectData[]>([]);
  const [taskPower, setTaskPower] = useState(false);
  const isTaskMg = useAuthPowers("1003");
  const userinfo = useSelector((state: RootState) => state.app.userinfo);
  const [columns, setColumns] = useState<ColumnsType<TableRecordData>>([
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
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
      title: "项目阶段",
      dataIndex: "stage",
      key: "stage",
      width: 150,
      render: (v: number, record: TableRecordData) => {
        let lastIndex = record.stages.findLastIndex((s) => {
          return s.nodes.every((n: any) => processHandler.isNodeComplete(n));
        });
        lastIndex =
          lastIndex === record.stages.length - 1 ? lastIndex : lastIndex + 1;
        const nowStage = record.stages[lastIndex];
        return nowStage.seq + "." + nowStage.name;
      },
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
      title: "工程状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: number, record: TableRecordData) => {
        const data = projectStatusDict.find((s) => s.value == v);
        return data ? data.label + (record.shelve ? " (搁置)" : "") : "--";
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
        return record.company ? (record.company as any).name : "--";
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
      width: 100,
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
            <span
              key="2"
              className="control-btn blue"
              onClick={() => onModalShow(record, "handle")}
            >
              <Tooltip placement="top" title="流程管理">
                <EditOutlined
                  className="g-icon"
                  style={{ marginRight: "10px" }}
                />
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
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
  ]);
  const [stagesOptions, setStagesOptions] = useState<SelectData[]>([]);

  // 模态框相关参数
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // see查看，add添加，up修改
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  const [modalForm, setModalForm] = useSetState({
    status: 1,
    shelve: false,
    nodeLabel: "",
  });

  // 搜索相关参数
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    name: undefined, // 用户名
    year: undefined, // 年份
    nodeStatus: undefined, // 节点状态
  });

  // 生命周期 - 组件挂载时触发一次
  useMount(async () => {
    onGetCompanyData();
    await onGetUserData();
    await onGetProcedureData();
    onGetData();
  });

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    setLoading(true);
    try {
      const res = await pmApi.getProjectList({
        ...searchInfo,
      });
      if (res && res.success) {
        let data = res.data;
        if (searchInfo.nodeStatus) {
          data = filterDataHandle(data);
        }
        const list = processHandler.tableDataSortHandler(data);
        setData(tools.processRowSpan(list, "id"));
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  function filterDataHandle(data: any[]) {
    const nodesStatus = searchInfo.nodeStatus || [];
    if (!nodesStatus.length) {
      return data;
    }
    // let filterStatus = nodesStatus[2]

    data = data.filter((p) => {
      const stage = p.stages.find((s: any) => s.seq === nodesStatus[0]);
      const node = stage.nodes.find((n: any) => n.seq === nodesStatus[1]);
      let filterStatus = false;
      if (processHandler.startTimeNodeKeys.includes(node.name)) {
        // 查询未完成/已完成
        if (nodesStatus[2] === 0) {
          filterStatus = !processHandler.isNodeComplete(node);
        } else {
          filterStatus = processHandler.isNodeComplete(node);
        }
      } else {
        // 查询延误/未延误
        if (processHandler.isNodeComplete(node)) {
          const pStart = new Date(
            tools.formatDate(node.plannedStart, "YYYY-MM-DD")
          ).getTime();
          const pEnd = new Date(
            tools.formatDate(node.plannedEnd, "YYYY-MM-DD")
          ).getTime();
          const aStart = new Date(
            tools.formatDate(node.actualStart, "YYYY-MM-DD")
          ).getTime();
          const aEnd = new Date(
            tools.formatDate(node.actualEnd, "YYYY-MM-DD")
          ).getTime();

          if (nodesStatus[2] === 0) {
            filterStatus = aEnd - aStart > pEnd - pStart;
          } else {
            filterStatus = !(aEnd - aStart > pEnd - pStart);
          }
        }
      }
      return filterStatus;
    });

    return data;
  }

  async function onGetProcedureData(): Promise<void> {
    return new Promise(async function (resolve, reject) {
      const res = await pmApi.getProcedureList();
      if (res && res.success) {
        // 设置流程配置
        processHandler.setProcedureConfig(res.data[0]);
        tableColumnsHandle();
        setStagesOptions(stagesOptionsHandle(processHandler.getProcedureStages()));
        resolve();
      } else {
        message.error(res?.message ?? "数据获取失败");
        reject();
      }
    });
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
    return new Promise(async function (resolve, reject) {
      const res = await sysApi.getUserList(tools.clearNull({ name: "" }));
      if (res && res.success) {
        userList = res.data;
        resolve();
      } else {
        message.error(res?.message ?? "数据获取失败");
        reject();
      }
    });
  }

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
            company: (data.company as any).id,
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
          data.stages.forEach((stage) => {
            stage.nodes.forEach((node: any) => {
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
          const selectNode: any = getCurrentNowTask(nodes);
          setModalForm({
            ...modalForm,
            shelve: Boolean(data.shelve),
            nodeLabel: selectNode.label,
            status: data.status,
          });
          const formValues = {
            status: data.status,
            shelve: Boolean(modal.nowData?.shelve),
            task: selectNode.value,
            plannedStart: tools.formatAntDate(
              tools.formatDate(selectNode.data.plannedStart),
              "YYYY-MM-DD"
            ),
            plannedEnd: tools.formatAntDate(
              tools.formatDate(selectNode.data.plannedEnd),
              "YYYY-MM-DD"
            ),
            actualStart: tools.formatAntDate(
              tools.formatDate(selectNode.data.actualStart),
              "YYYY-MM-DD"
            ),
            actualEnd: tools.formatAntDate(
              tools.formatDate(selectNode.data.actualEnd),
              "YYYY-MM-DD"
            ),
          };
          form.setFieldsValue(formValues);
          const configNode = processHandler.getNodeConfig(
            selectNode.data.name
          );
          setTaskPower(
            isTaskMg || processHandler.taskPowersCheck(configNode, selectNode.data, userinfo?.username)
          );
        }
      }
    });
  };

  // 当前用户需要处理的task
  const getCurrentNowTask = (allTasks: any[]) => {
    const userId = userinfo?.username;
    const userTaskList: any[] = [];
    let filterTasks: any[] = [];
    let selectTask: any = [];
    const configNodes = processHandler.getProcedureNodes()
    configNodes.forEach((n: any) => {
        if (n.participants.find((p: string) => p == userId)) {
          userTaskList.push(n);
        }
      });

    if (userTaskList.length) {
      filterTasks = allTasks.filter((t) => {
        if (userTaskList.find((ut) => ut.name === t.label)) {
          return true;
        }
        return false;
      });
    }

    filterTasks = filterTasks.length ? filterTasks : allTasks;

    let selectTaskIndex =
      filterTasks.findLastIndex((ft) => ft.data.actualEnd) + 1;
    if (selectTaskIndex > filterTasks.length - 1) {
      selectTaskIndex = filterTasks.length - 1;
    }
    selectTask = filterTasks[selectTaskIndex];
    return selectTask;
  };

  const taskChange = (val: number) => {
    const findNode: any = nodesData.find((n) => n.value === val);
    const node = findNode ? findNode.data : {};
    setModalForm({
      ...modalForm,
      shelve: Boolean(modal.nowData?.shelve),
      nodeLabel: findNode.label,
      status: modal.nowData?.status,
    });
    form.setFieldsValue({
      task: val,
      status: modal.nowData?.status,
      shelve: Boolean(modal.nowData?.shelve),
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
    const configNode = processHandler.getNodeConfig(node.name);
    setTaskPower(isTaskMg || processHandler.taskPowersCheck(configNode, node, userinfo?.username));
  };

  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (modal.operateType === "add") {
        addProject({
          ...values,
          year: Number(values.year.format("YYYY")),
          stage: 1,
          status: 1,
          stages: createStages(),
        });
      } else if (modal.operateType === "up") {
        editProject({
          ...values,
          year: Number(values.year.format("YYYY")),
          id: modal.nowData?.id,
        });
      } else {
        if (modalForm.nodeLabel === "项目施工") {
          editProject({
            ...modal.nowData,
            shelve: Number(modalForm.shelve),
            status: modalForm.status,
          });
        }
        editHandleProcedure(values);
      }
    } catch {
      // 未通过校验
    }
  };

  const addProject = async (values: any) => {
    setModal({
      modalLoading: true,
    });
    // 新增
    try {
      const res: Res | undefined = await pmApi.addProject(values);
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
  };

  const editProject = async (values: any) => {
    setModal({
      modalLoading: true,
    });
    try {
      const res: Res | undefined = await pmApi.editProject(values);
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
  };

  const editHandleProcedure = async (values: any) => {
    const findIndex = nodesData.findIndex(
      (n) => n.label === modalForm.nodeLabel
    );

    if (processHandler.startTimeNodeKeys.includes(modalForm.nodeLabel)) {
      values.plannedStart = values.actualEnd;
      values.plannedEnd = values.actualEnd;
      values.actualStart = values.actualEnd;
    }

    if (processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel) && !values.plannedEnd) {
      message.error("请先处理完上一个节点");
      return;
    }

    setModal({
      modalLoading: true,
    });
    try {
      const promiseList = [];
      promiseList.push(
        pmApi.editProjectNode({
          ...values,
          id: values.task,
          task: undefined,
        })
      );
      // 如果是开始节点，则后续所有节点的计划时间都要跟着变，下一个实际开始时间也要变
      if (processHandler.startTimeNodeKeys.includes(modalForm.nodeLabel)) {
        let pStart = values.plannedEnd;
        let pEnd = values.plannedEnd;
        for (let i = findIndex + 1; i < nodesData?.length; i++) {
          const nextNode = nodesData[i].data;
          if (processHandler.startEndTimeNodeKeys.includes(nextNode.name)) {
            break;
          }
          if (processHandler.startTimeNodeKeys.includes(nextNode.name)) {
            break;
          }

          pEnd = tools.formatAntDate(
            tools.addDays(pEnd, processHandler.getNodeConfig(nextNode.name).plannedDays),
            "YYYY-MM-DD"
          );
          const eidtNode: any = {
            plannedStart: pStart,
            plannedEnd: pEnd,
            id: nextNode.id,
          };

          if (findIndex + 1 === i) {
            eidtNode.actualStart = pStart;
          }

          promiseList.push(pmApi.editProjectNode(eidtNode));
          pStart = pEnd;
        }
      } else if (processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel)) {
        // 如果是结束节点，则下一个节点的实际开始时间要跟着变
        const nextNode = nodesData[findIndex + 1].data;
        if (nodesData[findIndex + 1] && processHandler.endTimeNodeKeys.includes(nextNode.name)) {
          promiseList.push(
            pmApi.editProjectNode({
              actualStart: values.actualEnd,
              id: nextNode.id,
            })
          );
        }
      }
      const res: any[] = await Promise.all(promiseList);
      if (res[0] && res[0].success) {
        message.success("修改成功");
        onGetData();
        onClose();
      } else {
        message.error(res[0]?.message ?? "操作失败");
      }
    } finally {
      setModal({
        modalLoading: false,
      });
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
    const stages = processHandler.getProcedureStages();
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

  const stagesOptionsHandle = (stages: any[]) => {
    return stages.map((stage: any) => {
      return {
        label: stage.stageName,
        value: stage.seq,
        children: stage.nodes.map((node: any) => {
          return {
            label: node.name,
            value: node.seq,
            children: [
              {
                label: processHandler.startTimeNodeKeys.includes(node.name) ? "未完成" : "超时",
                value: 0,
              },
              {
                label: processHandler.startTimeNodeKeys.includes(node.name) ? "已完成" : "正常",
                value: 1,
              },
            ],
          };
        }),
      };
    });
  };

  const tableColumnsHandle = () => {
    const stages = processHandler.getProcedureStages();

    const oneColumns: ColumnsType<TableRecordData> = stages.map((stage: any) => {
      const participantsList: any = [];
      stage.nodes.forEach((n: any) => {
        n.participants.forEach((p: string) => {
          if (!participantsList.find((p2: string) => p2 === p)) {
            participantsList.push(p);
          }
        });
      });
      return {
        title: stage.stageName, // 阶段
        align: "center",
        children: [
          {
            title: userHandle(participantsList), // 负责人
            align: "center",
            children: stage.nodes.map((node: any) => {
              return {
                title: node.name, // 节点
                align: "center",
                children: [
                  {
                    title: node.plannedDays || "--", // 制度要求时间
                    align: "center",
                    children: initNodesData(stage, node),
                  },
                ],
              };
            }),
          },
        ],
      };
    });

    setColumns([
      ...columns.slice(0, columns.length - 1),
      ...oneColumns,
      columns[columns.length - 1],
    ]);
  };
  const initNodesData = (stage: any, node: any) => {
    let children: ColumnsType = [
      {
        title: "开始时间",
        key: stage.seq + "-" + node.seq + "-" + "start",
        dataIndex: stage.seq + "-" + node.seq + "-" + "tart",
        align: "center",
        width: 100,
        onCell: (record: any) => {
          return processHandler.calcStartTimeCell(record, node);
        },
        render: (v: any, record: any) => {
          return processHandler.calcStartTime(record, node);
        },
      },
      {
        title: "结束时间",
        key: stage.seq + "-" + node.seq + "-" + "end",
        dataIndex: stage.seq + "-" + node.seq + "-" + "end",
        width: 100,
        align: "center",
        onCell: (record: any) => {
          return processHandler.calcEndTimeCell(record, node);
        },
        render: (v: any, record: any) => {
          return processHandler.calcEndTime(record, node);
        },
      },
    ];
    // 如果是开始时间节点，则不显示实际开始时间
    if (processHandler.startTimeNodeKeys.find((k) => k === node.name)) {
      children = children.filter((c) => c.title === "开始时间");
      children[0].title = "--";
    }
    if (processHandler.endTimeNodeKeys.find((k) => k === node.name)) {
      children = children.filter((c) => c.title === "结束时间");
      children[0].title = "--";
    }

    if (node.name === "项目施工") {
      children.push({
        title: "项目工期",
        key: stage.seq + "-" + node.seq + "-" + "days",
        dataIndex: stage.seq + "-" + node.seq + "-" + "days",
        width: 100,
        align: "center",
        onCell: (record: any) => {
          return processHandler.calcProjectPlanDurationCell(record, node);
        },
        render: (v: any, record: any) => {
          return processHandler.calcProjectPlanDuration(record, node);
        },
      });
    }
    return children;
  };

  const userHandle = (users: string[]) => {
    const userObj = processHandler.userDataHandle(users, userList)
    const keys = Object.keys(userObj)
    return (
      <>
        {keys.length ? keys.map((key) => (
          <div key={key}>
            {key}（{userObj[key].join("、")}）
          </div>
        )) : '--'}
      </>
    );
  };

  const renderFields = (fields: any[]) => {
    return fields
      .filter((field) => field.show?.() ?? true)
      .map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          required={
            typeof field.required === "function"
              ? field.required()
              : field.required
          }
          {...formItemLayout}
          rules={
            typeof field.required === "function" ? field.rules() : field.rules
          }
        >
          {field.type === "date" || field.type === "year" ? (
            <DatePicker
              style={{ width: "100%" }}
              picker={field.type}
              format={field.format}
              disabled={
                typeof field.disabled === "function"
                  ? field.disabled()
                  : field.disabled
              }
              placeholder={`请选择${field.label}`}
            />
          ) : field.type === "select" ? (
            <Select
              options={field.options}
              placeholder={`请选择${field.label}`}
              onChange={field.onChange}
            />
          ) : field.type === "switch" ? (
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              checked={field.value}
              defaultChecked={modalForm.shelve}
              onChange={field.onChange}
            />
          ) : (
            <Input placeholder={`请输入${field.label}`} />
          )}
        </Form.Item>
      ));
  };

  const handleFields = [
    {
      label: "任务",
      name: "task",
      type: "select",
      options: nodesData,
      required: true,
      onChange: taskChange,
    },
    {
      label: "工程状态",
      name: "status",
      type: "select",
      required: true,
      options: projectStatusDict,
      placeholder: "请选择状态",
      rules: [{ required: true, message: "请选择状态" }],
      show: () => modalForm.nodeLabel === "项目施工",
      onChange: (v: number) => {
        setModalForm({
          ...modalForm,
          status: v,
        });
      },
    },
    {
      label: "搁置",
      name: "shelve",
      type: "switch",
      show: () => modalForm.nodeLabel === "项目施工",
      required: true,
      onChange: (v: boolean) => {
        setModalForm({
          ...modalForm,
          shelve: v,
        });
      },
    },
    {
      label: "计划开始时间",
      name: "plannedStart",
      type: "date",
      required: () => modalForm.nodeLabel === "项目施工",
      rules: () =>
        modalForm.nodeLabel === "项目施工"
          ? [{ required: true, message: `请选择计划开始时间` }]
          : [],
      disabled: () => !taskPower,
      show: () => processHandler.startEndTimeNodeKeys.includes(modalForm.nodeLabel),
    },
    {
      label: "计划结束时间",
      name: "plannedEnd",
      type: "date",
      required: () => modalForm.nodeLabel === "项目施工",
      rules: () =>
        modalForm.nodeLabel === "项目施工"
          ? [{ required: true, message: `请选择计划结束时间` }]
          : [],
      disabled: () => {
        return processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel) ? true : !taskPower;
      },
      show: () =>
        processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel) ||
        processHandler.startEndTimeNodeKeys.includes(modalForm.nodeLabel),
    },
    {
      label: "实际开始时间",
      name: "actualStart",
      type: "date",
      required: () => {
        if (modalForm.status !== 1 && modalForm.nodeLabel === "项目施工") {
          return true;
        }
        return false;
      },
      rules: () => {
        if (modalForm.status !== 1 && modalForm.nodeLabel === "项目施工") {
          return [{ required: true, message: `请选择实际开始时间` }];
        }
        return [];
      },
      disabled: () => !taskPower,
      show: () => processHandler.startEndTimeNodeKeys.includes(modalForm.nodeLabel),
    },
    {
      label: "实际结束时间",
      name: "actualEnd",
      type: "date",
      required: () => {
        if (!processHandler.startEndTimeNodeKeys.includes(modalForm.nodeLabel)) {
          return true;
        } else {
          if (modalForm.status === 3 && modalForm.nodeLabel === "项目施工") {
            return true;
          }
          return false;
        }
      },
      rules: () => {
        if (!processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel)) {
          return [{ required: true, message: `请选择实际结束时间` }];
        } else {
          if (modalForm.status === 3 && modalForm.nodeLabel === "项目施工") {
            return [{ required: true, message: `请选择实际结束时间` }];
          }
          return [];
        }
      },
      disabled: () => !taskPower,
      show: () => true,
    },
  ];

  const projectFields = [
    {
      label: "工程编号",
      name: "projCode",
      type: "input",
      required: true,
      placeholder: "请输入工程编号",
      rules: [{ required: true, whitespace: true, message: "必填" }],
    },
    {
      label: "年度",
      name: "year",
      type: "year",
      required: true,
      placeholder: "请选择年份",
      rules: [{ required: true, message: "必填" }],
    },
    {
      label: "工程名称",
      name: "name",
      type: "input",
      required: true,
      placeholder: "请输入工程名称",
      rules: [{ required: true, whitespace: true, message: "必填" }],
    },
    {
      label: "合同金额",
      name: "amount",
      type: "input",
      required: true,
      placeholder: "请输入合同金额",
      rules: [{ required: true, whitespace: true, message: "必填" }],
    },
    {
      label: "项目类型",
      name: "type",
      type: "select",
      required: true,
      options: projectTypeDict,
      placeholder: "请选择项目类型",
      rules: [{ required: true, message: "请选择项目类型" }],
    },
    {
      label: "分公司",
      name: "company",
      type: "select",
      required: true,
      options: companyList,
      placeholder: "请选择分公司",
      rules: [{ required: true, message: "请选择分公司" }],
    },
  ];

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchInfo({
                    name: e.target.value,
                  });
                }}
              />
            </li>
            {/* <li>
              <Select
                placeholder="请选择延期状态"
                allowClear
                style={{ width: "200px" }}
                onChange={(v: any) => {
                  setSearchInfo({
                    delayedStatus: v,
                  });
                }}
              >
                <Option value={-1}>延期</Option>
                <Option value={1}>正常</Option>
              </Select>
            </li> */}
            <li>
              <Cascader
                style={{ width: "300px" }}
                options={stagesOptions}
                placeholder="请选择节点查询"
                onChange={(value: any) => {
                  setSearchInfo({
                    nodeStatus: value,
                  });
                }}
              />
            </li>
            <li>
              <DatePicker
                picker="year"
                format="YYYY"
                placeholder="请选择年份"
                onChange={(v: any) => {
                  setSearchInfo({
                    year: v ? v.format("YYYY") : "",
                  });
                }}
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
      <div className="diy-table">
        <Table
          columns={columns}
          loading={loading}
          dataSource={data}
          rowKey="newId"
          scroll={{ x: "max-content", y: "45vh" }}
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
          {modal.operateType === "handle"
            ? renderFields(handleFields)
            : renderFields(projectFields)}
        </Form>
      </Modal>
    </div>
  );
}

export default ProjectMgContainer;
