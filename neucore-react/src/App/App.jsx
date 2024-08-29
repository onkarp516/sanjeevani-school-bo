import React, { Component } from "react";
import "@/assets/scss/App.scss";
import DynamicComponents from "@/App/DynamicComponents/DynamicComponents";
import { Provider } from "react-redux";
import Store from "@/redux/Store";
export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={Store}>
          <DynamicComponents />
        </Provider>
      </div>
    );
  }
}
