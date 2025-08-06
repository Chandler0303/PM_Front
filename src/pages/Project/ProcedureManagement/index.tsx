import {
  Button,
  Empty,
  Form,
  InputNumber,
  message,
  Segmented,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { ProcedureInfo } from "./index.type";
import { useMount } from "react-use";
import { SearchOutlined } from "@ant-design/icons";
import tools from "@/util/tools";
import { TableRecordData as UserInfo } from "@/pages/System/UserAdmin/index.type";
import "./index.less";
import sysApi from "@/api/sys";
import pmApi from "@/api/pm";
import AuthWrapper from "@/components/AuthWrapper";
import { useAuthPowers } from "@/hooks/useAuthPowers";

function ProcedureManagementContainer(): JSX.Element {
  const [form] = Form.useForm();
  const [selectData, setSelectData] = useState<SelectData[]>([]);
  const [procedureInfo, setProcedureInfo] = useState<ProcedureInfo | null>(
    null
  );
  const [procedureId, setProcedureId] = useState<number | undefined>(undefined);
  const [procedureData, setProcedureData] = useState<ProcedureInfo[]>([]);
  const [currentStage, setCurrentStage] = useState<any>(null);
  const [userData, setUserData] = useState<SelectData[]>([]);
  const [formCache, setFormCache] = useState<Record<string, any>>({});
  const isEdit = useAuthPowers("edit:procedure");

  useMount(() => {
    // 页面加载时获取数据
    onGetData();
    onGetUserData();
  });

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    try {
      const res = await pmApi.getProcedureList();
      if (res && res.success) {
        setSelectData(
          res.data.map((item: ProcedureInfo) => {
            return {
              label: item.name,
              value: item.id,
            };
          })
        );
        setProcedureData(res.data);
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  async function onGetUserData(): Promise<void> {
    try {
      const res = await sysApi.getUserList(tools.clearNull({ name: "" }));
      if (res && res.success) {
        setUserData(
          res.data.map((item: UserInfo) => {
            return {
              label: item.name,
              value: item.username,
            };
          })
        );
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  const searchUsernameChange = (value: number) => {
    setProcedureId(value);
    setProcedureInfo(null);
    setCurrentStage(null);
    setFormCache({});
  };

  const segmentChange = async (value: string | number) => {
    if (!procedureInfo || !procedureInfo.stages) return;
    if (currentStage) {
      const values = await form.validateFields();
      const updatedCache = {
        ...formCache,
        [currentStage.stageName]: values.nodes,
      };
      setFormCache(updatedCache);
    }

    const newStage = procedureInfo.stages.find((s) => s.stageName === value);
    setCurrentStage(newStage);

    // 回显已缓存的值
    if (newStage) {
      const cachedNodes = formCache[newStage.stageName] || {};
      const formValues = { nodes: {} as Record<string, any> };
      newStage.nodes.forEach((node: any) => {
        formValues.nodes[node.name] = {
          plannedDays: node.plannedDays,
          participants: node.participants,
          ...cachedNodes[node.name],
        };
      });
      form.setFieldsValue(formValues);
    }
  };

  const onSearch = () => {
    if (!procedureId) {
      message.warning("请选择流程进行搜索");
      return;
    }
    let findedProcedure = procedureData.find(
      (item: ProcedureInfo) => item.id === procedureId
    );
    if (findedProcedure) {
      findedProcedure = {
        ...findedProcedure,
        stages: JSON.parse(findedProcedure.config).stages,
      };
      setProcedureInfo(findedProcedure);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const updatedCache = {
      ...formCache,
      [currentStage.stageName]: values.nodes,
    };
    setFormCache(updatedCache);

    try {
      const res: Res | undefined = await pmApi.editProcedureConfig({
        id: procedureInfo?.id,
        config: JSON.stringify({
          stages: configDiff(updatedCache),
        }),
      });
      if (res && res.success) {
        message.success("修改成功");
        onGetData();
      } else {
        message.error(res?.message ?? "操作失败");
      }
    } finally {
    }
  };

  const configDiff = (updatedCache: any) => {
    const stages = procedureInfo?.stages;
    for (const i in updatedCache) {
      const newStage = updatedCache[i];
      const oldStage = (stages as any[]).find((s: any) => s.stageName === i);
      oldStage.nodes.forEach((oldNode: any) => {
        const newNode = newStage[oldNode.name];
        if (newNode) {
          (oldNode.plannedDays = newNode.plannedDays),
            (oldNode.participants = newNode.participants);
        }
      });
    }
    return stages;
  };

  useEffect(() => {
    if (procedureInfo && procedureInfo.stages) {
      segmentChange(procedureInfo.stages[0].stageName);
    }
  }, [procedureInfo]);

  return (
    <div>
      <div className="g-search">
        <ul className="search-ul">
          <li>
            <Select
              style={{ width: 200 }}
              allowClear
              placeholder="请选择流程"
              onChange={searchUsernameChange}
              value={procedureId}
              options={selectData}
            />
          </li>
          <li>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              搜索
            </Button>
          </li>
        </ul>
      </div>

      <div style={{ margin: "20px" }}>
        {procedureInfo && procedureInfo.stages ? (
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
            initialValues={{}}
          >
            <Segmented
              style={{ marginBottom: 20 }}
              options={procedureInfo.stages.map((item: any) => item.stageName)}
              value={currentStage?.stageName}
              onChange={segmentChange}
            />
            <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
              {currentStage &&
                currentStage.nodes.map((item: any) => (
                  <div key={item.seq}>
                    <div className="g-flex" style={{ marginBottom: 20 }}>
                      <span className="line"></span>
                      <h3>{item.name}</h3>
                    </div>

                    <Form.Item
                      name={["nodes", item.name, "plannedDays"]}
                      label="制度要求时间："
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="请输入制度要求时间"
                        disabled={!isEdit}
                        min={0}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["nodes", item.name, "participants"]}
                      label="负责人："
                    >
                      <Select
                        style={{ width: "100%" }}
                        placeholder="请选择负责人"
                        mode="multiple"
                        disabled={!isEdit}
                        options={userData}
                      />
                    </Form.Item>
                  </div>
                ))}
            </div>
            <AuthWrapper code="edit:procedureconfig">
              <Button style={{marginTop: '20px'}} type="primary" onClick={handleSubmit}>
                提交
              </Button>
            </AuthWrapper>
          </Form>
        ) : (
          <Empty description="请选择一个流程进行搜索" />
        )}
      </div>
    </div>
  );
}

export default ProcedureManagementContainer;
