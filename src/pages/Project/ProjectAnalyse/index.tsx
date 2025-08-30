/* 主页 */
import ReactECharts from "echarts-for-react";
import { Card, Col, message, Progress, Row } from "antd";
import pmApi from "@/api/pm";
import { useState } from "react";
import { useMount } from "react-use";
import ProcessHandlerFactory from "@/util/processHandler";

const processHandler = ProcessHandlerFactory.create("A");

export default function ProjectAnalysePageContainer(): JSX.Element {

    const [opData, setOpData] = useState({
        projectLen: 0,
        yearProcedureOpData: {},
        stageProcedureOpData: {},
        stagesOpData: []
    })
    useMount(() => {
        onGetData()
    })
      // 函数 - 查询当前页面所需列表数据
  async function onGetData(): Promise<void> {
    try {
      const res = await pmApi.getProjectList({});
      if (res && res.success) {
        initProjectOp(res.data)
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
    }
  }

  const initProjectOp = (list: any[]) => {
    const stages = list[0].stages.map((s: any) => {
      return {
        seq: s.seq,
        name: s.name,
        count: 0
      }
    })
    stages.sort((a:any, b:any) => a.seq - b.seq)

    const yearObj: any = {}
    const yearSeriesList = []
    const stageHandlingList: any[] = []

    list.forEach(item => {
      // 计算当前项目阶段
      item.stage = processHandler.calcProjectStage(item).seq
      if (stageHandlingList[item.stage - 1]) {
        stageHandlingList[item.stage - 1].push(item)
      } else {
        stageHandlingList[item.stage - 1] = [item]
      }
        // 任务统计
        item.stages.forEach((s: any) => {
          let isNodeComplete = s.nodes.every((n: any) => processHandler.isNodeComplete(n))
          if (s.name === '招标采购') {
            isNodeComplete = s.nodes.every((n: any) => n.status === 1)
          }
          const findStage = stages.find((stage: any) => stage.seq === s.seq)
          if (findStage && isNodeComplete) {
            findStage.count += 1
          }
        })

        // 年份
        if (yearObj[item.year]) {
          yearObj[item.year].push(item);
        } else {
          yearObj[item.year] = [item];
        }
    })

    for (const i in yearObj) {
      const stageCount = new Array(stages.length).fill(0);
      yearObj[i].forEach((p: any) => {
        stageCount[p.stage - 1] += 1
      })
      yearSeriesList.push({
        name: i,
        data: stageCount
      })
    }



    const yearProcedure = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: stages.map((s: any) => s.name)
      },
      series: yearSeriesList.map((s: any) => {
        return {
          ...s,
          type: 'bar'
        }
      })
    };


    const stageProcedure = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      xAxis: [
        {
          type: 'category',
          data: stages.map((s: any) => s.name)
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '正常',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [320, 332, 301, 100, 200, 300]
        },
        {
          name: '预计超期<=100',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [120, 132, 101]
        },
        {
          name: '预计超期>100',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [220, 182, 191]
        }
      ]
    };

    
    setOpData({
        projectLen: list.length,
        yearProcedureOpData: yearProcedure,
        stageProcedureOpData: stageProcedure,
        stagesOpData: stages
    })
  }

  
  
  return (
    <div className="m-[15px] mt-[0px]">
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            {opData.stagesOpData.map((op: any, index) => (
              <div key={op.seq} className={index === 0 ? 'flex' : "flex mt-[10px]"}>
                <span className="w-[150px]">{op.name}</span>
                <div>
                  <Progress
                    percent={Number((op.count/opData.projectLen * 100).toFixed(0))}
                    percentPosition={{ align: 'center', type: 'inner' }}
                    size={[500, 20]}
                  />
                </div>
                <span className="w-[100px] ml-[10px]">{op.count}/{opData.projectLen}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <ReactECharts option={opData.yearProcedureOpData} />
          </Card>
        </Col>
      </Row>
       <Row gutter={24}>
        <Col span={24}>
          <Card>
            <ReactECharts option={opData.stageProcedureOpData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
