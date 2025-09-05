/** 当前页面所需所有类型声明 **/

import { VersionBasicInfoParam } from "@/models/index.type";

export type { UserBasicInfoParam, VersionBasicInfoParam } from "@/models/index.type";

// 列表table的数据类型
export type TableRecordData = {
  id: number; // ID
  wgtUrl: string;
  name: string | number;
  version: string | number;
  remark?: string;
};

export type operateType = "add";

export type ModalType = {
  operateType: operateType;
  nowData: VersionBasicInfoParam | null;
  modalShow: boolean;
  modalLoading: boolean;
};

export type SearchInfo = {
  name: string | undefined;
};
