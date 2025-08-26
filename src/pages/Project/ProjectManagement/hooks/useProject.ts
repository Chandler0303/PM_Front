// hooks/useProject.ts
import { useState, useEffect, useCallback } from "react";
import { SearchInfo } from "../index.type";
import { message } from "antd";
import pmApi from "@/api/pm";
export function useProject(initialParams: SearchInfo) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const refresh = useCallback(
    async (extraParams?: any) => {
      setLoading(true);
      try {
        const res = await pmApi.getProjectList({
          ...params,
        });
        if (res && res.success) {
          setData(res.data);
        } else {
          message.error(res?.message ?? "数据获取失败");
        }
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    refresh(); // 初始化请求
  }, [refresh]);

  return {
    data,
    loading,
    refresh,
    params,
    setParams, // 允许外部修改查询参数
  };
}
