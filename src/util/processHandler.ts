import { UserInfo } from "@/models/index.type";
import tools from "./tools";
import { TableRecordData } from "@/pages/Project/ProjectManagement/index.type";
import { act } from "react";

// 1. 定义各流程处理类，统一接口
class BaseProcessHandler {
  procedureConfig: any;
  procedureStages: any[] = [];
  procedureNodes: any[] = [];
  errorColor = "#ff4d4f";
  warningColor = "#faad14";
  normalColor = "#fff";
  tableDataSortHandler(
    tableData: TableRecordData[],
    idKey: string = "id"
  ): TableRecordData[] {
    const list: TableRecordData[] = [];
    let sum = 1;
    // 对每个流程的阶段进行排序
    // 并将每个阶段的节点进行排序
    // 最后将每个流程的阶段和节点进行处理
    // 生成新的表格数据
    tableData.forEach((item: TableRecordData, index: number) => {
      item.stages.sort((a, b) => a.seq - b.seq);
      item.stages.forEach((s) => {
        s.nodes.sort((a: any, b: any) => a.seq - b.seq);
      });
      item.index = index + 1;
      const key = item[idKey as keyof TableRecordData];
      list.push({
        ...item,
        newId: key + "-" + sum++,
        durationLabel: "计划时间",
      });
      list.push({
        ...item,
        newId: key + "-" + sum++,
        durationLabel: "实际时间",
      });
      list.push({
        ...item,
        newId: key + "-" + sum++,
        durationLabel: "偏差分析",
      });
    });
    return list;
  }
  getProcedureStages() {
    return this.procedureStages;
  }
  getProcedureNodes() {
    return this.procedureNodes;
  }
  getNodeConfig(name: string) {
    let node = {
      plannedDays: 0,
    };

    this.procedureStages.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        if (n.name === name) {
          node = n;
        }
      });
    });
    return node;
  }

  getProjectNodeConfig(stages: any[], name: string) {
    let node = {
      name: "",
      status: 0,
      plannedStart: "",
      plannedEnd: "",
      actualStart: "",
      actualEnd: "",
    };

    stages.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        if (n.name === name) {
          node = n;
        }
      });
    });
    return node;
  }

  setProcedureConfig(procedure: any) {
    this.procedureConfig = procedure;
    this.procedureStages = procedure.config.stages || [];
    this.procedureNodes = [];
    this.procedureStages.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        this.procedureNodes.push({
          ...n,
          parent: {
            name: s.stageName,
            seq: s.seq,
          },
        });
      });
    });
  }

  userDataHandle(users: string[], userList: UserInfo[]) {
    const filterUser: (UserInfo | undefined)[] = users
      .map((name: string) => {
        const user: UserInfo | undefined = userList.find(
          (u: UserInfo) => u.username === name
        );
        return user ? user : undefined;
      })
      .filter((u) => u);
    const userObj: any = {};
    filterUser.forEach((u: any) => {
      const orgName = u.org.name as string;
      if (userObj[orgName]) {
        userObj[orgName].push(u.name);
      } else {
        userObj[orgName] = [u.name];
      }
    });
    return userObj;
  }
}

class ProcessAHandler extends BaseProcessHandler {
  startTimeNodeKeys: string[] = [];
  endTimeNodeKeys: string[] = [];
  customTimeNodeKeys: string[] = [];
  statusNodeKeys: string[] = [];
  constructor() {
    super();
  }
  // 初始化配置
  setNodeType() {
    this.startTimeNodeKeys = this.procedureNodes
      .filter((n) => n.plannedDays.toString().indexOf("开始") !== -1)
      .map((n) => n.name);
    this.customTimeNodeKeys = ["开工日期", "竣工日期", "项目工期"];
    this.statusNodeKeys = ["分包招标是否完成", "物资招标是否完成"];
    this.endTimeNodeKeys = this.procedureNodes
      .filter(
        (n) =>
          n.plannedDays.toString().indexOf("开始") === -1 &&
          !this.customTimeNodeKeys.find((item) => item === n.name) &&
          !this.statusNodeKeys.find((item) => item === n.name)
      )
      .map((n) => n.name);
  }

  calcVal(record: any, node: any) {
    if (
      this.startTimeNodeKeys.find((k) => k === node.name) ||
      this.endTimeNodeKeys.find((k) => k === node.name)
    ) {
      return this.calcEndTime(record, node);
    } else if (this.customTimeNodeKeys.find((k) => k === node.name)) {
      return this.calcCustomTime(record, node);
    } else if (this.statusNodeKeys.find((k) => k === node.name)) {
      return this.calcStatusData(record, node);
    }
  }

  calcEndTime(record: any, node: any) {
    const currentNode = this.getProjectNodeConfig(record.stages, node.name);
    let val;
    switch (record.durationLabel) {
      case "计划时间":
        val = tools.formatDate(currentNode.plannedEnd, "YYYY/MM/DD");
        break;
      case "实际时间":
        val = tools.formatDate(currentNode.actualEnd, "YYYY/MM/DD");
        break;
      case "偏差分析":
        val = tools.diffDays(currentNode.plannedEnd, currentNode.actualEnd);
        break;
    }
    return val;
  }
  calcStatusData(record: any, node: any) {
    const currentNode = this.getProjectNodeConfig(record.stages, node.name);
    let val;
    if (currentNode.status === 1) {
      val = "已完成";
    } else {
      const connectNode = this.getProjectNodeConfig(
        record.stages,
        "甲方合同签订时间"
      );
      if (connectNode.actualEnd) {
        val = tools.diffDays(connectNode.actualEnd, new Date());
      } else {
        val = "";
      }
    }
    return val;
  }
  calcCustomTime(record: any, node: any) {
    const currentNode = this.getProjectNodeConfig(record.stages, node.name);
    let val;

    if (node.name === "开工日期") {
      switch (record.durationLabel) {
        case "计划时间":
          val = tools.formatDate(currentNode.plannedStart, "YYYY/MM/DD");
          break;
        case "实际时间":
          val = tools.formatDate(currentNode.actualStart, "YYYY/MM/DD");
          break;
        case "偏差分析":
          if (record.status === 1 && !record.shelve) {
            val = tools.diffDays(
              currentNode.plannedStart,
              currentNode.actualStart || new Date()
            );
          } else {
            val = tools.diffDays(
              currentNode.plannedStart,
              currentNode.actualStart
            );
          }
          break;
      }
    } else if (node.name === "竣工日期") {
      val = this.calcEndTime(record, node);
    } else {
      switch (record.durationLabel) {
        case "计划时间":
          val =
            currentNode.plannedEnd && currentNode.plannedStart
              ? Math.abs(
                  Number(
                    tools.diffDays(
                      currentNode.plannedEnd,
                      currentNode.plannedStart
                    )
                  )
                )
              : "";
          break;
        case "实际时间":
          if (record.shelve) {
            val = "";
          } else {
            if (record.status === 2) {
              val =
                Math.abs(
                  Number(tools.diffDays(new Date(), currentNode.actualStart))
                ) + 1;
            } else {
              val =
                currentNode.actualEnd && currentNode.actualStart
                  ? Math.abs(
                      Number(
                        tools.diffDays(
                          currentNode.actualEnd,
                          currentNode.actualStart
                        )
                      )
                    )
                  : "";
            }
          }
          break;
        case "偏差分析":
          if (record.shelve) {
            val = "";
          } else {
            const start = Math.abs(
              Number(
                tools.diffDays(currentNode.plannedEnd, currentNode.plannedStart)
              )
            );
            let end = 0;
            if (record.status === 1) {
              // end = Math.abs(
              //   Number(tools.diffDays(new Date(), currentNode.plannedStart))
              // );
              // val = end;
            } else if (record.status === 2) {
              val = -(
                start -
                (Math.abs(
                  Number(tools.diffDays(new Date(), currentNode.actualStart))
                ) +
                  1)
              );
            } else {
              end = Math.abs(
                Number(
                  tools.diffDays(currentNode.actualEnd, currentNode.actualStart)
                )
              );
              val = end - start;
            }
          }
          break;
      }
    }

    return val;
  }

  calcCell(record: any, node: any) {
    if (
      this.startTimeNodeKeys.find((k) => k === node.name) ||
      this.endTimeNodeKeys.find((k) => k === node.name)
    ) {
      return this.calcEndTimeCell(record, node);
    } else if (this.customTimeNodeKeys.find((k) => k === node.name)) {
      return this.calcCustomTimeCell(record, node);
    } else if (this.statusNodeKeys.find((k) => k === node.name)) {
      return this.calcStatusDataCell(record, node);
    }
  }
  calcCustomTimeCell(record: any, node: any) {
    if (record.durationLabel !== "偏差分析") {
      return {};
    }
    const currentNode = this.getProjectNodeConfig(record.stages, node.name);
    if (node.name === "开工日期") {
      let val;
      if (record.status === 1 && !record.shelve) {
        val = tools.diffDays(
          currentNode.plannedStart,
          currentNode.actualStart || new Date()
        );
      } else {
        val = tools.diffDays(currentNode.plannedStart, currentNode.actualStart);
      }
      return {
        style: {
          backgroundColor:
            Number(val) > 0
              ? Number(val) > 100
                ? this.errorColor
                : this.warningColor
              : this.normalColor,
        },
      };
    } else if (node.name === "竣工日期") {
      return this.calcEndTimeCell(record, node);
    } else {
      return this.calcProjectPlanDurationCell(record, node);
    }
  }
  calcEndTimeCell(record: any, node: any) {
    if (record.durationLabel !== "偏差分析") {
      return {};
    }
    const currentNode = this.getProjectNodeConfig(record.stages, node.name);

    const val = tools.diffDays(currentNode.plannedEnd, currentNode.actualEnd);
    return {
      style: {
        backgroundColor:
          Number(val) > 0
            ? Number(val) > 100
              ? this.errorColor
              : this.warningColor
            : this.normalColor,
      },
    };
  }
  calcProjectPlanDurationCell(record: any, node: any) {
    if (record.durationLabel === "偏差分析" && !record.shelve) {
      if (record.status === 1) {
        return {};
      }

      const currentNode = this.getProjectNodeConfig(record.stages, node.name);
      const start = Math.abs(
        Number(tools.diffDays(currentNode.plannedEnd, currentNode.plannedStart))
      );
      let end = 0;
      if (record.status === 2) {
        end =
          Math.abs(
            Number(tools.diffDays(new Date(), currentNode.actualStart))
          ) + 1;
      } else {
        end = Math.abs(
          Number(tools.diffDays(currentNode.actualEnd, currentNode.actualStart))
        );
      }
      return {
        style: {
          backgroundColor:
            end - start > 0
              ? end - start > 100
                ? this.errorColor
                : this.warningColor
              : this.normalColor,
        },
      };
    } else {
      return {};
    }
  }
  calcStatusDataCell(record: any, node: any) {
    return {};
  }

  isNodeComplete(node: any) {
    return (
      node.plannedStart && node.plannedEnd && node.actualStart && node.actualEnd
    );
  }
  taskPowersCheck(
    configNode: any,
    valNode: any,
    username: string | undefined
  ): boolean {
    if (!username) {
      return false;
    }
    const participants = configNode.participants || [];
    return (
      participants.some((c: string) => c.toString() === username) &&
      !this.isNodeComplete(valNode)
    );
  }
}

// 2. 工厂类，根据流程类型创建对应实例
class ProcessHandlerFactory {
  static create(type: string) {
    switch (type) {
      case "A":
        return new ProcessAHandler();
      default:
        throw new Error("Unsupported process type");
    }
  }
}

export default ProcessHandlerFactory;
