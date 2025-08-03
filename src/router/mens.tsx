// 所有的菜单数据
export const menus = [
  {
    id: 1,
    title: "首页",
    icon: "icon-home",
    url: "/home",
    parent: null,
    desc: "首页",
    sorts: 0
  },
  {
    id: 2,
    title: "项目管理",
    icon: "icon-setting",
    url: "/project",
    parent: null,
    desc: "项目管理目录分支",
    sorts: 1
  },
  {
    id: 3,
    title: "项目管理",
    icon: "icon-user",
    url: "/project/management",
    parent: 2,
    desc: "项目管理/项目管理",
    sorts: 0,
  },
  {
    id: 4,
    title: "流程管理",
    icon: "icon-user",
    url: "/procedure/management",
    parent: 2,
    desc: "项目管理/流程管理",
    sorts: 1,
  },
  {
    id: 5,
    title: "系统管理",
    icon: "icon-setting",
    url: "/system",
    parent: null,
    desc: "系统管理目录分支",
    sorts: 2
  },
  {
    id: 6,
    title: "用户管理",
    icon: "icon-user",
    url: "/system/useradmin",
    parent: 5,
    desc: "系统管理/用户管理",
    sorts: 0,
  },
];