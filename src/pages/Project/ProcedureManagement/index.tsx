import { Button, Empty, Form, InputNumber, message, Segmented, Select } from "antd"
import { useState } from "react";
import { ProcedureInfo } from "./index.type";
import { useDispatch } from "react-redux";
import { Dispatch } from "@/store";
import { useMount } from "react-use";
import { SearchOutlined } from "@ant-design/icons";
import tools from "@/util/tools";
import { TableRecordData as UserInfo } from "@/pages/System/UserAdmin/index.type";
import "./index.less";


function ProcedureManagementContainer(): JSX.Element{
    const dispatch = useDispatch<Dispatch>();

    const [selectData, setSelectData] = useState<SelectData[]>([]);
    const [procedureInfo, setProcedureInfo] = useState<ProcedureInfo | null>(null);
    const [procedureId, setProcedureId] = useState<number | undefined>(undefined);
    const [procedureData, setProcedureData] = useState<ProcedureInfo[]>([]);
    const [currentNodes, setCurrentNodes] = useState<any[]>([]);
    const [userData, setUserData] = useState<SelectData[]>([]);

    useMount(() => {
        // 页面加载时获取数据
        onGetData();
        onGetUserData();
    })

    // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    try {
      const res = await dispatch.sys.getProcedureList();
      if (res && res.status === 200) {
        setSelectData(res.data.list.map((item: ProcedureInfo) => {
          return {
            label: item.name,
            value: item.id,
          };
        }));
        setProcedureData(res.data.list);
       
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }
  
  async function onGetUserData(): Promise<void> {
    const params = {
      pageNum: 1,
      pageSize: 10
    };

    try {
      const res = await dispatch.sys.getUserList(tools.clearNull(params));
      if (res && res.status === 200) {
        setUserData(res.data.list.map((item: UserInfo) => {
          return {
            label: item.name,
            value: item.username,
          };
        }));
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  const searchUsernameChange = (value: number) => {
    setProcedureId(value);
    setProcedureInfo(null)
    setCurrentNodes([]);
  };

  const segmentChange = (value: string | number) => {
    if (!procedureInfo) return;
    const stage = procedureInfo.config.find((item: any) => item.stageName === value);
    if (stage) {
      console.log("Selected Stage:", stage);
      // 这里可以处理选中阶段的逻辑
      setCurrentNodes(stage.nodes);
    }
  };

  const onSearch = () => {
    console.log("onSearch", procedureData);
    if(!procedureId) {
      message.warning("请选择流程进行搜索");
      return;
    }
    const findedProcedure = procedureData.find((item: ProcedureInfo) => item.id === procedureId);

    setProcedureInfo(
      findedProcedure || null
    );
    setCurrentNodes(findedProcedure?.config[0]?.nodes || []);
  }


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
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={onSearch}
                        >
                            搜索
                        </Button>
                    </li>
                </ul>
            </div>

            <div style={{ margin: "20px" }}>
                {
                    procedureInfo ? 
                    (
                      <div>
                        <Segmented 
                            style={{ marginBottom: 20 }}
                            options={procedureInfo.config.map((item: any) => item.stageName)}
                            onChange={segmentChange}
                          />
                          {
                            currentNodes.map((item: any) => (
                              <div>
                                <div className="g-flex">
                                  <span className="line"></span>
                                  <h3>{item.name}</h3>
                                </div>
                                <Form
                              
                                  layout="vertical"
                              
                                  style={{ marginTop: 16 }}
                                >
                                  <Form.Item name="plannedDays" label="制度要求时间：">
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      placeholder="请输入制度要求时间"
                                      min={0}
                                    />
                                  </Form.Item>
                                  <Form.Item name="editUsers" label="负责人：">
                                    <Select
                                      style={{ width: "100%" }}
                                      placeholder="请选择负责人"
                                      mode="multiple"
                                      options={userData}
                                    />
                                  </Form.Item>
                                </Form>
                              </div>
                            ))
                          }
                          <Button type="primary" htmlType="submit">
                            提交
                          </Button>
                      </div>
                    )
                    : (
                        <Empty description="请选择一个流程进行搜索" />
                    )
                }
            </div>
        </div>
    )
}

export default ProcedureManagementContainer

