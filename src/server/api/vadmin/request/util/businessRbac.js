import { RBAC_APPS } from './constants';

export default function enhanceApi(Apis) {
  Apis.ClearBusinessRbac = async function(data, $curUser, $req, $res) {
    [RBAC_APPS.top.name, RBAC_APPS.doc.name].forEach(async AppName => {
      const res = await Apis.ListAppGroup({ AppName, Limit: 999 }, $curUser, $req, $res);
      res.Result.List.forEach(async group => {
        const GroupPermissionList = (await Apis.ListGroupPermission({
          AppName,
          GroupId: group.Id,
          Actions: 'r,w',
          Limit: 100,
        }, $curUser, $req, $res)).Result.List;
        await Promise.all(GroupPermissionList.map((GroupPermission) => {
          return Apis.RemoveGroupPermission({ AppName, RelationGroupPermissionId: GroupPermission.Id }, $curUser, $req, $res);
        }));
        Apis.DeleteAppGroup({ AppName, GroupId: group.Id, }, $curUser, $req, $res);
      });
    });
  };
}