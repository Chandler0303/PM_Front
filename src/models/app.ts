/**
 * 基础model
 * 在src/store/index.js 中被挂载到store上，命名为 app
 * **/

import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from "antd";
import { Dispatch, RootState } from "@/store";
import { UserInfo, AppState } from "./index.type";

const defaultState: AppState = {
  userinfo: null, // 当前用户基本信息
};
export default {
  state: defaultState,
  reducers: {
    reducerUserInfo(state: AppState, payload: UserInfo) {
      return {
        userinfo: payload,
      };
    },
    reducerLogout(state: AppState) {
      return {
        userinfo: null,
      };
    },
  },

  effects: (dispatch: Dispatch) => ({
    /**
     * 登录
     * @param { username, password } params
     * */
    async onLogin(params: { username: string; password: string }) {
      try {
        const res: Res = await axios.post("/api/auth/login", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 退出登录
     * @param null
     * **/
    async onLogout() {
      try {
        // 同 dispatch.app.reducerLogout();

        dispatch({ type: "app/reducerLogout", payload: null });
        sessionStorage.removeItem("userinfo");
        return "success";
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    async getUserInfo() {
      try {
        const res: Res = await axios.get("/api/user/info");
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 设置用户信息
     * @param: {*} params
     * **/
    async setUserInfo(params: UserInfo) {
      dispatch.app.reducerUserInfo(params);
      return "success";
    },

    /** 修改了角色/菜单/权限信息后需要更新用户的roles,menus,powers数据 **/
    async updateUserInfo(payload: null, rootState: RootState): Promise<any> {
      /** 2.重新查询角色信息 **/
      // const userinfo: UserInfo = rootState.app.userinfo;

      // const menus: Menu[] = userinfo.menus

      // const powers: Power[] = userinfo.powers

      // this.setUserInfo({
      //   ...userinfo,
      //   menus,
      //   powers,
      // });
      return;
    },
  }),
};
