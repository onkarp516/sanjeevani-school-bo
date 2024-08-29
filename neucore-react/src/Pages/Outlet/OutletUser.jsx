import React, { Component } from "react";

import {
  Button,
  Col,
  Row,
  Form,
  Table,
  Collapse,
  InputGroup,
  FormControl,
} from "react-bootstrap";

import { Formik } from "formik";
import * as Yup from "yup";
import {
  authenticationService,
  get_companies_super_admin,
  createCompanyUser,
  get_user_by_id,
  get_b_User_By_Id,
  updateInstituteUser,
  getSysAllPermissions,
  getBranchesByInstitute,
  getBAdminUser,
  getSysActions,
  getRolePermissionList,
  getCompanyUserById,
  getRolePermissionById,
} from "@/services/api_functions";
import Select from "react-select";
import {
  EMAILREGEXP,
  numericRegExp,
  ShowNotification,
  getValue,
  ArraySplitChunkElement,
  AuthenticationCheck,
  customStyles,
  getSelectValue,
  getUserAccessPermission,
  MyNotifications,
  eventBus,
} from "@/helpers";
import mousetrap from "mousetrap";
import "mousetrap-global-bind";
import refresh_iconblack from "@/assets/images/3x/refresh_iconblack.png";
import arrowicon from "@/assets/images/3x/arrowicon.png";
import cancel_icon from "@/assets/images/3x/cancel_icon.png";
import excel from "@/assets/images/3x/excel.png";
import print from "@/assets/images/3x/print.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
export default class OutletUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opendiv: false,
      opbranchList: [],
      opRoleList: [],
      opRolePermissionList: [],
      data: [],
      branchInitVal: {
        id: "",
        branchId: "",
        fullName: "",
        mobileNumber: "",
        userRole: "BADMIN",
        email: "",
        gender: "",
        usercode: "",
        password: "",
        roleId: "",
      },
      userRole: "BADMIN",
      sysPermission: [],
      orgSysPermission: [],
      userPermission: [],
      actionsOptions: [],
      orgUserPermission: [],
    };
    this.ref = React.createRef();
  }

  getBranchData = (outletId, initObj = null, branchId = null) => {
    let reqData = new FormData();
    console.log("outletId", outletId);
    reqData.append(
      "outletId",
      authenticationService.currentUserValue.companyId
    );
    getBranchesByInstitute(reqData)
      .then((response) => {
        let res = response.data;
        console.log("res", res);
        if (res.responseStatus == 200) {
          let d = res.responseObject;
          // if (d.length > 0)
          {
            let Opt = d.map(function (values) {
              return { value: values.id, label: values.branchName };
            });

            this.setState({ opbranchList: Opt }, () => {
              if (initObj != null && branchId != null) {
                initObj["branchId"] = getSelectValue(Opt, parseInt(branchId));

                this.setState({ initVal: initObj });
              }
            });
          }
        }
      })
      .catch((error) => {
        this.setState({ opbranchList: [] });
        console.log("error", error);
      });
  };

  lstSysActionsOptions = () => {
    getSysActions()
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.list;
          let opt = data.map((v) => {
            return { label: v.name, value: v.id, ...v };
          });
          if (opt.length > 0) {
            this.setState({ actionsOptions: opt });
          }
        }
      })
      .catch((error) => {});
  };

  getRoleList = () => {
    getRolePermissionList()
      .then((response) => {
        // console.log("response", response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.responseObject;
          let Opt = [];
          if (data.length > 0) {
            Opt = data.map(function (values) {
              return {
                value: values.id,
                label: values.roleName,
              };
            });
            this.setState({ opRoleList: Opt, orgData: data });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleUserSelection = (
    parent_id,
    child_id = 0,
    action_id = 0,
    status = false
  ) => {
    let { userPermission, sysPermission } = this.state;
    let filterUserPermission = [];
    let fuserPermissions = [];
    if (child_id == 0 && action_id == 0) {
      let f = sysPermission.find((v) => parseInt(v.id) == parseInt(parent_id));
      if (status == true) {
        let modules = [];
        if (f.level) {
          modules = f.level.map((vi) => {
            return { mapping_id: vi.id, actions: vi.actions };
          });
        }
        let d = {
          id: f.id,
          name: f.name,
          modules: modules,
        };
        // fuserPermissions.push(d);
        fuserPermissions = [...fuserPermissions, d];

        if (userPermission.length > 0) {
          filterUserPermission = userPermission.filter(
            (v) => parseInt(v.id) != parseInt(f.id)
          );
        }
        fuserPermissions = [...fuserPermissions, ...filterUserPermission];
      } else {
        if (userPermission.length > 0) {
          filterUserPermission = userPermission.filter(
            (v) => parseInt(v.id) != parseInt(f.id)
          );
        }
        fuserPermissions = filterUserPermission;
      }

      this.setState({ userPermission: fuserPermissions });
    } else if (action_id == 0) {
      if (status == true) {
        let f = sysPermission.find(
          (v) => parseInt(v.id) == parseInt(parent_id)
        );
        if (userPermission.length == 0) {
          let check = f.level.find(
            (v) => parseInt(v.value) == parseInt(child_id)
          );
          let modules = [];
          if (check) {
            modules.push({ mapping_id: check.id, actions: check.actions });
          }
          let d = {
            id: f.id,
            name: f.name,
            modules: modules,
          };
          // fuserPermissions.push(d);
          fuserPermissions = [...fuserPermissions, d];
        } else {
          // !IMP
          fuserPermissions = [...userPermission];
          let checkinner = userPermission.find(
            (v) => parseInt(v.id) == parseInt(parent_id)
          );

          if (checkinner) {
            let modules = [];
            // !IMP
            modules = checkinner.modules.filter(
              (v) => parseInt(v.mapping_id) != parseInt(child_id)
            );

            let Syscheck = f.level.find(
              (v) => parseInt(v.value) == parseInt(child_id)
            );

            if (Syscheck) {
              modules.push({
                mapping_id: Syscheck.id,
                actions: Syscheck.actions,
              });
            }
            let d = {
              id: f.id,
              name: f.name,
              modules: modules,
            };

            if (userPermission.length > 0) {
              filterUserPermission = userPermission.filter(
                (v) => parseInt(v.id) != parseInt(parent_id)
              );
            }
            fuserPermissions = [
              //! ...fuserPermissions,
              ...filterUserPermission,
              d,
            ];
          } else {
            let check = f.level.find(
              (v) => parseInt(v.value) == parseInt(child_id)
            );
            let modules = [];
            if (check) {
              modules.push({ mapping_id: check.id, actions: check.actions });
            }
            let d = {
              id: f.id,
              name: f.name,
              modules: modules,
            };
            if (userPermission.length > 0) {
              filterUserPermission = userPermission.filter(
                (v) => parseInt(v.id) != parseInt(parent_id)
              );
            }
            fuserPermissions = [
              ...fuserPermissions,
              ...filterUserPermission,
              d,
            ];
          }
        }
      } else {
        let checkinner = userPermission.find(
          (v) => parseInt(v.id) == parseInt(parent_id)
        );
        if (checkinner) {
          let check = checkinner.modules.filter(
            (v) => parseInt(v.mapping_id) !== parseInt(child_id)
          );
          let incheck = {
            id: checkinner.id,
            name: checkinner.name,
            modules: check,
          };
          let fcheckinner = userPermission.filter(
            (v) => parseInt(v.id) !== parseInt(parent_id)
          );
          fuserPermissions = [...fcheckinner, incheck];
        }
      }

      this.setState({ userPermission: fuserPermissions });
    } else {
      if (userPermission.length > 0) {
        if (status == true) {
          let checkinner = userPermission.find((v) => v.id == parent_id);
          let scheck = [];
          if (checkinner) {
            let check = checkinner.modules.find(
              (v) => parseInt(v.mapping_id) == parseInt(child_id)
            );
            if (check) {
              let actions = [...check.actions, action_id];
              check.actions = actions;
              let fcheck = checkinner.modules.filter(
                (v) => parseInt(v.mapping_id) !== parseInt(child_id)
              );
              scheck = [...fcheck, check];
              let incheck = {
                id: checkinner.id,
                name: checkinner.name,
                modules: scheck,
              };
              let fcheckinner = userPermission.filter(
                (v) => parseInt(v.id) !== parseInt(parent_id)
              );
              fuserPermissions = [...fuserPermissions, ...fcheckinner, incheck];
              this.setState({ userPermission: fuserPermissions });
            } else {
              let f = sysPermission.find(
                (v) => parseInt(v.id) == parseInt(parent_id)
              );
              let check = f.level.find(
                (v) => parseInt(v.value) == parseInt(child_id)
              );
              let modules = [...checkinner.modules];
              modules.push({ mapping_id: check.id, actions: [action_id] });
              let incheck = {
                id: f.id,
                name: f.name,
                modules: modules,
              };
              let fcheckinner = userPermission.filter(
                (v) => parseInt(v.id) !== parseInt(parent_id)
              );
              fuserPermissions = [...fuserPermissions, ...fcheckinner, incheck];

              this.setState({ userPermission: fuserPermissions });
            }
          } else {
            let f = sysPermission.find(
              (v) => parseInt(v.id) == parseInt(parent_id)
            );
            if (f) {
              let check = f.level.find(
                (v) => parseInt(v.value) == parseInt(child_id)
              );
              let modules = [];
              if (check) {
                modules.push({ mapping_id: check.id, actions: [action_id] });
              }
              if (check) {
                let d = {
                  id: f.id,
                  name: f.name,
                  modules: modules,
                };
                fuserPermissions = [d];
              }
              fuserPermissions = [...fuserPermissions, ...userPermission];
              this.setState({ userPermission: fuserPermissions });
            }
          }
        } else {
          let checkinner = userPermission.find(
            (v) => parseInt(v.id) == parseInt(parent_id)
          );
          let scheck = [];
          if (checkinner) {
            let check = checkinner.modules.find(
              (v) => parseInt(v.mapping_id) == parseInt(child_id)
            );
            if (check) {
              let actions = check.actions.filter(
                (v) => parseInt(v) != parseInt(action_id)
              );
              // let actions = [...check.actions, action_id];
              check.actions = actions;
              let fcheck = checkinner.modules.filter(
                (v) => parseInt(v.mapping_id) !== parseInt(child_id)
              );

              scheck = [...fcheck, check];
              let incheck = {
                id: checkinner.id,
                name: checkinner.name,
                modules: scheck,
              };
              let fcheckinner = userPermission.filter(
                (v) => parseInt(v.id) !== parseInt(parent_id)
              );
              fuserPermissions = [...fuserPermissions, ...fcheckinner, incheck];
              this.setState({ userPermission: fuserPermissions });
            }
          }
        }
      } else {
        if (status == true) {
          let f = sysPermission.find(
            (v) => parseInt(v.id) == parseInt(parent_id)
          );
          if (f) {
            let check = f.level.find(
              (v) => parseInt(v.value) == parseInt(child_id)
            );
            let modules = [];
            if (check) {
              modules.push({ mapping_id: check.id, actions: [action_id] });
            }
            if (check) {
              let d = {
                id: f.id,
                name: f.name,
                modules: modules,
              };
              fuserPermissions = [d];
            }
            this.setState({ userPermission: fuserPermissions });
          }
        } else {
          this.setState({ userPermission: [] });
        }
      }
    }
  };

  listSysPermission = () => {
    getSysAllPermissions()
      .then((response) => {
        let res = response.data;
        let fdata = [];
        if (res.responseStatus == 200) {
          let data = res.level;
          data.map((v) => {
            let check = fdata.find((vi) => vi.id == v.id);
            let d;
            if (check) {
              d = {
                id: v.id,
                level: [
                  ...check.level,
                  {
                    id: v.level.id,
                    actions: v.level.actions,
                    name: v.level.name,
                    value: v.level.id,
                    label: v.level.name,
                  },
                ],
                name: v.name,
                value: v.id,
                label: v.name,
              };
              fdata = fdata.filter((vi) => vi.id != v.id);
            } else {
              d = {
                id: v.id,
                level: [
                  {
                    id: v.level.id,
                    actions: v.level.actions,
                    name: v.level.name,
                    value: v.level.id,
                    label: v.level.name,
                  },
                ],
                name: v.name,
                value: v.id,
                label: v.name,
              };
            }
            fdata = [...fdata, d];
          });
          // console.log("fdata", fdata);
          fdata = fdata.sort((a, b) => (a.id < b.id ? -1 : 1));
          // console.log("fdata", JSON.stringify(fdata, undefined, 2));
          let userPer = fdata.map((v) => {
            console.log("v", v);
            let inner_modules =
              v.level &&
              v.level.map((vi) => {
                let action_inner = vi.actions.filter((va) => parseInt(va));
                return {
                  mapping_id: parseInt(vi.id),
                  actions: action_inner,
                };
              });

            let obj = {
              id: parseInt(v.id),
              name: v.name,
              modules: inner_modules,
            };
            return obj;
          });
          // console.log("userPer", userPer);
          this.setState({
            sysPermission: fdata,
            orgSysPermission: fdata,
            userPermission: userPer,
          });
        } else {
          this.setState({ sysPermission: [], orgSysPermission: [] });
        }
      })
      .catch((error) => {
        this.setState({ sysPermission: [] });
        console.log("error", error);
      });
  };
  handleActionSelection = (status, mapping_id, action_id) => {
    let { userPermission } = this.state;
    if (status == true) {
      let user = {
        mapping_id: mapping_id,
        actions: [action_id],
      };
      let is_new = true;
      userPermission = userPermission.map((v) => {
        if (v.mapping_id == mapping_id) {
          if (!v.actions.includes(action_id)) {
            let v_action = v.actions;
            v.actions = [...v_action, action_id];
            is_new = false;
          }
        }
        return v;
      });

      if (is_new == true) {
        userPermission = [...userPermission, user];
      }
      this.setState({ userPermission: userPermission });
    } else if (status == false) {
      userPermission = userPermission.map((v) => {
        if (v.mapping_id == mapping_id) {
          if (v.actions.includes(action_id)) {
            let v_action = v.actions;
            v.actions = v_action.filter((vi) => vi != action_id);
          }
        }
        return v;
      });

      this.setState({
        userPermission: userPermission.length > 0 ? userPermission : [],
      });
    }
  };

  handleSelectAllActionSelection = (status, mapping_id) => {
    let { userPermission, orgSysPermission } = this.state;
    if (status == true) {
      let obj = orgSysPermission.find((v) => v.id == mapping_id);
      let action_ids = obj.actions.map((vi) => {
        return vi.id;
      });
      let user = {
        mapping_id: mapping_id,
        actions: action_ids,
      };
      let is_new = true;
      userPermission = userPermission.map((v) => {
        if (v.mapping_id == mapping_id) {
          is_new = false;
        }
        return v;
      });
      if (is_new == true) {
        userPermission = [...userPermission, user];
      }
      this.setState({ userPermission: userPermission });
    } else if (status == false) {
      userPermission = userPermission.filter((v) => v.mapping_id != mapping_id);
      this.setState({
        userPermission: userPermission.length > 0 ? userPermission : [],
      });
    }
  };

  getActionSelectionOption = (mapping_id, action_id) => {
    let { userPermission } = this.state;
    let res = false;
    userPermission.map((v) => {
      if (v.mapping_id == mapping_id) {
        if (v.actions.includes(action_id)) {
          res = true;
        }
      }
    });

    return res;
  };
  getSelectAllOption = (mapping_id) => {
    let { userPermission, orgSysPermission } = this.state;
    let res = false;
    let obj = orgSysPermission.find((v) => v.id == mapping_id);
    console.log("obj : ", obj);
    let action_ids = obj.level.actions.map((vi) => {
      return vi.id;
    });
    console.log("userPermission : ", userPermission);
    userPermission.map((v) => {
      if (v.mapping_id == mapping_id) {
        if (action_ids.length == v.actions.length) {
          res = true;
        }
      }
    });

    return res;
  };

  isParentChecked = (parent_id) => {
    let { sysPermission, userPermission } = this.state;
    let res = false;

    let sysParentExist = sysPermission.find((v) => v.id === parent_id);
    let userParentExist = userPermission.find((v) => v.id === parent_id);
    if (sysParentExist && userParentExist) {
      let resArr = [];
      if (sysParentExist.level.length == userParentExist.modules.length) {
        userParentExist.modules.map((v) => {
          let r = this.isChildchecked(parent_id, v.mapping_id);
          resArr.push(r);
        });
      }
      if (resArr.length > 0 && !resArr.includes(false)) {
        res = true;
      }
    }
    return res;
  };

  isChildchecked = (parent_id, child_id) => {
    let { sysPermission, userPermission } = this.state;
    let res = false;
    let sysParentExist = sysPermission.find((v) => v.id === parent_id);

    let userParentExist = userPermission.find((v) => v.id === parent_id);

    if (sysParentExist && userParentExist) {
      let sysChildExist = sysParentExist.level.find((v) => v.id === child_id);
      let userChildExist = userParentExist.modules.find(
        (v) => v.mapping_id === child_id
      );
      if (sysChildExist && userChildExist) {
        if (sysChildExist.actions.length == userChildExist.actions.length) {
          res = true;
        }
      }
    }

    return res;
  };

  getActionOptionChecked(parent_id, child_id, action_id) {
    let { userPermission } = this.state;
    let res = false;
    let parentExist = userPermission.find((v) => v.id == parent_id);
    if (parentExist) {
      let childExist = parentExist.modules.find(
        (vi) => vi.mapping_id == child_id
      );
      if (childExist) {
        let childInnerExist = childExist.actions.find(
          (v) => parseInt(v) == parseInt(action_id)
        );
        if (childInnerExist) {
          res = true;
        }
      }
    }
    // console.log({ parent_id, child_id, action_id });
    return res;
  }

  listUsers = () => {
    getBAdminUser()
      .then((response) => {
        console.log("response", response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.responseObject;
          if (data.length > 0) {
            this.setState({ data: data });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleSubmitForm = () => {
    this.ref.current.submitForm();
  };

  getUserEditData = () => {
    let { userEditData, opCompanyList, opRoleList } = this.state;
    if (userEditData != "") {
      console.log("UserEditdata.id-->", userEditData);
      let requestData = new FormData();
      requestData.append("id", userEditData.id);
      getCompanyUserById(requestData)
        .then((res) => res.data)
        .then((response) => {
          // console.log("response of Compnay User ==->", response);
          if (response.responseStatus == 200) {
            let data = response.responseObject;

            let initVal = {
              id: data.id,
              // roleId: data.roleId,
              roleId: opRoleList.find((p) => p.value === data.roleId),
              companyId: opCompanyList.find(
                (v) =>
                  v.value === authenticationService.currentUserValue.companyId
              ),
              fullName: data.fullName,
              mobileNumber: data.mobileNumber,
              email: data.email != "NA" ? data.email : "",
              gender: data.gender,
              usercode: data.usercode,
              password: data.password,
              // companyId: getSelectValue(opCompanyList, data.companyId),
              permissions: data.permissions,
            };
            // console.log("initVal.companyId", initVal.companyId);
            // console.log(
            //   "userPermission: data.permissions =->",
            //   JSON.stringify(data.permissions)
            // );

            this.setState(
              {
                InitVal: initVal,
                isEditDataSet: true,
              },
              () => {
                this.getRolPermissionsByRoleId(initVal.roleId.value, initVal);
              }
            );
          }
        });
    }
  };

  componentDidMount() {
    if (AuthenticationCheck()) {
      let companyId = authenticationService.currentUserValue.companyId;
      this.getBranchData(companyId);

      this.listUsers();
      // this.listSysPermission();
      this.getRoleList();
      this.lstSysActionsOptions();
      this.setInitValue();
      mousetrap.bindGlobal("ctrl+s", this.handleSubmitForm);
      mousetrap.bindGlobal("ctrl+c", this.setInitValue);
      const { prop_data } = this.props.block;
      // console.log("prop_data--->", prop_data);
      this.setState({ userEditData: prop_data }, () => {});
    }
  }

  componentWillUnmount() {
    mousetrap.unbindGlobal("ctrl+s", this.handleSubmitForm);
    mousetrap.unbindGlobal("ctrl+c", this.setInitValue);
  }

  // componentDidUpdate() {
  //   const {
  //     opCompanyList,
  //     userEditData,
  //     // sysPermission,
  //     isEditDataSet,
  //     opRoleList,
  //     // orgSysPermission,
  //   } = this.state;
  //   if (
  //     opCompanyList.length > 0 &&
  //     userEditData != "" &&
  //     opRoleList.length > 0 &&
  //     // sysPermission.length > 0 &&
  //     isEditDataSet == false
  //     // orgSysPermission.length > 0
  //   ) {
  //     this.getUserEditData();
  //   }
  // }

  setInitValue = () => {
    this.ref.current.resetForm();
    this.setState({
      opendiv: false,
      opbranchList: [],
      data: [],
      branchInitVal: {
        id: "",
        branchId: "",
        fullName: "",
        mobileNumber: "",
        userRole: "BADMIN",
        email: "",
        gender: "",
        usercode: "",
        password: "",
        roleId: "",
      },
      userRole: "BADMIN",
    });
  };

  getRolPermissionsByRoleId = (v = 0, initVal = "") => {
    let requestData = new FormData();
    requestData.append("id", v);
    getRolePermissionById(requestData)
      .then((response) => {
        let res = response.data;
        let fdata = [];
        if (res.responseStatus == 200) {
          let data = res.level;
          data.map((v) => {
            let check = fdata.find((vi) => vi.id == v.id);
            let d;
            if (check) {
              d = {
                id: v.id,
                level: [
                  ...check.level,
                  {
                    id: v.level.id,
                    actions: v.level.actions,
                    name: v.level.name,
                    value: v.level.id,
                    label: v.level.name,
                  },
                ],
                name: v.name,
                value: v.id,
                label: v.name,
              };
              fdata = fdata.filter((vi) => vi.id != v.id);
            } else {
              d = {
                id: v.id,
                level: [
                  {
                    id: v.level.id,
                    actions: v.level.actions,
                    name: v.level.name,
                    value: v.level.id,
                    label: v.level.name,
                  },
                ],
                name: v.name,
                value: v.id,
                label: v.name,
              };
            }
            fdata = [...fdata, d];
          });
          fdata = fdata.sort((a, b) => (a.id < b.id ? -1 : 1));

          let userPer;
          if (initVal != "") {
            userPer = getUserAccessPermission(fdata, initVal.permissions);
            this.setState({
              orgUserPermission: userPer,
            });
          } else {
            userPer = fdata.map((v) => {
              console.log("v", v);
              let inner_modules =
                v.level &&
                v.level.map((vi) => {
                  let action_inner = vi.actions.filter((va) => parseInt(va));
                  return {
                    mapping_id: parseInt(vi.id),
                    actions: action_inner,
                  };
                });

              let obj = {
                id: parseInt(v.id),
                name: v.name,
                modules: inner_modules,
              };
              return obj;
            });
          }
          this.setState({
            sysPermission: fdata,
            orgSysPermission: fdata,
            userPermission: userPer,
          });
        } else {
          this.setState({ sysPermission: [], orgSysPermission: [] });
        }
      })
      .catch((error) => {
        this.setState({ sysPermission: [] });
        console.log("error", error);
      });
  };

  // getRolPermissionsByRoleId = (v = 0) => {
  //   console.log("RoleId->", v);
  //   let requestData = new FormData();
  //   requestData.append("id", v);
  //   getRolePermissionById(requestData)
  //     .then((response) => {
  //       let res = response.data;
  //       let fdata = [];
  //       if (res.responseStatus == 200) {
  //         let data = res.level;
  //         console.log("Response : ", data);
  //         data.map((v) => {
  //           let check = fdata.find((vi) => vi.id == v.id);
  //           let d;
  //           if (check) {
  //             d = {
  //               id: v.id,
  //               level: [
  //                 ...check.level,
  //                 {
  //                   id: v.level.id,
  //                   actions: v.level.actions,
  //                   name: v.level.name,
  //                   value: v.level.id,
  //                   label: v.level.name,
  //                 },
  //               ],
  //               name: v.name,
  //               value: v.id,
  //               label: v.name,
  //             };
  //             fdata = fdata.filter((vi) => vi.id != v.id);
  //           } else {
  //             d = {
  //               id: v.id,
  //               level: [
  //                 {
  //                   id: v.level.id,
  //                   actions: v.level.actions,
  //                   name: v.level.name,
  //                   value: v.level.id,
  //                   label: v.level.name,
  //                 },
  //               ],
  //               name: v.name,
  //               value: v.id,
  //               label: v.name,
  //             };
  //           }
  //           fdata = [...fdata, d];
  //         });
  //         // console.log("fdata", fdata);
  //         fdata = fdata.sort((a, b) => (a.id < b.id ? -1 : 1));

  //         let userPer = fdata.map((v) => {
  //           console.log("v", v);
  //           let inner_modules =
  //             v.level &&
  //             v.level.map((vi) => {
  //               let action_inner = vi.actions.filter((va) => parseInt(va));
  //               return {
  //                 mapping_id: parseInt(vi.id),
  //                 actions: action_inner,
  //               };
  //             });

  //           let obj = {
  //             id: parseInt(v.id),
  //             name: v.name,
  //             modules: inner_modules,
  //           };
  //           return obj;
  //         });
  //         this.setState({
  //           sysPermission: fdata,
  //           orgSysPermission: fdata,
  //           userPermission: userPer,
  //         });
  //       } else {
  //         this.setState({ sysPermission: [], orgSysPermission: [] });
  //       }
  //     })
  //     .catch((error) => {
  //       this.setState({ sysPermission: [] });
  //       console.log("error", error);
  //     });
  // };

  setUpdateData = (id) => {
    let formData = new FormData();
    const { opRoleList } = this.state;
    formData.append("id", id);
    get_user_by_id(formData)
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let userData = res.responseObject;
          let branchInitVal = {
            id: userData.id,
            branchId: getSelectValue(
              this.state.opbranchList,
              userData.branchId
            ),
            // companyId: getValue(this.state.opCompanyList, userData.companyId),
            fullName: userData.fullName,
            mobileNumber: userData.mobileNumber,
            userRole: this.state.userRole,
            email: userData.email != "NA" ? userData.email : "",
            gender: userData.gender,
            usercode: userData.usercode,
            roleId: opRoleList.find((p) => p.value === userData.roleId),
            permissions: userData.permissions,
          };
          console.log("branchInitVal ", branchInitVal);
          this.setState({ branchInitVal: branchInitVal, opendiv: true }, () => {
            this.getRolPermissionsByRoleId(
              branchInitVal.roleId.value,
              branchInitVal
            );
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  validationSchema = () => {
    if (this.state.branchInitVal.id == "") {
      return Yup.object().shape({
        branchId: Yup.object().required("Select branch"),
        fullName: Yup.string().trim().required("Full name is required"),
        mobileNumber: Yup.string()
          .trim()
          .matches(numericRegExp, "Enter valid mobile number")
          .required("Mobile number is required"),
        email: Yup.lazy((v) => {
          if (v != undefined) {
            return Yup.string()
              .trim()
              .matches(EMAILREGEXP, "Enter valid email id")
              .required("Email is required");
          }
          return Yup.string().notRequired();
        }),
        gender: Yup.string().trim().required("Gender is required"),
        password: Yup.string().trim().required("Password is required"),
        usercode: Yup.string().trim().required("Usercode is required"),
      });
    } else {
      return Yup.object().shape({
        branchId: Yup.object().required("select branch"),
        fullName: Yup.string().trim().required("Full Name is required"),
        mobileNumber: Yup.string()
          .trim()
          .matches(numericRegExp, "Enter valid mobile number")
          .required("Mobile Number is required"),
        email: Yup.lazy((v) => {
          if (v != undefined) {
            return Yup.string()
              .trim()
              .matches(EMAILREGEXP, "Enter valid email id")
              .required("Email is required");
          }
          return Yup.string().notRequired();
        }),
        gender: Yup.string().trim().required("gender is required"),
        // password: Yup.string().trim().required("password is required"),
        usercode: Yup.string().trim().required("usercode is required"),
      });
    }
  };

  pageReload = () => {
    this.componentDidMount();
    this.listSysPermission();
  };

  render() {
    const {
      opbranchList,
      opendiv,
      data,
      branchInitVal,
      sysPermission,
      actionsOptions,
      opRoleList,
      orgUserPermission,
    } = this.state;
    return (
      <div className="">
        <Collapse in={opendiv}>
          <div
            id="example-collapse-text"
            className="common-form-style  mt-2 p-2 "
          >
            <div className="main-div mb-2 m-0 company-from">
              <h4 className="form-header">Branch User</h4>
              <Formik
                validateOnChange={false}
                // validateOnBlur={false}
                enableReinitialize={true}
                initialValues={branchInitVal}
                innerRef={this.ref}
                validationSchema={this.validationSchema()}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  console.log("value", values);

                  let keys = Object.keys(branchInitVal);
                  let requestData = new FormData();
                  keys.map((v) => {
                    if (
                      values[v] != "" &&
                      // v != "companyId" &&
                      v != "branchId" &&
                      v != "roleId" &&
                      values[v] != "branchId"
                    ) {
                      requestData.append(v, values[v]);
                    }
                  });
                  requestData.append("branchId", values.branchId.value);
                  requestData.append("roleId", values.roleId.value);

                  if (values.id != "") {
                    let fuserPermissions = [];
                    if (
                      this.state.userPermission &&
                      this.state.userPermission.length > 0
                    ) {
                      this.state.userPermission.map((v) => {
                        fuserPermissions.push(...v.modules);
                      });
                    }

                    let forguserPermissions = [];
                    if (
                      this.state.orgUserPermission &&
                      this.state.orgUserPermission.length > 0
                    ) {
                      this.state.orgUserPermission.map((v) => {
                        forguserPermissions.push(...v.modules);
                      });
                    }

                    requestData.append(
                      "user_permissions",
                      JSON.stringify(fuserPermissions)
                    );

                    let permissionId = [
                      ...new Set(fuserPermissions.map((v) => v.mapping_id)),
                    ];
                    let setPermissionIds = [
                      ...new Set(forguserPermissions.map((v) => v.mapping_id)),
                    ];

                    let diffPermission = setPermissionIds.filter(
                      (v) => !permissionId.includes(parseInt(v))
                    );

                    // let diffPermission = setPermissionIds
                    //   .filter((x) => !permissionId.includes(x))
                    //   .concat(
                    //     permissionId.filter((x) => !setPermissionIds.includes(x))
                    //   );
                    requestData.append(
                      "del_user_permissions",
                      JSON.stringify(diffPermission)
                    );
                  } else {
                    let fuserPermissions = [];
                    if (
                      this.state.userPermission &&
                      this.state.userPermission.length > 0
                    ) {
                      this.state.userPermission.map((v) => {
                        fuserPermissions.push(...v.modules);
                      });
                    }
                    requestData.append(
                      "user_permissions",
                      JSON.stringify(fuserPermissions)
                    );
                  }

                  // requestData.append("companyId", values.companyId.value);
                  // setSubmitting(true);
                  // Display the key/value pairs
                  // for (var pair of requestData.entries()) {
                  //   console.log(pair[0] + ", " + pair[1]);
                  // }
                  if (values.id == "") {
                    MyNotifications.fire({
                      show: true,
                      icon: "confirm",
                      title: "Confirm",
                      msg: "Do you want to save !!!",
                      is_button_show: false,
                      is_timeout: false,
                      delay: 0,
                      handleSuccessFn: () => {
                        console.log("RoleCreateEvent : ");
                        createCompanyUser(requestData)
                          .then((response) => {
                            setSubmitting(false);
                            let res = response.data;
                            if (res.responseStatus == 200) {
                              //   ShowNotification("Success", res.message);
                              resetForm();

                              this.pageReload();
                            } else {
                              //   ShowNotification("Error", res.message);
                            }
                          })
                          .catch((error) => {
                            setSubmitting(false);
                            console.log("error", error);
                            // ShowNotification(
                            //   "Error",
                            //   "Not allowed duplicate user code "
                            // );
                          });
                      },
                      handleFailureFun: () => {
                        setSubmitting(false);
                      },
                    });
                  } else {
                    MyNotifications.fire({
                      show: true,
                      icon: "confirm",
                      title: "Confirm",
                      msg: "Do you want to update !!!",
                      is_button_show: false,
                      is_timeout: false,
                      delay: 0,
                      handleSuccessFn: () => {
                        console.log("RoleCreateEvent : ");
                        updateInstituteUser(requestData)
                          .then((response) => {
                            setSubmitting(false);
                            let res = response.data;
                            if (res.responseStatus == 200) {
                              ShowNotification("Success", res.message);
                              resetForm();

                              this.pageReload();
                            } else {
                              ShowNotification("Error", res.message);
                            }
                          })
                          .catch((error) => {
                            setSubmitting(false);
                            console.log("error", error);
                          });
                      },
                      handleFailureFun: () => {
                        setSubmitting(false);
                      },
                    });
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  resetForm,
                  setFieldValue,
                }) => (
                  <Form onSubmit={handleSubmit} className="form-style">
                    {/* {JSON.stringify(values)}
                    {JSON.stringify(errors)} */}

                    <div className="mb-2 m-0 company-from">
                      <Row className="mt-4 row-border">
                        <Col md="12" className="mb-4">
                          <h5 className="title-style">User Details</h5>
                          <Row className="row-inside">
                            <Col md="3">
                              <Form.Group className="createnew">
                                <Form.Label>Select Branch</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  onChange={(v) => {
                                    if (v != null) {
                                      setFieldValue("branchId", v);
                                    } else {
                                      setFieldValue("branchId", "");
                                    }
                                  }}
                                  name="branchId"
                                  options={opbranchList}
                                  value={values.branchId}
                                  invalid={errors.branchId ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.branchId && errors.branchId}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="3">
                              <Form.Group className="createnew">
                                <Form.Label>User Role</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  onChange={(v) => {
                                    if (v != null) {
                                      setFieldValue("roleId", v);
                                      this.getRolPermissionsByRoleId(v.value);
                                    } else {
                                      setFieldValue("roleId", "");
                                      this.setState({
                                        opRolePermissionList: [],
                                      });
                                    }
                                  }}
                                  value={values.roleId}
                                  name="branchId"
                                  options={opRoleList}
                                  invalid={errors.roleId ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.roleId && errors.roleId}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="3">
                              <Form.Group>
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Full Name"
                                  name="fullName"
                                  id="fullName"
                                  onChange={handleChange}
                                  value={values.fullName}
                                  isValid={touched.fullName && !errors.fullName}
                                  isInvalid={!!errors.fullName}
                                />
                                <span className="text-danger errormsg">
                                  {errors.fullName}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="3">
                              <Form.Group>
                                <Form.Label>Mobile No</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder=" Mobile No"
                                  name="mobileNumber"
                                  id="mobileNumber"
                                  onChange={handleChange}
                                  value={values.mobileNumber}
                                  isValid={
                                    touched.mobileNumber && !errors.mobileNumber
                                  }
                                  isInvalid={!!errors.mobileNumber}
                                  maxLength={10}
                                />
                                <span className="text-danger errormsg">
                                  {errors.mobileNumber}
                                </span>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-4 row-inside">
                            <Col md="3">
                              <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Email"
                                  name="email"
                                  id="email"
                                  onChange={handleChange}
                                  value={values.email}
                                  isValid={touched.email && !errors.email}
                                  isInvalid={!!errors.email}
                                />
                                <span className="text-danger errormsg">
                                  {errors.email}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="3">
                              <Form.Group className="mb-2">
                                <Form.Label className="mb-0">Gender</Form.Label>
                                <Row>
                                  <Col>
                                    <Form.Check
                                      type="radio"
                                      label="Male"
                                      className="pr-3"
                                      name="gender"
                                      id="gender1"
                                      value="male"
                                      onChange={handleChange}
                                      checked={
                                        values.gender == "male" ? true : false
                                      }
                                    />
                                  </Col>
                                  <Col style={{ marginRight: "130px" }}>
                                    <Form.Check
                                      type="radio"
                                      label="Female"
                                      name="gender"
                                      id="gender2"
                                      value="female"
                                      className=""
                                      onChange={handleChange}
                                      checked={
                                        values.gender == "female" ? true : false
                                      }
                                    />
                                  </Col>
                                </Row>
                              </Form.Group>
                            </Col>
                            <Col md="3">
                              <Form.Group>
                                <Form.Label>User Code</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="User Code"
                                  name="usercode"
                                  id="usercode"
                                  onChange={handleChange}
                                  value={values.usercode}
                                  isValid={touched.usercode && !errors.usercode}
                                  isInvalid={!!errors.usercode}
                                />
                                <span className="text-danger errormsg">
                                  {errors.usercode}
                                </span>
                              </Form.Group>
                            </Col>
                            {values.id == "" && (
                              <Col md="3">
                                <Form.Group>
                                  <Form.Label>Password</Form.Label>
                                  <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    id="password"
                                    onChange={handleChange}
                                    value={values.password}
                                    isValid={
                                      touched.password && !errors.password
                                    }
                                    isInvalid={!!errors.password}
                                  />
                                  <span className="text-danger errormsg">
                                    {errors.password}
                                  </span>
                                </Form.Group>
                              </Col>
                            )}
                            {!values.id == "" && <Col md="3"></Col>}
                          </Row>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        {/* {JSON.stringify(values)} */}
                        <Col md="12" className="mt-4  btn_align">
                          <Button
                            className="submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {values.id == "" ? "Submit" : "Update"}
                            <img src={arrowicon} className="btnico ms-1"></img>
                          </Button>
                          <Button
                            className="cancel-btn"
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();

                              MyNotifications.fire(
                                {
                                  show: true,
                                  icon: "confirm",
                                  title: "Confirm",
                                  msg: "Do you want to cancel",
                                  is_button_show: false,
                                  is_timeout: false,
                                  delay: 0,
                                  handleSuccessFn: () => {
                                    // eventBus.dispatch(
                                    //   "page_change",
                                    //   "outletuser"
                                    // );
                                    this.setState({ opendiv: !opendiv });
                                  },
                                  handleFailureFun: () => {},
                                },
                                () => {
                                  console.warn("return_data");
                                }
                              );
                            }}
                          >
                            Cancel
                            <img
                              src={cancel_icon}
                              className="ms-1"
                              style={{ height: "14px" }}
                            ></img>
                          </Button>
                        </Col>
                      </Row>
                      <Row className="mt-4 row-border">
                        <Col md="12" className="mb-4">
                          <h5 className="title-style">Permissions</h5>
                          {/* {JSON.stringify(sysPermission)} */}
                          {/* {sysPermission &&
                            sysPermission.length > 0 &&
                            sysPermission.map((v, i) => {
                              return (
                                <>
                                  <Row
                                    className={`${i != 0 ? "mt-3" : ""} m-0`}
                                  >
                                    {v &&
                                      v.length > 0 &&
                                      v.map((vi, ii) => {
                                        return (
                                          <>
                                            <Col md={2}>
                                              <Form.Group>
                                                <Form.Label>
                                                  <b>{vi.name}</b>
                                                </Form.Label>
                                                <div>
                                                  <Form.Check
                                                    type={"checkbox"}
                                                    id={`check-api-${ii}-${i}`}
                                                  >
                                                    <Form.Check.Input
                                                      type={"checkbox"}
                                                      defaultChecked={false}
                                                      name={`actions-${ii}-${i}`}
                                                      checked={this.getSelectAllOption(
                                                        vi.id
                                                      )}
                                                      onChange={(e) => {
                                                        this.handleSelectAllActionSelection(
                                                          e.target.checked,
                                                          vi.id
                                                        );
                                                      }}
                                                      value={vi.id}
                                                    />
                                                    <Form.Check.Label>
                                                      Select All
                                                    </Form.Check.Label>
                                                  </Form.Check>
                                                  {vi.actions &&
                                                    vi.actions.length > 0 &&
                                                    vi.actions.map(
                                                      (vii, iii) => {
                                                        return (
                                                          <>
                                                            <Form.Check
                                                              type={"checkbox"}
                                                              id={`check-api-${iii}-${ii}-${i}`}
                                                            >
                                                              <Form.Check.Input
                                                                type={
                                                                  "checkbox"
                                                                }
                                                                defaultChecked={
                                                                  false
                                                                }
                                                                name={`actions-${iii}-${ii}-${i}`}
                                                                checked={this.getActionSelectionOption(
                                                                  vi.id,
                                                                  vii.id
                                                                )}
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  this.handleActionSelection(
                                                                    e.target
                                                                      .checked,
                                                                    vi.id,
                                                                    vii.id
                                                                  );
                                                                }}
                                                                value={vii.id}
                                                              />
                                                              <Form.Check.Label>
                                                                {vii.name}
                                                              </Form.Check.Label>
                                                            </Form.Check>
                                                          </>
                                                        );
                                                      }
                                                    )}
                                                </div>

                                                <span className="text-danger errormsg">
                                                  {errors.unitCode}
                                                </span>
                                              </Form.Group>
                                            </Col>
                                          </>
                                        );
                                      })}
                                  </Row>
                                </>
                              );
                            })} */}
                          <div className="px-2 tblht">
                            <Table bordered className="usertblbg tblresponsive">
                              <thead style={{ position: "sticky", top: "0" }}>
                                <tr>
                                  <th
                                    style={{
                                      borderBottom: "2px solid transparent",
                                      backgroundColor: "#d6fcdc",
                                    }}
                                  >
                                    Particulars
                                  </th>
                                  {/* This Th-Map For Table header like Create,Edit,View */}
                                  {actionsOptions &&
                                    actionsOptions.length > 0 &&
                                    actionsOptions.map((v, i) => {
                                      return (
                                        <th
                                          className="text-center"
                                          style={{
                                            borderBottom:
                                              "2px solid transparent",
                                            backgroundColor: "#d6fcdc",
                                          }}
                                        >
                                          {v.label}
                                        </th>
                                      );
                                    })}
                                </tr>
                              </thead>
                              <tbody className="bg-white tblbtmline ">
                                {/* This Map for Insert Data Into Table Content Parent Names like ->Master With Check Box */}
                                {sysPermission.map((vi, ii) => {
                                  return (
                                    <>
                                      <tr>
                                        <td
                                          className="text-center"
                                          style={{ background: "#e6f2f8" }}
                                        >
                                          {vi && (
                                            <Form.Group className="d-flex">
                                              <Form.Check
                                                type={"checkbox"}
                                                id={`check-api-${ii}`}
                                              >
                                                <Form.Check.Input
                                                  type={"checkbox"}
                                                  defaultChecked={false}
                                                  name="level1"
                                                  checked={this.isParentChecked(
                                                    vi.id
                                                  )}
                                                  onChange={(e) => {
                                                    this.handleUserSelection(
                                                      vi.id,
                                                      0,
                                                      0,
                                                      e.target.checked
                                                    );
                                                  }}
                                                  //   value={this.getActionSelectionOption(
                                                  //     values,
                                                  //     v.value
                                                  //   )}
                                                />
                                                <Form.Check.Label
                                                  style={{
                                                    color: "#00a0f5",
                                                    textDecoration: "underline",
                                                  }}
                                                >
                                                  {vi.label}
                                                </Form.Check.Label>
                                              </Form.Check>
                                            </Form.Group>
                                          )}
                                        </td>
                                        {/* This Map Used for Insert Data of child Under Master */}
                                        {actionsOptions &&
                                          actionsOptions.length > 0 &&
                                          actionsOptions.map((v, i) => {
                                            return (
                                              <td
                                                style={{
                                                  background: "#e6f2f8",
                                                }}
                                              ></td>
                                            );
                                          })}
                                      </tr>
                                      {vi.level &&
                                        vi.level.map((vii, iii) => {
                                          return (
                                            <tr>
                                              <td className="text-center">
                                                {vii && (
                                                  <Form.Group className="d-flex">
                                                    <Form.Check
                                                      type={"checkbox"}
                                                      id={`check-api-${ii}-${iii}`}
                                                    >
                                                      <Form.Check.Input
                                                        type={"checkbox"}
                                                        defaultChecked={false}
                                                        name="level1"
                                                        checked={this.isChildchecked(
                                                          vi.id,
                                                          vii.id
                                                        )}
                                                        onChange={(e) => {
                                                          this.handleUserSelection(
                                                            vi.id,
                                                            vii.id,
                                                            0,
                                                            e.target.checked
                                                          );
                                                        }}
                                                        value={vii.id}
                                                      />
                                                      <Form.Check.Label>
                                                        {vii.label}
                                                      </Form.Check.Label>
                                                    </Form.Check>
                                                  </Form.Group>
                                                )}
                                              </td>
                                              {/* This Map Used For Load Actions of Child With Check Box Controle */}
                                              {vii.actions &&
                                                vii.actions.map((val, ind) => {
                                                  return (
                                                    <td className="text-center">
                                                      <Form.Group className="d-flex">
                                                        <Form.Check
                                                          type={"checkbox"}
                                                          id={`check-api-${ii}-${iii}-${ind}`}
                                                        >
                                                          <Form.Check.Input
                                                            type={"checkbox"}
                                                            defaultChecked={
                                                              false
                                                            }
                                                            name="inner_level"
                                                            checked={this.getActionOptionChecked(
                                                              vi.id,
                                                              vii.id,
                                                              val
                                                            )}
                                                            onChange={(e) => {
                                                              this.handleUserSelection(
                                                                vi.id,
                                                                vii.id,
                                                                val,
                                                                e.target.checked
                                                              );
                                                            }}
                                                            value={val}
                                                          />
                                                          <Form.Check.Label>
                                                            {/* {vii.label} */}
                                                          </Form.Check.Label>
                                                        </Form.Check>
                                                      </Form.Group>
                                                    </td>
                                                  );
                                                })}
                                            </tr>
                                          );
                                        })}
                                    </>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Collapse>
        <div className="wrapper_div">
          <div className="cust_table">
            <Row style={{ padding: "8px" }}>
              <Col lg={2} md={3} xs={12} className="mb-2">
                <Row>
                  <Col>
                    <Form.Label>Result Per Page</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className="selectTo"
                      styles={customStyles}
                      name="currency"
                      placeholder="10"
                    />
                  </Col>
                </Row>
              </Col>
              <Col lg={6} md="2"></Col>
              <Col lg={2} md={3} xs={12}>
                <Form.Label
                  htmlFor="inlineFormInputGroup"
                  visuallyHidden
                ></Form.Label>
                <InputGroup className="mb-2 headt">
                  <FormControl
                    id="inlineFormInputGroup"
                    placeholder="Search"
                    type="search"
                    aria-label="Search"
                    className="search-conrol"
                  />
                  <InputGroup.Text
                    style={{
                      borderLeft: "none",
                      background: "white",
                      borderTop: "none",
                      borderRight: "none",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="faIcon-style"
                    ></FontAwesomeIcon>
                  </InputGroup.Text>
                </InputGroup>
              </Col>
              <Col lg={2} md={3} xs={12} className="btn_align mainbtn_create">
                {!opendiv && (
                  <Button
                    className="create-btn mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      this.setState({ opendiv: !opendiv });
                    }}
                    aria-controls="example-collapse-text"
                    aria-expanded={opendiv}
                  >
                    Create
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      class="bi bi-plus-square-dotted svg-style"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.5 0c-.166 0-.33.016-.487.048l.194.98A1.51 1.51 0 0 1 2.5 1h.458V0H2.5zm2.292 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zm1.833 0h-.916v1h.916V0zm1.834 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zM13.5 0h-.458v1h.458c.1 0 .199.01.293.029l.194-.981A2.51 2.51 0 0 0 13.5 0zm2.079 1.11a2.511 2.511 0 0 0-.69-.689l-.556.831c.164.11.305.251.415.415l.83-.556zM1.11.421a2.511 2.511 0 0 0-.689.69l.831.556c.11-.164.251-.305.415-.415L1.11.422zM16 2.5c0-.166-.016-.33-.048-.487l-.98.194c.018.094.028.192.028.293v.458h1V2.5zM.048 2.013A2.51 2.51 0 0 0 0 2.5v.458h1V2.5c0-.1.01-.199.029-.293l-.981-.194zM0 3.875v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 5.708v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 7.542v.916h1v-.916H0zm15 .916h1v-.916h-1v.916zM0 9.375v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .916v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .917v.458c0 .166.016.33.048.487l.98-.194A1.51 1.51 0 0 1 1 13.5v-.458H0zm16 .458v-.458h-1v.458c0 .1-.01.199-.029.293l.981.194c.032-.158.048-.32.048-.487zM.421 14.89c.183.272.417.506.69.689l.556-.831a1.51 1.51 0 0 1-.415-.415l-.83.556zm14.469.689c.272-.183.506-.417.689-.69l-.831-.556c-.11.164-.251.305-.415.415l.556.83zm-12.877.373c.158.032.32.048.487.048h.458v-1H2.5c-.1 0-.199-.01-.293-.029l-.194.981zM13.5 16c.166 0 .33-.016.487-.048l-.194-.98A1.51 1.51 0 0 1 13.5 15h-.458v1h.458zm-9.625 0h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zm1.834-1v1h.916v-1h-.916zm1.833 1h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
                  </Button>
                )}

                <Button
                  className="ml-1"
                  style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    padding: "2px",
                  }}
                  type="button"
                  onClick={() => {
                    this.pageReload();
                  }}
                >
                  <img src={refresh_iconblack} className="iconstable"></img>
                </Button>
                <Button
                  style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    padding: "2px",
                  }}
                >
                  <img src={print} className="iconstable"></img>
                </Button>
                <Button
                  style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    padding: "2px",
                  }}
                >
                  <img src={excel} className="iconstable"></img>
                </Button>
              </Col>
            </Row>
            <div className="table_wrapper p-2 denomination-style">
              <Table hover size="sm" className="tbl-font">
                <thead>
                  <tr>
                    <th>#.</th>
                    <th>Company Name</th>
                    <th>Full Name</th>
                    <th>Mobile Number</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>UserCode</th>
                  </tr>
                </thead>
                <tbody className="tabletrcursor">
                  {data.length > 0 ? (
                    data.map((v, i) => {
                      return (
                        <tr
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            this.setUpdateData(v.id);
                          }}
                        >
                          <td>{i + 1}</td>
                          <td>{v.branchName}</td>
                          <td>{v.fullName}</td>
                          <td>{v.mobileNumber}</td>
                          <td>{v.email != "NA" ? v.email : ""}</td>
                          <td>{v.gender}</td>
                          <td>{v.usercode}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
