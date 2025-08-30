/** 通用动态面包屑 **/
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Menu } from "@/models/index.type";

interface Props {
  menus: Menu[];
}

export default function BreadCom(props: Props): JSX.Element {
  const location = useLocation();

  /** 根据当前location动态生成对应的面包屑 **/
  const breads = useMemo(() => {
    const paths: string = location.pathname;
    const breads: Menu[] = [];

    let parentId: string | null = null;
    do {
      const pathObj: Menu | undefined = props.menus.find(
        (v) => v.id === parentId || v.url === paths
      );

      if (pathObj) {
        breads.push(
         pathObj
        );
        parentId = pathObj.parent;
      } else {
        parentId = null;
      }
    } while (parentId);

    breads.reverse();
    return breads;
  }, [location.pathname, props.menus]);

  return (
    <div className="flex items-center p-[15px]">
      <EnvironmentOutlined className="mr-[5px] text-[#22cc22]" />
      <Breadcrumb items={breads.map(bread => ({ title: bread.title, key: bread.id }))}></Breadcrumb>
    </div>
  );
}
