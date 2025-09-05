import { UserBasicInfoParam, VersionBasicInfoParam } from "@/models/index.type";
import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from "antd";
import qs from "qs";

export default {
  /**
   * 条件分页查询用户列表
   * **/
  async getUserList(params: { name?: string }) {
    try {
      const res: Res = await axios.get(
        `/api/user/list?${qs.stringify(params)}`
      );
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 添加用户
   * **/
  async addUser(params: UserBasicInfoParam) {
    try {
      const res: Res = await axios.post("/api/user", params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 修改用户
   * **/
  async upUser(id: number, params: UserBasicInfoParam) {
    try {
      const res: Res = await axios.put("/api/user/" + id, params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 删除用户
   * **/
  async delUser(params: { id: number }) {
    try {
      const res: Res = await axios.delete("/api/user/" + params.id);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 给用户分配角色
   * 用的也是upUser接口
   * **/
  async setUserRoles(params: { id: number; roles: number[] }) {
    try {
      const res: Res = await axios.post("/api/upUser", params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 条件分页查询版本列表
   * **/
  async getVersionList(params: { name?: string }) {
    try {
      const res: Res = await axios.get(
        `/api/version?${qs.stringify(params)}`
      );
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },
  /**
   * 添加版本
   * **/
  async addVersion(params: VersionBasicInfoParam) {
    try {
      const res: Res = await axios.post("/api/version", params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 删除版本
   * **/
  async delVersion(params: { id: number }) {
    try {
      const res: Res = await axios.delete("/api/version/" + params.id);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },
};
