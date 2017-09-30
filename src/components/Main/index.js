import React, { PureComponent } from "react";
// import * as XLSX from "xlsx";
import Table from "./components/Table";
import { doConnect, doPrint, socket } from "../../services/cainiao";
import { sampleLP } from "../../services/temp/sampleLP";
import "./index.css";

class Main extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lp: ""
    };
    this.loadingChecker = this.loadingChecker.bind(this);
  }

  componentDidMount() {
    this.focus2Input();
  }

  focus2Input() {
    document.getElementById("lp_number").focus();
  }

  keyPressCheck(event) {
    if (event.charCode === 13) {
      this.sendLP2TOP(event);
      event.preventDefault();
    }
  }

  resetInput() {
    this.setState({
      lp: ""
    });

    this.focus2Input();
  }

  loadingChecker(loading) {
    this.props.loadingChecker(loading);
    console.log("loading checker ", loading);
  }

  fetchPrintData(baseUrl, lp) {
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
        const requestID = "1",
          taskID = "2",
          documentID = "3",
          preview = false;
        console.log("Success fetch print data ", lp);
        if (socket.readyState !== WebSocket.OPEN) {
          doConnect();
        }
        doPrint(this.setPrintData({ requestID, taskID, preview, documentID, printData }));
        // const lpRow = document.createElement("span");
        // const lpResult = document.createTextNode(lp);
        // lpRow.appendChild(lpResult);
        // document.getElementById("lp_result").appendChild(lpRow);
        // this.sleep(500);
        this.loadingChecker(false);
        return true;
      })
      .catch(reason => {
        console.log("Sorry, Could not fetch the label data\n", reason);
        this.loadingChecker(false);
      });
  }

  setPrintData({ requestID, taskID, preview, documentID, printData }) {
    return {
      cmd: "print",
      requestID: requestID,
      version: "1.0",
      task: {
        taskID: taskID,
        preview: preview,
        printer: "",
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

  loadingStart() {}

  sendLP2TOP(event) {
    event.preventDefault();
    const baseUrl = `http://localhost:4000/top`;
    const lp = this.state.lp;
    this.fetchPrintData(baseUrl, lp);
    this.resetInput();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testLP2TOP(event) {
    const baseUrl = `http://localhost:4000/top`;
    await this.sleep(1000);
    sampleLP.forEach(lp => {
      this.fetchPrintData(baseUrl, lp);
    });
  }

  getLPState(event) {
    this.setState({
      lp: event.target.value
    });
  }

  render() {
    return (
      <div className="Tip-main">
        <form name="lp_form" id="lp_form" className="mx-auto">
          <div className="form-group align-items-center has-success">
            <h2>{!this.state.lp ? "LP Number ..." : <strong>{this.state.lp}</strong>}</h2>

            {/* <label htmlFor="lp_number">Barcode Scan</label> */}
            <input
              name="lp_number"
              type="text"
              style={{ marginRight: "10px" }}
              value={this.state.lp}
              className="form-control"
              id="lp_number"
              onChange={e => this.getLPState(e)}
              onKeyPress={e => this.keyPressCheck(e)}
            />
          </div>
          <button onClick={() => this.resetInput()} type="button" id="submit-lp" className="btn btn-light">
            Cancel
          </button>
          <button onClick={e => this.sendLP2TOP(e)} type="button" id="submit-lp" className="btn btn-primary">
            Submit
          </button>
          <button onClick={e => this.testLP2TOP(e)} type="button" className="btn btn-info">
            Test
          </button>
        </form>
        <Table />
        <table id="lp_result" className="table result">
          <thead>
            <tr>
              <th>#</th>
              <th>LP No.</th>
              <th>Result</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="">
                1
              </th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
