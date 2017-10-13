import React, { PureComponent } from "react";
import { doPrint, socket, serviceUrl } from "../../services/cainiao";
import "./index.css";
import successSound from "./sound/success.wav";
import failSound from "./sound/fail.wav";

class Main extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lp: ""
    };
    this._printFail = null;
    this._printSuccess = null;
    this._baseURL = `http://ppbapps.asuscomm.com:9093/top`;
    this._printer = "ZDesigner GK420d (EPL)";
    this._preview = false;
    this.loadingChecker = this.isLoading.bind(this);
    this.hidePopUpWithSound = this.hidePopUpWithSound.bind(this);
    this.showPopUpWithSound = this.showPopUpWithSound.bind(this);
  }

  componentDidMount() {
    this.setPrintResultPopUpEl();
    this.setSocketMessage();
    this.setCursorFocus2Input();
  }

  setPrintResultPopUpEl() {
    this._printSuccess = document.getElementById("successResult");
    this._printFail = document.getElementById("failResult");
  }

  setSocketMessage() {
    const showPopUp = this.showPopUpWithSound;

    socket.onopen = function(event) {
      console.log("Socket is open");
    };

    socket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      console.log("Client received a message", event);

      if (response.cmd === "print" && response.status === "success") {
        showPopUp("success");
        console.log("=== Invoice Print success ===");
      } else if (response.cmd === "print" && response.status === "failed") {
        showPopUp("fail");
        alert("Print Failed: " + response.msg);
        console.log("=== Invoice Print failed: ", response.msg, "===");
      }

      if (response.cmd === "getPrinterConfig" && response.status === "success") {
        console.log('=== Printer"', response.printer.name, '" is ready ===');
      } else if (response.cmd === "getPrinterConfig" && response.status === "failed") {
        console.log("=== Printer is not ready ===");
      }
    };

    socket.onerror = function(error) {
      alert("Failed to connect CN print at " + serviceUrl, error);
    };

    socket.onclose = function(event) {
      console.log("Client notified socket has closed", event);
    };
  }

  setCursorFocus2Input() {
    document.getElementById("lp_number").focus();
  }

  submitActionByEnterKey(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      this.submitAction(event);
    }
  }

  resetAction() {
    this.hidePopUpWithSound("all");
    this.setCursorFocus2Input();
  }

  cancelAction() {
    this.setState({
      lp: ""
    });
    this.resetAction();
  }

  isLoading(loading) {
    this.props.loadingChecker(loading);
  }

  printInvoice(baseUrl, lp) {
    const apiUrl = `${baseUrl}/${lp}`;
    this.hidePopUpWithSound("all");
    this.isLoading(true);

    return fetch(apiUrl, { method: "GET" })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error(response);
        }
      })
      .then(result => {
        const printData = JSON.parse(result.waybillurl);
        // Start Print * if isPreview is true, it won't immediately start printing the invoice but wait for the manual start
        doPrint(this.setPrintData({ lp, printData }));
        /* End Print */
        this.isLoading(false);
        return true;
      })
      .catch(reason => {
        this.showPopUpWithSound("fail");
        this.isLoading(false);
        alert("Print Failed: Could not find the LP number!");
      });
  }

  setPrintData({ lp, printData }) {
    return {
      cmd: "print",
      requestID: lp,
      version: "1.0",
      task: {
        taskID: lp,
        preview: this._preview,
        printer: this._printer,
        previewType: "pdf",
        documents: [
          {
            documentID: lp,
            contents: [
              {
                encryptedData: printData.encryptedData,
                signature: printData.signature,
                templateURL: printData.templateURL
              }
            ]
          }
        ]
      }
    };
  }

  showPopUpWithSound(whichPopUp) {
    if (whichPopUp === "fail") {
      if (this._printFail.classList.contains("hide")) {
        this._printFail.classList.remove("hide");
      }
      this._printFail.getElementsByClassName("alert-heading")[0].innerHTML = this.state.lp;
      this._printFail.getElementsByClassName("alert-sound")[0].play();
    }

    if (whichPopUp === "success") {
      if (this._printSuccess.classList.contains("hide")) {
        this._printSuccess.classList.remove("hide");
      }
      this._printSuccess.getElementsByClassName("alert-heading")[0].innerHTML = this.state.lp;
      this._printSuccess.getElementsByClassName("alert-sound")[0].play();
    }
  }

  hidePopUpWithSound(whichPopUp) {
    if (whichPopUp === "fail" || whichPopUp === "all") {
      if (!this._printFail.classList.contains("hide")) {
        this._printFail.classList.add("hide");
      }
      this._printFail.getElementsByClassName("alert-sound")[0].pause();
      this._printFail.getElementsByClassName("alert-sound")[0].currentTime = 0;
    }

    if (whichPopUp === "success" || whichPopUp === "all") {
      if (!this._printSuccess.classList.contains("hide")) {
        this._printSuccess.classList.add("hide");
      }
      this._printSuccess.getElementsByClassName("alert-sound")[0].pause();
      this._printSuccess.getElementsByClassName("alert-sound")[0].currentTime = 0;
    }
  }

  submitAction(event) {
    event.preventDefault();
    const baseUrl = this._baseURL;
    const lp = this.state.lp;

    this.printInvoice(baseUrl, lp);
    this.resetAction();
  }

  setLP(event) {
    this.setState({
      lp: event.target.value
    });
  }

  render() {
    return (
      <div className="Tip-main container-fluid">
        <div className="row">
          <div className="col-sm-1 mr-auto" />
          <div className="col-sm-10">
            <h2 className="scanTitle">{!this.state.lp ? "Scan LP No." : <strong>{this.state.lp}</strong>}</h2>
            <form name="lp_form" id="lp_form" className="mx-auto">
              <div className="form-group row has-success">
                <div className="col-sm-10">
                  <input
                    name="lp_number"
                    type="text"
                    style={{ marginRight: "10px" }}
                    value={this.state.lp}
                    className="form-control"
                    id="lp_number"
                    onChange={e => this.setLP(e)}
                    onKeyPress={e => this.submitActionByEnterKey(e)}
                  />
                </div>
                <div className="col-sm-2">
                  <button onClick={e => this.submitAction(e)} type="button" id="submit-lp" className="btn btn-primary">
                    Submit
                  </button>
                  <button onClick={() => this.cancelAction()} type="button" id="submit-lp" className="btn btn-light">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-sm-1 mr-auto" />
        </div>
        <div className="row">
          <div className="col-sm-1 mr-auto" />
          <div className="col-sm-10">
            <div id="successResult" className="alert alert-dismissible alert-success hide">
              <h4 className="alert-heading">lpNo</h4>
              <hr />
              <strong>Well done!</strong> Successfully printed.
              <audio className="alert-sound">
                <source src={successSound} />
              </audio>
            </div>
            <div id="failResult" className="alert alert-dismissible alert-danger hide">
              <h4 className="alert-heading">lpNo</h4>
              <hr />
              <strong>Oh snap!</strong> Print failed. Please check the LP number.
              <audio className="alert-sound">
                <source src={failSound} />
              </audio>
            </div>
          </div>
          <div className="col-sm-1 mr-auto" />
        </div>
      </div>
    );
  }

  _NOTUSED_sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _NOTUSED_getDateTimeString() {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      "-" +
      now.getMonth().toString() +
      "-" +
      now.getDate().toString() +
      " " +
      now.getHours().toString() +
      ":" +
      now.getMinutes().toString() +
      ":" +
      now.getSeconds().toString()
    );
  }
}

export default Main;
