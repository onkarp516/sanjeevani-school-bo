import React from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Table,
  InputGroup,
  Collapse,
  FormControl,
} from "react-bootstrap";
import {
  authenticationService,
  createFeeHead,
  getAllFeeHeads,
  updateFeeHead,
  get_companies_super_admin,
  getBranchesByInstitute,
  getFeeHeadById,
  getLedgersByBranch,
  updateFeeHeadNormal,
} from "@/services/api_functions";

import Select from "react-select";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  customStyles,
  getSelectValue,
  MyNotifications,
  isActionExist,
  eventBus,
} from "@/helpers";
import "mousetrap-global-bind";
import refresh_iconblack from "@/assets/images/3x/refresh_iconblack.png";
import arrowicon from "@/assets/images/3x/arrowicon.png";
import cancel from "@/assets/images/3x/cancel.png";
import excel from "@/assets/images/3x/excel.png";
import print from "@/assets/images/3x/print.png";
import delete_ from "@/assets/images/3x/delete_.png";
import edit_ from "@/assets/images/3x/edit_.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import reset from "@/assets/images/reset.png";
import { setUserPermissions } from "@/redux/userPermissions/Action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
const CustomClearText = () => "clear all";
const ClearIndicator = (props) => {
  const {
    children = <CustomClearText />,
    getStyles,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div
      {...restInnerProps}
      ref={ref}
      style={getStyles("clearIndicator", props)}
    >
      <div style={{ padding: "0px 5px" }}>{children}</div>
    </div>
  );
};

const ClearIndicatorStyles = (base, state) => ({
  ...base,
  cursor: "pointer",
  color: state.isFocused ? "blue" : "black",
});

class FeesHead extends React.Component {
  constructor(props) {
    super(props);
    this.fessheadFormRef = React.createRef();
    this.state = {
      data: [],

      ledgerOpts: [],
      opbranchList: [],
      opCompanyList: [],
      opstandList: [],
      isnormalUpdate: true,
      studentTypeOptions: [
        { label: "Day School", value: 1 },
        { label: "Residential", value: 2 },
      ],
      isLoading: true,
      initVal: {
        id: "",
        companyId: "",
        branchId: "",
        underBranchId: "",
        ledgerId: "",
        studentType: "",
        feeHeadName: "",
        isReceiptCurrentBranch: "",
      },
    };
  }
  setInitValAndLoadData() {
    let { opbranchList } = this.state;
    this.setState(
      {
        initVal: {
          id: "",
          companyId: "",
          branchId: getSelectValue(
            opbranchList,
            authenticationService.currentUserValue.branchId
          ),
          underBranchId: "",
          ledgerId: "",
          studentType: "",
          feeHeadName: "",
          isReceiptCurrentBranch: "",
        },
        opendiv: false,
      },
      () => {
        this.getAllFeeHeadslst();
      }
    );
  }

  getAllFeeHeadslst = () => {
    getAllFeeHeads()
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let d = res.responseObject;
          if (d.length > 0) {
            this.setState({ data: d });
          }
        }
      })
      .catch((error) => {
        this.setState({ data: [] });
        console.log("error", error);
      });
  };

  getLedgersByBranchFun = (branchId, initObj = null) => {
    let requestData = new FormData();
    requestData.append("branchId", branchId);
    getLedgersByBranch(requestData)
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let d = res.responseObject;
          let Opt = d.map(function (values) {
            return { value: parseInt(values.id), label: values.ledger_name };
          });
          this.setState({ ledgerOpts: Opt }, () => {
            if (initObj != null) {
              initObj.ledgerId =
                getSelectValue(Opt, parseInt(initObj.ledgerId)) != undefined
                  ? getSelectValue(Opt, parseInt(initObj.ledgerId))
                  : "";
              this.setState({ initVal: initObj });
            }
          });
        }
      })
      .catch((error) => {
        this.setState({ opCompanyList: [] });
        console.log("error", error);
      });
  };

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
              let branchId = getSelectValue(
                Opt,
                authenticationService.currentUserValue.branchId
              );
              this.fessheadFormRef.current.setFieldValue("branchId", branchId);

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

  getFeeHeadByIdFun = (id) => {
    let { studentTypeOptions, opbranchList } = this.state;

    let reqData = new FormData();
    reqData.append("id", id);

    getFeeHeadById(reqData)
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let ob = res.responseObject;
          console.log({ ob });
          let initValue = {
            id: ob.id,
            branchId: getSelectValue(opbranchList, ob.branchId),
            underBranchId: getSelectValue(opbranchList, ob.underBranchId),
            studentType: getSelectValue(studentTypeOptions, ob.studentType),
            ledgerId: ob.ledgerId,
            feeHeadName: ob.feeHeadName ? ob.feeHeadName : "",
            isReceiptCurrentBranch:
              ob.isReceiptCurrentBranch == true ? "current" : "hostel",
          };

          console.log("initvalue", initValue);
          this.setState({ initVal: initValue, opendiv: true }, () => {
            this.getLedgersByBranchFun(ob.underBranchId, initValue);
          });
        }
      })
      .catch((error) => {
        this.setState({ data: [] });
        console.log("error", error);
      });
  };
  componentDidMount() {
    let companyId = authenticationService.currentUserValue.companyId;
    this.getBranchData(companyId);
    this.getAllFeeHeadslst();
  }

  pageReload = () => {
    this.componentDidMount();
  };

  UpdateFeesHeadWithPosting = (values, isnormalUpdate) => {
    console.log("isnormalupdate-->", isnormalUpdate);
    let requestData = new FormData();
    requestData.append("id", values.id);
    requestData.append("feeHeadName", values.feeHeadName);

    requestData.append("branchId", values.branchId.value);
    requestData.append("underBranchId", values.underBranchId.value);
    requestData.append("ledgerId", values.ledgerId.value);
    requestData.append("studentType", values.studentType.value);
    requestData.append("isReceiptCurrentBranch", values.isReceiptCurrentBranch);
    if (isnormalUpdate == false) {
      console.log("caaling Posting API");
      updateFeeHead(requestData)
        .then((response) => {
          // setSubmitting(false);
          let res = response.data;
          if (res.responseStatus == 200) {
            MyNotifications.fire({
              show: true,
              icon: "success",
              title: "Success",
              msg: response.message,
              is_timeout: true,
              delay: 1000,
            });
            this.transFormRef.current.resetForm();

            this.setInitValAndLoadData();
          } else {
            // setSubmitting(false);
            MyNotifications.fire({
              show: true,
              icon: "error",
              title: "Error",
              msg: response.message,
              is_button_show: true,
              response,
            });
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          // setSubmitting(false);
          MyNotifications.fire({
            show: true,
            icon: "error",
            title: "Error",

            is_button_show: true,
          });
          console.log("errors", error);
        });
    } else {
      console.log("caling Normal API");

      updateFeeHeadNormal(requestData)
        .then((response) => {
          // setSubmitting(false);
          let res = response.data;
          if (res.responseStatus == 200) {
            MyNotifications.fire({
              show: true,
              icon: "success",
              title: "Success",
              msg: response.message,
              is_timeout: true,
              delay: 1000,
            });
            // resetForm();
            this.setInitValAndLoadData();
          } else {
            // setSubmitting(false);
            MyNotifications.fire({
              show: true,
              icon: "error",
              title: "Error",
              msg: response.message,
              is_button_show: true,
              response,
            });
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          // setSubmitting(false);
          MyNotifications.fire({
            show: true,
            icon: "error",
            title: "Error",

            is_button_show: true,
          });
          console.log("errors", error);
        });
    }
  };

  pageReload = () => {
    this.componentDidMount();
  };

  render() {
    const {
      data,
      ledgerOpts,
      opendiv,
      initVal,
      opbranchList,
      opCompanyList,
      studentTypeOptions,
      isnormalUpdate,
    } = this.state;
    return (
      <div className="">
        <Collapse in={opendiv}>
          <div
            id="example-collapse-text"
            className="common-form-style mt-2 p-2"
          >
            <div className="main-div mb-2 m-0">
              <h4 className="form-header"> Fee Head</h4>
              <Formik
                validateOnChange={false}
                // validateOnBlur={false}
                enableReinitialize={true}
                initialValues={initVal}
                innerRef={this.fessheadFormRef}
                validationSchema={Yup.object().shape({
                  feeHeadName: Yup.string()
                    .trim()
                    .required("feehadeName  is required"),
                  branchId: Yup.object()
                    .required("Branch is required")
                    .nullable(),
                  studentType: Yup.object()
                    .required("student Type is required")
                    .nullable(),
                  isReceiptCurrentBranch: Yup.string()
                    .trim()
                    .required("Receipt option is required"),
                })}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  console.log("value", values);
                  let keys = Object.keys(initVal);
                  let requestData = new FormData();
                  keys.map((v) => {
                    if (
                      values[v] != "" &&
                      v != "branchId" &&
                      v != "underBranchId" &&
                      v != "ledgerId" &&
                      v != "studentType"
                    ) {
                      requestData.append(v, values[v]);
                    }
                  });
                  requestData.append("branchId", values.branchId.value);
                  requestData.append(
                    "underBranchId",
                    values.underBranchId.value
                  );
                  requestData.append("ledgerId", values.ledgerId.value);
                  requestData.append("studentType", values.studentType.value);
                  requestData.append(
                    "isReceiptCurrentBranch",
                    values.isReceiptCurrentBranch
                  );

                  setSubmitting(true);
                  if (values.id == "") {
                    createFeeHead(requestData)
                      .then((response) => {
                        let res = response.data;
                        if (res.responseStatus == 200) {
                          setSubmitting(false);
                          MyNotifications.fire({
                            show: true,
                            icon: "success",
                            title: "Success",
                            msg: response.message,
                            is_timeout: true,
                            delay: 1000,
                          });
                          resetForm();
                          this.setInitValAndLoadData();
                        } else {
                          //   ShowNotification("Error", res.message);
                          setSubmitting(false);
                          MyNotifications.fire({
                            show: true,
                            icon: "error",
                            title: "Error",
                            msg: response.message,
                            is_button_show: true,
                            response,
                          });
                        }
                      })
                      .catch((error) => {
                        setSubmitting(false);
                        console.log("error", error);
                        MyNotifications.fire({
                          show: true,
                          icon: "error",
                          title: "Error",

                          is_button_show: true,
                        });
                      });
                  } else {
                    MyNotifications.fire({
                      show: true,
                      icon: "confirm",
                      title: "confirm",
                      msg: "Are you sure want update with Postings ?",
                      is_button_show: true,

                      handleSuccessFn: () => {
                        console.log("Executing Posting YES");

                        this.UpdateFeesHeadWithPosting(values, false);
                      },
                      handleFailureFun: () => {
                        console.log("Executing Normal ");
                        this.UpdateFeesHeadWithPosting(values, true);
                      },
                    });

                    // updateFeeHead(requestData)
                    //   .then((response) => {
                    //     setSubmitting(false);
                    //     let res = response.data;
                    //     if (res.responseStatus == 200) {
                    //       MyNotifications.fire({
                    //         show: true,
                    //         icon: "success",
                    //         title: "Success",
                    //         msg: response.message,
                    //         is_timeout: true,
                    //         delay: 1000,
                    //       });
                    //       resetForm();
                    //       this.setInitValAndLoadData();
                    //     } else {
                    //       setSubmitting(false);
                    //       MyNotifications.fire({
                    //         show: true,
                    //         icon: "error",
                    //         title: "Error",
                    //         msg: response.message,
                    //         is_button_show: true,
                    //         response,
                    //       });
                    //     }
                    //   })
                    //   .catch((error) => {
                    //     this.setState({ isLoading: false });
                    //     setSubmitting(false);
                    //     MyNotifications.fire({
                    //       show: true,
                    //       icon: "error",
                    //       title: "Error",

                    //       is_button_show: true,
                    //     });
                    //     console.log("errors", error);
                    //   });
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
                    {/* {JSON.stringify(values)} */}
                    <div className="common-form-style m-0 mb-2">
                      <Row className="">
                        <Col md="12" className="mb-2">
                          <Row className="row-inside">
                            <Col md="2">
                              <Form.Group className="createnew">
                                <Form.Label>Select Branch</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  isDisabled={true}
                                  onChange={(v) => {
                                    setFieldValue("branchId", "");
                                    if (v != null) {
                                      setFieldValue("branchId", v);
                                    }
                                  }}
                                  name="branchId"
                                  options={opbranchList}
                                  value={values.branchId}
                                  invalid={errors.branchId ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.branchId}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="createnew">
                                <Form.Label>Student Type</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  onChange={(v) => {
                                    setFieldValue("studentType", "");
                                    if (v != null) {
                                      setFieldValue("studentType", v);
                                    }
                                  }}
                                  name="studentType"
                                  options={studentTypeOptions}
                                  value={values.studentType}
                                  invalid={errors.studentType ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.studentType}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group>
                                <Form.Label>Fee Head Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Fee Head Name"
                                  name="feeHeadName"
                                  id="feeHeadName"
                                  onChange={handleChange}
                                  value={values.feeHeadName}
                                  isValid={
                                    touched.feeHeadName && !errors.feeHeadName
                                  }
                                  isInvalid={!!errors.feeHeadName}
                                />
                                <span className="text-danger errormsg">
                                  {errors.feeHeadName}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="createnew">
                                <Form.Label>Select Under Branch</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  onChange={(v) => {
                                    setFieldValue("underBranchId", "");
                                    setFieldValue("ledgerId", "");
                                    if (v != null) {
                                      setFieldValue("underBranchId", v);
                                      this.getLedgersByBranchFun(v.value);
                                    } else {
                                      this.setState({ ledgerOpts: [] });
                                    }
                                  }}
                                  name="underBranchId"
                                  options={opbranchList}
                                  value={values.underBranchId}
                                  invalid={errors.underBranchId ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.underBranchId}
                                </span>
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="createnew">
                                <Form.Label>Select Ledger</Form.Label>
                                <Select
                                  isClearable={true}
                                  className="selectTo"
                                  styles={customStyles}
                                  onChange={(v) => {
                                    setFieldValue("ledgerId", "");
                                    if (v != null) {
                                      setFieldValue("ledgerId", v);
                                    }
                                  }}
                                  name="ledgerId"
                                  options={ledgerOpts}
                                  value={values.ledgerId}
                                  invalid={errors.ledgerId ? true : false}
                                />
                                <span className="text-danger errormsg">
                                  {errors.ledgerId}
                                </span>
                              </Form.Group>
                            </Col>

                            <Col md="2" className="p-0">
                              <Form.Group>
                                <Form.Label>
                                  Select Branch to shows in receipt ?
                                </Form.Label>
                                <br />
                                <div className="genderhorizotal">
                                  <Form.Check
                                    inline
                                    label="Current Branch"
                                    name="isReceiptCurrentBranch"
                                    value="current"
                                    type="radio"
                                    // value={checked}
                                    checked={
                                      values.isReceiptCurrentBranch ===
                                        "current"
                                        ? true
                                        : false
                                    }
                                    onChange={(v) => {
                                      setFieldValue(
                                        "isReceiptCurrentBranch",
                                        "current"
                                      );
                                    }}
                                  />
                                  <Form.Check
                                    inline
                                    label="Hostel Branch"
                                    name="isReceiptCurrentBranch"
                                    value="hostel"
                                    type="radio"
                                    checked={
                                      values.isReceiptCurrentBranch === "hostel"
                                        ? true
                                        : false
                                    }
                                    onChange={(v) => {
                                      setFieldValue(
                                        "isReceiptCurrentBranch",
                                        "hostel"
                                      );
                                    }}
                                  />
                                </div>
                                <span className="text-danger errormsg">
                                  {errors.isReceiptCurrentBranch}
                                </span>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      {/* <h5>Formation</h5> */}
                      <Row className="">
                        <Col md="12" className="btn_align ">
                          <Button
                            className="submitbtn affiliated"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {values.id == "" ? "Submit" : "Update"}
                            <img src={arrowicon} className="btnico ms-1"></img>
                          </Button>
                          <Button
                            className="submitbtn cancelbtn"
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              // console.log("reset");

                              this.setInitValAndLoadData();
                            }}
                          >
                            Cancel
                            <img
                              src={cancel}
                              alt=""
                              className="btsubmit"
                              style={{ height: "15px" }}
                            ></img>
                          </Button>
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
          {/* <h6>Group</h6> */}

          <div className="cust_table p-2">
            <Row style={{ padding: "8px" }} className="headpart">
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
                {/* {this.state.hide == 'true'} */}
                {!opendiv && (
                  <Button
                    className="create-btn me-2"
                    onClick={(e) => {
                      e.preventDefault();

                      if (
                        isActionExist(
                          "fees-head",
                          "create",
                          this.props.userPermissions
                        )
                      ) {
                        this.setState({ opendiv: !opendiv });
                      } else {
                        MyNotifications.fire({
                          show: true,
                          icon: "error",
                          title: "Error",
                          msg: "Permission is denied!",
                          is_button_show: true,
                        });
                      }
                    }}
                    //   this.setState({ opendiv: !opendiv });
                    // }}
                    aria-controls="example-collapse-text"
                    aria-expanded={opendiv}
                  // onClick={this.open}
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
            {/* {data.length > 0 && ( */}
            <div className="table_wrapper denomination-style">
              {isActionExist(
                "fees-head",
                "list",
                this.props.userPermissions
              ) && (
                <Table size="sm" hover className="tbl-font">
                  <thead>
                    <tr>
                      <th>#.</th>
                      {/* <th>Institute</th> */}
                      {/* <th>Branch</th> */}
                      <th>Student Type</th>
                      <th>Fees Head</th>
                      <th>Under Branch</th>
                      <th>Ledger</th>
                      <th>In receipt which branch under shows?</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody
                    className="tabletrcursor"
                    style={{ borderTop: "transparent" }}
                  >
                    {data.length > 0 ? (
                      data.map((v, i) => {
                        return (
                          <tr>
                            <td>{i + 1}</td>
                            {/* <td>{v.outletName}</td> */}
                            {/* <td>{v.branchName}</td> */}
                            <td>{v.studentType}</td>
                            <td>{v.feeHeadName}</td>
                            <td>{v.underBranchName}</td>
                            <td>{v.ledgerName}</td>
                            <td>{v.isReceiptCurrentBranch}</td>
                            <td>
                              {" "}
                              <a
                                href="#."
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (
                                    isActionExist(
                                      "fees-head",
                                      "edit",
                                      this.props.userPermissions
                                    )
                                  ) {
                                    this.getFeeHeadByIdFun(v.id);
                                  } else {
                                    MyNotifications.fire({
                                      show: true,
                                      icon: "error",
                                      title: "Error",
                                      msg: "Permission is denied !",
                                      is_button_show: true,
                                    });
                                  }
                                }}
                              >
                                <img
                                  src={edit_}
                                  alt=""
                                  className="marico"
                                ></img>
                              </a>
                              {/* <a href="">
                                <img
                                  src={delete_}
                                  alt=""
                                  className="marico"
                                ></img>
                              </a> */}
                            </td>
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
              )}
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ userPermissions }) => {
  return { userPermissions };
};

const mapActionsToProps = (dispatch) => {
  return bindActionCreators(
    {
      setUserPermissions,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapActionsToProps)(FeesHead);
