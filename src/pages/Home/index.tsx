/* 主页 */
import ReactECharts from "echarts-for-react";
import { Card, Col, message, Row } from "antd";
import pmApi from "@/api/pm";
import { useState } from "react";
import { useMount } from "react-use";
import { projectStatusDict } from "@/common/dict";

interface OpData {
  yearOpData: any;
  companyOpData: any;
  statusList: any[];
}
export default function HomePageContainer(): JSX.Element {
  const [opData, setOpData] = useState<OpData>({
    yearOpData: {},
    companyOpData: {},
    statusList: [],
  });
  useMount(() => {
    onGetData();
  });
  // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    try {
      const res = await pmApi.getProjectList({});
      if (res && res.success) {
        initProjectOp(res.data);
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  const initProjectOp = (list: any[]) => {
    const yearObj: any = {};
    const companyObj: any = {};
    const statusObj: any = {};

    let statusList: any[] = [];
    const companyList = [];
    const yearNameList = [];
    const yearValueList = [];

    list.forEach((item) => {
      // 年份统计
      if (yearObj[item.year]) {
        yearObj[item.year]++;
      } else {
        yearObj[item.year] = 1;
      }

      // 分公司统计
      if (companyObj[item.company.name]) {
        companyObj[item.company.name]++;
      } else {
        companyObj[item.company.name] = 1;
      }
      
      // 状态统计
      if (statusObj[item.status]) {
        statusObj[item.status]++;
      } else {
        statusObj[item.status] = 1;
      }
    });

    for (const i in statusObj) {
      statusList = projectStatusDict.map((s) => {
        return {
          ...s,
          value: statusObj[s.value] || 0,
          color:
            s.value === 1 ? "#F59E0B" : s.value === 2 ? "#3B82F6" : "#10B981",
        };
      });
    }
    for (const i in companyObj) {
      companyList.push({
        name: i,
        value: companyObj[i],
      });
    }
    for (const i in yearObj) {
      yearNameList.push(i);
      yearValueList.push(yearObj[i]);
    }
    const companyOpData = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        type: "plain",
      },
      series: [
        {
          name: "分公司",
          type: "pie",
          radius: "50%",
          data: companyList,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    const yearOpData = {
      xAxis: {
        type: "category",
        data: yearNameList,
      },
      yAxis: {
        type: "value",
      },
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "年度",
          data: yearValueList,
          label: {
            show: true,
            position: "top",
          },
          type: "bar",
        },
      ],
    };
    setOpData({
      companyOpData,
      yearOpData,
      statusList,
    });
  };

  return (
    <div className="m-[15px] mt-[0px]">
      <Row gutter={24}>
        {opData.statusList.map((s: any) => (
          <Col key={s.value} span={8}>
            <Card>
              <div className="flex-center flex-col">
                <span className="h1-title" style={{ color: s.color }}>
                  {s.value}
                </span>
                <span>{s.label}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={24} className="mt-[20px] mb-[20px]">
        <Col span={24}>
          <Card title="项目年度统计">
            <ReactECharts option={opData.yearOpData} />
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Card title="项目分公司统计">
            <ReactECharts option={opData.companyOpData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
