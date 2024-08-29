import React, { Component } from "react";

import { Button, Col, Row, Form, Table, Collapse } from "react-bootstrap";

import { Formik } from "formik";
import * as Yup from "yup";
import {
  authenticationService,
  getRolePermissionList,
  updateInstituteUser,
  get_b_users,
} from "@/services/api_functions";
import Select from "react-select";
import {
  EMAILREGEXP,
  numericRegExp,
  ShowNotification,
  getValue,
  AuthenticationCheck,
  customStyles,
  eventBus,
} from "@/helpers";
import mousetrap from "mousetrap";
import "mousetrap-global-bind";
import refresh from "@/assets/images/refresh.png";

export default class RoleList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opendiv: false,
      opCompanyList: [],
      orgData: [],
      data: [],
      CompanyInitVal: {
        id: "",
        companyId: "",
        fullName: "",
        mobileNumber: "",
        userRole: "USER",
        email: "",
        gender: "",
        usercode: "",
        password: "",
      },
      userRole: "USER",
    };
    this.ref = React.createRef();
  }

  getRoleList = () => {
    getRolePermissionList()
      .then((response) => {
        // console.log("response", response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.responseObject;
          if (data.length > 0) {
            this.setState({ data: data, orgData: data });
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

  componentDidMount() {
    if (AuthenticationCheck()) {
      this.getRoleList();
      this.setInitValue();
      mousetrap.bindGlobal("ctrl+s", this.handleSubmitForm);
      mousetrap.bindGlobal("ctrl+c", this.setInitValue);
    }
  }

  componentWillUnmount() {
    mousetrap.unbindGlobal("ctrl+s", this.handleSubmitForm);
    mousetrap.unbindGlobal("ctrl+c", this.setInitValue);
  }

  setInitValue = () => {
    this.setState({
      opendiv: false,
      opCompanyList: [],
      data: [],
      userRole: "USER",
    });
  };

  pageReload = () => {
    this.componentDidMount();
  };

  handleSearch = (vi) => {
    console.log({ vi });
    let { orgData } = this.state;
    console.log({ orgData });
    let orgData_F = orgData.filter(
      (v) =>
        v.roleName != null &&
        v.roleName.toLowerCase().includes(vi.toLowerCase())
    );

    if (vi.length == 0) {
      this.setState({
        data: orgData,
      });
    } else {
      this.setState({
        data: orgData_F.length > 0 ? orgData_F : [],
      });
    }
  };
  render() {
    const { data } = this.state;
    return (
      <div className="">
        <div className="wrapper_div">
          <div className="cust_table">
            <Row style={{ padding: "8px" }}>
              <Col md="3">
                <div className="">
                  <Form>
                    <Form.Group className="mt-1" controlId="formBasicSearch">
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        className="search-box"
                        name="Search"
                        id="Search"
                        onChange={(e) => {
                          this.handleSearch(e.target.value);
                        }}
                      />
                    </Form.Group>
                  </Form>
                </div>
              </Col>
              <Col md="9" className="mt-2 btn_align mainbtn_create">
                <Button
                  className="create-btn mr-2"
                  onClick={(e) => {
                    e.preventDefault();
                    eventBus.dispatch("page_change", "createrole");
                  }}
                  aria-controls="example-collapse-text"
                >
                  Create
                  {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="bi bi-plus-square-dotted svg-style"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.5 0c-.166 0-.33.016-.487.048l.194.98A1.51 1.51 0 0 1 2.5 1h.458V0H2.5zm2.292 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zm1.833 0h-.916v1h.916V0zm1.834 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zM13.5 0h-.458v1h.458c.1 0 .199.01.293.029l.194-.981A2.51 2.51 0 0 0 13.5 0zm2.079 1.11a2.511 2.511 0 0 0-.69-.689l-.556.831c.164.11.305.251.415.415l.83-.556zM1.11.421a2.511 2.511 0 0 0-.689.69l.831.556c.11-.164.251-.305.415-.415L1.11.422zM16 2.5c0-.166-.016-.33-.048-.487l-.98.194c.018.094.028.192.028.293v.458h1V2.5zM.048 2.013A2.51 2.51 0 0 0 0 2.5v.458h1V2.5c0-.1.01-.199.029-.293l-.981-.194zM0 3.875v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 5.708v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 7.542v.916h1v-.916H0zm15 .916h1v-.916h-1v.916zM0 9.375v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .916v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .917v.458c0 .166.016.33.048.487l.98-.194A1.51 1.51 0 0 1 1 13.5v-.458H0zm16 .458v-.458h-1v.458c0 .1-.01.199-.029.293l.981.194c.032-.158.048-.32.048-.487zM.421 14.89c.183.272.417.506.69.689l.556-.831a1.51 1.51 0 0 1-.415-.415l-.83.556zm14.469.689c.272-.183.506-.417.689-.69l-.831-.556c-.11.164-.251.305-.415.415l.556.83zm-12.877.373c.158.032.32.048.487.048h.458v-1H2.5c-.1 0-.199-.01-.293-.029l-.194.981zM13.5 16c.166 0 .33-.016.487-.048l-.194-.98A1.51 1.51 0 0 1 13.5 15h-.458v1h.458zm-9.625 0h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zm1.834-1v1h.916v-1h-.916zm1.833 1h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                  </svg> */}
                </Button>

                {/* <Button
                  className="ml-2 btn-refresh"
                  type="button"
                  onClick={() => {
                    this.pageReload();
                  }}
                >
                  <img src={refresh} alt="icon" />
                </Button> */}
              </Col>
            </Row>
            <div className="table_wrapper p-2">
              <Table hover size="sm" className="tbl-font">
                <thead>
                  <tr>
                    <th>Sr.</th>
                    <th>Role Name</th>
                  </tr>
                </thead>
                <tbody className="tabletrcursor">
                  {data.length > 0 ? (
                    data.map((v, i) => {
                      return (
                        <tr
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            // if (isActionExist("sales-quotation", "edit")) {
                            eventBus.dispatch("page_change", {
                              from: "rolelist",
                              to: "editrole",
                              prop_data: v,
                              isNewTab: false,
                            });
                            // } else {
                            //   MyNotifications.fire({
                            //     show: true,
                            //     icon: "error",
                            //     title: "Error",
                            //     msg: "Permission is denied!",
                            //     is_button_show: true,
                            //   });
                            // }
                          }}
                        >
                          <td>{i + 1}</td>
                          <td>{v.roleName}</td>
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
