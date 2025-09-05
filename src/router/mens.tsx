// 所有的菜单数据
export const menus = [
  {
    id: 'HOME',
    title: "首页",
    icon: "DesktopOutlined",
    url: "/home",
    parent: null,
    desc: "首页",
    sorts: 0,
  },
  {
    id: 'PROJECT',
    title: "项目管理",
    icon: "MenuOutlined",
    url: "/project",
    parent: null,
    desc: "项目管理目录分支",
    sorts: 1,
  },
  {
    id: 'PROJECT_MANAGEMENT',
    title: "项目管理",
    url: "/project/management",
    parent: "PROJECT",
    desc: "项目管理/项目管理",
    sorts: 0,
  },
  {
    id: "PROJECT_PROCEDURE",
    title: "流程管理",
    url: "/project/procedureMg",
    parent: "PROJECT",
    desc: "项目管理/流程管理",
    sorts: 1,
  },
  {
    id: "PROJECT_ANALYSE",
    title: "统计分析",
    url: "/project/analyse",
    parent: "PROJECT",
    desc: "项目管理/统计分析",
    sorts: 2,
  },
  {
    id: "SYSTEM",
    title: "系统管理",
    icon: "SettingOutlined",
    url: "/system",
    parent: null,
    desc: "系统管理目录分支",
    sorts: 2,
  },
  {
    id: "SYSTEM_USER",
    title: "用户管理",
    url: "/system/useradmin",
    parent: "SYSTEM",
    desc: "系统管理/用户管理",
    sorts: 0,
  },
  // {
  //   id: "SYSTEM_VERSION",
  //   title: "版本管理",
  //   url: "/system/version",
  //   parent: "SYSTEM",
  //   desc: "系统管理/版本管理",
  //   sorts: 1,
  // },
];

// 所有按钮权限
export const powers = [
  {
    id: "1001",
    name: "创建项目",
  },
  {
    id: "1002",
    name: "修改项目",
  },
  {
    id: "1003",
    name: "流程督查",
  },
];
