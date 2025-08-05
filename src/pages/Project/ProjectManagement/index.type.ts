/** 当前页面所需所有类型声明 **/

export type ProjectInfo = {
  id?: number;
  name: string;
  projCode: string;
  year: string;
  type: number;
  status: number;
  amount: string;
  stage: number;
  stages: any[];
  company: number;
};

// 列表table的数据类型
export interface TableRecordData extends ProjectInfo {
  id: number;
  newId?: string;
  durationLabel?: string;
}

export type operateType = "add" | "up" | "handle";

export type ModalType = {
  operateType: operateType;
  nowData: TableRecordData | null;
  modalShow: boolean;
  modalLoading: boolean;
};

export type SearchInfo = {
  username: string | undefined; // 用户名
  conditions: number | undefined; // 状态
};

export type RoleTreeInfo = {
  roleData: TreeDataInfo[]; // 所有的角色数据
  roleTreeLoading: boolean; // 控制树的loading状态，因为要先加载当前role的菜单，才能显示树
  roleTreeShow: boolean; // 角色树是否显示
  roleTreeDefault: number[]; // 用于角色树，默认需要选中的项
};

export type TreeDataInfo = {
  key: string | number;
  title: string;
  children?: TreeDataInfo[];
  parent?: TreeDataInfo;
};

export type CompanyInfo = {
  id: number;
  name: string;
};
