import React, { PureComponent } from "react";
// import * as XLSX from "xlsx";
// import PrintResultTable from "./components/Table";
import { doPrint, socket, serviceUrl } from "../../services/cainiao";
import { sampleLP } from "../../services/temp/sampleLP";
import "./index.css";

class Main extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lp: "",
      result: []
    };
    this.printFail = null;
    this.printSuccess = null;
    this.printer = "SINDOH D410 Series PCL";
    this.loadingChecker = this.loadingChecker.bind(this);
  }

  componentDidMount() {
    this.printSuccess = document.getElementById("successResult");
    this.printFail = document.getElementById("failResult");
    this.socketMessage();
    this.focus2Input();
  }

  socketMessage() {
    socket.onopen = function(event) {
      console.log("Socket is open");
    };

    socket.onmessage = function(event) {
      console.log("Client received a message", event);

      const response = JSON.parse(event.data);

      if (response.cmd === "getPrinterConfig" && response.status === "success") {
        console.log('=== Printer"', response.printer.name, '" is ready ===');
      } else if (response.cmd === "getPrinterConfig" && response.status === "failed") {
        console.log("=== Printer is not ready ===");
      }

      if (response.cmd === "print" && response.status === "success") {
        console.log("=== Invoice Print success ===");
      } else if (response.cmd === "print" && response.status === "failed") {
        console.log("=== Invoice Print failed: ", response.msg, "===");
      }
    };

    socket.onerror = function(error) {
      console.log("Failed to connect CN print at " + serviceUrl, error);
    };

    socket.onclose = function(event) {
      console.log("Client notified socket has closed", event);
    };
  }

  focus2Input() {
    document.getElementById("lp_number").focus();
  }

  enterKeyPressCheck(event) {
    if (event.charCode === 13) {
      this.sendLp2TOP(event);
      event.preventDefault();
    }
  }

  resetLpInput() {
    if (!this.printFail.classList.contains("hide")) {
      this.printFail.classList.add("hide");
    }
    if (!this.printSuccess.classList.contains("hide")) {
      this.printSuccess.classList.add("hide");
    }

    this.setState({
      lp: ""
    });

    this.focus2Input();
  }

  loadingChecker(loading) {
    this.props.loadingChecker(loading);
  }

  printInvoice(baseUrl, lp) {
    const apiUrl = `${baseUrl}/${lp}`;
    this.loadingChecker(true);

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
        const requestID = lp;
        const taskID = lp;
        const documentID = lp;
        const preview = false;
        const printer = this.printer;
        console.log("Success fetch print data ", lp);
        doPrint(this.setPrintData({ requestID, taskID, preview, documentID, printData, printer }));
        this.loadingChecker(false);
        return true;
      })
      .catch(reason => {
        console.log("Sorry, Could not fetch the label data\n", reason);
        this.loadingChecker(false);
      });
  }

  setPrintData({ requestID, taskID, preview, documentID, printData, printer }) {
    return {
      cmd: "print",
      requestID: requestID,
      version: "1.0",
      task: {
        taskID: taskID,
        preview: preview,
        printer: printer,
        previewType: "pdf",
        documents: [
          {
            documentID: documentID,
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

  getDateString() {
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

  sendLp2TOP(event) {
    event.preventDefault();
    const baseUrl = `http://localhost:4000/top`;
    const lp = this.state.lp;
    if (!this.printFail.classList.contains("hide")) {
      this.printFail.classList.add("hide");
    }
    if (!this.printSuccess.classList.contains("hide")) {
      this.printSuccess.classList.add("hide");
    }
    this.printInvoice(baseUrl, lp).then(res => {
      if (res) {
        if (!this.printFail.classList.contains("hide")) {
          this.printFail.classList.add("hide");
        }
        if (this.printSuccess.classList.contains("hide")) {
          this.printSuccess.classList.remove("hide");
        }
      } else {
        if (!this.printSuccess.classList.contains("hide")) {
          this.printSuccess.classList.add("hide");
        }
        if (this.printFail.classList.contains("hide")) {
          this.printFail.classList.remove("hide");
        }
      }
    });

    this.resetLpInput();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testLP2TOP(event) {
    const baseUrl = `http://localhost:4000/top`;
    await this.sleep(1000);
    sampleLP.forEach(lp => {
      this.printInvoice(baseUrl, lp);
    });
  }

  setLpNo(event) {
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
            <h2>{!this.state.lp ? "Scan LP No." : <strong>{this.state.lp}</strong>}</h2>
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
                    onChange={e => this.setLpNo(e)}
                    onKeyPress={e => this.enterKeyPressCheck(e)}
                  />
                </div>
                <div className="col-sm-2">
                  <button onClick={e => this.sendLp2TOP(e)} type="button" id="submit-lp" className="btn btn-primary">
                    Submit
                  </button>
                  <button onClick={() => this.resetLpInput()} type="button" id="submit-lp" className="btn btn-light">
                    Cancel
                  </button>
                  {/* <button onClick={e => this.testLP2TOP(e)} type="button" className="btn btn-info">
                Test
              </button> */}
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
              <button type="button" className="close" data-dismiss="alert">
                &times;
              </button>
              <strong>Well done!</strong> successfully printed.
            </div>
            {/* <PrintResultTable printResultList={this.state.result} /> */}
            <div id="failResult" className="alert alert-dismissible alert-danger hide">
              <button type="button" className="close" data-dismiss="alert">
                &times;
              </button>
              <strong>Oh snap!</strong> print failed.
            </div>
          </div>
          <div className="col-sm-1 mr-auto" />
        </div>
      </div>
    );
  }
}

export default Main;
