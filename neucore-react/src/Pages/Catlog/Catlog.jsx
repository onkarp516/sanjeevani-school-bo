import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import Group from "./Group.jsx";
import Brand from "./Brand.jsx";
import Category from "./Category.jsx";
import Subcategory from "./Subcategory.jsx";
import { setUserPermissions } from "@/redux/userPermissions/Action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
class Catlog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefresh: false,
    };
  }

  handleRefresh = (status) => {
    this.setState({ isRefresh: status });
  };
  render() {
    const { isRefresh } = this.state;
    return (
      <div>
        <Tabs
          defaultActiveKey="home"
          id="uncontrolled-tab-example"
          className="sub-tab-style "
          // style={{ background: "#fff" }}
        >
          <Tab eventKey="home" title="Brand">
            <Brand
              isRefresh={isRefresh}
              handleRefresh={this.handleRefresh.bind(this)}
            />
          </Tab>
          <Tab eventKey="profile" title="Group">
            <Group
              isRefresh={isRefresh}
              handleRefresh={this.handleRefresh.bind(this)}
            />
          </Tab>
          <Tab eventKey="category" title="Category">
            <Category
              isRefresh={isRefresh}
              handleRefresh={this.handleRefresh.bind(this)}
            />
          </Tab>
          <Tab eventKey="subcategory" title="Sub Category">
            <Subcategory
              isRefresh={isRefresh}
              handleRefresh={this.handleRefresh.bind(this)}
            />
          </Tab>
        </Tabs>
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

export default connect(mapStateToProps, mapActionsToProps)(Catlog);
