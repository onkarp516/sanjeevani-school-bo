import React from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Table,
  ButtonGroup,
  Modal,
  CloseButton,
  Collapse,
} from "react-bootstrap";
import { Formik } from "formik";

import * as Yup from "yup";

import moment from "moment";
import Select from "react-select";
import {
  getSalesAccounts,
  getSundryDebtors,
  getProduct,
  createPurchaseInvoice,
  getDiscountLedgers,
  getAdditionalLedgers,
  authenticationService,
  getPurchaseInvoiceById,
  create_sales_returns_invoices,
  getTranxSalesProductListBillNo,
  getTranxCreditNoteListInvoiceBillSC,
} from "@render/services/api_functions";

import {
  getSelectValue,
  ShowNotification,
  calculatePercentage,
  calculatePrValue,
  MyDatePicker,
  AuthenticationCheck,
  customStyles,
} from "@render/helpers";
import TRowComponent from "../../Components/TRowComponent";

const customStyles1 = {
  control: (base) => ({
    ...base,
    height: 26,
    minHeight: 26,
    border: "none",
    padding: "0 6px",
    boxShadow: "none",
    //lineHeight: "10",
    background: "transparent",
    // borderBottom: '1px solid #ccc',
    // '&:focus': {
    //   borderBottom: '1px solid #1e3989',
    // },
  }),
};

let adjOptions = [
  {
    label: "Adjustment",
    value: "adjustment",
  },
  {
    label: "Pending",
    value: "pending",
  },
];

export default class TranxCreditNoteProductList extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      show: false,
      opendiv: false,
      hidediv: true,
      invoice_data: "",
      salesAccLst: [],
      supplierNameLst: [],
      supplierCodeLst: [],
      invoiceedit: false,
      productLst: [],
      unitLst: [],
      rows: [],
      serialnopopupwindow: false,
      serialnoshowindex: -1,
      serialnoarray: [],
      lstDisLedger: [],
      additionalCharges: [],
      lstAdditionalLedger: [],
      additionalChargesTotal: 0,
      taxcal: { igst: [], cgst: [], sgst: [] },
      salesReturnData: "",
      salesReturnObject: "",
      isEditDataSet: false,
      rowDelDetailsIds: [],
      invoiceLstSC: [],
      selectedBills: [],
      initVal: {
        credit_note_sr: 1,
        transaction_dt: moment().format("YYYY-MM-DD"),
        salesId: "",
        invoice_no: "",
        invoice_dt: "",
        to_date: "",
        supplierCodeId: "",
        supplierNameId: "",
        sales_return_invoice: "",
        outstanding: "",
      },
      adjusmentbillmodal: false,
    };
  }

  handeladjusmentbillmodal = (status) => {
    this.setState({ adjusmentbillmodal: status });
  };

  lstAdditionalLedgers = () => {
    getAdditionalLedgers()
      .then((response) => {
        // console.log("response", response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.list;
          if (data.length > 0) {
            let Opt = data.map(function (values) {
              return { value: values.id, label: values.name };
            });
            let fOpt = Opt.filter(
              (v) => v.label.trim().toLowerCase() != "round off"
            );
            // console.log({ fOpt });
            this.setState({ lstAdditionalLedger: fOpt });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  lstDiscountLedgers = () => {
    getDiscountLedgers()
      .then((response) => {
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.list;
          if (data.length > 0) {
            let Opt = data.map(function (values) {
              return { value: values.id, label: values.name };
            });
            this.setState({ lstDisLedger: Opt });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  lstSalesAccounts = () => {
    getSalesAccounts()
      .then((response) => {
        // console.log("res", response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let opt = res.list.map((v, i) => {
            return { label: v.name, value: v.id };
          });
          this.setState({ salesAccLst: opt });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  lstSundrydebtors = () => {
    getSundryDebtors()
      .then((response) => {
        // console.log("res", response);

        let res = response.data;
        if (res.responseStatus == 200) {
          let opt = res.list.map((v, i) => {
            return {
              label: v.name,
              value: v.id,
              state: v.state,
              ledger_balance: v.ledger_balance,
              ledger_balance_type: v.ledger_balance_type,
            };
          });

          this.setState({
            supplierNameLst: opt,
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  lstProduct = () => {
    getProduct()
      .then((response) => {
        // console.log('res', response);
        let res = response.data;
        if (res.responseStatus == 200) {
          let data = res.responseObject;
          let opt = data.map((v) => {
            let unitOpt = v.units.map((vi) => {
              return { label: vi.unitCode, value: vi.id };
            });
            return {
              label: v.productName,
              value: v.id,
              igst: v.igst,
              hsnId: v.hsnId,
              sgst: v.sgst,
              cgst: v.cgst,
              productCode: v.productCode,
              productName: v.productName,
              isNegativeStocks: v.isNegativeStocks,
              isSerialNumber: v.isSerialNumber,
              unitOpt: unitOpt,
            };
          });
          this.setState({ productLst: opt });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  /**
   * @description Initialize Product Row
   */
  initRow = (len = null) => {
    let lst = [];
    let condition = 10;
    if (len != null) {
      condition = len;
    }
    for (let index = 0; index < condition; index++) {
      let data = {
        details_id: 0,
        productId: "",
        unitId: "",
        qtyH: "",
        qtyM: "",
        qtyL: "",
        rateH: "",
        rateM: "",
        rateL: "",
        base_amt_H: 0,
        base_amt_M: 0,
        base_amt_L: 0,
        base_amt: "",
        dis_amt: "",
        dis_per: "",
        dis_per_cal: "",
        dis_amt_cal: "",
        total_amt: "",
        gst: "",
        igst: "",
        cgst: "",
        sgst: "",
        total_igst: "",
        total_cgst: "",
        total_sgst: "",
        final_amt: "",
        serialNo: [],
        discount_proportional_cal: 0,
        additional_charges_proportional_cal: 0,
        reference_id: "",
        reference_type: "",
      };
      lst.push(data);
    }
    if (len != null) {
      let Initrows = [...this.state.rows, ...lst];
      this.setState({ rows: Initrows });
    } else {
      this.setState({ rows: lst });
    }
  };
  /**
   * @description Initialize Additional Charges
   */
  initAdditionalCharges = (len = null) => {
    // additionalCharges
    let lst = [];
    let condition = 5;
    if (len != null) {
      condition = len;
    }
    for (let index = 0; index < condition; index++) {
      let data = {
        additional_charges_details_id: 0,
        ledger_id: "",
        amt: "",
      };
      lst.push(data);
    }
    if (len != null) {
      let addLst = [...this.state.additionalCharges, ...lst];
      this.setState({ additionalCharges: addLst });
    } else {
      this.setState({ additionalCharges: lst });
    }
  };

  handleSubmitSCList = (value) => {
    console.log("value", value);

    let reqData = new FormData();
    reqData.append("sundry_debtors_id", value);
    // reqData.append('sundry_creditor_id', value.supplierCodeId.value);
    getTranxCreditNoteListInvoiceBillSC(reqData)
      .then((response) => {
        // console.log('before response', response);
        let res = response.data;
        if (res.responseStatus == 200) {
          // console.log('response', response);

          let lst = res.data;
          if (lst.length > 0) {
            this.setState({
              invoiceLstSC: lst,
              selected_values: value,
              show: true,
            });
          } else {
            ShowNotification("Error", "Data not found");
            this.setState({
              invoiceLstSC: lst,
            });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  setPurchaseInvoiceEditData = () => {
    console.log("salesReturnData", this.state.salesReturnData);
    const data = this.state.salesReturnData;

    let formData = new FormData();
    formData.append("sales_invoice_id", data.returnData.id);

    getTranxSalesProductListBillNo(formData)
      .then((response) => {
        let res = response.data;
        console.log("Edit response", res);
        if (res.responseStatus == 200) {
          let { invoice_data, row, addional_charges } = res;

          const {
            salesAccLst,
            supplierNameLst,
            productLst,
            lstAdditionalLedger,
            lstDisLedger,
          } = this.state;

          console.log({ invoice_data, supplierNameLst });

          let initInvoiceData = {
            id: invoice_data.id,
            sales_sr_no: invoice_data.sales_sr_no,
            invoice_dt: moment(invoice_data.po_date).format("YYYY-MM-DD"),
            sales_order_date: new Date(invoice_data.invoice_dt),
            supplier_id: getSelectValue(
              supplierNameLst,
              "" + invoice_data.debtors_id
            ),
            supplier_name: getSelectValue(
              supplierNameLst,
              "" + invoice_data.debtors_id
            ),
          };
          console.log("initInvoiceData", initInvoiceData);
          let initRowData = [];
          if (row.length > 0) {
            row.map((v) => {
              let productId = getSelectValue(productLst, v.product_id);
              let inner_data = {
                details_id: v.details_id,
                productId: productId,
                unitId: "",
                qtyH: v.qtyH > 0 ? v.qtyH : "",
                qtyM: v.qtyM > 0 ? v.qtyM : "",
                qtyL: v.qtyL > 0 ? v.qtyL : "",
                rateH: v.rateH > 0 ? v.rateH : "",
                rateM: v.rateM > 0 ? v.rateM : "",
                rateL: v.rateL > 0 ? v.rateL : "",
                base_amt_H: v.base_amt_H > 0 ? v.base_amt_H : "",
                base_amt_M: v.base_amt_M > 0 ? v.base_amt_M : "",
                base_amt_L: v.base_amt_L > 0 ? v.base_amt_L : "",
                base_amt: v.base_amt > 0 ? v.base_amt : "",
                dis_amt: v.dis_amt > 0 ? v.dis_amt : "",
                dis_per: v.dis_per > 0 ? v.dis_per : "",
                dis_per_cal: "",
                dis_amt_cal: "",
                total_amt: "",
                gst: productId.igst,
                igst: productId.igst,
                cgst: productId.cgst,
                sgst: productId.sgst,
                total_igst: "",
                total_cgst: "",
                total_sgst: "",
                final_amt: "",
                serialNo: [],
                discount_proportional_cal: 0,
                additional_charges_proportional_cal: 0,
              };
              initRowData.push(inner_data);
            });
          }

          console.log("initRowData", { initRowData });
          // let InitAdditionalCharges = [];
          // let totalAdditionalCharges = 0;
          // // console.log("addional_charges--->", addional_charges);
          // if (addional_charges.length > 0) {
          //   addional_charges.map((v) => {
          //     let data = {
          //       additional_charges_details_id: v.additional_charges_details_id,
          //       ledger_id:
          //         v.ledger_id > 0
          //           ? getSelectValue(lstAdditionalLedger, v.ledger_id)
          //           : '',
          //       amt: v.amt > 0 ? v.amt : '',
          //     };
          //     totalAdditionalCharges += parseFloat(v.amt);
          //     InitAdditionalCharges.push(data);
          //   });
          // }

          // if (res.discountLedgerId > 0) {
          //   let discountLedgerId = getSelectValue(
          //     lstDisLedger,
          //     res.discountLedgerId
          //   );
          //   this.myRef.current.setFieldValue(
          //     'purchase_disc_ledger',
          //     discountLedgerId
          //   );
          //   this.myRef.current.setFieldValue(
          //     'sales_discount',
          //     res.discountInPer
          //   );
          //   this.myRef.current.setFieldValue(
          //     'sales_discount_amt',
          //     res.discountInAmt
          //   );
          // }
          // this.myRef.current.setFieldValue('tcs', res.tcs);
          //this.myRef.current.setFieldValue('narration', res.narration);

          this.setState(
            {
              salesReturnObject: this.state.salesReturnData.returnIntiVal,
              invoice_data: initInvoiceData,
              initVal: data.returnIntiVal,
              rows: initRowData,
              isEditDataSet: true,
              // additionalCharges: InitAdditionalCharges,
              // additionalChargesTotal: totalAdditionalCharges,
            },
            () => {
              this.handleAdditionalChargesSubmit();
              this.handleSubmitSCList(initInvoiceData.supplier_id.value);
            }
          );
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  handleRowClick = (v) => {
    console.log({ v });
    let prop_data = {
      returnIntiVal: this.state.initVal,
      returnData: v,
    };

    this.setState({ invoiceedit: false, salesReturnData: prop_data }, () => {
      this.setPurchaseInvoiceEditData();
    });
  };

  componentDidMount() {
    if (AuthenticationCheck()) {
      this.lstSalesAccounts();
      this.lstSundrydebtors();
      this.lstProduct();
      this.lstDiscountLedgers();
      this.lstAdditionalLedgers();
      this.initRow();
      this.initAdditionalCharges();

      const { prop_data } = this.props.block;
      console.log("prop_data", { prop_data });
      this.setState({ salesReturnData: prop_data });
    }
  }
  componentDidUpdate() {
    const {
      salesAccLst,
      supplierNameLst,
      productLst,
      lstAdditionalLedger,
      isEditDataSet,
      salesReturnData,
      lstDisLedger,
    } = this.state;

    if (
      salesAccLst.length > 0 &&
      supplierNameLst.length > 0 &&
      productLst.length > 0 &&
      lstAdditionalLedger.length > 0 &&
      lstDisLedger.length > 0 &&
      isEditDataSet == false &&
      salesReturnData != ""
    ) {
      this.setPurchaseInvoiceEditData();
    }
  }
  handleClearProduct = (index) => {
    const { rows, rowDelDetailsIds } = this.state;
    let frows = [...rows];
    let data = {
      details_id: 0,
      productId: "",
      unitId: "",
      qtyH: "",
      qtyM: "",
      qtyL: "",
      rateH: "",
      rateM: "",
      rateL: "",
      base_amt_H: 0,
      base_amt_M: 0,
      base_amt_L: 0,
      base_amt: "",
      dis_amt: "",
      dis_per: "",
      dis_per_cal: "",
      dis_amt_cal: "",
      total_amt: "",
      gst: "",
      igst: "",
      cgst: "",
      sgst: "",
      total_igst: "",
      total_cgst: "",
      total_sgst: "",
      final_amt: "",
      serialNo: [],
      discount_proportional_cal: 0,
      additional_charges_proportional_cal: 0,
    };
    frows[index] = data;
    let rowsplice = rows.splice(index, 1);
    let details_id = rowsplice[0]["details_id"];
    if (details_id > 0) {
      if (!rowDelDetailsIds.includes(details_id)) {
        rowDelDetailsIds.push(details_id);
      }
    }

    this.setState({ rows: frows }, () => {
      this.handleAdditionalChargesSubmit();
    });
  };
  /**
   *
   * @param {*} product
   * @param {*} element
   * @description to return place holder according to product unit
   * @returns
   */
  handlePlaceHolder = (product, element) => {
    // console.log({ product, element });
    if (product != "") {
      if (element == "qtyH") {
        if (product.unitOpt.length > 0) {
          return product.unitOpt[0].label;
        }
      }
      if (element == "rateH") {
        if (product.unitOpt.length > 0) {
          return product.unitOpt[0].label;
        }
      }
      if (element == "qtyM") {
        if (product.unitOpt.length > 1) {
          return product.unitOpt[1].label;
        }
      }
      if (element == "rateM") {
        if (product.unitOpt.length > 1) {
          return product.unitOpt[1].label;
        }
      }
      if (element == "qtyL") {
        if (product.unitOpt.length > 2) {
          return product.unitOpt[2].label;
        }
      }
      if (element == "rateL") {
        if (product.unitOpt.length > 2) {
          return product.unitOpt[2].label;
        }
      }
    }
    return "";
  };

  /**
   *
   * @param {*} element
   * @param {*} value
   * @param {*} index
   * @param {*} setFieldValue
   * @description on change of each element in row function will recalculate amt
   */
  handleChangeArrayElement = (element, value, index, setFieldValue) => {
    // console.log({ element, value, unittype });
    let { rows } = this.state;

    // checkelement[element] = value;
    /**
     * @description Calculate product level calculation
     */
    let frows = rows.map((v, i) => {
      if (i == index) {
        v[element] = value;
        index = i;
        if (element == "productId" && value != null && value != undefined) {
          v["igst"] = value.igst;
          v["gst"] = value.igst;
          v["cgst"] = value.cgst;
          v["sgst"] = value.sgst;
          if (value.isSerialNumber == true) {
            let serialnoarray = [];
            for (let index = 0; index < 100; index++) {
              serialnoarray.push({ no: "" });
            }
            v["serialNo"] = serialnoarray;
            this.setState({
              serialnopopupwindow: true,
              serialnoshowindex: i,
              serialnoarray: serialnoarray,
            });
          }
        }

        return v;
      } else {
        return v;
      }
    });
    this.setState({ rows: frows }, () => {
      this.handleAdditionalChargesSubmit();
    });
  };

  setElementValue = (element, index) => {
    let elementCheck = this.state.rows.find((v, i) => {
      return i == index;
    });
    // console.log("elementCheck", elementCheck);
    // console.log("element", element);
    return elementCheck ? elementCheck[element] : "";
  };

  handleUnitLstOpt = (productId) => {
    // console.log("productId", productId);
    if (productId != undefined && productId) {
      return productId.unitOpt;
    }
  };
  handleUnitLstOptLength = (productId) => {
    // console.log("productId", productId);
    if (productId != undefined && productId) {
      return productId.unitOpt.length;
    }
  };
  handleSerialNoQty = (element, index) => {
    let { rows } = this.state;
    console.log("serial no", rows);
    console.log({ element, index });
    // this.setState({ serialnopopupwindow: true });
  };
  handleSerialNoValue = (index, value) => {
    let { serialnoarray } = this.state;
    let fn = serialnoarray.map((v, i) => {
      if (i == index) {
        v["no"] = value;
      }
      return v;
    });

    this.setState({ serialnoarray: fn });
  };
  valueSerialNo = (index) => {
    let { serialnoarray } = this.state;
    let fn = serialnoarray.find((v, i) => i == index);
    return fn ? fn.no : "";
  };
  renderSerialNo = () => {
    let { rows, serialnoshowindex, serialnoarray } = this.state;
    if (serialnoshowindex != -1) {
      let rdata = rows.find((v, i) => i == serialnoshowindex);

      return serialnoarray.map((vi, ii) => {
        return (
          <tr>
            <td>{ii + 1}</td>
            <td>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder=""
                  onChange={(e) => {
                    this.handleSerialNoValue(ii, e.target.value);
                  }}
                  value={this.valueSerialNo(ii)}
                />
              </Form.Group>
            </td>
          </tr>
        );
      });
    }
  };
  handleSerialNoSubmit = () => {
    let { rows, serialnoshowindex, serialnoarray } = this.state;

    if (serialnoshowindex != -1) {
      let rdata = rows.map((v, i) => {
        if (i == serialnoshowindex) {
          let no = serialnoarray.filter((vi, ii) => {
            if (vi.no != "") {
              return vi.no;
            }
          });
          v["serialNo"] = no;
          v["qtyH"] = no.length;
        }
        return v;
      });
      this.setState({
        rows: rdata,
        serialnoshowindex: -1,
        serialnoarray: [],
        serialnopopupwindow: false,
      });
    }
  };
  handleAdditionalCharges = (element, index, value) => {
    // console.log({ element, index, value });

    let { additionalCharges } = this.state;
    let fa = additionalCharges.map((v, i) => {
      if (i == index) {
        v[element] = value;
      }
      return v;
    });
    let totalamt = 0;
    fa.map((v) => {
      if (v.amt != "") {
        totalamt += parseFloat(v.amt);
      }
    });
    this.setState({ additionalCharges: fa, additionalChargesTotal: totalamt });
  };
  setAdditionalCharges = (element, index) => {
    let elementCheck = this.state.additionalCharges.find((v, i) => {
      return i == index;
    });

    return elementCheck ? elementCheck[element] : "";
  };
  /**
   * @description Calculate the formula discount + Additional charges
   */
  handleAdditionalChargesSubmit = (discamtval = -1, type = "") => {
    const { rows, additionalChargesTotal } = this.state;
    // console.log("rows init --====+++++++-->", rows);
    // console.log("additionalCharges -->", additionalChargesTotal);
    if (discamtval == "") {
      discamtval = 0;
    }
    if (type != "" && discamtval >= 0) {
      if (type == "sales_discount") {
        this.myRef.current.setFieldValue(
          "sales_discount",
          discamtval != "" ? discamtval : 0
        );
      } else {
        this.myRef.current.setFieldValue(
          "sales_discount_amt",
          discamtval != "" ? discamtval : 0
        );
      }
    }
    let totalamt = 0;
    /**
     * @description calculate indivisual row discount and total amt
     */
    let row_disc = rows.map((v) => {
      if (v["productId"] != "") {
        if (v["qtyH"] != "" && v["rateH"] != "") {
          v["base_amt_H"] = parseInt(v["qtyH"]) * parseFloat(v["rateH"]);
        }
        if (v["qtyM"] != "" && v["rateM"] != "") {
          v["base_amt_M"] = parseInt(v["qtyM"]) * parseFloat(v["rateM"]);
        }
        if (v["qtyL"] != "" && v["rateL"] != "") {
          v["base_amt_L"] = parseInt(v["qtyL"]) * parseFloat(v["rateL"]);
        }

        v["base_amt"] = v["base_amt_H"] + v["base_amt_M"] + v["base_amt_L"];

        v["total_amt"] = parseFloat(v["base_amt"]);

        if (v["dis_amt"] != "" && v["dis_amt"] > 0) {
          // console.log("v['dis_amt']", v["dis_amt"]);
          v["total_amt"] =
            parseFloat(v["total_amt"]) - parseFloat(v["dis_amt"]);
          v["dis_amt_cal"] = v["dis_amt"];
        }
        if (v["dis_per"] != "" && v["dis_per"] > 0) {
          // console.log("v['dis_per']", v["dis_per"]);
          let per_amt = calculatePercentage(v["total_amt"], v["dis_per"]);
          v["dis_per_cal"] = parseFloat(per_amt);
          v["total_amt"] = parseFloat(v["total_amt"]) - per_amt;
        }

        totalamt = parseFloat(totalamt) + parseFloat(v["total_amt"]);
      }
      // console.log("VVVVVVVVVVVVV", v);
      return v;
    });

    // console.log({ row_disc });
    // console.log("totalamt", totalamt);
    let ntotalamt = 0;
    /**
     *
     */
    let bdisc = row_disc.map((v, i) => {
      if (v["productId"] != "") {
        if (type != "" && discamtval >= 0) {
          if (type == "sales_discount") {
            // console.log("values", this.myRef.current.values);
            // this.myRef.current.setFieldValue("sales_discount", discamtval);

            let peramt = calculatePercentage(
              totalamt,
              parseFloat(discamtval),
              v["total_amt"]
            );
            v["discount_proportional_cal"] = calculatePrValue(
              totalamt,
              peramt,
              v["total_amt"]
            );

            v["total_amt"] =
              v["total_amt"] -
              calculatePrValue(totalamt, peramt, v["total_amt"]);
          } else {
            v["total_amt"] =
              v["total_amt"] -
              calculatePrValue(
                totalamt,
                parseFloat(discamtval),
                v["total_amt"]
              );
            v["discount_proportional_cal"] = calculatePrValue(
              totalamt,
              parseFloat(discamtval),
              v["total_amt"]
            );
          }
        } else {
          if (
            this.myRef.current.values.sales_discount > 0 &&
            this.myRef.current.values.sales_discount != ""
          ) {
            let peramt = calculatePercentage(
              totalamt,
              this.myRef.current.values.sales_discount,
              v["total_amt"]
            );
            v["discount_proportional_cal"] = calculatePrValue(
              totalamt,
              peramt,
              v["total_amt"]
            );

            v["total_amt"] =
              v["total_amt"] -
              calculatePrValue(totalamt, peramt, v["total_amt"]);
          }
          if (
            this.myRef.current.values.sales_discount_amt > 0 &&
            this.myRef.current.values.sales_discount_amt != ""
          ) {
            v["total_amt"] =
              v["total_amt"] -
              calculatePrValue(
                totalamt,
                this.myRef.current.values.sales_discount_amt,
                v["total_amt"]
              );
            v["discount_proportional_cal"] = calculatePrValue(
              totalamt,
              this.myRef.current.values.sales_discount_amt,
              v["total_amt"]
            );
          }
        }
        ntotalamt = parseFloat(ntotalamt) + parseFloat(v["total_amt"]);
      }
      return v;
    });
    // console.log({ bdisc });
    /**
     * Additional Charges
     */
    let addCharges = [];

    addCharges = bdisc.map((v, i) => {
      if (v["productId"] != "") {
        v["total_amt"] = parseFloat(
          v["total_amt"] +
            calculatePrValue(ntotalamt, additionalChargesTotal, v["total_amt"])
        ).toFixed(2);
        v["additional_charges_proportional_cal"] = calculatePrValue(
          ntotalamt,
          additionalChargesTotal,
          v["total_amt"]
        );
      }
      return v;
    });

    // console.log("addCharges", addCharges);
    let famt = 0;
    let totalbaseamt = 0;
    let totaltaxableamt = 0;
    let totaltaxamt = 0;
    let totalcgstamt = 0;
    let totalsgstamt = 0;
    let totaligstamt = 0;
    let total_discount_proportional_amt = 0;
    let total_additional_charges_proportional_amt = 0;
    let total_sales_discount_amt = 0;
    let totalqtyH = 0;
    let totalqtyM = 0;
    let totalqtyL = 0;

    let taxIgst = [];
    let taxCgst = [];
    let taxSgst = [];
    /**
     * GST Calculation
     * **/
    let frow = addCharges.map((v, i) => {
      if (v["productId"] != "") {
        v["total_igst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["igst"])
        ).toFixed(2);
        v["total_cgst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["cgst"])
        ).toFixed(2);
        v["total_sgst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["sgst"])
        ).toFixed(2);

        v["final_amt"] = parseFloat(
          parseFloat(v["total_amt"]) + parseFloat(v["total_igst"])
        ).toFixed(2);
        totalqtyH += parseInt(v["qtyH"] != "" ? v["qtyH"] : 0);
        totalqtyM += parseInt(v["qtyM"] != "" ? v["qtyM"] : 0);
        totalqtyL += parseInt(v["qtyL"] != "" ? v["qtyL"] : 0);
        totaligstamt += parseFloat(v["total_igst"]).toFixed(2);
        totalcgstamt += parseFloat(v["total_cgst"]).toFixed(2);
        totalsgstamt += parseFloat(v["total_sgst"]).toFixed(2);
        total_sales_discount_amt =
          parseFloat(total_sales_discount_amt) +
          parseFloat(v["discount_proportional_cal"]);
        total_discount_proportional_amt =
          parseFloat(total_discount_proportional_amt) +
          parseFloat(v["discount_proportional_cal"]);
        total_additional_charges_proportional_amt =
          parseFloat(total_additional_charges_proportional_amt) +
          parseFloat(v["additional_charges_proportional_cal"]);
        // additional_charges_proportional_cal
        famt = parseFloat(
          parseFloat(famt) + parseFloat(v["final_amt"])
        ).toFixed(2);

        // parseFloat(v["dis_per_cal"] != "" ? v["dis_per_cal"] : 0) -
        // parseFloat(v["dis_amt_cal"] != "" ? v["dis_amt_cal"] : 0)
        let baseamt = parseFloat(v["base_amt"]);
        if (v["dis_amt"] != "" && v["dis_amt"] > 0) {
          baseamt = baseamt - parseFloat(v["dis_amt_cal"]);
        }
        if (v["dis_per"] != "" && v["dis_per"] > 0) {
          baseamt = baseamt - parseFloat(v["dis_per_cal"]);
        }

        totalbaseamt = parseFloat(parseFloat(totalbaseamt) + baseamt).toFixed(
          2
        );

        totaltaxableamt = parseFloat(
          parseFloat(totaltaxableamt) + parseFloat(v["total_amt"])
        ).toFixed(2);
        totaltaxamt = parseFloat(
          parseFloat(totaltaxamt) + parseFloat(v["total_igst"])
        ).toFixed(2);

        // ! Tax Indidual gst % calculation
        if (v.productId != "") {
          if (v.productId.igst > 0) {
            if (taxIgst.length > 0) {
              let innerIgstTax = taxIgst.find(
                (vi) => vi.gst == v.productId.igst
              );
              if (innerIgstTax != undefined) {
                let innerIgstCal = taxIgst.filter((vi) => {
                  if (vi.gst == v.productId.igst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_igst"]);
                  }
                  return vi;
                });
                taxIgst = [...innerIgstCal];
              } else {
                let innerIgstCal = {
                  gst: v.productId.igst,
                  amt: parseFloat(v.total_igst),
                };
                taxIgst = [...taxIgst, innerIgstCal];
              }
            } else {
              let innerIgstCal = {
                gst: v.productId.igst,
                amt: parseFloat(v.total_igst),
              };
              taxIgst = [...taxIgst, innerIgstCal];
            }
          }
          if (v.productId.cgst > 0) {
            if (taxCgst.length > 0) {
              let innerCgstTax = taxCgst.find(
                (vi) => vi.gst == v.productId.cgst
              );
              // console.log("innerTax", innerTax);
              if (innerCgstTax != undefined) {
                let innerCgstCal = taxCgst.filter((vi) => {
                  if (vi.gst == v.productId.cgst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_cgst"]);
                  }
                  return vi;
                });
                taxCgst = [...innerCgstCal];
              } else {
                let innerCgstCal = {
                  gst: v.productId.cgst,
                  amt: parseFloat(v.total_cgst),
                };
                taxCgst = [...taxCgst, innerCgstCal];
              }
            } else {
              let innerCgstCal = {
                gst: v.productId.cgst,
                amt: parseFloat(v.total_cgst),
              };
              taxCgst = [...taxCgst, innerCgstCal];
            }
          }
          if (v.productId.sgst > 0) {
            if (taxSgst.length > 0) {
              let innerCgstTax = taxSgst.find(
                (vi) => vi.gst == v.productId.sgst
              );
              if (innerCgstTax != undefined) {
                let innerCgstCal = taxSgst.filter((vi) => {
                  if (vi.gst == v.productId.sgst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_sgst"]);
                  }
                  return vi;
                });
                taxSgst = [...innerCgstCal];
              } else {
                let innerCgstCal = {
                  gst: v.productId.sgst,
                  amt: parseFloat(v.total_sgst),
                };
                taxSgst = [...taxSgst, innerCgstCal];
              }
            } else {
              let innerCgstCal = {
                gst: v.productId.sgst,
                amt: parseFloat(v.total_sgst),
              };
              taxSgst = [...taxSgst, innerCgstCal];
            }
          }
        }
      }
      return v;
    });

    // console.log("frow---====++++>", frow);
    let roundoffamt = Math.round(famt);

    let roffamt = parseFloat(roundoffamt - famt).toFixed(2);
    this.myRef.current.setFieldValue(
      "total_sales_discount_amt",
      parseFloat(total_sales_discount_amt).toFixed(2)
    );

    this.myRef.current.setFieldValue(
      "total_discount_proportional_amt",
      parseFloat(total_discount_proportional_amt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "total_additional_charges_proportional_amt",
      parseFloat(total_additional_charges_proportional_amt).toFixed(2)
    );

    this.myRef.current.setFieldValue("roundoff", roffamt);
    this.myRef.current.setFieldValue(
      "total_base_amt",
      parseFloat(totalbaseamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "total_taxable_amt",
      parseFloat(totaltaxableamt).toFixed(2)
    );

    this.myRef.current.setFieldValue(
      "totalcgst",
      parseFloat(totalcgstamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totalsgst",
      parseFloat(totalsgstamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totaligst",
      parseFloat(totaligstamt).toFixed(2)
    );

    this.myRef.current.setFieldValue(
      "total_tax_amt",
      parseFloat(totaltaxamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totalamt",
      parseFloat(roundoffamt).toFixed(2)
    );
    this.myRef.current.setFieldValue("totalqtyH", totalqtyH);
    this.myRef.current.setFieldValue("totalqtyM", totalqtyM);
    this.myRef.current.setFieldValue("totalqtyL", totalqtyL);
    let taxState = { cgst: taxCgst, sgst: taxSgst, igst: taxIgst };
    this.setState(
      { rows: frow, additionchargesyes: false, taxcal: taxState },
      () => {
        if (this.state.rows.length != 10) {
          this.initRow(10 - this.state.rows.length);
        }
        if (this.state.additionalCharges.length != 5) {
          this.initAdditionalCharges(5 - this.state.additionalCharges.length);
        }
      }
    );
  };
  handleRoundOffchange = (v) => {
    // console.log("roundoff", v);
    const { rows, additionalChargesTotal } = this.state;
    let totalamt = 0;
    /**
     * @description calculate indivisual row discount and total amt
     */
    let row_disc = rows.map((v) => {
      // console.log("v", v.final_amt);
      if (v["productId"] != "") {
        if (v["qtyH"] != "" && v["rateH"] != "") {
          v["base_amt_H"] = parseInt(v["qtyH"]) * parseFloat(v["rateH"]);
        }
        if (v["qtyM"] != "" && v["rateM"] != "") {
          v["base_amt_M"] = parseInt(v["qtyM"]) * parseFloat(v["rateM"]);
        }
        if (v["qtyL"] != "" && v["rateL"] != "") {
          v["base_amt_L"] = parseInt(v["qtyL"]) * parseFloat(v["rateL"]);
        }

        v["base_amt"] = v["base_amt_H"] + v["base_amt_M"] + v["base_amt_L"];
        v["total_amt"] = v["base_amt"];
        if (v["dis_amt"] != "" && v["dis_amt"] > 0) {
          v["total_amt"] =
            parseFloat(v["total_amt"]) - parseFloat(v["dis_amt"]);
          v["dis_amt_cal"] = v["dis_amt"];
        }
        if (v["dis_per"] != "" && v["dis_per"] > 0) {
          let per_amt = calculatePercentage(v["total_amt"], v["dis_per"]);
          v["dis_per_cal"] = per_amt;
          v["total_amt"] = v["total_amt"] - per_amt;
        }
        totalamt += parseFloat(v["total_amt"]);
      }
      return v;
    });

    // console.log("totalamt", totalamt);
    let ntotalamt = 0;
    /**
     *
     */

    let bdisc = row_disc.map((v, i) => {
      if (v["productId"] != "") {
        if (
          this.myRef.current.values.sales_discount > 0 &&
          this.myRef.current.values.sales_discount != ""
        ) {
          let peramt = calculatePercentage(
            totalamt,
            this.myRef.current.values.sales_discount,
            v["total_amt"]
          );
          v["discount_proportional_cal"] = calculatePrValue(
            totalamt,
            peramt,
            v["total_amt"]
          );

          v["total_amt"] =
            v["total_amt"] - calculatePrValue(totalamt, peramt, v["total_amt"]);
        }
        if (
          this.myRef.current.values.sales_discount_amt > 0 &&
          this.myRef.current.values.sales_discount_amt != ""
        ) {
          v["total_amt"] =
            parseFloat(v["total_amt"]) -
            calculatePrValue(
              totalamt,
              this.myRef.current.values.sales_discount_amt,
              v["total_amt"]
            );
          v["discount_proportional_cal"] = parseFloat(
            calculatePrValue(
              totalamt,
              this.myRef.current.values.sales_discount_amt,
              v["total_amt"]
            )
          ).toFixed(2);
        }

        ntotalamt += parseFloat(v["total_amt"]);
      }
      return v;
    });

    // console.log("ntotalamt", ntotalamt);
    /**
     * Additional Charges
     */
    let addCharges = [];

    addCharges = bdisc.map((v, i) => {
      if (v["productId"] != "") {
        v["total_amt"] = parseFloat(
          v["total_amt"] +
            calculatePrValue(ntotalamt, additionalChargesTotal, v["total_amt"])
        ).toFixed(2);
        v["additional_charges_proportional_cal"] = parseFloat(
          calculatePrValue(ntotalamt, additionalChargesTotal, v["total_amt"])
        ).toFixed(2);
      }
      return v;
    });

    let famt = 0;
    let totalbaseamt = 0;

    let totaltaxableamt = 0;
    let totaltaxamt = 0;
    let totalcgstamt = 0;
    let totalsgstamt = 0;
    let totaligstamt = 0;
    let total_discount_proportional_amt = 0;
    let total_additional_charges_proportional_amt = 0;
    let total_sales_discount_amt = 0;

    let taxIgst = [];
    let taxCgst = [];
    let taxSgst = [];

    let totalqtyH = 0;
    let totalqtyM = 0;
    let totalqtyL = 0;
    /**
     * GST Calculation
     * **/
    let frow = addCharges.map((v, i) => {
      if (v["productId"] != "") {
        v["total_igst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["igst"])
        ).toFixed(2);
        v["total_cgst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["cgst"])
        ).toFixed(2);
        v["total_sgst"] = parseFloat(
          calculatePercentage(v["total_amt"], v["productId"]["sgst"])
        ).toFixed(2);

        v["final_amt"] = parseFloat(
          parseFloat(v["total_amt"]) + parseFloat(v["total_igst"])
        ).toFixed(2);
        totalqtyH += parseInt(v["qtyH"] != "" ? v["qtyH"] : 0);
        totalqtyM += parseInt(v["qtyM"] != "" ? v["qtyM"] : 0);
        totalqtyL += parseInt(v["qtyL"] != "" ? v["qtyL"] : 0);
        totaligstamt =
          parseFloat(totaligstamt) + parseFloat(v["total_igst"]).toFixed(2);
        totalcgstamt =
          parseFloat(totalcgstamt) + parseFloat(v["total_cgst"]).toFixed(2);
        totalsgstamt =
          parseFloat(totalsgstamt) + parseFloat(v["total_sgst"]).toFixed(2);
        // console.log("final_amt", v["final_amt"]);
        famt = parseFloat(
          parseFloat(famt) + parseFloat(v["final_amt"])
        ).toFixed(2);
        // totalbaseamt =
        //   parseFloat(totalbaseamt) + parseFloat(v["base_amt"]).toFixed(2);

        totalbaseamt = parseFloat(
          parseFloat(totalbaseamt) +
            (parseFloat(v["base_amt"]) -
              parseFloat(v["dis_per_cal"] != "" ? v["dis_per_cal"] : 0) -
              parseFloat(v["dis_amt_cal"] != "" ? v["dis_amt_cal"] : 0))
        ).toFixed(2);
        totaltaxableamt =
          parseFloat(totaltaxableamt) + parseFloat(v["total_amt"]).toFixed(2);
        totaltaxamt =
          parseFloat(totaltaxamt) + parseFloat(v["total_igst"]).toFixed(2);
        total_sales_discount_amt =
          parseFloat(total_sales_discount_amt) +
          parseFloat(v["discount_proportional_cal"]);
        total_discount_proportional_amt =
          parseFloat(total_discount_proportional_amt) +
          parseFloat(v["discount_proportional_cal"]);
        total_additional_charges_proportional_amt =
          parseFloat(total_additional_charges_proportional_amt) +
          parseFloat(v["additional_charges_proportional_cal"]);
        // ! Tax Indidual gst % calculation
        if (v.productId != "") {
          if (v.productId.igst > 0) {
            if (taxIgst.length > 0) {
              let innerIgstTax = taxIgst.find(
                (vi) => vi.gst == v.productId.igst
              );
              if (innerIgstTax != undefined) {
                let innerIgstCal = taxIgst.filter((vi) => {
                  if (vi.gst == v.productId.igst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_igst"]);
                  }
                  return vi;
                });
                taxIgst = [...innerIgstCal];
              } else {
                let innerIgstCal = {
                  gst: v.productId.igst,
                  amt: parseFloat(v.total_igst),
                };
                taxIgst = [...taxIgst, innerIgstCal];
              }
            } else {
              let innerIgstCal = {
                gst: v.productId.igst,
                amt: parseFloat(v.total_igst),
              };
              taxIgst = [...taxIgst, innerIgstCal];
            }
          }
          if (v.productId.cgst > 0) {
            if (taxCgst.length > 0) {
              let innerCgstTax = taxCgst.find(
                (vi) => vi.gst == v.productId.cgst
              );
              if (innerCgstTax != undefined) {
                let innerCgstCal = taxCgst.filter((vi) => {
                  if (vi.gst == v.productId.cgst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_cgst"]);
                  }
                  return vi;
                });
                taxCgst = [...innerCgstCal];
              } else {
                let innerCgstCal = {
                  gst: v.productId.cgst,
                  amt: parseFloat(v.total_cgst),
                };
                taxCgst = [...taxCgst, innerCgstCal];
              }
            } else {
              let innerCgstCal = {
                gst: v.productId.cgst,
                amt: parseFloat(v.total_cgst),
              };
              taxCgst = [...taxCgst, innerCgstCal];
            }
          }
          if (v.productId.sgst > 0) {
            if (taxSgst.length > 0) {
              let innerCgstTax = taxSgst.find(
                (vi) => vi.gst == v.productId.sgst
              );
              if (innerCgstTax != undefined) {
                let innerCgstCal = taxSgst.filter((vi) => {
                  if (vi.gst == v.productId.sgst) {
                    vi["amt"] =
                      parseFloat(vi["amt"]) + parseFloat(v["total_sgst"]);
                  }
                  return vi;
                });
                taxSgst = [...innerCgstCal];
              } else {
                let innerCgstCal = {
                  gst: v.productId.sgst,
                  amt: parseFloat(v.total_sgst),
                };
                taxSgst = [...taxSgst, innerCgstCal];
              }
            } else {
              let innerCgstCal = {
                gst: v.productId.sgst,
                amt: parseFloat(v.total_sgst),
              };
              taxSgst = [...taxSgst, innerCgstCal];
            }
          }
        }
      }
      return v;
    });
    let roundoffamt = Math.round(famt);
    this.myRef.current.setFieldValue("totalqtyH", totalqtyH);
    this.myRef.current.setFieldValue("totalqtyM", totalqtyM);
    this.myRef.current.setFieldValue("totalqtyL", totalqtyL);
    this.myRef.current.setFieldValue(
      "total_discount_proportional_amt",
      parseFloat(total_discount_proportional_amt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "total_additional_charges_proportional_amt",
      parseFloat(total_additional_charges_proportional_amt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "total_sales_discount_amt",
      parseFloat(total_sales_discount_amt).toFixed(2)
    );
    this.myRef.current.setFieldValue("roundoff", v);
    // let roffamt = parseFloat(roundoffamt - famt).toFixed(2);
    // this.myRef.current.setFieldValue("roundoff", roundoffamt);
    this.myRef.current.setFieldValue(
      "total_base_amt",
      parseFloat(totalbaseamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "total_taxable_amt",
      parseFloat(totaltaxableamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totaligst",
      parseFloat(totaligstamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totalcgst",
      parseFloat(totalcgstamt).toFixed(2)
    );
    this.myRef.current.setFieldValue(
      "totalsgst",
      parseFloat(totalsgstamt).toFixed(2)
    );

    this.myRef.current.setFieldValue(
      "total_tax_amt",
      parseFloat(totaltaxamt).toFixed(2)
    );

    let taxState = { cgst: taxCgst, sgst: taxSgst, igst: taxIgst };
    this.myRef.current.setFieldValue("totalamt", parseFloat(famt).toFixed(2));
    this.setState({ rows: frow, additionchargesyes: false, taxcal: taxState });
  };

  handleBillsSelection = (id, status) => {
    let { selectedBills } = this.state;
    if (status == true) {
      if (!selectedBills.includes(id)) {
        selectedBills = [...selectedBills, id];
      }
    } else {
      selectedBills = selectedBills.filter((v) => v != id);
    }
    this.setState({
      selectedBills: selectedBills,
    });
  };

  render() {
    const {
      invoice_data,
      opendiv,
      hidediv,
      invoiceedit,
      salesAccLst,
      supplierNameLst,
      supplierCodeLst,
      rows,
      productLst,
      serialnopopupwindow,
      additionchargesyes,
      lstDisLedger,
      additionalCharges,
      lstAdditionalLedger,
      additionalChargesTotal,
      taxcal,
      rowDelDetailsIds,
      initVal,
      invoiceLstSC,
      salesReturnData,
      salesReturnObject,
      adjusmentbillmodal,
      selectedBills,
    } = this.state;
    return (
      <div className="">
        <div className="dashboardpg institutepg">
          {/* <h6>Purchase Invoice</h6> */}
          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            innerRef={this.myRef}
            initialValues={{
              totalamt: 0,
              totalqty: 0,
              roundoff: 0,
              narration: "",
              tcs: 0,
              sales_discount: 0,
              sales_discount_amt: 0,
              total_sales_discount_amt: 0,
              total_base_amt: 0,
              total_tax_amt: 0,
              total_taxable_amt: 0,
              total_dis_amt: 0,
              total_dis_per: 0,
              totalcgstper: 0,
              totalsgstper: 0,
              totaligstper: 0,
              sales_disc_ledger: "",
              total_discount_proportional_amt: 0,
              total_additional_charges_proportional_amt: 0,
            }}
            enableReinitialize={true}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              let requestData = new FormData();

              console.log({ invoice_data, initVal });

              console.log("submit call");
              this.setState({ adjusmentbillmodal: true });
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
              <Form
                onSubmit={handleSubmit}
                noValidate
                className="new_trnx_design"
              >
                <div className="d-bg i-bg" style={{ height: "720px" }}>
                  <div className="institute-head pt-2 pl-2 pr-2 pb-0">
                    <Collapse in={opendiv}>
                      <div
                        id="example-collapse-text"
                        className="p-invoice-modal create_box"
                      >
                        <div className="institute-head m-0 mb-2 purchasescreen">
                          <Formik
                            validateOnChange={false}
                            validateOnBlur={false}
                            enableReinitialize={true}
                            initialValues={initVal}
                            validationSchema={Yup.object().shape({
                              salesId: Yup.object().required(
                                "select sales account"
                              ),
                              supplierNameId: Yup.object().required(
                                "select supplier name"
                              ),
                            })}
                            onSubmit={(
                              values,
                              { setSubmitting, resetForm }
                            ) => {
                              console.log("values", values);
                              this.handleSubmitSCList(
                                values.supplierNameId.value
                              );
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
                              <Form onSubmit={handleSubmit} noValidate>
                                {/* {JSON.stringify(errors)} */}
                                <Row>
                                  <Col md="5">
                                    <Form.Group className="createnew">
                                      <Form.Label>
                                        Client Name{" "}
                                        <span className="pt-1 pl-1 req_validation">
                                          *
                                        </span>
                                      </Form.Label>
                                      <Select
                                        className="selectTo"
                                        styles={customStyles}
                                        isClearable
                                        options={supplierNameLst}
                                        borderRadius="0px"
                                        colors="#729"
                                        name="supplierNameId"
                                        onChange={(v) => {
                                          if (v != null) {
                                            setFieldValue(
                                              "supplierCodeId",
                                              getSelectValue(
                                                supplierCodeLst,
                                                v.value
                                              )
                                            );
                                          }
                                          setFieldValue("supplierNameId", v);
                                        }}
                                        value={values.supplierNameId}
                                      />

                                      <span className="text-danger errormsg">
                                        {errors.supplierNameId}
                                      </span>
                                    </Form.Group>
                                  </Col>

                                  <Col md="4">
                                    <Form.Group className="createnew">
                                      <Form.Label>
                                        Sales A/c.{" "}
                                        <span className="pt-1 pl-1 req_validation">
                                          *
                                        </span>
                                      </Form.Label>
                                      <Select
                                        autoFocus
                                        className="selectTo"
                                        styles={customStyles}
                                        isClearable
                                        options={salesAccLst}
                                        borderRadius="0px"
                                        colors="#729"
                                        name="salesId"
                                        onChange={(v) => {
                                          setFieldValue("salesId", v);
                                        }}
                                        value={values.salesId}
                                      />

                                      <span className="text-danger errormsg">
                                        {errors.salesId}
                                      </span>
                                    </Form.Group>
                                  </Col>

                                  <Col md="3">
                                    <Form.Group>
                                      <Form.Label>
                                        Ledger Balance
                                        <span className="pt-1 pl-1 req_validation">
                                          *
                                        </span>
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        placeholder="Ledger Balance"
                                        name="outstanding"
                                        id="outstanding"
                                        onChange={handleChange}
                                        value={
                                          values.supplierNameId &&
                                          values.supplierNameId.ledger_balance +
                                            " " +
                                            values.supplierNameId
                                              .ledger_balance_type
                                        }
                                        readOnly
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {errors.outstanding}
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                  <Col md="12" className="btn_align mt-2">
                                    <Button className="createbtn" type="submit">
                                      Submit
                                    </Button>
                                    <Button
                                      className="ml-2  alterbtn"
                                      type="submit"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        // this.po_ref.current.resetForm();
                                        this.setState({
                                          opendiv: !opendiv,
                                          hidediv: !hidediv,
                                        });
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
                    {this.state.hidediv && (
                      <Row>
                        <Col md="11">
                          <div className="p-2 supplie-det">
                            <ul>
                              <li>
                                <h6>Purchase Return Sr. No. </h6>:{" "}
                                <span>
                                  {initVal ? initVal.credit_note_sr : ""}
                                </span>
                              </li>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <li>
                                <h6>Transaction Date </h6>:{" "}
                                <span>
                                  {initVal
                                    ? moment(initVal.transaction_dt).format(
                                        "DD-MM-YYYY"
                                      )
                                    : ""}
                                </span>
                              </li>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <li>
                                <h6>Supplier Name </h6>:{" "}
                                <span>
                                  {initVal
                                    ? initVal.supplierNameId &&
                                      initVal.supplierNameId.label
                                    : ""}
                                </span>
                              </li>
                              <li className="pull-right editpencil">
                                <a
                                  href="#."
                                  // onClick={(e) => {
                                  //   e.preventDefault();
                                  //   this.setState({ invoiceedit: true });
                                  // }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({
                                      opendiv: !opendiv,
                                      hidediv: !hidediv,
                                    });
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-pencil"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                  </svg>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>

                  <div className="institutetbl p-2">
                    <div className="table_wrapper3">
                      <Table
                        size="sm"
                        className="key mb-0 purchacetbl"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <th>#.</th>
                            <th>Particulars</th>
                            <th>Qnty</th>
                            {/* <th style={{ width: "5%" }}>Qty</th> */}
                            <th>Rate</th>
                            {/* <th>Base Amt</th> */}
                            <th>Disc Amt</th>
                            <th>Disc %</th>
                            <th>Total Amt</th>
                            <th>GST %</th>
                            <th>Tax Amt</th>
                            <th>Final Amt</th>
                          </tr>
                          <tr className="unithead">
                            <td></td>
                            <td></td>
                            <td>
                              <tr>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="H"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="M"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                                <td>
                                  {" "}
                                  <Form.Control
                                    type="text"
                                    placeholder="L"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                              </tr>
                            </td>
                            {/* <td></td> */}
                            <td>
                              <tr>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="H"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                                <td>
                                  {" "}
                                  <Form.Control
                                    type="text"
                                    placeholder="M"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                                <td>
                                  {" "}
                                  <Form.Control
                                    type="text"
                                    placeholder="L"
                                    readonly
                                    disabled
                                    style={{ background: "#fff" }}
                                  />
                                </td>
                              </tr>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((v, i) => {
                            return (
                              <TRowComponent
                                i={i}
                                setFieldValue={setFieldValue}
                                setElementValue={this.setElementValue.bind(
                                  this
                                )}
                                handleChangeArrayElement={this.handleChangeArrayElement.bind(
                                  this
                                )}
                                productLst={productLst}
                                handlePlaceHolder={this.handlePlaceHolder.bind(
                                  this
                                )}
                                handleUnitLstOptLength={this.handleUnitLstOptLength.bind(
                                  this
                                )}
                                isDisabled={false}
                                handleClearProduct={this.handleClearProduct.bind(
                                  this
                                )}
                              />
                            );
                          })}

                          <tr
                            className="totalr_fix1"
                            style={{ background: "#f5f5f5" }}
                          >
                            <td></td>

                            <td
                              style={{ background: "#eee", textAlign: "right" }}
                            >
                              Total Qnty
                            </td>
                            <tr>
                              <td style={{ background: "#eee" }}>
                                <Form.Control
                                  type="text"
                                  name="totalqtyH"
                                  onChange={handleChange}
                                  value={values.totalqtyH}
                                  readOnly
                                />
                              </td>
                              <td style={{ background: "#eee" }}>
                                <Form.Control
                                  type="text"
                                  name="totalqtyM"
                                  onChange={handleChange}
                                  value={values.totalqtyM}
                                  readOnly
                                />
                              </td>
                              <td style={{ background: "#eee" }}>
                                <Form.Control
                                  type="text"
                                  name="totalqtyL"
                                  onChange={handleChange}
                                  value={values.totalqtyL}
                                  readOnly
                                />
                              </td>
                            </tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            {/* <td></td>
                          <td></td> */}
                            <td
                              style={{ background: "#eee", textAlign: "right" }}
                              cellpadding="3"
                            >
                              Round Off
                            </td>
                            <td style={{ background: "#eee" }}>
                              <Form.Control
                                type="text"
                                name="roundoff"
                                onChange={(v) => {
                                  this.handleRoundOffchange(v.target.value);
                                }}
                                value={values.roundoff}
                                style={{
                                  textAlign: "right",
                                  //paddingRight: "23px",
                                }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    <Table size="sm" className="mb-0 key1 f-totaltbl">
                      <tbody>
                        <tr style={{ border: "1px solid #eee" }}>
                          <td></td>
                          <td style={{ width: "7%" }}>Disc Ledger : </td>
                          <td style={{ width: "10%" }}>
                            {" "}
                            <Select
                              className="selectTo"
                              components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null,
                                // Menu: () => null,
                              }}
                              onChange={(v) => {
                                setFieldValue("sales_disc_ledger", v);
                              }}
                              placeholder=""
                              styles={customStyles1}
                              isClearable
                              options={lstDisLedger}
                              borderRadius="0px"
                              colors="#729"
                              name="sales_disc_ledger"
                              value={values.sales_disc_ledger}
                            />
                          </td>

                          <td style={{ width: "5%" }}>
                            <span> Disc % : </span>
                          </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              <Form.Control
                                type="text"
                                name="sales_discount"
                                onChange={(e) => {
                                  // console.log("e", e.target.value);
                                  this.handleAdditionalChargesSubmit(
                                    e.target.value,
                                    "sales_discount"
                                  );
                                }}
                                value={values.sales_discount}
                                readOnly={
                                  values.sales_disc_ledger == "" ? true : false
                                }
                              />
                              {/* Cr */}
                            </span>
                          </td>
                          <td style={{ width: "5%" }}>
                            <span> Disc Amt : </span>
                          </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              <Form.Control
                                type="text"
                                name="sales_discount_amt"
                                onChange={(e) => {
                                  this.handleAdditionalChargesSubmit(
                                    e.target.value,
                                    "sales_discount_amt"
                                  );
                                }}
                                value={values.sales_discount_amt}
                                readOnly={
                                  values.sales_disc_ledger == "" ? true : false
                                }
                              />
                              {/* Cr */}
                            </span>
                          </td>
                          <td></td>

                          <td></td>

                          {/* <td style={{ width: "4%" }}>CGST : </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              {" "}
                              <Form.Control
                                type="text"
                                name="totalcgst"
                                onChange={handleChange}
                                value={values.totalcgst}
                                readOnly
                              />{" "}

                            </span>
                          </td> */}
                          <td></td>
                          {/* <td style={{ width: "4%" }}>SGST : </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              <Form.Control
                                type="text"
                                name="totalsgst"
                                onChange={handleChange}
                                value={values.totalsgst}
                                readOnly
                              />

                            </span>
                          </td> */}
                          <td></td>
                          <td style={{ width: "4%" }}>TCS : </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              <Form.Control
                                type="text"
                                name="tcs"
                                onChange={handleChange}
                                value={values.tcs}
                              />
                              {/* Dr */}
                            </span>
                          </td>
                          <td style={{ width: "8%", fontWeight: "bold" }}>
                            Add. Charges :
                          </td>
                          <td style={{ width: "5%" }}>
                            <span>
                              <Form.Control
                                type="text"
                                name="addch"
                                placeholder="0"
                                value={additionalChargesTotal}
                                readOnly
                              />
                              {/* Dr */}
                            </span>
                          </td>
                          <td className="addchag" style={{ width: "6%" }}>
                            <a
                              href="/"
                              onClick={(e) => {
                                e.preventDefault();
                                this.setState({ additionchargesyes: true });
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus-square-dotted mt-1"
                                viewBox="0 0 16 16"
                              >
                                <path d="M2.5 0c-.166 0-.33.016-.487.048l.194.98A1.51 1.51 0 0 1 2.5 1h.458V0H2.5zm2.292 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zm1.833 0h-.916v1h.916V0zm1.834 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zM13.5 0h-.458v1h.458c.1 0 .199.01.293.029l.194-.981A2.51 2.51 0 0 0 13.5 0zm2.079 1.11a2.511 2.511 0 0 0-.69-.689l-.556.831c.164.11.305.251.415.415l.83-.556zM1.11.421a2.511 2.511 0 0 0-.689.69l.831.556c.11-.164.251-.305.415-.415L1.11.422zM16 2.5c0-.166-.016-.33-.048-.487l-.98.194c.018.094.028.192.028.293v.458h1V2.5zM.048 2.013A2.51 2.51 0 0 0 0 2.5v.458h1V2.5c0-.1.01-.199.029-.293l-.981-.194zM0 3.875v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 5.708v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 7.542v.916h1v-.916H0zm15 .916h1v-.916h-1v.916zM0 9.375v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .916v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .917v.458c0 .166.016.33.048.487l.98-.194A1.51 1.51 0 0 1 1 13.5v-.458H0zm16 .458v-.458h-1v.458c0 .1-.01.199-.029.293l.981.194c.032-.158.048-.32.048-.487zM.421 14.89c.183.272.417.506.69.689l.556-.831a1.51 1.51 0 0 1-.415-.415l-.83.556zm14.469.689c.272-.183.506-.417.689-.69l-.831-.556c-.11.164-.251.305-.415.415l.556.83zm-12.877.373c.158.032.32.048.487.048h.458v-1H2.5c-.1 0-.199-.01-.293-.029l-.194.981zM13.5 16c.166 0 .33-.016.487-.048l-.194-.98A1.51 1.51 0 0 1 13.5 15h-.458v1h.458zm-9.625 0h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zm1.834-1v1h.916v-1h-.916zm1.833 1h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                              </svg>{" "}
                            </a>
                            {/* Or
                            <a href="/">&nbsp; No</a> */}
                          </td>
                          {/* <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>*/}
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td style={{ color: "#1e3889", fontWeight: "600" }}>
                            TOTAL
                          </td>
                          <td style={{ color: "#1e3889", fontWeight: "600" }}>
                            <Form.Control
                              type="text"
                              name="totalamt"
                              onChange={handleChange}
                              value={values.totalamt}
                              readOnly
                              style={{
                                textAlign: "right",
                                //paddingRight: "23px",
                              }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  <div className="summery p-2">
                    <Row>
                      <Col md="3">
                        <div className="summerytag narrationdiv">
                          <fieldset>
                            <legend>Narration</legend>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                              <Form.Control
                                as="textarea"
                                // rows={5}
                                // cols={25}
                                name="narration"
                                onChange={handleChange}
                                style={{ width: "auto" }}
                                className="purchace-text"
                                value={values.narration}
                                //placeholder="Narration"
                              />
                            </Form.Group>
                          </fieldset>
                        </div>
                      </Col>
                      <Col md="7">
                        <div className="summerytag">
                          <fieldset>
                            <legend>Summary</legend>
                            <Row>
                              {invoice_data &&
                                invoice_data.supplierCodeId &&
                                invoice_data.supplierCodeId.state !=
                                  authenticationService.currentUserValue
                                    .state && (
                                  <Col md="4">
                                    {invoice_data &&
                                    invoice_data.supplierCodeId &&
                                    invoice_data.supplierCodeId.state !=
                                      authenticationService.currentUserValue
                                        .state
                                      ? taxcal.igst.length > 0 && (
                                          <Table>
                                            <tr>
                                              <td
                                                style={{
                                                  background: "#f5f5f5",
                                                  textAlign: "center",
                                                  fontWeight: "bold",
                                                }}
                                                colspan="2"
                                              >
                                                IGST
                                              </td>
                                            </tr>
                                            {taxcal.igst.map((vi) => {
                                              return (
                                                <tr>
                                                  <td>{vi.gst}</td>
                                                  <td>
                                                    :{" "}
                                                    {vi.amt
                                                      ? parseFloat(
                                                          vi.amt
                                                        ).toFixed(2)
                                                      : parseFloat(0).toFixed(
                                                          2
                                                        )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </Table>
                                        )
                                      : ""}
                                  </Col>
                                )}

                              {AuthenticationCheck() &&
                                authenticationService.currentUserValue.state &&
                                invoice_data &&
                                invoice_data.supplierCodeId &&
                                invoice_data.supplierCodeId.state ==
                                  authenticationService.currentUserValue
                                    .state && (
                                  <Col md="4">
                                    {AuthenticationCheck() &&
                                    authenticationService.currentUserValue
                                      .state &&
                                    invoice_data &&
                                    invoice_data.supplierCodeId &&
                                    AuthenticationCheck() &&
                                    invoice_data.supplierCodeId.state ==
                                      authenticationService.currentUserValue
                                        .state
                                      ? taxcal.cgst.length > 0 && (
                                          <Table>
                                            <tr>
                                              <td
                                                style={{
                                                  background: "#f5f5f5",
                                                  textAlign: "center",
                                                  fontWeight: "bold",
                                                }}
                                                colspan="2"
                                              >
                                                CGST
                                              </td>
                                            </tr>
                                            {taxcal.cgst.map((vi) => {
                                              return (
                                                <tr>
                                                  <td>{vi.gst}</td>
                                                  <td>
                                                    :{" "}
                                                    {vi.amt
                                                      ? parseFloat(
                                                          vi.amt
                                                        ).toFixed(2)
                                                      : parseFloat(0).toFixed(
                                                          2
                                                        )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </Table>
                                        )
                                      : ""}
                                  </Col>
                                )}

                              {AuthenticationCheck() &&
                                authenticationService.currentUserValue.state &&
                                invoice_data &&
                                invoice_data.supplierCodeId &&
                                AuthenticationCheck() &&
                                invoice_data.supplierCodeId.state ==
                                  authenticationService.currentUserValue
                                    .state && (
                                  <Col md="4">
                                    {AuthenticationCheck() &&
                                      authenticationService.currentUserValue
                                        .state &&
                                      invoice_data &&
                                      invoice_data.supplierCodeId &&
                                      AuthenticationCheck() &&
                                      invoice_data.supplierCodeId.state ==
                                        authenticationService.currentUserValue
                                          .state &&
                                      taxcal.sgst.length > 0 && (
                                        <Table>
                                          <tr>
                                            <td
                                              style={{
                                                background: "#f5f5f5",
                                                textAlign: "center",
                                                fontWeight: "bold",
                                              }}
                                              colspan="2"
                                            >
                                              SGST
                                            </td>
                                          </tr>
                                          {taxcal.sgst.map((vi) => {
                                            return (
                                              <tr>
                                                <td>{vi.gst}</td>
                                                <td>
                                                  :{" "}
                                                  {vi.amt
                                                    ? parseFloat(
                                                        vi.amt
                                                      ).toFixed(2)
                                                    : parseFloat(0).toFixed(2)}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </Table>
                                      )}
                                  </Col>
                                )}
                              <Col md="4">
                                <ul className="summerytot pl-3">
                                  <li>
                                    <h4>Total Base Amt</h4>:{" "}
                                    {parseFloat(values.total_base_amt).toFixed(
                                      2
                                    )}
                                  </li>
                                  <li>
                                    <h4>Taxable Amt</h4>:
                                    <span>
                                      {" "}
                                      {parseFloat(
                                        values.total_taxable_amt
                                      ).toFixed(2)}
                                    </span>
                                  </li>
                                  <li>
                                    <h4>Tax Amt</h4>:{" "}
                                    {parseFloat(values.total_tax_amt).toFixed(
                                      2
                                    )}
                                  </li>
                                  <li>
                                    <h4>Final Amt</h4>:{" "}
                                    {parseFloat(values.totalamt).toFixed(2)}
                                  </li>
                                </ul>
                              </Col>
                            </Row>
                          </fieldset>
                        </div>
                        {/* <ul>
                          <li>
                            <div>
                              <h4>Summery</h4>
                            </div>
                          </li>
                        </ul>
                        <ul>
                          <li className="summerydiv">
                            <Form.Group>
                              <Form.Label>Total Base Amt : </Form.Label>
                            </Form.Group>
                          </li>

                          <li className="summerydiv">
                            <span>

                              {parseFloat(values.total_base_amt).toFixed(2)}
                            </span>
                          </li>
                        </ul>
                        &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                        <ul>
                          <li className="summerydiv">
                            <Form.Group>
                              <Form.Label>Total Dis : </Form.Label>
                            </Form.Group>
                          </li>

                          <li className="summerydiv">
                            <span>

                              {parseFloat(values.total_dis_amt).toFixed(2)}
                            </span>
                          </li>
                        </ul>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <ul>
                          <li className="summerydiv">
                            <Form.Group>
                              <Form.Label>Total Dis %: </Form.Label>
                            </Form.Group>
                          </li>

                          <li className="summerydiv">
                            <span>

                              {parseFloat(values.total_dis_per).toFixed(2)}
                            </span>
                          </li>
                        </ul>
                        &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                        <ul>
                          <li className="summerydiv" md="1">
                            <Form.Group>
                              <Form.Label>Taxable Amt : </Form.Label>
                            </Form.Group>
                          </li>

                          <li className="summerydiv">

                            <span>

                              {parseFloat(values.total_taxable_amt).toFixed(2)}
                            </span>
                          </li>
                        </ul>
                        &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                        <ul>
                          <li className="summerydiv" md="1">
                            <Form.Group>
                              <Form.Label>Tax Amt : </Form.Label>
                            </Form.Group>
                          </li>
                          <li className="summerydiv">
                            <span>

                              {parseFloat(values.total_tax_amt).toFixed(2)}
                            </span>
                          </li>
                        </ul>
                        &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                        <ul>
                          <li className="summerydiv" md="1">
                            <Form.Group>
                              <Form.Label>Final Amt : </Form.Label>
                            </Form.Group>
                          </li>
                          <li className="summerydiv">
                            <span>

                              {parseFloat(values.totalamt).toFixed(2)}
                            </span>
                          </li>
                        </ul> */}
                      </Col>

                      <Col md="2 mt-5 pt-5">
                        <ButtonGroup
                          className="pull-right submitbtn mt-5"
                          aria-label="Basic example"
                        >
                          <Button
                            className="mid-btn"
                            variant="secondary"
                            type="submit"
                          >
                            Submit
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              window.electron.ipcRenderer.webPageChange({
                                from: "tranx_debit_note_product_list",
                                to: "tranx_debit_note_list",
                                isNewTab: false,
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="9"></Col>
                    </Row>
                    {/* <Row>
                      <Col md="9"></Col>
                      <Col md="3">
                        <div className="confirm-yes mt-2 pt-2 pb-2 pl-2">
                          <h5>Confirm</h5>
                          <p className="mr-4 pr-4">Are you sure ? </p>
                          <Button
                            className="save-btn p-1"
                            variant="secondary"
                            type="Save"
                          >
                            Save
                          </Button>
                          <Button
                            className="save-btn p-1"
                            variant="secondary"
                            type="Save"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row> */}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* invoice list of supplier */}
        <Modal
          show={invoiceedit}
          size="lg"
          className="mt-5 mainmodal"
          onHide={() => this.setState({ invoiceedit: false })}
          // dialogClassName="modal-400w"
          // aria-labelledby="example-custom-modal-styling-title"
          aria-labelledby="contained-modal-title-vcenter"
          //centered
        >
          <Modal.Header
            closeButton
            closeVariant="white"
            className="pl-2 pr-2 pt-1 pb-1 purchaseinvoicepopup"
          >
            <Modal.Title id="example-custom-modal-styling-title" className="">
              Sales Return
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="purchaseumodal p-3 p-invoice-modal ">
            <div className="purchasescreen">
              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                enableReinitialize={true}
                initialValues={initVal}
                validationSchema={Yup.object().shape({
                  salesId: Yup.object().required("select sales account"),
                  supplierNameId: Yup.object().required("select supplier name"),
                })}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  console.log("values", values);
                  this.handleSubmitSCList(values.supplierNameId.value);
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
                  <Form onSubmit={handleSubmit} noValidate>
                    {/* {JSON.stringify(errors)} */}
                    <Row>
                      <Col md="5">
                        <Form.Group className="createnew">
                          <Form.Label>
                            Client Name{" "}
                            <span className="pt-1 pl-1 req_validation">*</span>
                          </Form.Label>
                          <Select
                            className="selectTo"
                            styles={customStyles}
                            isClearable
                            options={supplierNameLst}
                            borderRadius="0px"
                            colors="#729"
                            name="supplierNameId"
                            onChange={(v) => {
                              if (v != null) {
                                setFieldValue(
                                  "supplierCodeId",
                                  getSelectValue(supplierCodeLst, v.value)
                                );
                              }
                              setFieldValue("supplierNameId", v);
                            }}
                            value={values.supplierNameId}
                          />

                          <span className="text-danger errormsg">
                            {errors.supplierNameId}
                          </span>
                        </Form.Group>
                      </Col>

                      <Col md="4">
                        <Form.Group className="createnew">
                          <Form.Label>
                            Sales A/c.{" "}
                            <span className="pt-1 pl-1 req_validation">*</span>
                          </Form.Label>
                          <Select
                            autoFocus
                            className="selectTo"
                            styles={customStyles}
                            isClearable
                            options={salesAccLst}
                            borderRadius="0px"
                            colors="#729"
                            name="salesId"
                            onChange={(v) => {
                              setFieldValue("salesId", v);
                            }}
                            value={values.salesId}
                          />

                          <span className="text-danger errormsg">
                            {errors.salesId}
                          </span>
                        </Form.Group>
                      </Col>

                      <Col md="3">
                        <Form.Group>
                          <Form.Label>
                            Ledger Balance
                            <span className="pt-1 pl-1 req_validation">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ledger Balance"
                            name="outstanding"
                            id="outstanding"
                            onChange={handleChange}
                            value={
                              values.supplierNameId &&
                              values.supplierNameId.ledger_balance +
                                " " +
                                values.supplierNameId.ledger_balance_type
                            }
                            readOnly
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.outstanding}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md="12" className="btn_align mt-2">
                        <Button className="createbtn" type="submit">
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>

              {invoiceLstSC.length > 0 && (
                <div className="all_bills">
                  <div className="bills_dt">
                    <div className="institutetbl pb-2 pt-0 pl-2 pr-2">
                      <div className="table_wrapper1">
                        <Table className="serialnotbl mb-0">
                          <thead>
                            <tr>
                              <th style={{ textAlign: "left" }}> #.</th>
                              <th style={{ textAlign: "left" }}>Bill No</th>
                              <th style={{ textAlign: "left" }}>Bill Amt</th>
                              <th style={{ textAlign: "left" }}>Bill Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceLstSC.map((v, i) => {
                              return (
                                <tr
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log("v", v);
                                    this.handleRowClick(v);
                                  }}
                                >
                                  <td>{i + 1}</td>
                                  <td>{v.invoice_no}</td>
                                  <td>{v.total_amount}</td>
                                  <td>
                                    {moment(v.invoice_date).format(
                                      "DD/MM/YYYY"
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>

        {/* serial no start */}
        <Modal
          show={serialnopopupwindow}
          size="sm"
          className="mt-5 mainmodal"
          onHide={() => this.setState({ serialnopopupwindow: false })}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Header
            closeButton
            className="pl-1 pr-1 pt-0 pb-0 purchaseinvoicepopup"
          >
            <Modal.Title id="example-custom-modal-styling-title" className="">
              Serial No.
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="purchaseumodal p-2">
            <div className="purchasescreen">
              <Form className="serailnoscreoolbar">
                <Table className="serialnotbl">
                  <thead>
                    <tr>
                      <th>#.</th>
                      <th>Serial No.</th>
                    </tr>
                  </thead>
                  <tbody>{this.renderSerialNo()}</tbody>
                </Table>
              </Form>
            </div>
          </Modal.Body>

          <Modal.Footer className="p-1">
            <Button
              className="createbtn seriailnobtn"
              onClick={(e) => {
                e.preventDefault();
                this.handleSerialNoSubmit();
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>

        {/* additional charges */}
        <Modal
          show={additionchargesyes}
          // size="sm"
          className="mt-5 mainmodal"
          onHide={() => this.handleAdditionalChargesSubmit()}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Header
            closeButton
            closeVariant="white"
            className="pl-2 pr-2 pt-1 pb-1 purchaseinvoicepopup"
          >
            <Modal.Title id="example-custom-modal-styling-title" className="">
              Additional Charges
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="purchaseumodal p-2">
            <div className="purchasescreen">
              {additionalCharges.length > 0 && (
                <Table className="serialnotbl additionachargestbl table-bordered">
                  <thead>
                    <tr>
                      <th>#.</th>
                      <th>Ledger</th>
                      <th> Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalCharges.map((v, i) => {
                      return (
                        <tr>
                          <td>{i + 1}</td>
                          <td style={{ width: "75%" }}>
                            <Select
                              className="selectTo"
                              components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null,
                              }}
                              placeholder=""
                              styles={customStyles}
                              isClearable
                              options={lstAdditionalLedger}
                              borderRadius="0px"
                              colors="#729"
                              onChange={(value) => {
                                this.handleAdditionalCharges(
                                  "ledger_id",
                                  i,
                                  value
                                );
                              }}
                              value={this.setAdditionalCharges("ledger_id", i)}
                            />
                          </td>
                          <td className="additionamt pr-5 pl-1">
                            <Form.Control
                              type="text"
                              placeholder=""
                              onChange={(value) => {
                                this.handleAdditionalCharges(
                                  "amt",
                                  i,
                                  value.target.value
                                );
                              }}
                              value={this.setAdditionalCharges("amt", i)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={2} style={{ textAlign: "right" }}>
                        Total:{" "}
                      </td>
                      <td clasName="additionamt pr-5 pl-1">
                        <Form.Control
                          type="text"
                          placeholder=""
                          // onChange={(value) => {
                          //   console.log(value);
                          // }}
                          readOnly
                          value={additionalChargesTotal}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer className="p-0">
            <Button
              className="createbtn seriailnobtn"
              onClick={(e) => {
                e.preventDefault();

                this.handleAdditionalChargesSubmit();
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Adjustment and pending bill modal start*/}
        <Modal
          show={adjusmentbillmodal}
          //size="lg"
          className="mt-5 mainmodal"
          onHide={() => this.setState({ handeladjusmentbillmodal: false })}
          aria-labelledby="contained-modal-title-vcenter"
          //centered
        >
          <Modal.Header
            // closeButton
            className="pl-2 pr-2 pt-1 pb-1 purchaseinvoicepopup"
          >
            <Modal.Title id="example-custom-modal-styling-title" className="">
              New Reference
            </Modal.Title>
            <CloseButton
              variant="white"
              className="pull-right"
              onClick={() => this.handeladjusmentbillmodal(false)}
            />
          </Modal.Header>

          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            initialValues={{
              newReference: "",
            }}
            validationSchema={Yup.object().shape({
              newReference: Yup.string().required("Select Option"),
            })}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              console.log("values", values);
              console.log({ invoice_data, initVal });

              let requestData = new FormData();

              requestData.append("newReference", values.newReference);

              // !Invoice Data
              requestData.append("sales_return_sr_no", initVal.credit_note_sr);
              requestData.append("return_invoice_id", invoice_data.id);
              requestData.append("sales_acc_id", initVal.salesId.value);

              requestData.append(
                "sales_return_no",
                initVal.sales_return_invoice
              );

              requestData.append("transaction_dt", initVal.transaction_dt);
              requestData.append("debtors_id", initVal.supplierCodeId.value);
              // !Invoice Data

              let returnValues = this.myRef.current.values;
              console.log("returnValues ", returnValues);
              requestData.append("roundoff", returnValues.roundoff);
              if (returnValues.narration && returnValues.narration != "") {
                requestData.append("narration", returnValues.narration);
              }

              requestData.append("total_base_amt", returnValues.total_base_amt);
              requestData.append("totalamt", returnValues.totalamt);
              requestData.append(
                "taxable_amount",
                returnValues.total_taxable_amt
              );
              requestData.append("totalcgst", returnValues.totalcgst);
              requestData.append("totalsgst", returnValues.totalsgst);
              requestData.append("totaligst", returnValues.totaligst);
              requestData.append("totalqty", returnValues.totalqty);
              requestData.append("tcs", returnValues.tcs);
              requestData.append("sales_discount", returnValues.sales_discount);
              requestData.append(
                "sales_discount_amt",
                returnValues.sales_discount_amt
              );
              requestData.append(
                "total_sales_discount_amt",
                returnValues.sales_discount_amt > 0
                  ? returnValues.sales_discount_amt
                  : returnValues.total_sales_discount_amt
              );
              requestData.append(
                "sales_disc_ledger",
                returnValues.sales_disc_ledger
                  ? returnValues.sales_disc_ledger.value
                  : 0
              );

              let frow = this.state.rows.map((v, i) => {
                if (v.productId != "") {
                  return {
                    details_id: v.details_id,
                    product_id: v.productId.value,
                    unit_id: v.unitId.value,
                    qtyH: v.qtyH != "" ? v.qtyH : 0,
                    rateH: v.rateH != "" ? v.rateH : 0,
                    qtyM: v.qtyM != "" ? v.qtyM : 0,
                    rateM: v.rateM != "" ? v.rateM : 0,
                    qtyL: v.qtyL != "" ? v.qtyL : 0,
                    rateL: v.rateL != "" ? v.rateL : 0,
                    base_amt_H: v.base_amt_H != "" ? v.base_amt_H : 0,
                    base_amt_L: v.base_amt_L != "" ? v.base_amt_L : 0,
                    base_amt_M: v.base_amt_M != "" ? v.base_amt_M : 0,
                    base_amt: v.base_amt != "" ? v.base_amt : 0,
                    dis_amt: v.dis_amt != "" ? v.dis_amt : 0,
                    dis_per: v.dis_per != "" ? v.dis_per : 0,
                    dis_per_cal: v.dis_per_cal != "" ? v.dis_per_cal : 0,
                    dis_amt_cal: v.dis_amt_cal != "" ? v.dis_amt_cal : 0,
                    total_amt: v.total_amt != "" ? v.total_amt : 0,
                    igst: v.igst != "" ? v.igst : 0,
                    cgst: v.cgst != "" ? v.cgst : 0,
                    sgst: v.sgst != "" ? v.sgst : 0,
                    total_igst: v.total_igst != "" ? v.total_igst : 0,
                    total_cgst: v.total_cgst != "" ? v.total_cgst : 0,
                    total_sgst: v.total_sgst != "" ? v.total_sgst : 0,
                    final_amt: v.final_amt != "" ? v.final_amt : 0,
                    serialNo: v.serialNo,
                    discount_proportional_cal: v.discount_proportional_cal,
                    additional_charges_proportional_cal:
                      v.additional_charges_proportional_cal,
                    reference_id: v.reference_id != "NA" ? v.reference_id : "",
                    reference_type:
                      v.reference_type != "NA" ? v.reference_type : "",
                  };
                }
              });

              var filtered = frow.filter(function (el) {
                return el != null;
              });

              let additionalChargesfilter = additionalCharges.filter((v) => {
                if (
                  v.ledgerId != "" &&
                  v.ledgerId != undefined &&
                  v.ledgerId != null
                ) {
                  v["ledger"] = v["ledgerId"]["value"];
                  return v;
                }
              });
              requestData.append(
                "additionalChargesTotal",
                additionalChargesTotal
              );
              requestData.append("row", JSON.stringify(filtered));
              requestData.append(
                "additionalCharges",
                JSON.stringify(additionalChargesfilter)
              );

              if (
                authenticationService.currentUserValue.state &&
                invoice_data &&
                invoice_data.supplierCodeId &&
                invoice_data.supplierCodeId.state !=
                  authenticationService.currentUserValue.state
              ) {
                let taxCal = {
                  igst: this.state.taxcal.igst,
                };

                requestData.append("taxFlag", false);
                requestData.append("taxCalculation", JSON.stringify(taxCal));
              } else {
                let taxCal = {
                  cgst: this.state.taxcal.cgst,
                  sgst: this.state.taxcal.sgst,
                };
                // console.log("taxCal", taxCal);
                requestData.append("taxCalculation", JSON.stringify(taxCal));
                requestData.append("taxFlag", true);
              }

              let filterRowDetail = [];
              if (rowDelDetailsIds.length > 0) {
                filterRowDetail = rowDelDetailsIds.map((v) => {
                  return { del_id: v };
                });
              }
              requestData.append(
                "rowDelDetailsIds",
                JSON.stringify(filterRowDetail)
              );
              // console.log('requestData', requestData.values());
              // // List key/value pairs
              // for (let [name, value] of requestData) {
              //   console.log(`Formdata ${name} = ${value}`); // key1 = value1, then key2 = value2
              // }

              console.log("submit call");
              create_sales_returns_invoices(requestData)
                .then((response) => {
                  let res = response.data;
                  if (res.responseStatus == 200) {
                    ShowNotification("Success", res.message);
                    resetForm();
                    this.initRow();
                    window.electron.ipcRenderer.webPageChange({
                      from: "tranx_credit_note_product_list",
                      to: "tranx_credit_note",
                      isNewTab: false,
                    });
                  } else {
                    ShowNotification("Error", res.message);
                  }
                })
                .catch((error) => {
                  console.log("error", error);
                });
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
              <Form onSubmit={handleSubmit}>
                {/* {JSON.stringify(values)}
                {JSON.stringify(errors)} */}
                <Modal.Body className="purchaseumodal p-4 p-invoice-modal ">
                  <div className="purchasescreen pb-2 pt-0 pl-2 pr-2">
                    <Row>
                      <Col md="12">
                        <Form.Group>
                          <Form.Label>
                            New Reference <span className="redstar">*</span>
                          </Form.Label>
                        </Form.Group>
                      </Col>
                      <Col md="2">
                        <Form.Group className="gender nightshiftlabel">
                          <Form.Label>
                            <input
                              name="newReference"
                              type="radio"
                              value="YES"
                              checked={
                                values.newReference === "YES" ? true : false
                              }
                              onChange={handleChange}
                              className="mr-3"
                            />
                            <span className="ml-3">&nbsp;&nbsp;YES</span>
                          </Form.Label>
                        </Form.Group>
                      </Col>
                      <Col md="3">
                        <Form.Group className="nightshiftlabel">
                          <Form.Label className="ml-3">
                            <input
                              name="newReference"
                              type="radio"
                              value="NO"
                              onChange={handleChange}
                              checked={
                                values.newReference === "NO" ? true : false
                              }
                              className="mr-3"
                            />
                            <span className="ml-3">&nbsp;&nbsp;NO</span>
                          </Form.Label>

                          <span className="text-danger">
                            {errors.newReference && "Select Option"}
                          </span>
                        </Form.Group>
                      </Col>
                      <Col md="7" className="btn_align">
                        <Button
                          className="createbtn"
                          type="submit"
                          style={{ marginTop: "-9px" }}
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Modal.Body>
              </Form>
            )}
          </Formik>
        </Modal>
      </div>
    );
  }
}
