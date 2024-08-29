import React, { Component } from "react";
import { Button, Col, Row, Form, Table, Figure, FormGroup, FormLabel, FormControl } from "react-bootstrap";
import {

    numberWithCommasIN,
} from "@/helpers";
import { getTrasactionDetailsById } from "@/services/api_functions";
export default class AddmissionForm extends React.Component {
    constructor() {
        super();
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
            "width: 100%;" +
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
            ".width1{" +
            "width: 20px;" +
            "}" +

            ".h3-style{" +
            "font-size: 16px;" +
            "margin: 0px;" +
            "}" +

            ".text-center {" +
            "text-align: center;" +
            "}" +
            ".text-end {" +
            "text-align: end !important;" +
            "border-bottom: 1px solid !important;" +
            "}" +
            ".border-top {" +
            "border-top: 1px solid !important;" +
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
            // "font-family: Calibri;" +
            "}" +
            ".td-style {" +
            "text-align:start;" +
            "border-right:1px solid #000;" +
            "border-left:1px solid #000;" +
            // "border-bottom:1px solid #000;" +
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

    componentDidMount() {
        const { prop_data } = this.props.block;
        console.log("propData--->", prop_data);
        this.setState({ receiptData: prop_data });
        this.getFeesData();

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
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        this.callPrint();
                    }}
                >
                    Print
                </Button>
                <Button variant="primary">Cancel</Button>

                <iframe id="printf" name="printf" className="d-none"></iframe>
                <div id="printDiv" className="">
                    <Row className="mx-0">
                        <Col
                            lg="12"
                            className="data_body border-style"
                            style={{ marginLeft: "10px", marginBottom: "40px" }}
                        >
                            <div className="text-center">
                                <Row>
                                    <Col>
                                        <div
                                            style={{
                                                border: "1px solid",
                                                marginBottom: "2px",
                                                // margin: "10px",
                                                width: "92%",
                                            }}
                                        >
                                            <h3 className="h3-style"> {feesPaymentData.schoolName}</h3>
                                            {/* <h3 className="h3-style">ENGLISH SCHOOL</h3> */}
                                            <p className="p-style">EKONDI (J.) Tq. Omerga Dist. Osmanabad</p>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div
                                            style={{
                                                border: "1px solid",
                                                marginBottom: "2px",
                                                // margin: "10px",
                                                width: "92%",
                                            }}
                                        >
                                            <Row>
                                                <Col md={6} className="row-style d-flex">
                                                    <p
                                                        className="rec-style"
                                                        style={{
                                                            width: "300px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Bill No.{feesPaymentData.id}


                                                    </p>


                                                    <p
                                                        className="rec-style1"
                                                        style={{
                                                            width: "160px",
                                                            margin: "6px 2px 6px 0px",
                                                        }}
                                                    >
                                                        Date:{feesPaymentData.transactionDate}
                                                        {/* <span>/</span>
                                                        <span>/20</span> */}
                                                    </p>
                                                </Col>

                                                <Col md={12}>
                                                    <p className="rec-style">
                                                        Student Name :
                                                        {feesPaymentData.studentName}
                                                    </p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6} className="row-style d-flex">
                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "200px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Class:
                                                        <span>
                                                            {feesPaymentData.standard}
                                                        </span>
                                                    </p>

                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "200px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Div.:
                                                        <span>
                                                            {feesPaymentData.division}
                                                        </span>
                                                    </p>

                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "200px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Mob.:<span>
                                                            ____________________
                                                        </span>
                                                    </p>

                                                </Col>

                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                                <Table
                                    className="receipt-tbl"
                                >
                                    <tbody className="tbody-style">
                                        <tr>
                                            <th className="text-start td-style th-style width1">
                                                <b>Sr <br />No.</b>
                                            </th>
                                            <th className="amt-th-style td-style th-style width2">
                                                <b>PARTICULARS</b>
                                            </th>
                                            <th className="amt-th-style td-style th-style width3">
                                                <b>Amount</b>
                                                <br />
                                                <span className="row-style">

                                                    <b>Rs.</b>
                                                    <b>Ps.</b>
                                                </span>
                                            </th>
                                        </tr>
                                        {particularList != "" && particularList.map((v, i) => {
                                            return (<tr>
                                                <td className="text-start td-style">
                                                    {i + 1}
                                                </td>
                                                <td className="text-start td-style">
                                                    {v.particular}
                                                </td>
                                                <td className="text-start td-style">
                                                    {v.headFeeAmount}
                                                </td>
                                            </tr>)
                                        })}


                                        <tr>
                                            <td className="text-end td-style">
                                            </td>
                                            <td className="text-end td-style">
                                                Total
                                            </td>
                                            <td className="text-end td-style border-top">
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
                                        <div
                                            style={{
                                                border: "1px solid",
                                                marginBottom: "2px",
                                                // margin: "10px",
                                                width: "92%",
                                            }}
                                        >
                                            <Row>

                                                <Col md={12}>
                                                    <p className="rec-style">
                                                        In Words :
                                                        {feesPaymentData && feesPaymentData.inword}

                                                    </p>
                                                    <p className="rec-style" style={{ marginTop: '15px' }}>
                                                        ...........................................................................................................................................
                                                    </p>
                                                </Col>
                                                <Col md={6} className="row-style d-flex">
                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "300px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Balance Rs:
                                                        <span>
                                                            .................................
                                                        </span>
                                                    </p>

                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "300px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Due Date:
                                                        <span>
                                                            .................................
                                                        </span>
                                                    </p>

                                                    <p
                                                        className="rec-style d-flex"
                                                        style={{
                                                            width: "200px",
                                                            margin: "6px 0px 6px 5px",
                                                        }}
                                                    >
                                                        Signature
                                                    </p>

                                                </Col>
                                            </Row>

                                        </div>
                                    </Col>
                                </Row>


                            </div>
                        </Col>

                    </Row>

                </div>

            </>
        )
    }
}


