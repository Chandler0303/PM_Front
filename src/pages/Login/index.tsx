/** 登录页 **/

// ==================
// 所需的各种插件
// ==================
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// ==================
// 所需的所有组件
// ==================
import { Form, Input, Button, message } from "antd";
import { UserOutlined, KeyOutlined } from "@ant-design/icons";
import CanvasBack from "@/components/CanvasBack";
import LogoImg from "@/assets/logo.png";

// ==================
// 类型声明
// ==================
import { Dispatch } from "@/store";

// ==================
// CSS
// ==================
import "./index.less";

// ==================
// 本组件
// ==================
function LoginContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // 是否正在登录中

  // 用户提交登录
  const onSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await dispatch.app.onLogin(values);

      if (res && res.success) {
        const userRes = await dispatch.app.getUserInfo();

        if (userRes && userRes.success) {
          message.success("登录成功");
          setLoading(false);

          sessionStorage.setItem("userinfo", JSON.stringify(userRes.data));
          await dispatch.app.setUserInfo(userRes.data);
          navigate("/"); // 跳转到主页
        }
      } else {
        message.error(res?.message ?? "登录失败");
        setLoading(false);
      }
    } catch (e) {
      // 验证未通过
    }
  };

  return (
    <div className="page-login">
      <div className="canvasBox">
        <CanvasBack row={12} col={8} />
      </div>
      <div className="loginBox">
        <Form form={form}>
          <div className="title">
            <img src={LogoImg} alt="logo" />
            <span>PM</span>
          </div>
          <div>
            <Form.Item
              name="username"
              rules={[
                { max: 12, message: "最大长度为12位字符" },
                {
                  required: true,
                  whitespace: true,
                  message: "请输入用户名",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ fontSize: 13 }} />}
                size="large"
                id="username" // 为了获取焦点
                placeholder="请输入用户名"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { max: 18, message: "最大长度18个字符" },
              ]}
            >
              <Input
                prefix={<KeyOutlined style={{ fontSize: 13 }} />}
                size="large"
                type="password"
                placeholder="请输入密码"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="submit-btn"
                size="large"
                type="primary"
                loading={loading}
                onClick={onSubmit}
              >
                {loading ? "请稍后" : "登录"}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default LoginContainer;
