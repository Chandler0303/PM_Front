interface Page {
  pageNum: number;
  pageSize: number;
  total: number;
}

interface SelectData {
  label: string;
  value: number | string;
  data?: any;
}

// 接口的返回值类型
type Res =
  | {
      success: Boolean;
      data?: any; // 返回的数据
      message?: string; // 返回的消息
    }
  | undefined;
