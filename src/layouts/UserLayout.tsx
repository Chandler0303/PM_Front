/** 基础页面结构 - 有头部，有底部，有侧边导航 **/

// ==================
// 所需的第三方库
// ==================
import { Outlet } from "react-router-dom";
import { Layout } from "antd";

// ==================
// 自定义的东西
// ==================

// ==================
// 组件
// ==================

const { Content } = Layout;
// ==================
// 本组件
// ==================
export default function AppContainer(): JSX.Element {
  return (
    <Layout className="w-full h-screen">
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
