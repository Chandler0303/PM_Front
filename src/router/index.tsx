/** 根路由 **/

// ==================
// 第三方库
// ==================
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";

// ==================
// 自定义的东西
// ==================

// ==================
// 组件
// ==================
import { AuthNoLogin, AuthWithLogin, AuthNoPower } from "./AuthProvider";
import Loading from "../components/Loading";
import BasicLayout from "@/layouts/BasicLayout";
import UserLayout from "@/layouts/UserLayout";

// 全局提示只显示2秒
message.config({
  duration: 2,
});

// ==================
// 类型声明
// ==================
import { RootState, Dispatch } from "@/store";

// ==================
// 异步加载各路由模块
// ==================
const NotFound = lazy(() => import("../pages/ErrorPages/404"));
const NoPower = lazy(() => import("../pages/ErrorPages/401"));
const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));
const ProjectManagement = lazy(() => import("../pages/Project/ProjectManagement"));
const ProcedureManagement = lazy(() => import("../pages/Project/ProcedureManagement"));
const ProjectAnalyse = lazy(() => import("../pages/Project/ProjectAnalyse"));
const UserAdmin = lazy(() => import("../pages/System/UserAdmin"));
const AppVersion = lazy(() => import("../pages/System/AppVersion"));

// ==================
// 本组件
// ==================
function RouterCom(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const userinfo = useSelector((state: RootState) => state.app.userinfo);

  useEffect(() => {
    const userTemp = sessionStorage.getItem("userinfo");
    /**
     * sessionStorage中有user信息，但store中没有
     * 说明刷新了页面，需要重新同步user数据到store
     * **/
    if (userTemp && !userinfo) {
      dispatch.app.setUserInfo(JSON.parse(userTemp));
    }
  }, [dispatch.app, userinfo]);
  return (
    <Suspense fallback={<Loading />}>
      {/* 在这里写 <Routes> <Route element={<Home />} /> ... */}
      <Routes>
        <Route
          path="/user"
          element={
            <AuthWithLogin>
              <UserLayout />
            </AuthWithLogin>
          }
        >
          <Route index element={<Navigate to="login" />}></Route>
          <Route path="login" element={<Login />}></Route>
          <Route path="*" element={<Navigate to="login" />} />
        </Route>
        <Route
          path="/"
          element={
            <AuthNoLogin>
              <BasicLayout />
            </AuthNoLogin>
          }
        >
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<Home />} />
          <Route
            path="project/management"
            element={
              <AuthNoPower>
                <ProjectManagement />
              </AuthNoPower>
            }
          />
          <Route
            path="project/procedureMg"
            element={
              <AuthNoPower>
                <ProcedureManagement />
              </AuthNoPower>
            }
          />
          <Route
            path="project/analyse"
            element={
              <AuthNoPower>
                <ProjectAnalyse />
              </AuthNoPower>
            }
          />
          <Route
            path="system/useradmin"
            element={
              <AuthNoPower>
                <UserAdmin />
              </AuthNoPower>
            }
          />
          <Route
            path="system/version"
            element={
              <AuthNoPower>
                <AppVersion />
              </AuthNoPower>
            }
          />
          <Route path="404" element={<NotFound />} />
          <Route path="401" element={<NoPower />} />
          <Route path="*" element={<Navigate to="404" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default RouterCom;
