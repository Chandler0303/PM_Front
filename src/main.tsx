import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import Router from "./router";

import "normalize.css";
import "@/assets/styles/default.less";
import "@/assets/styles/global.less";
import "@/assets/styles/tailwindcss/index.css"

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN"; // ✅ v5 的 locale 路径变了
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn"); // 设置 dayjs 全局语言


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <Provider store={store}>
        <HashRouter>
          <Router />
        </HashRouter>
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
);
