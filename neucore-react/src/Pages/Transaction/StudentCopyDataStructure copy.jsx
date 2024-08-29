import React, { Component } from "react";

// import suyash from "@/assets/images/3x/suyash.jpg";
import suyash from "@/assets/images/suyash.jpg";
import cancel from "@/assets/images/3x/cancel.png";
import moment from "moment";
import {
  ShowNotification,
  customStyles,
  getSelectValue,
  MyNotifications,
  eventBus,
  isActionExist,
  MyDatePicker,
  numberWithCommasIN,
} from "@/helpers";
import { Button, Col, Row, Form, Table, Figure } from "react-bootstrap";

import { getTrasactionDetailsById } from "@/services/api_functions";
export default class StudentCopyDataStructure extends Component {
  constructor(props) {
    super(props);
    this.transFormRef = React.createRef();
    this.state = {
      isReqSent: false,
      receiptData: "",
      feesPaymentData: "",
      particularList: [],
      hostelParticularList: [],
      blankLength: "",
      isEditDataSet: false,
      hostelBlankLength: "",
      normalupdate: true,

    };
  }

  getFeesData = () => {
    // let { receiptData } = this.state;
    if (this.state.receiptData != undefined) {
      this.setState({ isReqSent: true }, () => {
        let requestData = new FormData();
        requestData.append(
          "transactionId",
          this.state.receiptData.transactionId
        );
        requestData.append(
          "lastReceiptNo",
          this.state.receiptData.lastReceiptNo
        );
        console.log("fun call");
        getTrasactionDetailsById(requestData)
          .then((response) => {


            console.log("response->", response);

            if (response.responseStatus === 200) {
              let res = response;

              console.log({ res });
              if (res.responseStatus === 200) {
                let len = res && res.particularList.length;
                let blen = 9 - len;

                let hlen = res && res.hostelParticularList.length;
                let hblen = 9 - hlen;

                console.log({ blen });

                let rows = [];
                for (var i = 0; i < blen; i++) {
                  rows.push(
                    <tr>
                      <td className="text-start td-style">&nbsp;</td>
                      <td className="text-center td-style">&nbsp;</td>
                    </tr>
                  );
                }

                let hrows = [];
                for (var i = 0; i < hblen; i++) {
                  hrows.push(
                    <tr>
                      <td className="text-start td-style">&nbsp;</td>
                      <td className="text-center td-style">&nbsp;</td>
                    </tr>
                  );
                }
                this.setState({
                  isReqSent: false,
                  isEditDataSet: true,
                  feesPaymentData: res.responseObject,
                  particularList: res.particularList,
                  hostelParticularList: res.hostelParticularList,
                  blankLength: rows,
                  hostelBlankLength: hrows,
                });
              }
            } else {
              // this.setState({
              //   isReqSent: false,
              //   isEditDataSet: true,
              // });
            }
          })
          .catch((error) => {
            this.setState({ isReqSent: false });
            console.log("errors", error);
          });
      });
    }
  };

  componentDidMount() {
    const { prop_data } = this.props.block;
    console.log("propData--->", prop_data);
    this.setState({ receiptData: prop_data });
    this.getFeesData();

  }

  // componentDidUpdate() {
  //   let { isReqSent, receiptData, isEditDataSet } = this.state;
  //   console.log({ isReqSent, receiptData, isEditDataSet });
  //   if (receiptData != "" && isReqSent == false && isEditDataSet == false) {
  //     this.getFeesData();
  //   }
  // }

  callPrint = () => {
    var newWin = window.frames["printf"];
    var divToPrint = document.getElementById("printDiv");
    let data = divToPrint.outerHTML;
    let htmlToPrint = '<body onload="window.print()">';
    htmlToPrint +=
      "<style>@media print {" +
      "body {" +
      "width: 100%;" +
      // "margin: 0;" +
      // "color: #ffffff;" +
      // "background-color: #000000;" +
      "font-size: 18px;" +
      "margin-top: 0px;" +
      "page-break-after: auto;" +
      "font-family: Calibri;" +
      "}" +
      ".data_body {" +
      // "padding: 10px" +
      "width: 47%;" +
      "display: inline-block;" +
      "font-size: 18px;" +
      "font-family: Calibri;" +
      "}" +
      ".border-style{" +
      "border-right: 1px dashed black;" +
      "margin-right: 10px" +
      "}" +
      ".p-style{" +
      "font-size: 10px;" +
      "margin: 0px;" +
      "}" +
      ".row-style{" +
      "display: flex;" +
      "}" +
      ".rec-style{" +
      "font-size: 12px;" +
      "text-align: start;" +
      "margin-left:2px;" +
      "margin:5px;" +
      "margin-bottom:11px;" +
      "line-height:5px;" +
      "}" +
      ".rec-style1{" +
      "font-size: 12px;" +
      "text-align: end;" +
      "margin-left:2px;" +
      "margin:5px;" +
      "margin-bottom:11px;" +
      "line-height:5px;" +
      "}" +
      ".word-style{" +
      "font-size: 11px;" +
      "}" +
      ".sign-style{" +
      "margin-left:5px;" +
      "font-size: 13px;" +
      "margin-top: 30px;" +
      "text-align: start;" +
      "}" +
      ".h3-style{" +
      "font-size: 16px;" +
      "margin: 0px;" +
      "}" +
      ".outlet-header {" +
      "margin-top: 0px;" +
      "text-transform: uppercase;" +
      "font-weight: bold;" +
      "margin-bottom: 0px;" +
      "font-size: 18px;" +
      "text-align: center;" +
      "font-family: Calibri;" +
      "}" +
      ".text-center {" +
      "text-align: center;" +
      "}" +
      ".text-end {" +
      "text-align: end;" +
      "}" +
      ".outlet-address {" +
      "word-wrap: break-word;" +
      "text-align: center;" +
      "font-style: italic;" +
      "font-weight: 500;" +
      "margin-bottom: 0;" +
      "font-size: 12px;" +
      "margin-top: 0px;" +
      "font-family: Calibri;" +
      "}" +
      ".printtop {" +
      "border-bottom: 1px solid #333;" +
      "}" +
      ".support {" +
      "text-align: center;" +
      "word-wrap: break-word;" +
      "font-weight: 500;" +
      "font-size: 12px;" +
      "margin-top: 0px;" +
      "margin-bottom: 0 !important;" +
      "font-family: Calibri;" +
      "}" +
      ".support1 {" +
      "font-size: 12px;" +
      // "text-align: center;" +
      "word-wrap: break-word;" +
      "margin-top: 2px;" +
      "margin-bottom: 0 !important;" +
      "font-family: Calibri;" +
      // font-family: Calibri;
      "}" +
      ".receipt-tbl {" +
      "width: 92.5%;" +
      "border-collapse: collapse;" +
      "font-size: 8px;" +
      ".tbody-style {" +
      "font-family: Calibri;" +
      "}" +
      "}" +
      ".th-style {" +
      // "font-weight: 500;" +
      "border-bottom: 1px solid #333;" +
      "border-top: 1px solid #333;" +
      "text-align:start;" +
      "width:70%;" +
      // "font-family: Calibri;" +
      "}" +
      ".td-style {" +
      "text-align:start;" +
      "border-right:1px solid #000;" +
      "border-left:1px solid #000;" +
      "border-bottom:1px solid #000;" +
      "font-size: 13px;" +
      "}" +
      ".amt-th-style {" +
      "text-align:center !important;" +
      "}" +
      ".amt-style {" +
      "text-align:center !important;" +
      // "text-align:end !important;" +
      "width:50px;" +
      "}" +
      "}</style>";
    htmlToPrint += data;
    htmlToPrint += "</body>";
    newWin.document.write(htmlToPrint);
    newWin.document.close();
  };
  render() {
    const {
      feesPaymentData,
      particularList,
      blankLength,
      hostelParticularList,
      hostelBlankLength,
      receiptData,
    } = this.state;
    return (
      <>
        <Form autoComplete="off" className="form-style">
          <Button
            onClick={(e) => {
              e.preventDefault();
              this.callPrint();
            }}
          >
            Print
          </Button>
          <Button
            type="submit"
            className="submitbtn cancelbtn formbtn affiliated"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              eventBus.dispatch("page_change", {
                from: "studentcopywithstructure",
                to: "dailycollection",
                prop_data: receiptData,
                isNewTab: false,

                // eventBus.dispatch("page_change", "dailycollection");
              });
            }}
          >
            Cancel
            <img src={cancel} alt="" className="btsubmit "></img>
          </Button>

          <iframe id="printf" name="printf" className="d-none"></iframe>
          <div id="printDiv" className="">
            <Row className="justify-content-center">
              <Col md="6" style={{ border: "1px solid #c5c5c5", borderBottom: "transparent" }}>
                <h1>
                  {/* //SANJEEVANI MODERN ENGLISH SCHOOL */}
                  {feesPaymentData.schoolName}
                </h1>
                <h6>
                  EKONDI(J.)Tq.Omerga Dist.Osmanabad
                </h6>
                <hr className="m-0"></hr>
                <hr className="mt-1"></hr>
              </Col>


            </Row>

            <Row className="justify-content-center">
              <Col md={6} style={{ border: "1px solid #c5c5c5", borderTop: "transparent" }}>
                <Row>
                  <Col md="6">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={2}>
                        Bill No.
                      </Form.Label>
                      <Col sm={2}>
                        <Form.Label column sm={1}>
                          {feesPaymentData.id}
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={1}>
                        Date:
                      </Form.Label>
                      <Col sm={2}>
                        <Form.Label column sm={1}>
                          {feesPaymentData.transactionDate}
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                    <Form.Label column sm={2}>
                      Student Name:
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Label column sm={1}>
                        {feesPaymentData.studentName}
                        <hr></hr>
                      </Form.Label>
                    </Col>
                  </Form.Group>
                </Row>
                <Row>
                  <Col md="4">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={2}>
                        Class:
                      </Form.Label>
                      <Col sm={10}>
                        <Form.Label column sm={1}>
                          {feesPaymentData.standard}
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={2}>
                        Div:
                      </Form.Label>
                      <Col sm={10}>
                        <Form.Label column sm={1}>
                          {feesPaymentData.division}
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={2}>
                        Mob:
                      </Form.Label>
                      <Col sm={10}>
                        <Form.Label column sm={1}>
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>

                <Table bordered   >
                  <thead>
                    <tr >
                      <th style={{ width: "5%" }}>Sr No.</th>
                      <th style={{ textAlign: "center" }}>Perticular</th>
                      <th style={{ textAlign: "center" }}>Amount</th>

                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: "transparent" }}>
                    {particularList != "" && particularList.map((v, i) => {
                      return (
                        <tr>
                          <td style={{ width: "5%" }}>{i + 1}</td>
                          <td style={{ width: "80%" }}>{v.particular}</td>
                          <td>{v.headFeeAmount}</td>

                        </tr>


                      );
                    })}

                    <tr style={{ borderBottom: "1px solid #c5c5c5" }}>
                      <td style={{ width: "5%" }}></td>
                      <td style={{ width: "80%", textAlign: "right" }}>Total</td>
                      <td style={{
                        border: "1px solid #c5c5c5", height: "40px"
                      }}>
                        {" "}
                        {numberWithCommasIN(
                          feesPaymentData && feesPaymentData.paidAmount,
                          true,
                          2
                        )}
                      </td>

                    </tr>
                  </tbody>
                </Table>
                <Row>
                  <Col>
                    In Words{feesPaymentData && feesPaymentData.inword}
                    <hr>
                    </hr>
                    <hr></hr>
                  </Col>
                </Row>
                <Row>
                  <Col md="5">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={6}>
                        Balance Rs:
                      </Form.Label>
                      <Col sm={6}>
                        <Form.Label column sm={1}>
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col md="5">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={6}>
                        Due Date:
                      </Form.Label>
                      <Col sm={6}>
                        <Form.Label column sm={1}>
                          <hr></hr>
                        </Form.Label>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col md="2" style={{ textAlign: "right" }}>
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                      <Form.Label column sm={2}>
                        Signature
                      </Form.Label>

                    </Form.Group>
                  </Col>
                </Row>

              </Col>
            </Row>
          </div>
        </Form >
      </>
    );
  }
}
