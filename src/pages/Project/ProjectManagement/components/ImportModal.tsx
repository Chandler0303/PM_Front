import React, { useState } from "react";
import { Modal, Upload, Button, message, Form, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import pmApi from "@/api/pm";
import * as XLSX from "xlsx";
import {
  projectStatusDict,
  projectTypeDict,
  businessTypeDict,
  importTypeDict
} from "@/common/dict";
import { UserInfo } from "@/models/index.type";

interface ImportModalProps {
  companyList: SelectData[];
  userList: UserInfo[];
  open: boolean;
  onClose: () => void;
  processHandler: any;
}

const ImportModal: React.FC<ImportModalProps> = React.memo(
  ({ open, onClose, companyList, userList, processHandler }) => {
    console.log("导入弹框渲染了");
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
      if (!fileList.length) {
        message.warning("请先选择文件");
        return;
      }
      setLoading(true);
      handleFile(fileList[0].originFileObj);
    };

    const handleFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // 取第一个 sheet
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
        });
        // console.log(jsonData); // 输出解析后的 JSON
        const projectData = handleData(jsonData);
        // console.log(jsonData, jsonData)
        // return
        // const values = await form.validateFields();
        
        try {
          const res: any = await pmApi.importProject({ projects: projectData, mode: 'full' });
          if (res && res.success) {
            message.success("请稍后刷新查看，后台正在导入...");
            close();
          } else {
            message.error(res?.message ?? "操作失败");
          }
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    const handleData = (data: any[]) => {
      const projectData: any[] = [];

      let isComplete = false;
      const headerData = data[3].map((h: any) => {
        let str = h;
        if (str === "是否完成") {
          str = isComplete ? "物资招标" + str : "分包招标" + str;
          isComplete = true;
        }
        if (str) str = str.replace(/\n/g, "");
        return str;
      });

      data.forEach((item, index) => {
        if (index > 4 && item.includes("计划时间")) {
          const findUser = getDictVal(userList.map(u => ({label: u.name, value: u.id})), item[10], '')
          const project = {
            projCode: item[1],
            name: item[3],
            status: getDictVal(projectStatusDict, item[7]),
            year: item[2],
            type: getDictVal(projectTypeDict, item[6]),
            businessType: getDictVal(businessTypeDict, item[8]),
            company: getDictVal(companyList, item[9]),
            user: findUser || undefined,
            shelve: 0,
            amount: item[5],
            stage: getStage(item[4]),
            stages: createStages(headerData, item, data[index + 1]),
            remark: item[item.length - 1]
          };
          projectData.push(project);
        }
      });
      return projectData;
    };

    const createStages = (
      header: any[],
      plannedData: any[],
      actualData: any[]
    ) => {
      const stages = processHandler.getProcedureStages();
      plannedData.forEach((h, i) => {
        plannedData[i] = h === "所处节点" ? "" : h;
      });
      actualData.forEach((h, i) => {
        actualData[i] = h === "所处节点" ? "" : h;
      });

      return stages.map((stage: any) => {
        return {
          name: stage.stageName,
          seq: stage.seq,
          nodes: stage.nodes.map((node: any) => {
            const nodeData: any = {
              name: node.name,
              seq: node.seq,
              status: 0,
              type: 0,
              principal: "",
              plannedStart: "",
              plannedEnd: "",
              actualStart: "",
              actualEnd: "",
            };
            const valIndex = header.findIndex((h) => h === node.name);
            if (processHandler.startTimeNodeKeys.includes(node.name)) {
              nodeData.plannedStart = toJSDate(plannedData[valIndex]);
              nodeData.actualStart = toJSDate(actualData[valIndex]);
              nodeData.plannedEnd = toJSDate(plannedData[valIndex]);
              nodeData.actualEnd = toJSDate(actualData[valIndex]);
            } else if (processHandler.endTimeNodeKeys.includes(node.name)) {
              nodeData.plannedStart = toJSDate(plannedData[valIndex - 1]);
              nodeData.actualStart = toJSDate(actualData[valIndex - 1]);
              nodeData.plannedEnd = toJSDate(plannedData[valIndex]);
              nodeData.actualEnd = toJSDate(actualData[valIndex]);
            } else if (processHandler.statusNodeKeys.includes(node.name)) {
              nodeData.plannedStart = null;
              nodeData.actualStart = null;
              nodeData.plannedEnd = null;
              nodeData.actualEnd = null;
              nodeData.status = plannedData[valIndex] === "已完成" ? 1 : 0;
            } else {
              if (node.name === "开工日期") {
                nodeData.plannedStart = toJSDate(plannedData[valIndex]);
                nodeData.actualStart = toJSDate(actualData[valIndex]);
                nodeData.plannedEnd = toJSDate(plannedData[valIndex + 1]);
                nodeData.actualEnd = toJSDate(actualData[valIndex + 1]);
              } else if (node.name === "竣工日期") {
                nodeData.plannedStart = toJSDate(plannedData[valIndex - 1]);
                nodeData.actualStart = toJSDate(actualData[valIndex - 1]);
                nodeData.plannedEnd = toJSDate(plannedData[valIndex]);
                nodeData.actualEnd = toJSDate(actualData[valIndex]);
              } else {
                nodeData.plannedStart = toJSDate(plannedData[valIndex - 2]);
                nodeData.actualStart = toJSDate(actualData[valIndex - 2]);
                nodeData.plannedEnd = toJSDate(plannedData[valIndex - 1]);
                nodeData.actualEnd = toJSDate(actualData[valIndex - 1]);
              }
            }
            return nodeData;
          }),
        };
      });
    };

    const toJSDate = (excelNum: number) => {
      if (!excelNum) {
        return null;
      }
      if (typeof excelNum === 'string') {
        return new Date(excelNum);
      } else {
        const d = XLSX.SSF.parse_date_code(excelNum);
        return new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S);
      }
      
    };
    const getStage = (label: string) => {
      const findData = processHandler.procedureStages.find(
        (s: any) => s.stageName === label
      );
      return findData ? findData.seq : processHandler.procedureStages[0].seq;
    };
    const getDictVal = (dict: SelectData[], label: string, defaultVal = dict[0].value) => {
      const findData = dict.find((d: SelectData) => d.label === label);
      return findData ? findData.value : defaultVal
    };

    const close = () => {
      setFileList([]);
      onClose();
    };

    return (
      <Modal
        title="导入数据"
        open={open}
        onCancel={close}
        onOk={handleUpload}
        confirmLoading={loading}
        okText="上传"
        cancelText="取消"
      >
        <Form form={form}
          initialValues={{
            mode: 'full',
          }}>
          <Form.Item label="导入文件：" required>
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                return false; // 阻止 antd 自动上传
              }}
              onChange={({ fileList }) => setFileList(fileList)}
              onRemove={() => {
                setFileList([]);
              }}
              maxCount={1}
              accept=".csv,.xlsx"
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          {/* <Form.Item label="导入类型：" name="mode" required>
            <Select
              style={{width: '300px'}}
              options={importTypeDict}
              placeholder="请选择导入类型"
            />
          </Form.Item> */}
        </Form>
      </Modal>
    );
  }
);

export default ImportModal;
