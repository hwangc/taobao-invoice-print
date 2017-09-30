import React, { Component } from "react";
import Header from "../Header";
import Side from "../Side";
import Main from "../Main";
import Footer from "../Footer";
import "./index.css";

class Tip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.checkIsLoading = this.checkIsLoading.bind(this);
  }

  checkIsLoading(loading) {
    this.setState({
      loading
    });
  }

  render() {
    return (
      <div className="Tip">
        <Header loading={this.state.loading} />
        <Side />
        <Main loadingChecker={loading => this.checkIsLoading(loading)} />
        <Footer />
      </div>
    );
  }
}

export default Tip;
