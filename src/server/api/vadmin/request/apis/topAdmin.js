import { getRbacPermissionInfo } from '../../../public/user';
import { RBAC_APPS } from '../util/constants';
const topAdmin = {
  ListServices: {
    func: async({ Limit, Offset }, $curUser, $req, $res) => {
      const topPermission = await getRbacPermissionInfo(RBAC_APPS.top.name, $curUser, $req, $res);
      const query = {
        Limit, Offset
      };
      if (topPermission && !topPermission.admin) {
        query.Query = [];
        Object.keys(topPermission).forEach(key => {
          const [keyId, ServiceId] = key.split('_');
          if (keyId === 'top' && !isNaN(ServiceId)) {
            query.Query.push(ServiceId);
          }
        });
        query.Query = query.Query.join(',');
      }
      return {
        query
      };
    }
  },
  IamListServices: {
    action: 'ListServices',
    permission: 'OPSIAMPermissionApis'
  },
  UpdateService: {
    method: 'post'
  },
  ListApis: {},
  CreateApi: {
    method: 'post',
    func: ({ ServiceId, Action, Version, ApiName, ApiGroup, Method, Path, IsInner, IsAuth, Timeout, ApiDesc, Psm }) => {
      return {
        data: {
          ServiceId, ApiAction: Action, ApiVersion: Version, ApiName, ApiGroup, Method, Path, IsInner: +IsInner, IsAuth: +IsAuth, Timeout, ApiDesc, Psm
        }
      };
    }
  },
  UpdateApi: {
    method: 'post',
  },
  PublishApi: {
    method: 'post',
  },
  GetApi: {},
  ListServiceAccessKey: {},
  CreateServiceAccessKey: {
    method: 'post',
  },
  UpdateServiceAccessKey: {
    method: 'post',
    func: ({ ServiceId, AccessKeyId, Status }) => {
      return {
        data: {
          ServiceId, AccessKeyId, Status
        }
      };
    }
  },
  DeleteServiceAccessKey: {
    method: 'post',
    func: ({ ServiceId, AccessKeyId }) => {
      return {
        data: {
          ServiceId, AccessKeyId
        }
      };
    }
  },
  ListApiParam: {},
  CreateApiParam: {
    method: 'post',
  },
  UpdateApiParam: {
    method: 'post',
  },
  DeleteApiParam: {
    method: 'post',
  },
  ListResourceType: {},
  PublishResourceType: {
    method: 'post',
  },
  CreateResourceType: {
    method: 'post',
  },
  UpdateResourceType: {
    method: 'post',
  },
  CreateService: {
    method: 'post',
    permission: 'TopManagerPermissionApis'
  },
  PublishService: {
    method: 'post',
  }
};
Object.keys(topAdmin).forEach(name => {
  if (name !== 'ListServices' && !topAdmin[name].permission)
    topAdmin[name].permission = 'MTopOPermissionApis';
});
export default topAdmin;