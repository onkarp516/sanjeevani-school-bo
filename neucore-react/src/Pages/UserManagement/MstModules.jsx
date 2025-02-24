import React, { Component } from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Table,
  Modal,
  CloseButton,
  Collapse,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  createUnit,
  getAllUnit,
  updateUnit,
  get_units,
  createSysModule,
  getSysModuleTlst,
  getSysModuleDlst,
} from "@/services/api_functions";
import {
  getHeader,
  ShowNotification,
  AuthenticationCheck,
  customStyles,
  convertToSlug,
  getValue,
} from "@/helpers";
import Select from "react-select";

export default class MstModules extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      show: false,
      opendiv: false,
      showDiv: false,
      data: [],
      getunittable: [],
      lst_t_module: [],
      lst_parent_opt: [],
      initVal: {
        id: "",
        name: "",
        slug: "",
        parent_id: "",
      },
    };
  }

  lstSysModule = () => {
    getSysModuleTlst()
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.list;
          if (data.length > 0) {
            this.setState({ lst_t_module: data });
          }
        }
      })
      .catch((error) => {});
  };
  lstSysModuleParent = () => {
    getSysModuleDlst()
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.list;
          let opt = data.map((v) => {
            return { label: v.parent_name, value: v.parent_id, ...v };
          });
          if (opt.length > 0) {
            this.setState({ lst_parent_opt: opt });
          }
        }
      })
      .catch((error) => {});
  };
  setInitValue = () => {
    let initVal = {
      id: "",
      name: "",
      slug: "",
      parent_id: "",
    };
    this.setState({ initVal: initVal, opendiv: false });
  };
  componentDidMount() {
    if (AuthenticationCheck()) {
      this.setInitValue();
      this.lstSysModule();
      this.lstSysModuleParent();
    }
  }

  pageReload = () => {
    this.setInitValue();
    this.componentDidMount();
  };

  render() {
    const {
      show,
      data,
      initVal,
      opendiv,
      getunittable,
      showDiv,
      lst_t_module,
      lst_parent_opt,
    } = this.state;
    return (
      <div className="">
        <Collapse in={opendiv}>
          <div id="example-collapse-text" className="common-form-style m-2">
            <div className="main-div mb-2 m-0">
              <h4 className="form-header"> Module</h4>
              <Formik
                innerRef={this.myRef}
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={initVal}
                enableReinitialize={true}
                validationSchema={Yup.object().shape({
                  name: Yup.string().trim().required("Name is required"),
                  slug: Yup.string().required("Slug is required"),
                })}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  let requestData = new FormData();
                  requestData.append("name", values.name);
                  requestData.append("slug", values.slug);

                  requestData.append(
                    "parent_id",
                    values.parent_id != "" ? values.parent_id.value : ""
                  );

                  if (values.id == "") {
                    createSysModule(requestData)
                      .then((response) => {
                        let res = response.data;
                        if (res.responseStatus == 200) {
                          ShowNotification("Success", res.message);
                          this.myRef.current.resetForm();
                          this.pageReload();
                        } else {
                          ShowNotification("Error", res.message);
                        }
                      })
                      .catch((error) => {});
                  } else {
                    requestData.append("id", values.id);
                    updateUnit(requestData)
                      .then((response) => {
                        let res = response.data;
                        if (res.responseStatus == 200) {
                          ShowNotification("Success", res.message);
                          this.myRef.current.resetForm();
                          this.pageReload();
                        } else {
                          ShowNotification("Error", res.message);
                        }
                      })
                      .catch((error) => {});
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
                    <Row>
                      <Col md="3">
                        <Form.Group>
                          <Form.Label>Module Name</Form.Label>
                          <Form.Control
                            autoFocus="true"
                            type="text"
                            placeholder="Module Name"
                            name="name"
                            id="name"
                            onChange={(e) => {
                              let v = e.target.value;
                              setFieldValue("name", v);
                              setFieldValue("slug", convertToSlug(v));
                            }}
                            value={values.name}
                            isValid={touched.name && !errors.name}
                            isInvalid={!!errors.name}
                          />
                          {/* <Form.Control.Feedback type="invalid"> */}
                          <span className="text-danger errormsg">
                            {errors.name}
                          </span>
                          {/* </Form.Control.Feedback> */}
                        </Form.Group>
                      </Col>
                      <Col md="3">
                        <Form.Group>
                          <Form.Label>Module Slug</Form.Label>
                          <Form.Control
                            autoFocus="true"
                            type="text"
                            placeholder="Module Slug"
                            name="slug"
                            id="slug"
                            onChange={handleChange}
                            value={values.slug}
                            isValid={touched.slug && !errors.slug}
                            isInvalid={!!errors.slug}
                          />
                          {/* <Form.Control.Feedback type="invalid"> */}
                          <span className="text-danger errormsg">
                            {errors.slug}
                          </span>
                          {/* </Form.Control.Feedback> */}
                        </Form.Group>
                      </Col>
                      <Col md="3">
                        <Form.Group>
                          <Form.Label>Parent Id</Form.Label>
                          <Select
                            className="selectTo"
                            id="parent_id"
                            placeholder="parent_id"
                            styles={customStyles}
                            isClearable
                            options={lst_parent_opt}
                            name="parent_id"
                            onChange={(value) => {
                              setFieldValue("parent_id", value);
                            }}
                            value={values.parent_id}
                          />

                          <span className="text-danger errormsg">
                            {errors.parent_id}
                          </span>
                        </Form.Group>
                      </Col>
                      <Col md="3" className="mt-4 text-end">
                        <Button className="submit-btn" type="submit">
                          {values.id == "" ? "Submit" : "Update"}
                        </Button>
                        <Button
                          variant="secondary cancel-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            this.pageReload();
                          }}
                        >
                          Cancel
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Collapse>
        <div className="wrapper_div">
          <Row className="p-2">
            <Col md="3">
              <Form>
                <Form.Group className="mt-1" controlId="formBasicSearch">
                  <Form.Control
                    type="text"
                    placeholder="Search"
                    className="search-box"
                  />
                  {/* <Button type="submit">x</Button> */}
                </Form.Group>
              </Form>
            </Col>
            <Col md="9" className="mt-2 text-end">
              {!opendiv && (
                <Button
                  className="create-btn mr-2"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ opendiv: !opendiv });
                  }}
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
                className="ml-2 refresh-btn"
                onClick={(e) => {
                  e.preventDefault();
                  this.pageReload();
                }}
              >
                Refresh
              </Button>
            </Col>
          </Row>

          <div className="table_wrapper row-inside">
            {/* {getunittable.length > 0 && ( */}
            <Table
              hover
              size="sm"
              className="tbl-font"
              //responsive
            >
              <thead>
                {/* <div className="scrollbar_hd"> */}
                <tr>
                  {/* {this.state.showDiv && ( */}
                  <th>#.</th>
                  {/* )} */}
                  <th>Module Name</th>
                  <th>Module Slug</th>
                  <th>Parent Name</th>
                </tr>
                {/* </div> */}
              </thead>
              <tbody>
                {lst_t_module.length > 0 ? (
                  lst_t_module.map((v, i) => {
                    return (
                      <tr
                        onDoubleClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <td>{i + 1}</td>
                        <td>{v.name}</td>
                        <td>{v.slug}</td>
                        <td>{v.parent_name ? v.parent_name : "-"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No Data Found
                    </td>
                  </tr>
                )}
                {/* </div> */}
              </tbody>
            </Table>
            {/* )} */}
          </div>
        </div>
      </div>
    );
  }
}
