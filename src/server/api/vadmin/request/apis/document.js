import { getRbacPermissionInfo } from '../../../public/user';
import { RBAC_APPS } from '../util/constants';
function mapID2Id(data) {
  const newData = {};
  Object.keys(data).forEach(key => {
    const newKey = key.replace(/ID/, 'Id');
    newData[newKey] = data[key];
  });
  return newData;
}
function postMapID2Id(data) {
  return { data: mapID2Id(data) };
}
function getMapID2Id(data) {
  return { query: mapID2Id(data) };
}
const document = {
  GetBusinessDocumentStructure: {
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: getMapID2Id
  },
  GetLatestBusinessDocument: {
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: getMapID2Id
  },
  AddBusinessDocument: {
    method: 'post',
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: postMapID2Id
  },
  DelBusinessDocument: {
    method: 'post',
    permission: 'MDocOPermissionApis',
    func: postMapID2Id
  },
  OfflineBusinessDocument: {
    action: 'MultiOfflineBusinessDocument',
    method: 'post',
    permission: 'MDocOPermissionApis',
    func: ({ DocumentID, BusinessID }) => {
      return {
        data: {
          DocumentIds: DocumentID, BusinessId: BusinessID
        }
      };
    }
  },
  UpdateBusinessDocument: {
    method: 'post',
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: postMapID2Id,
  },
  SaveBusinessDocument: {
    method: 'post',
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: postMapID2Id,
  },
  PublishBusinessDocument: {
    action: 'MultiPublishBusinessDocument',
    permission: 'MDocOPermissionApis',
    method: 'post',
    func: ({ DocumentID, BusinessID }, curUser) => {
      return {
        data: {
          EmployeeEmail: curUser.name, DocumentIds: DocumentID, BusinessId: BusinessID
        }
      };
    }
  },
  UpdateBusinessDocumentIndex: {
    method: 'postJSON',
    permission: 'MDocOPermissionApis',
    func: ({ List, BusinessID }) => {
      return {
        data: {
          BusinessId: +BusinessID,
          List,
        }
      };
    }
  },
  ListBusinessDocumentVersion: {
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: getMapID2Id,
  },
  PublishBusinessDocumentVersion: {
    permission: 'MDocOPermissionApis',
    method: 'post',
    func: ({ DocumentID, VersionID, BusinessID },curUser) => {
      return {
        data: {
          EmployeeEmail: curUser.name, DocumentId: DocumentID, VersionId: VersionID, BusinessId: BusinessID
        },
        timeout: 3000
      };
    }
  },
  GetBusinessDocumentVersion: {
    permission: ['MDocOPermissionApis', 'DocEPermissionApis'],
    func: ({ DocumentID, VersionID, BusinessID }, curUser) => {
      return {
        query: {
          EmployeeEmail: curUser.name, DocumentId: DocumentID, VersionId: VersionID, BusinessId: BusinessID
        }
      };
    }
  },
  MultiPublishBusinessDocument: {
    method: 'post',
    permission: 'MDocOPermissionApis',
    func: ({ DocumentIDs, BusinessID }, curUser) => {
      return {
        data: {
          EmployeeEmail: curUser.name, DocumentIds: DocumentIDs, BusinessId: BusinessID
        },
        timeout: 3000
      };
    }
  },
  MultiOfflineBusinessDocument: {
    method: 'post',
    permission: 'MDocOPermissionApis',
    func: postMapID2Id
  },
  ListBusiness: {
    func: async({ Limit, Offset, Type }, $curUser, $req, $res) => {
      const docPermission = await getRbacPermissionInfo(RBAC_APPS.doc.name, $curUser, $req, $res);
      const query = {
        Limit, Offset, Type
      };
      if (docPermission && !docPermission.admin) {
        const idSet = new Set();
        Object.keys(docPermission).forEach(key => {
          const splitList = key.split('_');
          const keyId = splitList[0];
          const BusinessId = splitList[splitList.length - 1];
          if (keyId === 'doc' && !isNaN(BusinessId)) {
            idSet.add(BusinessId);
          }
        });
        query.Query = Array.from(idSet).join(',');
      }
      return {
        query
      };
    }
  },
  CreateBusiness: {
    method: 'post',
    func: postMapID2Id,
    permission: 'DocManagerPermissionApis'
  },
  UpdateBusiness: {
    method: 'post',
    func: postMapID2Id,
    permission: 'DocManagerPermissionApis'
  },
  UpdateBusinessIndex: {
    method: 'postJSON',
    permission: 'DocManagerPermissionApis'
  },
  ListGroups: {
    permission: 'DocManagerPermissionApis',
    func: getMapID2Id
  }
};
export default document;