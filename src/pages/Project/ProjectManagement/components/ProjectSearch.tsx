import React, { ReactNode } from "react";
import { Button, Divider, Input, Cascader, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSetState } from "react-use";
import { SearchInfo } from "../index.type";

interface ProjectSearchProps {
  handleSearch: (params: SearchInfo) => void;
  stagesOptions: SelectData[],
  children?: ReactNode
}

const ProjectSearch: React.FC<ProjectSearchProps> = React.memo(({
  handleSearch,
  stagesOptions,
  children
}) => {
    console.log('search 刷新了')
     // 搜索相关参数
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    name: undefined, // 用户名
    year: undefined, // 年份
    nodeStatus: undefined, // 节点状态
  });

  const search = () => {
    handleSearch({...searchInfo})
  }

  return (
     <div className="g-search">
       {children}
        <Divider type="vertical" />
        {
          <ul className="search-ul">
            <li>
              <Input
                placeholder="请输入工程名"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchInfo({
                    name: e.target.value,
                  });
                }}
              />
            </li>
            {/* <li>
              <Select
                placeholder="请选择延期状态"
                allowClear
                style={{ width: "200px" }}
                onChange={(v: any) => {
                  setSearchInfo({
                    delayedStatus: v,
                  });
                }}
              >
                <Option value={-1}>延期</Option>
                <Option value={1}>正常</Option>
              </Select>
            </li> */}
            <li>
              <Cascader
                style={{ width: "300px" }}
                options={stagesOptions}
                placeholder="请选择节点查询"
                onChange={(value: any) => {
                  setSearchInfo({
                    nodeStatus: value,
                  });
                }}
              />
            </li>
            <li>
              <DatePicker
                picker="year"
                format="YYYY"
                placeholder="请选择年份"
                onChange={(v: any) => {
                  setSearchInfo({
                    year: v ? v.format("YYYY") : "",
                  });
                }}
              />
            </li>
            <li>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={search}
              >
                搜索
              </Button>
            </li>
          </ul>
        }
      </div>
  );
});

export default ProjectSearch;
