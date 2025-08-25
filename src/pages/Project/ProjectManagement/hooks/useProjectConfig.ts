// hooks/useProjectConfig.ts
import { useState } from 'react';
import { CompanyInfo } from '../index.type';
import { message } from 'antd';
import pmApi from "@/api/pm";
import sysApi from "@/api/sys";
import { useMount } from 'react-use';
import tools from '@/util/tools';
import { UserInfo } from '@/models/index.type';
export function useProjectConfig(processHandler: any) {
  const [companyList, setCompanyList] = useState<SelectData[]>([]);
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [procedureList, setProcedureList] = useState<any[]>([])
 // 分公司
  async function onGetCompanyData(): Promise<void> {
    try {
      const res = await pmApi.getCompanyList();
      if (res && res.success) {
        setCompanyList(
          res.data.map((item: CompanyInfo) => {
            return {
              label: item.name,
              value: item.id,
            };
          })
        );
      } else {
        message.error(res?.message ?? "数据获取失败");
      }
    } finally {
      
    }
  }
  // 用户
  async function onGetUserData(): Promise<void> {
    return new Promise(async function (resolve, reject) {
      const res = await sysApi.getUserList(tools.clearNull({ name: "" }));
      if (res && res.success) {
        setUserList(res.data);
        resolve();
      } else {
        message.error(res?.message ?? "数据获取失败");
        reject();
      }
    });
  }

  async function onGetProcedureData(): Promise<void> {
      return new Promise(async function(resolve, reject) {
        const res = await pmApi.getProcedureList();
        if (res && res.success) {
          // 设置流程配置
          setProcedureList(res.data)
           processHandler.setProcedureConfig(res.data[0]);
            processHandler.setNodeType();
          resolve();
        } else {
          message.error(res?.message ?? "数据获取失败");
          reject();
        }
      });
    }
  // 生命周期 - 组件挂载时触发一次
  useMount(async () => {
    onGetCompanyData();
    await onGetUserData();
    await onGetProcedureData();
  })

  return {
    companyList,
    userList,
    procedureList
  };
}
