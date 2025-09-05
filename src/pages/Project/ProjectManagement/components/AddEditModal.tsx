import React, { useEffect, useState } from "react";
import { Modal, message, Form } from "antd";
import pmApi from "@/api/pm";
import { projectTypeDict, businessTypeDict } from "@/common/dict";
import { TableRecordData } from "../index.type";
import RenderFields from "@/components/RenderFields";
import dayjs from "dayjs";
import { UserInfo } from "@/models/index.type";

interface TaskModalProps {
  data: TableRecordData | null;
  companyList: SelectData[];
  userList: UserInfo[];
  type: string | null;
  open: boolean;
  onClose: (refresh?: boolean) => void;
  processHandler: any;
}

const AddEditModal: React.FC<TaskModalProps> = React.memo(
  ({ open, onClose, data, type, companyList, userList, processHandler }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false); // 数据是否正在加载中

    useEffect(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        form.resetFields();
      } else if (type === "edit") {
        // 修改，需设置表单各控件的值为当前所选中行的数据
        if (data) {
          form.setFieldsValue({
            user: data.user ? data.user.id : null,
            amount: data.amount,
            company: data.company ? data.company.id : null,
            name: data.name,
            projCode: data.projCode,
            stage: data.stage === 0 ? undefined : data.stage,
            status: data.status,
            type: Number(data.type),
            businessType: Number(data.businessType),
            year: dayjs(data.year),
            remark: data.remark || ''
          });
        }
      }
    }, [data]);

    console.log("新增编辑渲染了");

    const addProject = async (values: any) => {
      setLoading(true);
      // 新增
      try {
        const res: Res | undefined = await pmApi.addProject(values);
        if (res && res.success) {
          message.success("添加成功");
          onClose(true);
        } else {
          message.error(res?.message ?? "操作失败");
        }
      } finally {
        setLoading(false);
      }
    };
    const editProject = async (values: any) => {
      setLoading(true);
      try {
        const res: Res | undefined = await pmApi.editProject(values);
        if (res && res.success) {
          message.success("修改成功");
          onClose(true);
        } else {
          message.error(res?.message ?? "操作失败");
        }
      } finally {
        setLoading(false);
      }
    };

    const createStages = () => {
      const stages = processHandler.getProcedureStages();
      return stages.map((stage: any) => {
        return {
          name: stage.stageName,
          seq: stage.seq,
          nodes: stage.nodes.map((node: any) => {
            return {
              name: node.name,
              seq: node.seq,
              status: 0,
              type: 0,
              principal: "",
            };
          }),
        };
      });
    };

    /** 模态框确定 **/
    const onOk = async (): Promise<void> => {
      try {
        const values = await form.validateFields();

        if (type === "add") {
          addProject({
            ...values,
            year: Number(values.year.format("YYYY")),
            stage: 0,
            status: 1,
            stages: createStages(),
          });
        } else if (type === "edit") {
          editProject({
            ...values,
            year: Number(values.year.format("YYYY")),
            id: data?.id,
          });
        }
      } catch {
        // 未通过校验
      }
    };

    const projectFields = [
      {
        label: "工程编号",
        name: "projCode",
        type: "input",
        required: true,
        rules: [{ required: true, whitespace: true, message: "必填" }],
      },
      {
        label: "年度",
        name: "year",
        type: "year",
        required: true,
        rules: [{ required: true, message: "必填" }],
      },
      {
        label: "工程名称",
        name: "name",
        type: "input",
        required: true,
        rules: [{ required: true, whitespace: true, message: "必填" }],
      },
      {
        label: "合同金额",
        name: "amount",
        type: "input",
        required: true,
        rules: [{ required: true, whitespace: true, message: "必填" }],
      },
      {
        label: "项目类型",
        name: "type",
        type: "select",
        required: true,
        options: projectTypeDict,
        rules: [{ required: true, message: "请选择项目类型" }],
      },
      {
        label: "业务类型",
        name: "businessType",
        type: "select",
        required: true,
        options: businessTypeDict,
        rules: [{ required: true, message: "请选择业务类型" }],
      },
      {
        label: "项目阶段",
        name: "stage",
        type: "select",
        required: true,
        options: processHandler.getProcedureStages().map((s: any) => {
          return {
            label: s.stageName,
            value: s.seq,
          };
        }),
        rules: [{ required: true, message: "请选择项目阶段" }],
        show: () => type === "edit",
      },
      {
        label: "分公司",
        name: "company",
        type: "select",
        required: true,
        options: companyList,
        rules: [{ required: true, message: "请选择分公司" }],
      },
      {
        label: "项目经理",
        name: "user",
        type: "select",
        options: userList.map(item => {
          return {
            label: item.name,
            value: item.id
          }
        })
      },
      {
        label: "备注",
        name: "remark",
        type: "textArea"
      },
    ];

    return (
      <Modal
        title={type === "add" ? "新增" : "修改"}
        open={open}
        onOk={onOk}
        onCancel={() => onClose()}
        okButtonProps={{
          loading,
        }}
      >
        <Form
          form={form}
          initialValues={{
            type: 1,
          }}
        >
          <RenderFields fields={projectFields}></RenderFields>
        </Form>
      </Modal>
    );
  }
);

export default AddEditModal;
