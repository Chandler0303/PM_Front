import { DatePicker, Form, Input, Select, Switch } from "antd";
import TextArea from "antd/lib/input/TextArea";

interface Props {
  fields: any[];
}
export default function RenderFields({ fields }: Props) {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 17 },
    },
  };
  return fields
    .filter((field) => field.show?.() ?? true)
    .map((field) => (
      <Form.Item
        key={field.name}
        label={field.label}
        name={field.name}
        required={
          typeof field.required === "function"
            ? field.required()
            : field.required
        }
        {...formItemLayout}
        rules={
          typeof field.required === "function" ? field.rules() : field.rules
        }
      >
        {field.type === "date" || field.type === "year" ? (
          <DatePicker
            style={{ width: "100%" }}
            picker={field.type}
            format={field.format}
            disabled={
              typeof field.disabled === "function"
                ? field.disabled()
                : field.disabled
            }
            placeholder={`请选择${field.label}`}
          />
        ) : field.type === "select" ? (
          <Select
            options={field.options}
            placeholder={`请选择${field.label}`}
            onChange={field.onChange}
          />
        ) : field.type === "switch" ? (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={field.value}
            defaultChecked={field.defaultChecked}
            onChange={field.onChange}
          />
        ) : field.type === "textArea" ? (
          <TextArea
            showCount
            maxLength={100}
            placeholder={`请输入${field.label}`}
            style={{ height: 120, resize: "none" }}
          />
        ) : (
          <Input placeholder={`请输入${field.label}`} />
        )}
      </Form.Item>
    ));
}
