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
        processHandler.setStageSort(res.data)
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

    const yearObj: any = {}
    const yearSeriesList = []
    const stageSeriesData = [{
          name: '正常',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: new Array(stages.length).fill(0)
        },
        {
          name: '预计超期<=100',
          type: 'bar',
          color: processHandler.warningColor,
          emphasis: {
            focus: 'series'
          },
          data: new Array(stages.length).fill(0)
        },
        {
          name: '预计超期>100',
          type: 'bar',
          color: processHandler.errorColor,
          emphasis: {
            focus: 'series'
          },
          data: new Array(stages.length).fill(0)
        }]

    list.forEach(item => {
      // 计算当前项目阶段
      const nowStage = processHandler.calcProjectStage(item)
      item.stage = nowStage.seq
      const stageDelay = processHandler.calcProcedureDelay(item)
      stageSeriesData[stageDelay].data[item.stage - 1] = stageSeriesData[stageDelay].data[item.stage - 1] + 1


      // 任务统计
      item.stages.forEach((s: any) => {
        let isNodeComplete = s.nodes.every((n: any) => processHandler.isNodeComplete(n))
        if (s.name === '招标采购') {
          isNodeComplete = s.nodes.every((n: any) => n.status === 1)
        } else if (s.name === '工程施工') {
          isNodeComplete = item.status === 3
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


    const yearList = Object.keys(yearObj).map(Number).sort((a, b) => a - b);
    const lastFourYears = yearList.slice(-4);
    for (const i in yearObj) {
      if (Number(i) < lastFourYears[0]) {
        yearObj[lastFourYears[0]] = yearObj[lastFourYears[0]].concat(yearObj[i])
      }
    }
    for (const i in yearObj) {
      if (lastFourYears.includes(Number(i))) {
        const stageCount = new Array(stages.length).fill(0);
        yearObj[i].forEach((p: any) => {
          stageCount[p.stage - 1] += 1
        })
        yearSeriesList.push({
          name: i,
          data: stageCount
        })
      }
      
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
      series: yearSeriesList.map((s: any, index: number) => {
        return {
          ...s,
          name: index === 0 ? s.name + '及以前' : s.name,
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
      series: stageSeriesData
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
          <Card title="完成分析">
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
      <Row gutter={24} className="mt-[20px]">
        <Col span={24}>
          <Card title="年度分析">
            <ReactECharts option={opData.yearProcedureOpData} />
          </Card>
        </Col>
      </Row>
       <Row gutter={24} className="mt-[20px]">
        <Col span={24}>
          <Card title="进行中分析">
            <ReactECharts option={opData.stageProcedureOpData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
