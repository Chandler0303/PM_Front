import { ProjectInfo } from "@/pages/Project/ProjectManagement/index.type";
import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from "antd";
import qs from "qs";

export default {
  async getProjectList(params: any) {
    try {
      const res: Res = await axios.get(
        `/api/project/list?${qs.stringify(params)}`
      );
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  async addProject(params: ProjectInfo) {
    try {
      const res: Res = await axios.post(`/api/project`, params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  async editProject(params: ProjectInfo) {
    try {
      const res: Res = await axios.put(`/api/project/modify`, params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },
  async editProjectNode(params: any) {
    try {
        const res: Res = await axios.put(`/api/project/node/modify`, params)
        return res
    } catch (err) {
        message.error("网络错误，请重试");
    }
  },
  /**
   * 删除项目
   * **/
  async delProject(params: { id: number }) {
    try {
      const res: Res = await axios.delete("/api/project/" + params.id);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 获取流程管理
   * **/
  async getProcedureList() {
    try {
      const res: Res = await axios.get(`/api/project/procedures`);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },
  // 流程编辑
  async editProcedureConfig(params: any) {
    try {
      const res: Res = await axios.put(`/api/project/procedureConfig`, params);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 部门查询
   */
  async getOrgList() {
    try {
      const res: Res = await axios.get(`/api/org/list`);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },

  /**
   * 分公司查询
   */
  async getCompanyList() {
    try {
      const res: Res = await axios.get(`/api/company/list`);
      return res;
    } catch (err) {
      message.error("网络错误，请重试");
    }
    return;
  },
};
