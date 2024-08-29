import { authenticationService } from "@/services/api_functions";

export function authHeader() {
  const token = localStorage.getItem("authenticationService");
  return {
    // "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function authLogin() {
  return {
    "Content-Type": "application/json",
  };
}

export function getHeader() {
  const token = localStorage.getItem("authenticationService");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function getFormDataHeader() {
  const token = localStorage.getItem("authenticationService");
  return {
    // "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };
}

export function isParentExist(parent_slug, permissionJson = "") {
  console.log("permissionJson =->", permissionJson);
  // console.log(
  //   "authenticationService.currentUserValue.userRole, per -> ",
  //   authenticationService.currentUserValue.userRole,
  //   permissionJson
  // );
  // console.log("permissions", permissions);
  let res = false;
  // let permissions = JSON.parse(
  //   authenticationService.currentUserValue.permissionJson
  // );
  // let permissions = permissionJson;
  if (
    authenticationService.currentUserValue.userRole == "SADMIN" ||
    authenticationService.currentUserValue.userRole == "CADMIN"
    // ||authenticationService.currentUserValue.userRole == "BADMIN"
  ) {
    return true;
  }
  let userPermissions = permissionJson;
  if (userPermissions) {
    console.log("userpermission in Parent function->", userPermissions);
    userPermissions.map((v) => {
      let parents = v.parent_modules;
      parents.map((vi) => {
        if (vi.slug == parent_slug) {
          res = true;
        }
      });
    });
  }
  return res;
  // return true;
}

export function isActionExist(module_slug, action_slug, permissionJson) {
  let res = false;
  let permissions = permissionJson;
  // console.log("permissions", permissions);
  if (
    authenticationService.currentUserValue.userRole == "SADMIN" ||
    authenticationService.currentUserValue.userRole == "CADMIN"
    // ||authenticationService.currentUserValue.userRole == "BADMIN"
  ) {
    return true;
  }
  let userPermissions = permissions;
  if (permissions) {
    // console.log("userPermission in is action->", userPermissions);
    console.log("model slug,Action slug", module_slug, action_slug);
    let obj = userPermissions.find((v) => v.action_mapping_slug == module_slug);
    // console.log("userPermissions", userPermissions);
    // console.log(obj);
    if (obj) {
      let actions = obj.actions;
      actions.map((vi) => {
        if (vi.slug == action_slug) {
          res = true;
        }
      });
    }
  }
  return res;
  // return true;
}
