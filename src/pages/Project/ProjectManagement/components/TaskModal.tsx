import React, { useEffect, useState } from "react";
import { Modal, message, Form } from "antd";
import pmApi from "@/api/pm";
import { projectStatusDict, nodeStatusDict } from "@/common/dict";
import { TableRecordData } from "../index.type";
import { useSetState } from "react-use";
import tools from "@/util/tools";
import { useAuthPowers } from "@/hooks/useAuthPowers";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import RenderFields from "@/components/RenderFields";

interface TaskModalProps {
  data: TableRecordData | null;
  open: boolean;
  onClose: (refresh?: boolean) => void;
  processHandler: any;
}

const TaskModal: React.FC<TaskModalProps> = React.memo(
  ({ open, onClose, data, processHandler }) => {
    const [form] = Form.useForm();
    const isTaskMg = useAuthPowers("1003");
    const userinfo = useSelector((state: RootState) => state.app.userinfo);
    const [taskPower, setTaskPower] = useState(false);
    const [nodesData, setNodesData] = useState<SelectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalForm, setModalForm] = useSetState({
      projectStatus: 1,
      shelve: false,
      nodeLabel: "",
    });

    useEffect(() => {
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
          projectStatus: data.status,
        });

        const formValues = {
          projectStatus: data.status,
          status: selectNode.data.status,
          shelve: Boolean(data.shelve),
          task: selectNode.value,
          remark: selectNode.remark,
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
        const configNode = processHandler.getNodeConfig(selectNode.data.name);
        setTaskPower(
          isTaskMg ||
            processHandler.taskPowersCheck(
              configNode,
              selectNode.data,
              userinfo?.username
            )
        );
      }
    }, [data]);

    console.log("任务弹框渲染了");
    // 当前用户需要处理的task
    const getCurrentNowTask = (allTasks: any[]) => {
      const userId = userinfo?.username;
      const userTaskList: any[] = [];
      let filterTasks: any[] = [];
      let selectTask: any = [];
      const configNodes = processHandler.getProcedureNodes();
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
        filterTasks.findLastIndex((ft) => ft.data.actualEnd || ft.data.status) +
        1;
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
        shelve: Boolean(data?.shelve),
        nodeLabel: findNode.label,
        projectStatus: data?.status,
      });
      form.setFieldsValue({
        task: val,
        projectStatus: data?.status,
        status: node.status,
        remark: node.remark,
        shelve: Boolean(data?.shelve),
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
      setTaskPower(
        isTaskMg ||
          processHandler.taskPowersCheck(configNode, node, userinfo?.username)
      );
    };
    const editProject = (values: any) => {
      return pmApi.editProject(values);
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

      if (
        processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel) &&
        !values.plannedEnd
      ) {
        message.error("请先处理完上一个节点");
        return;
      }
      try {
        const promiseList = [];
        // 如果是开始节点，则后续所有节点的计划时间都要跟着变，下一个实际开始时间也要变
        if (processHandler.startTimeNodeKeys.includes(modalForm.nodeLabel)) {
          promiseList.push(
            pmApi.editProjectNode({
              ...values,
              id: values.task,
              task: undefined,
            })
          );
          let pStart = values.plannedEnd;
          let pEnd = values.plannedEnd;
          for (let i = findIndex + 1; i < nodesData?.length; i++) {
            const nextNode = nodesData[i].data;
            if (processHandler.customTimeNodeKeys.includes(nextNode.name)) {
              break;
            }
            if (processHandler.startTimeNodeKeys.includes(nextNode.name)) {
              break;
            }
            if (processHandler.statusNodeKeys.includes(nextNode.name)) {
              break;
            }

            pEnd = tools.formatAntDate(
              tools.addDays(
                pEnd,
                processHandler.getNodeConfig(nextNode.name).plannedDays
              ),
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
        } else if (
          processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel)
        ) {
          promiseList.push(
            pmApi.editProjectNode({
              ...values,
              id: values.task,
              task: undefined,
            })
          );
          // 如果是结束节点，则下一个节点的实际开始时间要跟着变
          const nextNode = nodesData[findIndex + 1];
          if (
            nextNode &&
            processHandler.endTimeNodeKeys.includes(nextNode.data.name)
          ) {
            promiseList.push(
              pmApi.editProjectNode({
                actualStart: values.actualEnd,
                id: nextNode.data.id,
              })
            );
          }
        } else if (
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
        ) {
          nodesData.forEach((n) => {
            if (processHandler.customTimeNodeKeys.includes(n.label)) {
              if (n.label === "开工日期") {
                promiseList.push(
                  pmApi.editProjectNode({
                    ...values,
                    id: n.value,
                    plannedStart: values.plannedStart || null,
                    plannedEnd: values.plannedEnd || null,
                    actualStart: values.actualStart || null,
                    actualEnd: values.actualEnd || null,
                    task: undefined,
                  })
                );
              } else if (n.label === "竣工日期") {
                promiseList.push(
                  pmApi.editProjectNode({
                    ...values,
                    id: n.value,
                    plannedStart: values.plannedStart || null,
                    plannedEnd: values.plannedEnd || null,
                    actualStart: values.actualStart || null,
                    actualEnd: values.actualEnd || null,
                    task: undefined,
                  })
                );
              } else {
                promiseList.push(
                  pmApi.editProjectNode({
                    ...values,
                    id: n.value,
                    plannedStart: values.plannedStart || null,
                    plannedEnd: values.plannedEnd || null,
                    actualStart: values.actualStart || null,
                    actualEnd: values.actualEnd || null,
                    task: undefined,
                  })
                );
              }
            }
          });
        } else {
          promiseList.push(
            pmApi.editProjectNode({
              ...values,
              id: values.task,
              task: undefined,
            })
          );
        }

        setLoading(true);

        if (processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)) {
          await editProject({
            ...data,
            shelve: Number(modalForm.shelve),
            status: modalForm.projectStatus,
            stages: undefined
          });
        }

        const res: any[] = await Promise.all(promiseList);
        if (res[0] && res[0].success) {
          message.success("修改成功");
          onClose(true);
        } else {
          message.error(res[0]?.message ?? "操作失败");
        }
      } finally {
        setLoading(false);
      }
    };

    /** 模态框确定 **/
    const onOk = async (): Promise<void> => {
      try {
        const values = await form.validateFields();
        editHandleProcedure(values);
      } catch {
        // 未通过校验
      }
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
        name: "projectStatus",
        type: "select",
        required: true,
        options: projectStatusDict,
        placeholder: "请选择状态",
        rules: [{ required: true, message: "请选择状态" }],
        show: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
        onChange: (v: number) => {
          setModalForm({
            ...modalForm,
            projectStatus: v,
          });
        },
      },
      {
        label: "搁置",
        name: "shelve",
        type: "switch",
        defaultChecked: data?.shelve,
        show: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
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
        required: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
        rules: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
            ? [{ required: true, message: `请选择计划开始时间` }]
            : [],
        disabled: () => !taskPower,
        show: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
      },
      {
        label: "计划结束时间",
        name: "plannedEnd",
        type: "date",
        required: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
        rules: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
            ? [{ required: true, message: `请选择计划结束时间` }]
            : [],
        disabled: () => {
          return processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel)
            ? true
            : !taskPower;
        },
        show: () =>
          processHandler.endTimeNodeKeys.includes(modalForm.nodeLabel) ||
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
      },
      {
        label: "实际开始时间",
        name: "actualStart",
        type: "date",
        required: () => {
          if (
            modalForm.projectStatus !== 1 &&
            processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
          ) {
            return true;
          }
          return false;
        },
        rules: () => {
          if (
            modalForm.projectStatus !== 1 &&
            processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
          ) {
            return [{ required: true, message: `请选择实际开始时间` }];
          }
          return [];
        },
        disabled: () => !taskPower,
        show: () =>
          processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel),
      },
      {
        label: "实际结束时间",
        name: "actualEnd",
        type: "date",
        required: () => {
          if (
            !processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
          ) {
            return true;
          } else {
            if (
              modalForm.projectStatus === 3 &&
              processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
            ) {
              return true;
            }
            return false;
          }
        },
        rules: () => {
          if (
            !processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
          ) {
            return [{ required: true, message: `请选择实际结束时间` }];
          } else {
            if (
              modalForm.projectStatus === 3 &&
              processHandler.customTimeNodeKeys.includes(modalForm.nodeLabel)
            ) {
              return [{ required: true, message: `请选择实际结束时间` }];
            }
            return [];
          }
        },
        disabled: () => !taskPower,
        show: () =>
          !processHandler.statusNodeKeys.includes(modalForm.nodeLabel),
      },
      {
        label: "状态",
        name: "status",
        type: "select",
        options: nodeStatusDict,
        placeholder: "请选择状态",
        require: true,
        disabled: () => !taskPower,
        show: () => processHandler.statusNodeKeys.includes(modalForm.nodeLabel),
      },
      // {
      //   label: "备注",
      //   name: "remark",
      //   type: "textArea",
      //   disabled: () => !taskPower,
      //   show: () => true,
      // },
    ];
    return (
      <Modal
        title="任务管理"
        open={open}
        onOk={onOk}
        onCancel={() => onClose()}
        okButtonProps={{
          loading: loading,
          disabled: !taskPower,
        }}
      >
        <Form form={form}>
          <RenderFields fields={handleFields}></RenderFields>
        </Form>
      </Modal>
    );
  }
);

export default TaskModal;
