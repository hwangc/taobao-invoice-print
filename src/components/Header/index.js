import React, { PureComponent } from "react";
import logo from "./images/tip_logo_kr.png";
import spinner from "./images/lp_fetch_spinner.gif";
import "./index.css";

class Header extends PureComponent {
  render() {
    return (
      <header className="Tip-header">
        <div className="Tip-brand">
          <a href="/">
            <img src={!this.props.loading ? logo : spinner} className="Tip-logo" alt="logo" />
            <div className="Tip-logo-text">
              <h1 className="Tip-title">TIP</h1>
              <span className="Tip-title-tag">Taobao Invoice Print</span>
            </div>
          </a>
        </div>
      </header>
    );
  }
}

export default Header;
