// @ts-nocheck
// 不需要下面这几行，只是本地发布DEMO用
// const Mock = require("mockjs");
// Mock.setup({
//   timeout: "0-500",
// });

import { message } from "antd";
import { get } from "lodash";
/**
 * 模拟数据
 * 这个文件使用了兼容IE11的语法，
 * 也没有弄成ts,因为server.js中要用到此文件
 * **/

// ID序列
let id_sequence = 1000;

// 所有的菜单数据
const menus = [
  {
    id: 1,
    title: "首页",
    icon: "icon-home",
    url: "/home",
    parent: null,
    desc: "首页",
    sorts: 0,
  },
  {
    id: 2,
    title: "项目管理",
    icon: "icon-setting",
    url: "/project",
    parent: null,
    desc: "项目管理目录分支",
    sorts: 1,
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
    sorts: 2,
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

// 所有的权限数据
const powers = [
  {
    id: 1,
    menu: 3,
    title: "新增",
    code: "user:add",
    desc: "用户管理 - 添加权限",
    sorts: 1,
  },
  {
    id: 2,
    menu: 3,
    title: "修改",
    code: "user:up",
    desc: "用户管理 - 修改权限",
    sorts: 2,
  },
  {
    id: 4,
    menu: 3,
    title: "删除",
    code: "user:del",
    desc: "用户管理 - 删除权限",
    sorts: 4,
    conditions: 1,
  },
  {
    id: 5,
    menu: 3,
    title: "分配角色",
    code: "user:role",
    desc: "用户管理 - 分配角色权限",
    sorts: 5,
  },
];

// 所有的用户数据
const users = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    phone: "13600000000",
    email: "admin@react.com",
    desc: "超级管理员",
    menus: menus.map((item) => item.id), // 该用户拥有的菜单ID
    powers: powers.map((item) => item.id), // 该用户拥有的权限ID{
  },
];

/**
 * 工具 - decode
 * **/
const decode = function (str) {
  if (!str) {
    return str;
  }
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * 方法
 * **/
// 登录
const onLogin = function (p) {
  const u = users.find(function (item) {
    return item.username === p.username;
  });
  if (!u) {
    return { status: 204, data: null, message: "该用户不存在" };
  } else if (u.password !== p.password) {
    return { status: 204, data: null, message: "密码错误" };
  }
  return { status: 200, data: u, message: "登录成功" };
};
// 获取所有菜单
const getMenus = function (p) {
  return { status: 200, data: menus, message: "success" };
};
// 获取菜单（根据ID）
const getMenusById = function (p) {
  // const p = JSON.parse(request.body);
  let res = [];
  if (p.id instanceof Array) {
    res = menus.filter(function (item) {
      return p.id.includes(item.id);
    });
  } else {
    const t = menus.find(function (item) {
      return item.id === p.id;
    });
    res.push(t);
  }
  return { status: 200, data: res, message: "success" };
};

// 根据菜单ID查询其下权限
const getPowerByMenuId = function (p) {
  // const p = JSON.parse(request.body);
  const menuId = Number(p.menuId);

  if (menuId) {
    return {
      status: 200,
      data: powers
        .filter(function (item) {
          return item.menu === menuId;
        })
        .sort(function (a, b) {
          return a.sorts - b.sorts;
        }),
      message: "success",
    };
  } else {
    return { status: 200, data: [], message: "success" };
  }
};
// 根据权限ID查询对应的权限
const getPowerById = function (p) {
  // const p = JSON.parse(request.body);
  let res = [];
  if (p.id instanceof Array) {
    res = powers.filter(function (item) {
      return p.id.includes(item.id);
    });
  } else {
    const t = powers.find(function (item) {
      return item.id === p.id;
    });
    res.push(t);
  }
  return { status: 200, data: res, message: "success" };
};
// 查询角色（分页,条件筛选）
const getRoles = function (p) {
  const map = roles.filter(function (item) {
    let yeah = true;
    const title = decode(p.title);
    const conditions = Number(p.conditions);
    if (title && !item.title.includes(title)) {
      yeah = false;
    }
    if (conditions && item.conditions !== conditions) {
      yeah = false;
    }
    return yeah;
  });
  const r = map.sort(function (a, b) {
    return a.sorts - b.sorts;
  });
  const res = r.slice((p.pageNum - 1) * p.pageSize, p.pageNum * p.pageSize);
  return {
    status: 200,
    data: { list: res, total: map.length },
    message: "success",
  };
};
// 查询角色（所有）
const getAllRoles = function (p) {
  return { status: 200, data: roles, message: "success" };
};
// 查询角色（通过角色ID）
const getRoleById = function (p) {
  // const p = JSON.parse(request.body);
  let res = [];
  if (p.id instanceof Array) {
    res = roles.filter(function (item) {
      return p.id.includes(item.id);
    });
  } else {
    const t = roles.find(function (item) {
      return item.id === p.id;
    });
    res.push(t);
  }
  return { status: 200, data: res, message: "success" };
};
// 根据角色ID查询该角色所拥有的菜单和权限详细信息
const findAllPowerByRoleId = function (p) {
  // const p = JSON.parse(request.body);
  const t = roles.find(function (item) {
    return item.id === p.id;
  });
  if (t) {
    const res = t.powers.map(function (item, index) {
      const _menu = menus.find(function (v) {
        return v.id === item.menuId;
      });
      const _powers = item.powers.map(function (v) {
        return powers.find(function (p) {
          return p.id === v;
        });
      });
      _menu.powers = _powers.filter(function (item) {
        return item.conditions === 1;
      });
      return _menu;
    });
    return { status: 200, data: res, message: "success" };
  } else {
    return { status: 204, data: null, message: "未找到该角色" };
  }
};
// 获取所有的菜单及权限数据 - 为了构建PowerTree组件
const getAllMenusAndPowers = function (p) {
  const res = menus.map(function (item) {
    const _menu = item;
    const _powers = powers.filter(function (v) {
      return v.menu === item.id && v.conditions === 1;
    });
    _menu.powers = _powers;
    return _menu;
  });
  return { status: 200, data: res, message: "success" };
};
// 给指定角色分配菜单和权限
const setPowersByRoleId = function (p) {
  // const p = JSON.parse(request.body);
  const oldIndex = roles.findIndex(function (item) {
    return item.id === p.id;
  });
  if (oldIndex !== -1) {
    const pow = p.menus.map(function (item) {
      return { menuId: item, powers: [] };
    });
    // 将每一个权限id归类到对应的菜单里
    p.powers.forEach(function (ppItem) {
      // 通过权限id查询该权限对象
      const thePowerData = powers.find(function (pItem) {
        return pItem.id === ppItem;
      });
      if (thePowerData) {
        const theMenuId = thePowerData.menu;
        if (theMenuId) {
          const thePow = pow.find(function (powItem) {
            return powItem.menuId === theMenuId;
          });
          if (thePow) {
            thePow.powers.push(ppItem);
          }
        }
      }
    });

    roles[oldIndex].menuAndPowers = pow;
    return { status: 200, data: null, message: "success" };
  } else {
    return { status: 204, data: null, message: "未找到该条数据" };
  }
};

// 给指定角色分配菜单和权限
const setPowersByRoleIds = function (ps) {
  ps.forEach(function (p) {
    const oldIndex = roles.findIndex(function (item) {
      return item.id === p.id;
    });
    if (oldIndex !== -1) {
      const pow = p.menus.map(function (item) {
        return { menuId: item, powers: [] };
      });
      // 将每一个权限id归类到对应的菜单里
      p.powers.forEach(function (ppItem) {
        // 通过权限id查询该权限对象
        const thePowerData = powers.find(function (pItem) {
          return pItem.id === ppItem;
        });
        if (thePowerData) {
          const theMenuId = thePowerData.menu;
          if (theMenuId) {
            const thePow = pow.find(function (powItem) {
              return powItem.menuId === theMenuId;
            });
            if (thePow) {
              thePow.powers.push(ppItem);
            }
          }
        }
      });
      roles[oldIndex].menuAndPowers = pow;
    }
  });
  return { status: 200, data: null, message: "success" };
};

// 部门获取
const getOrg = function () {
  return {
    status: 200,
    data: [
      {
        id: 1,
        name: "test1",
      },
      {
        id: 2,
        name: "test2",
      },
    ],
    message: "success",
  };
};

const getProcedureList = function (p) {
  const res = [
    {
      id: 1,
      name: "流程1",
      config: [
        {
          seq: 1,
          stageName: "合同签订阶段",
          nodes: [
            {
              name: "中标公示结束",
              participants: [1, 3, 4],
            },
            {
              name: "甲方合同签订时间",
              plannedDays: 30,
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 2,
          stageName: "合同交底阶段",
          nodes: [
            {
              name: "合同交底会",
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 3,
          stageName: "技经中心完成成本下达",
          nodes: [
            {
              name: "合同交底会",
              plannedDays: 10,
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 4,
          stageName: "分包、物资招标阶段",
          nodes: [
            {
              name: "物资招标",
              participants: [1, 3, 4],
            },
            {
              name: "分包招标",
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 5,
          stageName: "工程实施阶段",
          nodes: [
            {
              name: "开工",
              participants: [1, 3, 4],
            },
            {
              name: "竣工验收",
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 6,
          stageName: "总包结算阶段",
          nodes: [
            {
              name: "接收结算资料",
              plannedDays: 10,
              participants: [1, 3, 4],
            },
            {
              name: "总包结算初审",
              plannedDays: 45,
              participants: [1, 3, 4],
            },
            {
              name: "总包结算",
              plannedDays: 15,
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 7,
          stageName: "分包结算阶段",
          nodes: [
            {
              name: "分包结算",
              plannedDays: 60,
              participants: [1, 3, 4],
            },
          ],
        },
        {
          seq: 8,
          stageName: "项目决算阶段",
          nodes: [
            {
              name: "分公司启动决算工作",
              participants: [1, 3, 4],
            },
            {
              name: "核实项目账务情况",
              plannedDays: 5,
              participants: [1, 3, 4],
            },
            {
              name: "项目账务关闭",
              plannedDays: 5,
              participants: [1, 3, 4],
            },
          ],
        },
      ],
    },
  ];
  return {
    status: 200,
    data: { list: res, total: res.length }, // 模拟数据
    message: "success",
  };
};

// 条件分页查询用户列表
const getUserList = function (p) {
  const pageNum = Number(p.pageNum); // 从第1页开始
  const pageSize = Number(p.pageSize);
  const res = users.slice((pageNum - 1) * pageSize, pageNum * pageSize);
  return {
    status: 200,
    data: { list: res, total: users.length },
    message: "success",
  };
};
// 添加用户
const addUser = function (p) {
  // const p = JSON.parse(request.body);
  p.id = ++id_sequence;
  users.push(p);
  return { status: 200, data: null, message: "success" };
};
// 修改用户
const upUser = function (p) {
  // const p = JSON.parse(request.body);
  const oldIndex = users.findIndex(function (item) {
    return item.id === p.id;
  });
  if (oldIndex !== -1) {
    const news = Object.assign({}, users[oldIndex], p);
    users.splice(oldIndex, 1, news);
    return { status: 200, data: null, message: "success" };
  } else {
    return { status: 204, data: null, message: "未找到该条数据" };
  }
};
// 删除用户
const delUser = function (p) {
  // const p = JSON.parse(request.body);
  const oldIndex = users.findIndex(function (item) {
    return item.id === p.id;
  });
  if (oldIndex !== -1) {
    users.splice(oldIndex, 1);
    return { status: 200, data: null, message: "success" };
  } else {
    return { status: 204, data: null, message: "未找到该条数据" };
  }
};

export default function (obj) {
  const url = obj.url;
  const body = obj.body;
  let params = typeof body === "string" ? JSON.parse(body) : body;
  let path = url;

  // 是get请求 解析参数
  if (url.includes("?")) {
    path = url.split("?")[0];
    const s = url.split("?")[1].split("&"); // ['a=1','b=2']
    params = {};

    for (let i = 0; i < s.length; i++) {
      if (s[i]) {
        const ss = s[i].split("=");
        params[ss[0]] = ss[1];
      }
    }
  }
  if (path.includes("http")) {
    path = path.replace(
      globalThis.location.protocol + "//" + globalThis.location.host,
      ""
    );
  }
  console.info("请求接口：", path, params);
  switch (path) {
    case "/api/login":
      return onLogin(params);
    case "/api/getmenus":
      return getMenus(params);
    case "/api/getMenusById":
      return getMenusById(params);
    case "/api/getpowerbymenuid":
      return getPowerByMenuId(params);
    case "/api/getPowerById":
      return getPowerById(params);
    case "/api/getroles":
      return getRoles(params);
    case "/api/getAllRoles":
      return getAllRoles(params);
    case "/api/getRoleById":
      return getRoleById(params);
    case "/api/findAllPowerByRoleId":
      return findAllPowerByRoleId(params);
    case "/api/getAllMenusAndPowers":
      return getAllMenusAndPowers(params);
    case "/api/setPowersByRoleId":
      return setPowersByRoleId(params);
    case "/api/setPowersByRoleIds":
      return setPowersByRoleIds(params);
    case "/api/getUserList":
      return getUserList(params);
    case "/api/addUser":
      return addUser(params);
    case "/api/upUser":
      return upUser(params);
    case "/api/delUser":
      return delUser(params);
    case "/api/getOrgList":
      return getOrg();
    case "/api/getProcedureList":
      return getProcedureList(params);
    default:
      return { status: 404, data: null, message: "api not found" };
  }
}
