import { LazyLoadComponent } from '../../public/util/lazyLoad';
import React from 'react';
import { Menu, Icon } from 'antd';
import pagePermission from './util/pagePermission';
import Link from '@component/Link';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
// LazyLoadComponent将会在路由切换到该页面时[组件contructor时]懒加载
// 这里看起来写的这么蠢的原因 参考 https://wiki.bytedance.net/pages/viewpage.action?pageId=201206702
const Doc = LazyLoadComponent(() => import('./pages/Doc'));
const DocEditor = LazyLoadComponent(() => import('./pages/Doc/DocEditor'));
const Top = LazyLoadComponent(() => import('./pages/Top'));
const Api = LazyLoadComponent(() => import('./pages/Top/Api'));
const KeyManage = LazyLoadComponent(() => import('./pages/Top/KeyManage'));
//const Account = LazyLoadComponent(() => import('./pages/Account'));
const User = LazyLoadComponent(() => import('./pages/User'));
const Basics = LazyLoadComponent(() => import('./pages/User/basics'));
const Audit = LazyLoadComponent(() => import('./pages/Audit'));
const AuditManage = LazyLoadComponent(() => import('./pages/Audit/manage'));
const Product = LazyLoadComponent(() => import('./pages/Billing/Product'));
const ApiParam = LazyLoadComponent(() => import('./pages/Top/Api/ApiParam'));
const Resource = LazyLoadComponent(() => import('./pages/Top/Resource'));
const CostStatistics = LazyLoadComponent(() => import('./pages/CostStatistics'));
const CostVod = LazyLoadComponent(() => import('./pages/CostStatistics/Vod'));
const CostLive = LazyLoadComponent(() => import('./pages/CostStatistics/Live'));
const OrderManage = LazyLoadComponent(() => import('./pages/Finance/OrderManage'));
const OrderHome = LazyLoadComponent(() => import('./pages/Finance/OrderManage/home'));
const BillManage = LazyLoadComponent(() => import('./pages/Finance/BillManage'));
const BillHome = LazyLoadComponent(() => import('./pages/Finance/BillManage/home'));
const BillOverview = LazyLoadComponent(() => import('./pages/BillOverview'));
const OrderDetail = LazyLoadComponent(() => import('./pages/Finance/OrderDetail'));
const BillDetail = LazyLoadComponent(() => import('./pages/Finance/BillDetail'));
const Instance = LazyLoadComponent(() => import('./pages/Instance'));
const InstanceHome = LazyLoadComponent(() => import('./pages/Instance/home'));
const RTC = LazyLoadComponent(() => import('./pages/Billing/Product/RTC'));
const RTCCOMMON2 = LazyLoadComponent(() => import('./pages/Billing/Product/RTC/Common'));
const CommonService = LazyLoadComponent(() => import('./pages/Billing/Product/common'));
const Common = LazyLoadComponent(() => import('./pages/Billing/Product/common/Common'));
const ECS = LazyLoadComponent(() => import('./pages/Billing/Product/ECS'));
const ECSCommon = LazyLoadComponent(() => import('./pages/Billing/Product/ECS/Common'));
const ECSSpecial = LazyLoadComponent(() => import('./pages/Billing/Product/ECS/Special'));
const ECSSpecialManager = LazyLoadComponent(() => import('./pages/Billing/Product/ECS/Special/manager'));
const all = LazyLoadComponent(() => import('./pages/Finance/BillManage/all'));
const digital = LazyLoadComponent(() => import('./pages/Billing/Product/digitalCommon'));
const digitalCommon = LazyLoadComponent(() => import('./pages/Billing/Product/digitalCommon/Common'));
const digitalSpecial = LazyLoadComponent(() => import('./pages/Billing/Product/digitalCommon/Special'));
const digitalSpecialManager = LazyLoadComponent(() => import('./pages/Billing/Product/digitalCommon/Special/manager'));
const VOD2 = LazyLoadComponent(() => import('./pages/Billing/Product/VOD2'));
const VODCommon2 = LazyLoadComponent(() => import('./pages/Billing/Product/VOD2/Common'));
const VODSpecial2 = LazyLoadComponent(() => import('./pages/Billing/Product/VOD2/Special'));
const VODSpecialManager2 = LazyLoadComponent(() => import('./pages/Billing/Product/VOD2/Special/manager'));
const App = LazyLoadComponent(() => import('./pages/RBAC/App'));
const RBACResource = LazyLoadComponent(() => import('./pages/RBAC/Resource'));
const UserGroup = LazyLoadComponent(() => import('./pages/RBAC/UserGroup'));
const Auth = LazyLoadComponent(() => import('./pages/RBAC/UserGroup/Auth'));
const Policy = LazyLoadComponent(() => import('./pages/Product/IAM/Policy'));
export const ROOT_PATH = '/app';
const NOOP = () => { };
const pageConfig = {
  'account': {
    name: '用户中心管理',
    renderSubMenu(menuNode, renderPath, subMenu, manageOpenFunc = NOOP) {
      return (
        <SubMenu key={renderPath} onTitleClick={manageOpenFunc} title={<span><Icon type="user" />{menuNode.name}</span>}>
          {
            subMenu
          }
        </SubMenu>
      );
    },
    children: {
      'manage': {
        name: '用户管理',
        component: User,
        children: {
          'basics': {
            name: '基本资料',
            component: Basics,
            menuIgnore: true,
            path: ':accountId/'
          }
        }
      },
      'audit': {
        name: '服务审核管理',
        component: Audit,
        children: {
          'manage': {
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.serviceName];
            },
            component: AuditManage,
            menuIgnore: true,
            path: ':serviceName/'
          }
        }
      }
    },
  },
  'base': {
    name: '基础功能管理',
    renderSubMenu(menuNode, renderPath, subMenu, manageOpenFunc = NOOP) {
      return (
        <SubMenu key={renderPath} onTitleClick={manageOpenFunc} title={<span><Icon type="setting" theme="filled" />{menuNode.name}</span>}>
          {
            subMenu
          }
        </SubMenu>
      );
    },
    children: {
      'doc': {
        name: '文档中心',
        component: Doc,
        children: {
          'docedit': {
            name: '文档编辑',
            component: DocEditor,
            menuIgnore: true,
            path: ':BusinessID/'
          }
        },
      },
      'top': {
        name: 'TOP管理',
        component: Top,
        children: {
          'api': {
            name: 'API 管理',
            component: Api,
            menuIgnore: true,
            path: 'api/:ServiceId/',
            children: {
              'param': {
                name: 'API参数管理',
                component: ApiParam,
                menuIgnore: true,
                path: ':ApiId/'
              }
            }
          },
          'key': {
            name: '密钥管理',
            component: KeyManage,
            menuIgnore: true,
            path: 'key/:ServiceId/'
          },
          'resource': {
            name: '资源管理',
            component: Resource,
            menuIgnore: true,
            path: 'resource/:ServiceId/'
          }
        }
      }
    },
  },
  'billing': {
    name: '财务中心管理',
    renderSubMenu(menuNode, renderPath, subMenu, manageOpenFunc = NOOP) {
      return (
        <SubMenu key={renderPath} onTitleClick={manageOpenFunc} title={<span><Icon type="money-collect" theme="filled" />{menuNode.name}</span>}>
          {
            subMenu
          }
        </SubMenu>
      );
    },
    children: {
      'product': {
        name: '商品管理',
        component: Product,
        children: {
          'digital': {
            menuIgnore: true,
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.service];
            },
            component: digital,
            path: 'digital/:service/',
            children: {
              'common': {
                name: '普通商品',
                component: digitalCommon,
                menuIgnore: true,
                path: 'common/:ID/'
              },
              'special': {
                name: '特殊定价',
                component: digitalSpecial,
                menuIgnore: true,
                path: 'special/:ID/',
                children: {
                  'manager': {
                    name: '特殊定价管理',
                    component: digitalSpecialManager,
                    menuIgnore: true,
                    path: ':accountID/'
                  }
                }
              }
            }
          },
          'common': {
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.service];
            },
            component: CommonService,
            menuIgnore: true,
            path: 'common/:service/',
            children: {
              'common': {
                name: '普通商品',
                component: Common,
                menuIgnore: true,
                path: 'common/:ID/'
              },
            }
          },
          'rtc': {
            name: '实时通信',
            component: RTC,
            menuIgnore: true,
            children: {
              'common': {
                name: '普通商品',
                component: RTCCOMMON2,
                menuIgnore: true,
                path: 'common/:ID/'
              }
            }
          },
          'ecs': {
            menuIgnore: true,
            name: '云主机',
            component: ECS,
            children: {
              'common': {
                name: '普通商品',
                component: ECSCommon,
                menuIgnore: true,
                path: 'common/:ID/'
              },
              'special': {
                name: '特殊定价',
                component: ECSSpecial,
                menuIgnore: true,
                path: 'special/:ID/',
                children: {
                  'manager': {
                    name: '特殊定价管理',
                    component: ECSSpecialManager,
                    menuIgnore: true,
                    path: ':accountID/'
                  }
                }
              }
            }
          },
          'vod2': {
            menuIgnore: true,
            name: '视频点播',
            component: VOD2,
            children: {
              'common': {
                name: '普通商品',
                component: VODCommon2,
                menuIgnore: true,
                path: 'common/:ID/'
              },
              'special': {
                name: '特殊定价',
                component: VODSpecial2,
                menuIgnore: true,
                path: 'special/:ID/',
                children: {
                  'manager': {
                    name: '特殊定价管理',
                    component: VODSpecialManager2,
                    menuIgnore: true,
                    path: ':accountID/'
                  }
                }
              }
            }
          },
        },
      },
      'order': {
        name: '订单管理',
        component: OrderHome,
        children: {
          detail: {
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.serviceName];
            },
            menuIgnore: true,
            component: OrderManage,
            path: ':serviceName/',
            children: {
              detail: {
                menuIgnore: true,
                name: '订单详情',
                component: OrderDetail,
                path: ':orderId/'
              }
            }
          }

        }
      },
      'billOverview': {
        name: '账单总览',
        component: BillOverview,
        // children: {
        //   detail: {
        //     name: params => {
        //       return window.INIT_CONFIG.expenseConfig.Service[params.match.params.serviceName];
        //     },
        //     menuIgnore: true,
        //     component: OrderManage,
        //     path: ':serviceName/',
        //     children: {
        //       detail: {
        //         menuIgnore: true,
        //         name: '订单详情',
        //         component: OrderDetail,
        //         path: ':orderId/'
        //       }
        //     }
        //   }

        // }
      },
      'bill': {
        name: '账单管理',
        component: BillHome,
        children: {
          'all': {
            menuIgnore: true,
            name: '全部',
            component: all,
            children: {
              detail: {
                menuIgnore: true,
                name: '账单详情',
                component: BillDetail,
                path: ':billId/'
              }
            }
          },
          detail: {
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.serviceName];
            },
            menuIgnore: true,
            path: ':serviceName/',
            component: BillManage,
            children: {
              detail: {
                menuIgnore: true,
                name: '账单详情',
                component: BillDetail,
                path: ':billId/'
              }
            }
          }
        }
      },
      'instance': {
        name: '实例管理',
        component: InstanceHome,
        children: {
          detail: {
            name: params => {
              return window.INIT_CONFIG.expenseConfig.Service[params.match.params.serviceName];
            },
            menuIgnore: true,
            path: '/:serviceName/',
            component: Instance,
          }
        }
      },
      'cost': {
        name: '成本统计',
        component: CostStatistics,
        children: {
          'vod': {
            name: '视频点播',
            menuIgnore: true,
            component: CostVod
          },
          'live': {
            name: '视频直播',
            menuIgnore: true,
            component: CostLive
          }
        }
      },
    },
  },
  'ops': {
    name: '产品运维管理',
    renderSubMenu(menuNode, renderPath, subMenu, manageOpenFunc = NOOP) {
      return (
        <SubMenu key={renderPath} onTitleClick={manageOpenFunc} title={<span><Icon type="tool" theme="filled" />{menuNode.name}</span>}>
          {
            subMenu
          }
        </SubMenu>
      );
    },
    children: {
      'iam': {
        name: 'IAM管理',
        children: {
          'policy': {
            name: '系统预设策略',
            component: Policy,
            renderItem(menuNode, renderPath) {
              return <MenuItem key={renderPath}><Link to={renderPath}><span style={{ marginLeft: '-15px' }}>{menuNode.name}</span></Link></MenuItem>;
            }
          }
        },
      }
    },
  },
  'rbac': {
    name: '权限控制',
    menuIgnore: true,
    children: {
      'app': {
        name: '应用管理',
        menuIgnore: true,
        component: App,
        children: {
          'resource': {
            name: '资源管理',
            menuIgnore: true,
            component: RBACResource,
          },
          'usergroup': {
            name: '用户组管理',
            component: UserGroup,
            menuIgnore: true,
            children: {
              detail: {
                menuIgnore: true,
                name: '授权',
                component: Auth,
                path: '/:appId/:groupId/'
              }
            }
          },
        }
      },
    },
  }
};
// 生成路由
function getInitPath(children) {
  let defaultPath;
  if (Object.keys(children).length > 0) {
    const initKey = Object.keys(children)[0];
    const initNode = children[initKey];
    defaultPath = `/${initNode.path ? initNode.path.replace(/(^\/|\/$)/, '') : initKey}`;
    if (initNode.children && !initNode.component) {
      defaultPath += getInitPath(initNode.children);
    }
  }
  return defaultPath;
}
pagePermission(pageConfig);
const defaultPath = getInitPath(pageConfig) || '/';
export const DEFAULT_PATH = ROOT_PATH.replace(/\/$/, '') + defaultPath;
export default pageConfig;