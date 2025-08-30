/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useCallback, useState } from "react";
import { useSetState, useMount } from "react-use";
import {
  Button,
  Input,
  Table,
  message,
  Divider,
  DatePicker,
  Tooltip,
  Popconfirm,
  Cascader,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ToolOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数
import pmApi from "@/api/pm";
import sysApi from "@/api/sys";
import {
  projectStatusDict,
  projectTypeDict,
  businessTypeDict,
} from "@/common/dict";
import AuthWrapper from "@/components/AuthWrapper";
import ProcessHandlerFactory from "@/util/processHandler";

const processHandler = ProcessHandlerFactory.create("A");

// ==================
// 类型声明
// ==================
import {
  TableRecordData,
  ModalType,
  SearchInfo,
  CompanyInfo,
} from "./index.type";
import { ColumnsType } from "antd/lib/table";
// ==================
// CSS
// ==================
import "./index.less";
import ImportModal from "./components/ImportModal";
import TaskModal from "./components/TaskModal";
import AddEditModal from "./components/AddEditModal";
import { UserInfo } from "@/models/index.type";

// ==================
// 本组件
// ==================
function ProjectMgContainer(): JSX.Element {
  console.log("主页刷新");

  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [companyList, setCompanyList] = useState<SelectData[]>([]);
  const [userList, setUserList] = useState<UserInfo[]>([])
  const [columns, setColumns] = useState<ColumnsType<TableRecordData>>([
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: 30,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "工程编号",
      dataIndex: "projCode",
      key: "projCode",
      width: 80,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "年度",
      dataIndex: "year",
      key: "year",
      width: 40,
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
      width: 100,
      render: (v: number, record: TableRecordData) => {
        const nowStage = processHandler.calcProjectStage(record)
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
      width: 80,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "项目类型",
      dataIndex: "type",
      key: "type",
      width: 50,
      render: (v: number) => {
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
      width: 50,
      render: (v: number, record: TableRecordData) => {
        const data = projectStatusDict.find((s) => s.value == v);
        return data ? data.label + (record.shelve ? " (搁置)" : "") : "--";
      },
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "业务类型",
      dataIndex: "businessType",
      key: "businessType",
      width: 50,
      render: (v: number) => {
        const data = businessTypeDict.find((s) => s.value == v);
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
      width: 60,
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
      width: 50,
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
                onClick={() =>
                  setActiveModal({
                    operateType: "edit",
                    nowData: record,
                  })
                }
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
              onClick={() =>
                setActiveModal({
                  operateType: "task",
                  nowData: record,
                })
              }
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

  const [activeModal, setActiveModal] = useState<ModalType>({
    operateType: null,
    nowData: null,
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
      } else if (processHandler.statusNodeKeys.includes(node.name)) {
        // 查询未完成/已完成
        if (nodesStatus[2] === 0) {
          filterStatus = node.status === 0;
        } else {
          filterStatus = node.status === 1;
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

          if (node.name === "开工日期") {
            if (nodesStatus[2] === 0) {
              filterStatus = aStart > pStart;
            } else {
              filterStatus = !(aStart > pStart);
            }
          } else if (node.name === "竣工日期") {
            if (nodesStatus[2] === 0) {
              filterStatus = aEnd > pEnd;
            } else {
              filterStatus = !(aEnd > pEnd);
            }
          } else {
            if (nodesStatus[2] === 0) {
              filterStatus = aEnd - aStart > pEnd - pStart;
            } else {
              filterStatus = !(aEnd - aStart > pEnd - pStart);
            }
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
        processHandler.setNodeType();
        tableColumnsHandle();
        setStagesOptions(
          stagesOptionsHandle(processHandler.getProcedureStages())
        );
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
        setUserList(res.data)
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

  const modalClose = useCallback((refresh = false) => {
    setActiveModal({
      operateType: null,
      nowData: null,
    });
    if (refresh) {
      onGetData();
    }
  }, []);

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
                label:
                  processHandler.startTimeNodeKeys.includes(node.name) ||
                  processHandler.statusNodeKeys.includes(node.name)
                    ? "未完成"
                    : "超时",
                value: 0,
              },
              {
                label:
                  processHandler.startTimeNodeKeys.includes(node.name) ||
                  processHandler.statusNodeKeys.includes(node.name)
                    ? "已完成"
                    : "正常",
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

    const oneColumns: ColumnsType<TableRecordData> = stages.map(
      (stage: any) => {
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
                      title: node.plannedDays || "--",
                      key: stage.seq + "-" + node.seq + "-" + "start",
                      dataIndex: stage.seq + "-" + node.seq + "-" + "tart",
                      align: "center",
                      width: 80,
                      onCell: (record: any) => {
                        return processHandler.calcCell(record, node);
                      },
                      render: (v: any, record: any) => {
                        return processHandler.calcVal(record, node);
                      },
                    },
                  ],
                };
              }),
            },
          ],
        };
      }
    );

    setColumns([
      ...columns.slice(0, columns.length - 1),
      ...oneColumns,
      columns[columns.length - 1],
    ]);
  };

  const userHandle = (users: string[]) => {
    const userObj = processHandler.userDataHandle(users, userList);
    const keys = Object.keys(userObj);
    return (
      <>
        {keys.length
          ? keys.map((key) => (
              <div key={key}>
                {key}（{userObj[key].join("、")}）
              </div>
            ))
          : "--"}
      </>
    );
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
                onClick={() =>
                  setActiveModal({
                    operateType: "add",
                    nowData: null,
                  })
                }
              >
                添加项目
              </Button>
            </AuthWrapper>
          </li>
          <li style={{ marginLeft: "10px" }}>
            <AuthWrapper code="1001">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() =>
                  setActiveModal({
                    operateType: "import",
                    nowData: null,
                  })
                }
              >
                导入项目
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
          className="my-table"
          rowKey="newId"
          scroll={{ x: "300", y: "60vh" }}
          bordered
          size="small"
          pagination={false}
        />
      </div>

      {/* 模态框 */}
      {(activeModal.operateType === "add" ||
        activeModal.operateType === "edit") && (
        <AddEditModal
          open={
            activeModal.operateType === "add" ||
            activeModal.operateType === "edit"
          }
          onClose={modalClose}
          companyList={companyList}
          userList={userList}
          type={activeModal.operateType}
          data={activeModal.nowData}
          processHandler={processHandler}
        />
      )}

      {activeModal.operateType === "task" && (
        <TaskModal
          open={activeModal.operateType === "task"}
          onClose={modalClose}
          data={activeModal.nowData}
          processHandler={processHandler}
        />
      )}

      {activeModal.operateType === "import" && (
        <ImportModal
          open={activeModal.operateType === "import"}
          onClose={modalClose}
          companyList={companyList}
          processHandler={processHandler}
        />
      )}
    </div>
  );
}

export default ProjectMgContainer;
