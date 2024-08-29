import React, { Component } from "react";
import { Button, Col, Row, Form, Table, Figure, FormGroup, FormLabel, FormControl } from "react-bootstrap";
export default class AddmissionForm extends React.Component {
    constructor() {
        super();
        this.state = {}
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
    render() {
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
                                            <h3 className="h3-style">SANJEEVANI MODERN</h3>
                                            <h3 className="h3-style">ENGLISH SCHOOL</h3>
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
                                                        Bill No.

                                                    </p>


                                                    <p
                                                        className="rec-style1"
                                                        style={{
                                                            width: "160px",
                                                            margin: "6px 2px 6px 0px",
                                                        }}
                                                    >
                                                        Date:
                                                        <span>/</span>
                                                        <span>/20</span>
                                                    </p>
                                                </Col>

                                                <Col md={12}>
                                                    <p className="rec-style">
                                                        Student Name :
                                                        ______________________
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
                                                            _____________________
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
                                                            ______________________
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
                                        <tr>
                                            <td className="text-start td-style">
                                                1)
                                            </td>
                                            <td className="text-start td-style">
                                                Addmission Form
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                2)
                                            </td>
                                            <td className="text-start td-style">
                                                Tution Fees |/||/||| term
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                3)
                                            </td>
                                            <td className="text-start td-style">
                                                Identity Card
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                4)
                                            </td>
                                            <td className="text-start td-style">
                                                Sports Fees
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                5)
                                            </td>
                                            <td className="text-start td-style">
                                                Cultural Activities
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                6)
                                            </td>
                                            <td className="text-start td-style">
                                                Miscellaneous Fees
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-start td-style">
                                                7)
                                            </td>
                                            <td className="text-start td-style">
                                                Other
                                            </td>
                                            <td className="text-start td-style">
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="text-end td-style">
                                            </td>
                                            <td className="text-end td-style">
                                                Total
                                            </td>
                                            <td className="text-end td-style border-top">
                                            </td>
                                        </tr>

                                        {/* <tr>
                                            <td colSpan={3} className="text-start td-style">
                                                <b>
                                                     
                                                    IN WORDS : 
                                                    <span className="word-style">
                                                    </span>
                                                </b>
                                            </td>
                                        </tr> */}

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
                                                        .......................................................................................................................................

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


