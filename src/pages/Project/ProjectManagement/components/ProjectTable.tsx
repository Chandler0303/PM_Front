import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Divider,
  Input,
  Cascader,
  DatePicker,
  Table,
  Tooltip,
  Popconfirm,
} from "antd";
import { DeleteOutlined, EditOutlined, ToolOutlined } from "@ant-design/icons";
import { TableRecordData } from "../index.type";
import { ColumnsType } from "antd/lib/table";
import {
  businessTypeDict,
  projectStatusDict,
  projectTypeDict,
} from "@/common/dict";
import AuthWrapper from "@/components/AuthWrapper";
import { UserInfo } from "@/models/index.type";

interface ProjectTableProps {
  loading: boolean;
  data: TableRecordData[];
  procedureList: any[];
  processHandler: any;
  userList: UserInfo[]
}

const ProjectTable: React.FC<ProjectTableProps> = React.memo(
  ({ loading, data, procedureList, processHandler, userList }) => {
    console.log("table 刷新了");
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

     useEffect(() => {
        tableColumnsHandle();
      }, [procedureList]);

    return (
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
    );
  }
);

export default ProjectTable;
