/* Tree选择 - 角色选择 - 多选 */
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Tree, Modal } from "antd";
import { cloneDeep } from "lodash";
import { TreeDataInfo } from "@/pages/Project/ProjectManagement/index.type";

// ==================
// 类型声明
// ==================

interface Props {
  title: string; // 标题
  data: TreeDataInfo[]; //  原始数据
  defaultKeys: number[]; // 当前默认选中的key们
  visible: boolean; // 是否显示
  loading: boolean; // 确定按钮是否在等待中状态
  onOk: (keys: string[], role: TreeDataInfo[]) => Promise<void>; // 确定
  onClose: () => void; // 关闭
}

// ==================
// 本组件
// ==================
export default function RoleTreeComponent(props: Props): JSX.Element {
  const [nowKeys, setNowKeys] = useState<string[]>([]);

  useEffect(() => {
    setNowKeys(props.defaultKeys.map((item) => `${item}`));
  }, [props.defaultKeys]);

  // 工具 - 递归将扁平数据转换为层级数据
  const dataToJson = useCallback(
    (one: TreeDataInfo | undefined, data: TreeDataInfo[]) => {
      let kids;
      if (!one) {
        // 第1次递归
        kids = data.filter((item: TreeDataInfo) => !item.parent);
      } else {
        kids = data.filter(
          (item: TreeDataInfo) => item.parent?.key === one.key
        );
      }
      kids.forEach(
        (item: TreeDataInfo) => (item.children = dataToJson(item, data))
      );
      return kids.length ? kids : undefined;
    },
    []
  );

  // 点击确定时触发
  const onOk = useCallback(() => {
    // 通过key返回指定的数据
    const res = props.data.filter((item) => {
      return nowKeys.includes(`${item.key}`);
    });
    // 返回选中的keys和选中的具体数据
    props.onOk && props.onOk(nowKeys, res);
  }, [props, nowKeys]);

  // 点击关闭时触发
  const onClose = useCallback(() => {
    props.onClose();
  }, [props]);

  // 选中或取消选中时触发
  const onCheck = useCallback((keys: any) => {
    setNowKeys(keys);
  }, []);

  // ==================
  // 计算属性 memo
  // ==================

  // 处理原始数据，将原始数据处理为层级关系
  const sourceData = useMemo(() => {
    const roleData: TreeDataInfo[] = cloneDeep(props.data);

    return dataToJson(undefined, roleData) || [];
  }, [props.data, dataToJson]);

  console.log(sourceData);

  return (
    <Modal
      title={props.title || "请选择"}
      open={props.visible}
      wrapClassName="menuTreeModal"
      confirmLoading={props.loading}
      onOk={onOk}
      onCancel={onClose}
    >
      <Tree
        checkable
        selectable={false}
        checkedKeys={nowKeys}
        onCheck={onCheck}
        treeData={sourceData}
      />
    </Modal>
  );
}
