import React, { Component } from 'react'
import { Button, Col, Row, Form, Table, Figure, FormGroup, FormLabel, FormControl } from "react-bootstrap";
export default class Login extends Component {
    render() {
        return (
            <>
                <div>
                    <Row className="justify-content-center">
                        <Col md="4" style={{ border: "1px solid", padding: "0px" }}>
                            <Row>
                                <Col md={2} className="my-auto"><p style={{ backgroundColor: "#000", color: "white", textAlign: "center", borderRadius: "5px", transform: "rotate(-30deg)" }}>Register</p></Col>
                                <Col md={10}>
                                    <h1 style={{ color: "#000", textAlign: "center" }}>SANJEEVANI MODERN ENGLISH SCHOOL </h1>

                                </Col>
                            </Row>
                            <Row className='ps-2 pe-2 m-0'>
                                <Col md={12}>
                                    <p className="mb-0 text-start">EKONDI(J.)Tq Omerga Dist. Osmanabad contact:9421994306</p>
                                </Col>
                            </Row>
                            <hr className='mt-0'></hr>
                            <Row className='mb-3 ps-2 pe-2'>
                                <Col md="6">
                                    <Row>
                                        <Col md="3">
                                            <label><b>Bill No.</b></label>
                                        </Col>
                                        <Col md="9"><label>236</label></Col>
                                    </Row>

                                </Col>
                                <Col md="6">
                                    <Row>
                                        <Col md="3">
                                            <label><b>Date:</b></label>
                                        </Col>
                                        <Col md="9"><label>___ /___ / ___</label></Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className='mb-2 ps-2 pe-2'>
                                <Col md={3}>
                                    <label><b>Student Name:</b></label>
                                </Col>
                                <Col md={9}>___________________________________________________________________</Col>
                            </Row>
                            <Row className='mb-3 ps-2 pe-2'>
                                <Col md={4}>
                                    <Row>
                                        <Col md={2}><b>Class:</b></Col>

                                        <Col md={9}>___________</Col>
                                    </Row>

                                </Col>
                                <Col md={4}>
                                    <Row>
                                        <Col md={2}><b>Div:</b></Col>
                                        <Col md={10}>___________</Col>
                                    </Row>
                                </Col>
                                <Col md={4}>
                                    <Row>
                                        <Col md={2}><b>Mob:</b></Col>
                                        <Col md={10}>________________</Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Table bordered className='mt-5' style={{ border: "1px solid black" }}>
                                <thead>
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Perticulars</th>
                                        <th>Amount in Rs.</th>

                                    </tr>
                                </thead>
                                <tbody >
                                    <tr styles={{ borderBottom: "1px solid trasparent" }}>
                                        <td>1)</td>
                                        <td>Traveling From ................<br></br>To Sanjeevani Modern English School,Ekondi(J.)
                                            <br></br>Month __________ to __________ <br></br>Year 20-</td>
                                        <td></td>

                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='text-end'><b>Total</b></td>
                                        <td></td>

                                    </tr>

                                </tbody>
                            </Table>
                            <Row className='ps-2 pe-2'>
                                <Col md={12}>
                                    <p>In Words ______________________________________________________________________________
                                        <br></br>______________________________________________________________________________</p>
                                </Col>
                            </Row>
                            <Row className='ps-2 pe-2'>
                                <Col md={12}><p className='text-end'><b>Signature</b></p></Col>
                            </Row>
                        </Col>
                    </Row>


                </div>
            </>
        )
    }
}
