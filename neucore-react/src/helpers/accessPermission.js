function getUserAccessPermission(jsonSysPermission, jsonUserPermission) {
  //   console.log("Syuste", jsonSysPermission);
  //   console.log("user", jsonUserPermission);

  let permissionId = jsonUserPermission.map((v) => v.mapping_id);
  // console.log("permissionId", permissionId);
  let finalarr = [];

  let setPermissionIds = [];

  jsonSysPermission.map((v) => {
    // console.log("v", JSON.stringify(v));
    if (permissionId.includes(parseInt(v.id))) {
      if (!setPermissionIds.includes(parseInt(v.id))) {
        setPermissionIds.push(parseInt(v.id));
      }

      // console.log("true");
      // console.log("v ID=->", parseInt(v.id));
      // console.log("level", JSON.stringify(v.level));
      let inner_modules =
        v.level &&
        v.level.map((vi) => {
          // console.log('vi',JSON.stringify(vi));

          if (permissionId.includes(parseInt(vi.id))) {
            // console.log("innner ",vi.id);
            let userPermissionObj = jsonUserPermission.find(
              (uv) => parseInt(uv.mapping_id) == parseInt(vi.id)
            );
            // console.log("userPermissionObj",userPermissionObj);

            let userPermissionActions =
              userPermissionObj &&
              userPermissionObj.actions.map((up) => parseInt(up));
            // console.log("userPermissionActions",userPermissionActions);
            let action_inner = vi.actions.filter(
              (vz) =>
                userPermissionActions.includes(parseInt(vz)) && parseInt(vz)
            );
            // console.log("action_inner",action_inner);
            if (!setPermissionIds.includes(parseInt(vi.id))) {
              setPermissionIds.push(parseInt(vi.id));
            }

            return {
              mapping_id: parseInt(vi.id),
              actions: action_inner,
            };
          }
        });
      // console.log("inner_modeuls", inner_modules);
      // setPermissionIds.push(parseInt(v.id));
      inner_modules = inner_modules.filter((im) => im != null);
      let obj = {
        id: parseInt(v.id),
        name: v.name,
        modules: inner_modules,
      };
      // console.log("obj", JSON.stringify(obj));
      finalarr.push(obj);
    }
  });

  // console.log("setPermissionIds", JSON.stringify(setPermissionIds));
  // console.log("finalarr", JSON.stringify(finalarr));

  let diffPermission = permissionId.filter(
    (v) => !setPermissionIds.includes(parseInt(v))
  );

  // console.log("diffPremission", diffPermission);
  function findParentObj(id) {
    // console.log("id =-> ",id);
    let objRet = "";

    jsonSysPermission.map((v) => {
      // console.log("jsonS",v);
      // console.log("Level=-> ",JSON.stringify(v.level));
      let actionIds = v.level.map((vi) => parseInt(vi.id));
      // console.log("actionIDs",actionIds);

      if (actionIds.includes(parseInt(id))) {
        objRet = v;
      }
    });

    // console.log("ObjRet",objRet);

    return objRet;
  }

  if (diffPermission.length > 0) {
    diffPermission.map((v) => {
      // console.log("v",v);
      // console.log("findParentObj",findParentObj(v));
      let parentObj = findParentObj(v);

      let inner_modules =
        parentObj.level &&
        parentObj.level.map((vi) => {
          // console.log('vi',JSON.stringify(vi));

          if (permissionId.includes(parseInt(vi.id))) {
            // console.log("innner ",vi.id);
            let userPermissionObj = jsonUserPermission.find(
              (uv) => parseInt(uv.mapping_id) == parseInt(vi.id)
            );
            // console.log("userPermissionObj",userPermissionObj);

            let userPermissionActions =
              userPermissionObj &&
              userPermissionObj.actions.map((up) => parseInt(up));
            // console.log("userPermissionActions",userPermissionActions);
            let action_inner = vi.actions.filter(
              (vz) =>
                userPermissionActions.includes(parseInt(vz)) && parseInt(vz)
            );
            // console.log("action_inner",action_inner);
            if (!setPermissionIds.includes(parseInt(vi.id))) {
              setPermissionIds.push(parseInt(vi.id));
            }

            return {
              mapping_id: parseInt(vi.id),
              actions: action_inner,
            };
          }
        });
      inner_modules = inner_modules.filter((im) => im != null);
      let obj = {
        id: parseInt(parentObj.id),
        name: parentObj.name,
        modules: inner_modules,
      };
      // console.log("obj",JSON.stringify(obj));
      finalarr.push(obj);
    });
  }
  return finalarr;
}

export { getUserAccessPermission };
