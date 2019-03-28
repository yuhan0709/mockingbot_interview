export const Resp = {
  type: 'object',
  properties: {
    CreatedTime: { type: 'integer' },
    UpdatedTime: { type: 'integer' },
    Status: { type: 'string' },
  },
  required: ['CreatedTime', 'UpdatedTime', 'Status']
};

function extend(extendObj, properties, required) {
  const newObj = { ...extendObj };
  newObj.properties = {
    ...newObj.properties,
    ...properties
  };
  newObj.required = (newObj.required || []).concat(required);
  return newObj;
}

const DocumentResp = extend(Resp,
  {
    DocumentID: { type: 'integer' },
    BusinessID: { type: 'integer' },
    ParentID: { type: ['integer', 'null'] },
    DocVersion: { type: 'integer' },
    Content: { type: 'string' },
    Index: { type: 'integer' },
    MainPage: { type: 'integer' },
    Title: { type: 'string' },
    Keywords: { type: 'string' },
  },
  ['DocumentID', 'BusinessID', 'DocVersion', 'Index', 'MainPage', 'Title', 'Keywords']
);

const BusinessResp = extend(Resp,
  {
    BusinessID: { type: 'integer' },
    Index: { type: 'integer' },
    CategoryID: { type: 'integer' },
    Name: { type: 'string' },
    EnName: { type: 'string' },
    ShortName: { type: 'string' },
    Description: { type: 'string' },
    List: {
      type: 'array',
      items: DocumentResp
    }
  },
  ['BusinessID', 'Index', 'CategoryID', 'Name', 'ShortName']
);

const DocumentVersionResp = extend(Resp,
  {
    DocumentID: { type: 'integer' },
    VersionID: { type: 'integer' },
    Content: { type: 'string' },
    Title: { type: 'string' },
    Keywords: { type: 'string' },
  },
  ['DocumentID', 'VersionID', 'Title', 'Keywords']
);

const CategoryResp = extend(Resp,
  {
    CategoryID: { type: 'integer' },
    Name: { type: 'string' },
    Index: { type: 'integer' },
  },
  ['CategoryID', 'Name', 'Index']
);

const PermissionResp = extend(Resp,
  {
    PermissionID: { type: 'integer' },
    BusinessID: { type: 'integer' },
    EmployeeEmail: { type: 'string' },
    Permission: { type: 'string' },
  },
  ['PermissionID', 'BusinessID', 'EmployeeEmail', 'Permission']
);

const ResponseMetadata = {
  type: 'object',
  properties: {
    'RequestId': { type: 'string' },
    'Action': { type: 'string' },
    'Version': { type: 'string' },
    'Service': { type: 'string' },
    'Region': { type: 'string' },
  },
  required: ['RequestId', 'Action', 'Version', 'Service']
};

const ServiceResp = {
  type: 'object',
  properties: {
    'Id': { type: 'integer' },
    'ServiceName': { type: 'string' },
    'ServiceShortName': { type: 'string' },
    'Psm': { type: 'string' },
    'ApiCount': { type: 'integer' },
    'PublishedApiCount': { type: 'integer' },
    'Owner': { type: 'string' },
    'PublishedTime': { type: 'integer' },
    'CreatedTime': { type: 'integer' },
    'UpdatedTime': { type: 'integer' },
    'Status': { type: 'string' },
  },
  required: ['Id', 'ServiceName', 'ServiceShortName', 'Psm', 'PublishedTime','CreatedTime','UpdatedTime','Status']
};

const ApiResp = {
  type: 'object',
  properties: {
    'Id': { type: 'integer' },
    'ServiceId': { type: 'integer' },
    'ApiName': { type: 'string' },
    'Action': { type: 'string' },
    'Version': { type: 'string' },
    'ApiGroup': { type: 'string' },
    'ApiDes': { type: 'string' },
    'Path': { type: 'string' },
    'Psm': { type: 'string' },
    'Method': { type: 'string' },
    'IsInner': { type: 'integer' },
    'IsAuth': { type: 'integer' },
    'Timeout': { type: 'integer' },
    'PublishedTime': { type: 'integer' },
    'CreatedTime': { type: 'integer' },
    'UpdatedTime': { type: 'integer' },
    'Status': { type: 'string' },
  },
  required: ['Id', 'ServiceId', 'ApiName', 'Action','Version', 'PublishedTime','CreatedTime','UpdatedTime','Status']
};

const AccessKeyResp = {
  type: 'object',
  properties: {
    'AccessKeyId': { type: 'string' },
    'SecretAccessKey': { type: 'string' },
    'UserName': { type: 'string' },
    'CreateDate': { type: 'string' },
    'UpdateDate': { type: 'string' },
    'Status': { type: 'string' },
  },
  required: ['AccessKeyId', 'SecretAccessKey', 'UserName', 'CreateDate','UpdateDate','Status']
};

const AccessKeyMetaResp = {
  type: 'object',
  properties: {
    'AccessKeyId': { type: 'string' },
    'UserName': { type: 'string' },
    'CreateDate': { type: 'string' },
    'UpdateDate': { type: 'string' },
    'Status': { type: 'string' },
  },
  required: ['AccessKeyId', 'UserName', 'CreateDate','UpdateDate','Status']
};

const genSchema = (resultObject) => {
  const required = resultObject ? ['ResponseMetadata', 'Result'] : ['ResponseMetadata'];
  return {
    type: 'object',
    properties: {
      ResponseMetadata,
      Result: {
        type: 'object',
        properties: resultObject
      }
    },
    required: required
  };
};

const genListSchema = (arrayOptions) => {
  const required = ['ResponseMetadata', 'Result'];
  return {
    type: 'object',
    properties: {
      ResponseMetadata,
      Result: {
        type: 'array',
        ...arrayOptions
      }
    },
    required: required
  };
};

const pageResp = {
  Total: { type: 'integer' },
  Limit: { type: 'integer' },
  Offset: { type: 'integer' },
};

const MultiOfflineBusinessDocument = genSchema();
const MultiPublishBusinessDocument = genSchema();
const EmployeeSaveBusinessDocumentVersionToDraft = genSchema({
  Content: { type: 'string' }
});
const PublishBusinessDocumentVersion = genSchema({
  DocumentResp
});
const ListBusinessDocumentVersion = genSchema({
  List: { type: 'array', items: DocumentVersionResp },
  ...pageResp
});
const GetBusinessDocumentStructure = genSchema({
  List: { type: 'array', items: DocumentResp }
});
const UpdateBusinessDocumentIndex = genListSchema({
  items: DocumentResp
});
const PublishBusinessDocument = genSchema({
  DocumentResp
});
const EmployeeUpdateBusiness = genSchema({
  BusinessResp
});
const SaveBusinessDocument = genSchema({
  // Content: { type: 'string' }
});
const UpdateBusinessDocument = genSchema({
  DocumentResp
});
const OfflineBusinessDocument = genSchema();
const DelBusinessDocument = genSchema();
const AddBusinessDocument = genSchema({
  DocumentResp
});
const UpdateBusiness = genSchema({
  BusinessResp
});
const CreateBusiness = genSchema({
  BusinessResp
});
const GetLatestBusinessDocument = genSchema({
  // Content: { type: 'string' }
});


const ListServices = genSchema({
  List: { type: 'array', items: ServiceResp },
  ...pageResp
});
const UpdateService = genSchema({
  ServiceResp
});
const ListApis = genSchema({
  List: { type: 'array', items: ApiResp },
  ...pageResp
});
const CreateApi = genSchema({ ApiResp });
const UpdateApi = genSchema({ ApiResp });
const PublishApi = genSchema();
const ListServiceAccessKey = genSchema({
  List: { type: 'array', items: AccessKeyMetaResp },
  ...pageResp
});
const CreateServiceAccessKey = genSchema({ AccessKeyResp });
const UpdateServiceAccessKey = genSchema({ AccessKeyMetaResp });
const DelServiceAccessKey = genSchema();

export default {
  ResponseMetadata,
  DocumentResp,
  BusinessResp,
  DocumentVersionResp,
  CategoryResp,
  PermissionResp,
  MultiOfflineBusinessDocument,
  MultiPublishBusinessDocument,
  EmployeeSaveBusinessDocumentVersionToDraft,
  PublishBusinessDocumentVersion,
  ListBusinessDocumentVersion,
  GetBusinessDocumentStructure,
  UpdateBusinessDocumentIndex,
  PublishBusinessDocument,
  EmployeeUpdateBusiness,
  SaveBusinessDocument,
  UpdateBusinessDocument,
  OfflineBusinessDocument,
  DelBusinessDocument,
  AddBusinessDocument,
  UpdateBusiness,
  CreateBusiness,
  GetLatestBusinessDocument,
  EmployeeAddAndDelBusinessDocument: DelBusinessDocument,
  ListServices,
  UpdateService,
  ListApis,
  CreateApi,
  UpdateApi,
  PublishApi,
  ListServiceAccessKey,
  CreateServiceAccessKey,
  UpdateServiceAccessKey,
  DelServiceAccessKey
};
