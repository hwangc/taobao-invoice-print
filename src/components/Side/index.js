import React, { PureComponent } from "react";
import flow from "./images/tip_flow.png";
import "./index.css";

class Side extends PureComponent {
  constructor(props) {
    super(props);
    this.tipFlowModal = null;
    this.tipFlowDialog = null;
    this.tipFlowBackDrop = null;
    this.tipVersion = "v1.3.4";
  }

  componentDidMount() {
    this.setFullHeightEl();
    this.setFullHeightElResizeEvent();
    this.setModalEl();
  }

  setModalEl() {
    this.tipFlowBackDrop = document.getElementsByClassName("tipflow-backdrop")[0];
    this.tipFlowModal = document.getElementById("tipFlowModal");
    this.tipFlowDialog = document.getElementsByClassName("modal-dialog")[0];
  }

  setFullHeightEl() {
    let heightScreen = window.innerHeight;
    const headerHeight = document.getElementsByClassName("Tip-header")[0].offsetHeight;
    let sideHeight = heightScreen - headerHeight;
    // console.group("Side");
    // console.log("header height: ", headerHeight);
    // console.log("side height: ", sideHeight);
    // console.groupEnd();
    document.getElementsByClassName("Tip-side")[0].setAttribute("style", "height:" + sideHeight + "px");
  }

  setFullHeightElResizeEvent() {
    const resizeFn = this.setFullHeightEl.bind(this);
    window.addEventListener("resize", function() {
      resizeFn();
    });
  }

  showFlow(event) {
    event.preventDefault();
    this.tipFlowBackDrop.className += " modal-backdrop show";
    this.tipFlowModal.className += " show";
    this.tipFlowBackDrop.style.opacity = "0.6";
    this.tipFlowDialog.style.marginTop = "180px";
    this.tipFlowModal.style.opacity = "1";
  }

  closeFlow(event) {
    event.preventDefault();
    this.tipFlowBackDrop.classList.remove("modal-backdrop");
    this.tipFlowBackDrop.classList.remove("show");
    this.tipFlowModal.classList.remove("show");
    this.tipFlowBackDrop.style.opacity = "0";
    this.tipFlowDialog.style.marginTop = "0px";
    this.tipFlowModal.style.opacity = "0";
  }

  render() {
    return (
      <div className="Tip-side left">
        <div className="Tip-intro">
          <span className="Tip-about">
            <i className="fa fa-info fa-lg" aria-hidden="true" /> About
          </span>
          TIP(<strong>T</strong>aobao <strong>I</strong>nvoice <strong>P</strong>rint) will fetch user order data from Taobao and trigger the printer connected by CAINIAO Printing
          Tool
          <span className="Tip-about">
            <i className="fa fa-tasks fa-lg" aria-hidden="true" /> Flow
          </span>
          <div
            className="Tip-flow-chart"
            onClick={e => {
              this.showFlow(e);
            }}
          >
            <img src={flow} alt="tip flow" style={{ width: "100%" }} />
          </div>
          <span className="Tip-about">
            <i className="fa fa-wrench fa-lg" aria-hidden="true" /> Required
          </span>
          <ul>
            <li>Barcode Scanner</li>
            <li>
              <a href="http://cdn-cloudprint.cainiao.com/waybill-print/client/CNPrintSetup.exe">CAINIAO Printing Tool</a>
            </li>
            <li>Printer</li>
          </ul>
          <span className="Tip-about">
            <i className="fa fa-code fa-lg" aria-hidden="true" /> Development
          </span>
          <ul>
            <li>NodeJS</li>
            <li>ReactJS</li>
            <li>TOP SDK</li>
          </ul>
          <span className="Tip-about">
            <i className="fa fa-envelope fa-lg" aria-hidden="true" /> Contact
          </span>
          <a href="mailto:hoyean.hwang@ppbstudios.com">hoyean.hwang@ppbstudios.com</a>
          <span className="Tip-about">
            <i className="fa fa-code-fork fa-lg" aria-hidden="true" /> Version
          </span>
          {this.tipVersion}
        </div>
        {/* Modal */}
        <div
          className="modal fade"
          id="tipFlowModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          onClick={e => {
            this.closeFlow(e);
          }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Tip Flow
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={e => {
                    this.closeFlow(e);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <img src={flow} alt="tip flow" style={{ width: "100%", height: "auto" }} />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary tipFlowCloseBtn"
                  data-dismiss="modal"
                  onClick={e => {
                    this.closeFlow(e);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Modal back drop */}
        <div className="tipflow-backdrop fade" />
      </div>
    );
  }
}

export default Side;
