import rbacEnhance from './util/businessRbac';
import getHost from '../../../util/host';
import { get, post } from '../../../util/byted/request';
import getConfigs from '../../public/publicConfig';
import { RBAC_APPS } from './util/constants';
import tcc from '@byted-service/tcc';
let expenseConfig;
const getExpenseConfig = async () => {
  try {
    const res = await tcc({
      serviceName: 'fe.videoarch.vadmin',
      key: 'expenseConfig',
    });
    if (res) {
      expenseConfig = JSON.parse(res);
    }
  } catch (e){
    console.log(e);
  }
};
getExpenseConfig();

const GetAccountV2 = async function(query, $curUser, $req, $res) {
  const host = await _getPassportHostV2();
  // console.log({ url: `${host}/account`, query, headers: {
  //   'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
  // } }, {}, $req, $res);
  return get({ url: `${host}/account`, query, headers: {
    'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
  } }, {}, $req, $res);
};

export const GetAccount = GetAccountV2;

const ecsSpecMap = {
  Region: '区域',
  Az: '可用区',
  Flavor: '实例规格',
  ImageName: '镜像名称',
  VolumeType: '云硬盘类型',
  Storage: '云硬盘大小',
  Os: '操作系统',
  Mem: '内存'
};

async function decoratorSpec(Spec, $req, $res) {
  const { expenseConfig = {} } = await getConfigs($req, $res);
  const { Region = {} } = expenseConfig;
  if (Spec.Region) {
    Spec.Region = Region[Spec.Region] || Spec.Region;
  }
  if (Spec.Storage) {
    Spec.Storage = Spec.Storage + 'GB';
  }
  if (Spec.Cpu) {
    Spec.Cpu = Spec.Cpu + '核';
  }
  if (Spec.Mem) {
    Spec.Mem = Spec.Mem + 'GB';
  }
  Object.keys(Spec).forEach(key => {
    if (ecsSpecMap[key]) {
      Spec[ecsSpecMap[key]] = Spec[key];
      delete Spec[key];
    }
  });
  return Spec;
}
async function _getPassportHostV2() {
  const host = await getHost.passport();
  return `http://${host}/v2`;
}

export async function UpdateTagsV2(query, $curUser, $req, $res) {
  const host = await _getPassportHostV2();
  const promises = [];
  query.addTags && query.addTags.map(tag => {
    promises.push(
      post({ url: `${host}/tag/add`, data: {
        AccountId: query.AccountId,
        TagKey: tag.TagKey,
        TagValue: tag.TagValue
      }, headers: {
        'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
      } }, {}, $req, $res)
    );
  });
  query.delTags && query.delTags.map(tag => {
    promises.push(
      post({ url: `${host}/tag/remove`, data: {
        AccountId: query.AccountId,
        TagKey: tag.TagKey,
        TagValue: tag.TagValue
      }, headers: {
        'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
      } }, {}, $req, $res)
    );
  });
  return Promise.all(promises);
}

export default function enhanceApi(Apis) {
  Apis.ListAppGroupAndCount = async (params, $curUser, $req, $res) => {
    const res = await Apis.ListAppGroup(params, $curUser, $req, $res);
    const p = {
      ...params,
      Limit: 1,
    };
    const list = res.Result.List;
    let promiseAll = [];
    for (let i = 0; i < list.length; i++) {
      const ele = list[i];
      p.GroupId = ele.Id;
      const param = {
        ...p
      };
      ((ele,param) => {
        promiseAll.push(
          Apis.ListEmployeeOfGroup(param, $curUser, $req, $res).then(res => {
            if (res.Result)
              ele.count = res.Result.Total;
          })
        );
      })(ele,param);
    }
    await Promise.all(promiseAll);
    return res;
  };
  Apis.GetAccountInfo = async function({ AccountId }, $curUser, $req, $res) {
    const queryAccount = await Apis.QueryAccountV2({ AccountIds: [AccountId] }, $curUser, $req, $res);
    return queryAccount.Result.List;
  };
  Apis.GetAccountIdFuzzy = async function({ Identity }, $curUser, $req, $res) {
    const queryAccount = await Apis.QueryAccountV2({ QueryName: Identity }, $curUser, $req, $res);
    return queryAccount.Result.List;
  };
  Apis.QueryAccountV2 = async function(query, $curUser, $req, $res) {
    const host = await _getPassportHostV2();
    return get({ url: `${host}/account/list`, query, headers: {
      'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
    } }, {}, $req, $res);
  };
  Apis.GetAccountV2 = GetAccountV2;
  Apis.UpdateEmailV2 = async function(data, $curUser, $req, $res) {
    const host = await _getPassportHostV2();
    return post({ url: `${host}/account/email/update`, data, headers: {
      'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
    } }, {}, $req, $res);
  };
  Apis.UpdateTagsV2 = UpdateTagsV2;
  Apis.GetProfileV2 = async function(query, $curUser, $req, $res) {
    const host = await _getPassportHostV2();
    return get({ url: `${host}/profile`, query, headers: {
      'Authorization': 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I='
    } }, {}, $req, $res);
  };
  Apis.GetOrderWithRegion = async function ({ OrderId }, $curUser, $req, $res) {
    const orderRes = await Apis.GetOrder({ OrderId }, $curUser, $req, $res);
    try {
      if (orderRes.Result && orderRes.Result.Order) {
        const { ProductMetadata = {} } = orderRes.Result.Order;
        const { ProductGroupId, AccountId } = ProductMetadata;
        orderRes.Result.Order.Region = (await Apis.GetProductGroup({ ProductGroupId, AccountId }, $curUser, $req, $res)).Result.ProductGroupMetadata.Region;
        if (orderRes.Result.Order.Spec) {
          const { Spec, ProductMetadata } = orderRes.Result.Order;
          if (Spec.Az) {
            ProductMetadata.BillingMethodCombination.some(bMethod => {
              if (bMethod.Key === 'az') {
                Spec.Az =  bMethod.DisplayName;
              }
            });
          }
          orderRes.Result.Order.Spec = await decoratorSpec(Spec, $req, $res);
        }
      }
    } catch (e) {
      console.log(e);
    }
    return orderRes;
  };
  Apis.GetBillWithRegion = async function ({ BillId }, $curUser, $req, $res) {
    const billRes = await Apis.GetBill({ BillId }, $curUser, $req, $res);
    try {
      if (billRes.Result && billRes.Result.Bill) {
        const { OrderMetadata, Measures } = billRes.Result.Bill;
        if (billRes.Result.Bill.Service === 'tce') {
          let MeasuresTemp = [];
          getExpenseConfig();
          const map = expenseConfig.CommonService[billRes.Result.Bill.Service];
          Measures.forEach(measure => {
            const measureTempIndex = MeasuresTemp.findIndex(m => measure.BeginTime === m.BeginTime && measure.EndTime === m.EndTime);
            let measureTemp;
            const [ category, region, az ] = measure.SubCategory.split('|');
            if (measureTempIndex === -1) {
              measureTemp = measure;
              measureTemp.Spec = {
                '区域': expenseConfig.Region[region],
                '可用区': expenseConfig.AZ[az]
              };
              measureTemp.Prices = {};
              MeasuresTemp.push(measureTemp);
            } else {
              measureTemp = MeasuresTemp[measureTempIndex];
              measureTemp.Amount += measure.Amount;
            }
            measureTemp.Spec[map.spec[category].name] = measure.Count + map.spec[category].unit;
            measureTemp.Prices[map.columns[category].name] = measure.Price + map.columns[category].unit;
          });
          billRes.Result.Bill.Measures = MeasuresTemp;
        } else if (billRes.Result.Bill.Service === 'tos') {
          if (Measures) {
            Measures.forEach((measure, index) => {
              const [ category, region ] = measure.SubCategory.split('|');
              Measures[index].service = measure.Category;
              Measures[index].Category = category;
              Measures[index].region = region;
            });
          }
        } else if (billRes.Result.Bill.Service === 'ecs') {
          const { Id: OrderId } = OrderMetadata;
          const orderRes = (await Apis.GetOrderWithRegion({ OrderId }, $curUser, $req, $res)).Result.Order;
          billRes.Result.Bill.Region = orderRes.Region;
          if (Measures) {
            Measures.forEach((_, index) => {
              Measures[index].Spec = orderRes.Spec;
            });
          }
        } else if (billRes.Result.Bill.Service === 'rtc') {
          if (Measures) {
            Measures.forEach((_, index) => {
              Measures[index].service = billRes.Result.Bill.Service;
              Measures[index].Category = Measures[index].SubCategory;
            });
          }
        }
        // else {
        //   const ProductId = billRes.Result.Bill.ProductId;
        //   const res = (await Apis.GetProduct({ ProductId, AccountId: billRes.Result.Bill.AccountId }, $curUser, $req, $res)).Result;
        //   if (Measures) {
        //     Measures.forEach((_, index) => {
        //       Measures[index].Metrology = JSON.stringify(res.ProductMetadata.BillingMethodCombination);
        //     });
        //   }
        // }
      }
    } catch (e) {
      console.log(e);
    }
    return billRes;
  };
  // 根据实例提供的商品 Id 获取商品全量计费法、分量已选计费项、对应商品组
  Apis.GetProductByInstance = async function ({ ProductId, AccountId }, $curUser, $req, $res) {
    try {
      // 商品
      const { Result: product } = await Apis.GetProduct({
        ProductId,
        AccountId,
        AllowOffline: true
      }, $curUser, $req, $res);
      if (!product || !product.ProductMetadata){
        return {
          message: '商品目前不可用，无法获取更改计费法所需数据'
        };
      }
      // 获取商品已选计费法
      // const BillingMethodCombination = product.ProductMetadata.BillingMethodCombination;
      // const initMethods = {};
      // BillingMethodCombination.forEach(method => {
      //   initMethods[method.Category] = method.BillingMethod.Id;
      // });

      // 获取商品组所有计费法
      const ProductGroupId = product.ProductMetadata.ProductGroupId;
      const { Result: productGroup } = await Apis.GetProductGroup({
        ProductGroupId,
        AccountId
      }, $curUser, $req, $res);
      if (!productGroup || !productGroup.ProductGroupMetadata){
        return {
          message: '目前无可用商品，无法获取更改计费法所需数据'
        };
      }
      const methods = {};
      productGroup.ProductGroupMetadata.BillingMethodSets.forEach(method => {
        let json = method.BillingMethodSet;
        methods[method.Category] = json;
      });

      // 获取商品组下所有商品
      const { Result: products } = await Apis.ListProductsByGroup({
        ProductGroupId,
        AccountId,
        Limit: 1000,
        Offset: 0
      }, $curUser, $req, $res);
      if (!products || !products.ProductMetadatas){
        return {
          message: '无可用商品，无法获取更改计费法所需数据'
        };
      }
      try {
        products.ProductMetadatas.forEach(p => {
          const Method = {};
          const BillingMethodCombination = p.BillingMethodCombination;
          BillingMethodCombination.forEach(item => {
            Method[item.Category] = item.BillingMethod.Id;
          });
          p.Method = Method;
        });
      } catch (e) {
        return {
          ResponseMetadata: 'erroe'
        };
      }
      const initMethods = {};
      Object.keys(methods).forEach(key=>{
        initMethods[key] = methods[key][0].Id;
      });
      return {
        ResponseMetadata: 'GetProductByInstance',
        Result: {
          methods,
          initMethods,
          products: products.ProductMetadatas
        }
      };

    } catch (e) {
      return {
        message: e.message
      };
    }
  };
  // 成本业务
  Apis.GetCost = ({ keys = [] }) => {
    const rowData = [{
      name: '视频点播',
      key: 'vod'
    },{
      name: '视频直播',
      key: 'live'
    }];
    return {
      ResponseMetadata: {},
      Result: {
        List: rowData.filter(item => {
          return keys.includes(item.key);
        })
      }
    };
  };
  async function addGroupPermission({ ResourceId, GroupId, AppName, Actions, $curUser, $req, $res }) {
    await Apis.AddGroupPermission({
      AppName,
      GroupId,
      ResourceId,
      Actions,
    }, $curUser, $req, $res);
  }
  async function createRGWithPermission({ Actions = 'r,w', AppName, Resource, ResourceName, GroupName, $curUser, $req, $res }) {
    const [resource, group] = await Promise.all([
      Apis.CreateResource({
        Resource,
        Name: ResourceName,
        AppName
      }, $curUser, $req, $res),
      Apis.CreateAppGroup({
        Name: GroupName,
        AppName
      }, $curUser, $req, $res)
    ]);
    if (resource && resource.Result && resource.Result.Resource
      && group && group.Result && group.Result.Group) {
      await addGroupPermission({
        ResourceId: resource.Result.Resource.Id,
        GroupId: group.Result.Group.Id,
        AppName,
        Actions,
        $curUser, $req, $res
      });
      return [resource.Result.Resource, group.Result.Group];
    }
    return [null, null];
  }
  async function addEmployeeToGroup({ Group, Employee, AppName, $curUser, $req, $res }) {
    const GroupId = Group.Id;
    const { email: EmployeeEmail, nickname: EmployeeName } = Employee;
    return Apis.AddEmployeeToGroup({
      AppName,
      GroupId,
      EmployeeEmail,
      EmployeeName,
    }, $curUser, $req, $res);
  }
  async function createDocEditor({ BusinessID, Name, $curUser, $req, $res }) {
    const AppName = RBAC_APPS.doc.name;
    const Group = (await Apis.CreateAppGroup({
      Name: `${Name}文档编辑员`,
      AppName,
    }, $curUser, $req, $res)).Result.Group;
    const ResourceKey = `doc_${BusinessID}`;
    const ResourceList = (await Apis.ListResource({ AppName, Limit: 999 }, $curUser, $req, $res)).Result.List;
    let ResourceId = 0;
    for (const Resource of ResourceList) {
      if (Resource.Resource === ResourceKey) {
        ResourceId = Resource.Id;
        break;
      }
    }
    await addGroupPermission({
      ResourceId,
      GroupId: Group.Id,
      AppName,
      Actions: 'edit',
      $curUser, $req, $res
    });
  }
  Apis.CreateServiceWithResource = async (data, $curUser, $req, $res) => {
    const newService = await Apis.CreateService(data, $curUser, $req, $res);
    if (newService && newService.Result) {
      const { ServiceId, ServiceName } = newService.Result;
      const AppName = RBAC_APPS.top.name;
      const mockUser = { email: 'liujing.viv@bytedance.com' };

      // 创建Top服务后自动新增对应资源、用户组、权限
      const [, Group] = await createRGWithPermission({
        AppName,
        Resource: `top_${ServiceId}`,
        ResourceName: `${ServiceName}top接口`,
        GroupName: `${ServiceName}top接口编辑者`,
        $curUser: mockUser,
        $req,
        $res
      });
      if (Group) {
        addEmployeeToGroup({
          Group,
          Employee: $curUser,
          AppName,
          $curUser: mockUser,
          $req,
          $res
        });
      }
    }
    return newService;
  };
  Apis.CreateBusinessWithResource = async (data, $curUser, $req, $res) => {
    const newDocument = await Apis.CreateBusiness(data, $curUser, $req, $res);
    if (newDocument && newDocument.Result) {
      const { BusinessID, Name } = newDocument.Result;
      const AppName = RBAC_APPS.doc.name;
      const mockUser = { email: 'liujing.viv@bytedance.com' };
      // 创建文档后自动新增对应资源、用户组、权限
      const [Resource, Group] = await createRGWithPermission({
        AppName,
        Resource: `doc_${BusinessID}`,
        ResourceName: `${Name}文档管理`,
        GroupName: `${Name}文档管理员`,
        $curUser: mockUser,
        $req,
        $res
      });
      if (Group) {
        console.log('\n\n\n\n\n\n\n', Group);
        addEmployeeToGroup({
          Group,
          Employee: $curUser,
          AppName,
          $curUser: mockUser,
          $req,
          $res
        });
      }
      if (Resource) {
        createDocEditor({
          BusinessID,
          Name,
          $curUser: mockUser,
          $req,
          $res,
        });
      }
    }
    return newDocument;
  };
  Apis.GetBusinessManagers = async (data, $curUser, $req, $res) => {
    const { BusinessName } = data;
    const managerGroupName = `${BusinessName}文档管理员`;
    const AppName = RBAC_APPS.doc.name;
    const mockUser = { email: 'liujing.viv@bytedance.com' };
    const res = await Apis.ListAppGroup({
      AppName,
      Limit: 999,
    }, mockUser, $req, $res);
    let managers = [];
    if (res.Result && res.Result.List) {
      await Promise.all(res.Result.List.map(async group => {
        if (group.Name === managerGroupName) {
          managers = (await Apis.ListEmployeeOfGroup({ Limit: 5, AppName, GroupId: group.Id }, mockUser, $req, $res)).Result.List;

          return true;
        }
        return false;
      }));
    }
    return managers;
  };
  rbacEnhance(Apis);
}