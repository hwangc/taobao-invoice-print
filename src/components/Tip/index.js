import React, { Component } from "react";
import Header from "../Header";
import Side from "../Side";
import Main from "../../containers/Main";
import Log from "../Log";
import Footer from "../Footer";
import "./index.css";
import moment from "moment";

class Tip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lp: "",
      date: moment().format("YYYY-MM-DD"),
      turn: "1"
    };
    this.checkIsLoading = this.checkIsLoading.bind(this);
    this.setLP = this.setLP.bind(this);
    this.setDateTurn = this.setDateTurn.bind(this);
  }

  checkIsLoading(loading) {
    this.setState({
      loading
    });
  }

  setDateTurn(date, turn) {
    this.setState({
      date,
      turn
    });
  }

  setLP(lp) {
    this.setState({
      lp
    });
  }

  render() {
    return (
      <div className="Tip">
        <Header loading={this.state.loading} />
        <Side />
        <Main
          date={this.state.date}
          turn={this.state.turn}
          lp={this.state.lp}
          setLP={this.setLP}
          setDateTurn={this.setDateTurn}
          loadingChecker={loading => this.checkIsLoading(loading)}
        />
        {/* <Log /> */}
        <Footer />
      </div>
    );
  }
}

export default Tip;
