import { UserInfo } from "@/models/index.type";
import tools from "./tools";

// 1. 定义各流程处理类，统一接口
class BaseProcessHandler {
  processData() {
    throw new Error("processData method must be implemented");
  }
  renderTable() {
    throw new Error("renderTable method must be implemented");
  }
  checkCondition() {
    throw new Error("checkCondition method must be implemented");
  }
}

class ProcessAHandler extends BaseProcessHandler {
  startTimeKeys: string[] = [];
  endTimeKeys: string[] = [];
  userList: any[] = [];
  initConfig() {
    this.startTimeKeys = [
      "中标公示",
      "合同交底会",
      "竣工验收",
      "核实项目账务情况",
    ];
    this.endTimeKeys = [];
  }
  getTaskUser(stage: any, userList: any[]) {
    const participantsList: any = [];
    stage.nodes.forEach((n: any) => {
      n.participants.forEach((p: string) => {
        if (!participantsList.find((p2: string) => p2 === p)) {
          participantsList.push(p);
        }
      });
    });

    const filterUser: (UserInfo | undefined)[] = participantsList
      .map((name: string) => {
        const user: UserInfo | undefined = userList.find(
          (u: UserInfo) => u.username === name
        );
        return user ? user : undefined;
      })
      .filter((u: any) => u);
    if (!filterUser.length) {
      return "--";
    }
    const userObj: any = {};
    filterUser.forEach((u: any) => {
      const orgName = u.org.name as string;
      if (userObj[orgName]) {
        userObj[orgName].push(u.name);
      } else {
        userObj[orgName] = [u.name];
      }
    });
  }
  processData() {
    // A流程的数据处理
    // return this.data.map(item => ({ ...item, processedBy: 'A' }));
  }
  renderTable() {
    // A流程表格渲染逻辑
    // return <Table columns={columnsA} dataSource={this.processData()} />;
  }
  checkCondition() {
    // A流程条件判断
    // return this.data.length > 0;
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
