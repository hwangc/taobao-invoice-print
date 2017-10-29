import React, { PureComponent } from "react";
import { doPrint, socket, serviceUrl } from "../../services/cainiao";
import "./index.css";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import TipStatus from "./components/StatusBar";
import TipScanLpNo from "./components/ScanLpNo";
import TipResult from "./components/Sections/Result";

class Main extends PureComponent {
  constructor(props) {
    super(props);
    this._submit = {
      lp: "",
      turn: "",
      date: ""
    };
    this._printFailEl = null;
    this._printSuccessEl = null;
    this._unsubscribeHandle = null;
    const tipURL = document.location.href;
    if (tipURL.indexOf("localhost")) {
      this._baseURL = `http://localhost:4040/top`;
    } else if (tipURL.indexOf("tip.ppb.st")) {
      this._baseURL = `http://tip-server.ppb.st/top`;
    }
    /* 
      Please do not define the printer name unless it only uses the specific printer
      if it is empty, it will use a primary printer connected to a computer
      * eventually it should be chosen by user
    */
    this._printer = "";
    /* 
      If preview is true, it won't let the printer do print immediately but let user maually choose to print or delete from cainiao printing tool
      * eventually it should be chosen by user
    */
    this._preview = true;
    this.loadingChecker = this.isLoading.bind(this);
    this.hidePopUpWithSound = this.hidePopUpWithSound.bind(this);
    this.showPopUpWithSound = this.showPopUpWithSound.bind(this);
    this.datePickerAction = this.datePickerAction.bind(this);
    this.turnPickerAction = this.turnPickerAction.bind(this);
  }
  componentWillMount() {
    this._unsubscribeHandle = this.props.subscribeNewLpTotal({ date: this.props.date, turn: this.props.turn });
  }

  componentDidMount() {
    this.setFullHeightEl();
    this.setPrintResultPopUpEl();
    this.setSocketMessage();
    this.setCursorFocus2Input();
  }

  setFullHeightEl() {
    const heightScreen = window.innerHeight;
    document.getElementsByClassName("Tip-main")[0].setAttribute("style", "height:" + heightScreen + "px");
  }

  setPrintResultPopUpEl() {
    this._printSuccessEl = document.getElementById("successResult");
    this._printFailEl = document.getElementById("failResult");
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
  /*
* set the property requestID with turn in order to use it in the socket.onMessage 
*/
  setPrintData({ lp, turn, date, encryptedData, signature, templateURL }) {
    return {
      cmd: "print",
      requestID: turn + "|" + date,
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
                encryptedData: encryptedData,
                signature: signature,
                templateURL: templateURL
              }
            ]
          }
        ]
      }
    };
  }

  showPopUpWithSound(whichPopUp, alertMsg = "") {
    if (whichPopUp === "fail") {
      if (this._printFailEl.classList.contains("hide")) {
        this._printFailEl.classList.remove("hide");
      }
      this._printFailEl.getElementsByClassName("alert-heading")[0].innerHTML = this._submit.lp ? this._submit.lp : "Hey, Scan LP first!";
      this._printFailEl.getElementsByClassName("alert-message")[0].innerHTML = alertMsg ? alertMsg : "Please check LP number";
      this._printFailEl.getElementsByClassName("alert-sound")[0].play();
    }

    if (whichPopUp === "success") {
      if (this._printSuccessEl.classList.contains("hide")) {
        this._printSuccessEl.classList.remove("hide");
      }
      this._printSuccessEl.getElementsByClassName("alert-heading")[0].innerHTML = this._submit.lp;
      this._printSuccessEl.getElementsByClassName("alert-sound")[0].play();
    }
  }

  hidePopUpWithSound(whichPopUp) {
    if (whichPopUp === "fail" || whichPopUp === "all") {
      if (!this._printFailEl.classList.contains("hide")) {
        this._printFailEl.classList.add("hide");
      }
      this._printFailEl.getElementsByClassName("alert-sound")[0].pause();
      this._printFailEl.getElementsByClassName("alert-sound")[0].currentTime = 0;
    }

    if (whichPopUp === "success" || whichPopUp === "all") {
      if (!this._printSuccessEl.classList.contains("hide")) {
        this._printSuccessEl.classList.add("hide");
      }
      this._printSuccessEl.getElementsByClassName("alert-sound")[0].pause();
      this._printSuccessEl.getElementsByClassName("alert-sound")[0].currentTime = 0;
    }
  }

  previewModeAction(event) {
    if (event.target.value === "on") {
      event.target.value = "off";
      this._preview = true;
    } else {
      event.target.value = "on";
      this._preview = false;
    }
  }

  getInvoiceByLP(baseUrl, submit = {}) {
    const apiUrl = `${baseUrl}/${submit.lp}`;

    return fetch(apiUrl, { method: "GET" })
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject("Failed to receive LP data: " + response.statusText);
        }
        return response.json();
      })
      .then(result => {
        const encryptedInvoiceData = JSON.parse(result.waybillurl);
        const invoiceData = this.setPrintData({ ...submit, ...encryptedInvoiceData });

        if (!invoiceData) {
          return Promise.reject("Failed to generate invoice data");
        }
        return invoiceData;
      });
  }

  insertAction(lp, turn, date, timestamp) {
    return fetch(`http://localhost:4040/top/insert`, {
      method: `POST`,
      body: JSON.stringify({
        lp,
        turn,
        date,
        timestamp
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(res => {
        if (res.err) {
          return Promise.reject("Failed to insert LP into DB " + res.err);
        }
        return { result: "success" };
      });
  }

  setSocketMessage() {
    const insertAction = this.insertAction.bind(this);
    const showPopUpWithSound = this.showPopUpWithSound.bind(this);
    const isLoading = this.isLoading.bind(this);

    socket.onopen = function(event) {
      console.log("===> Socket is open");
    };

    socket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      const lp = response.taskID;
      const turn = response.requestID.split("|")[0];
      const date = response.requestID.split("|")[1];
      const timestamp = moment(response.timeStamp).format("YYYY-MM-DD HH:mm:ss");
      console.log("===> WebSocket client received a message", event);
      if (response.cmd === "print" && response.status === "success") {
        console.log("socket subscribe date ", date, ", turn ", turn);
        insertAction(lp, turn, date, timestamp)
          .then(insertRes => {
            showPopUpWithSound("success");
            isLoading(false);
            console.log("===> Invoice Print success");
          })
          .catch(reason => {
            showPopUpWithSound("fail", reason);
            isLoading(false);
            console.log("===> Error Couldn't insert LP: %c" + reason, "color:red");
          });
      } else if (response.cmd === "print" && response.status === "failed") {
        showPopUpWithSound("fail", response.msg);
        isLoading(false);
        console.log("===> Invoice Print failed: %c" + response.msg, "color:red;font-size:2em");
      }

      if (response.cmd === "getPrinterConfig" && response.status === "success") {
        console.log('===> Printer"', response.printer.name, '" is ready');
      } else if (response.cmd === "getPrinterConfig" && response.status === "failed") {
        alert("===> Printer is not ready. Please restart Cainiao tool");
      }
    };

    socket.onerror = function(error) {
      alert("Failed to connect CN print at " + serviceUrl, error);
    };

    socket.onclose = function(event) {
      alert("Client notified socket has closed", event);
    };
  }

  submitAction(event) {
    event.preventDefault();
    const baseUrl = this._baseURL;
    this._submit = {
      lp: this.props.lp,
      turn: this.props.turn,
      date: this.props.date
    };
    console.log("submit subscribe date: ", this._submit.date, ", turn: ", this._submit.turn);
    this.hidePopUpWithSound("all");
    this.isLoading(true);
    this.getInvoiceByLP(baseUrl, this._submit)
      .then(invoiceData => {
        return doPrint(invoiceData);
      })
      .catch(reason => {
        this.showPopUpWithSound("fail", reason);
        this.isLoading(false);
        console.log("===> Error Couldn't successfully submit the LP: ", reason);
      });
    this.cancelAction();
  }

  setLP(event) {
    this.props.setLP(event.target.value);
  }

  datePickerAction(date) {
    this.props.setDateTurn(date, "1");
  }

  turnPickerAction(newTurn) {
    this.props.setDateTurn(this.props.date, newTurn);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.date !== this.props.date || newProps.turn !== this.props.turn) {
      console.log("unsubscribe handle");
      this._unsubscribeHandle();
      console.log("new props ", newProps.date, "-", newProps.turn);
      this.props.subscribeNewLpTotal({ date: newProps.date, turn: newProps.turn });
      this.props.data.refetch(newProps.date, newProps.turn);
      if (newProps.date !== this.props.date) {
        document.getElementById("turn-1").selected = true;
      }
    }
  }

  loadTurnOptionsByDate(turns = 1) {
    let options = [];
    let counter = 1;
    let turnStartFrom1 = turns ? turns : 1;

    for (counter; counter <= turnStartFrom1; counter++) {
      options.push(
        <option key={counter.toString()} id={"turn-" + counter.toString()}>
          {counter}
        </option>
      );
    }

    return options;
  }

  render() {
    const { data: { loading, error, queryLpTotal, queryTurnByDate } } = this.props;
    if (!loading) console.log("this props queryLpTotal", queryLpTotal);
    return (
      <div className="Tip-main">
        <TipStatus date={this.props.date} turn={this.props.turn} total={error ? "Server Query Error" : loading ? "Loading.." : queryLpTotal.totalLP} />
        <section className="scan-section">
          <TipScanLpNo lp={!this.props.lp ? "Scan LP No." : this.props.lp} />
          <form name="lp_form" id="lp_form" className="mx-auto">
            <div className="form-group">
              <div className="form-fields">
                <input
                  name="lp_number"
                  type="text"
                  style={{ marginRight: "10px" }}
                  value={this.props.lp}
                  className="form-control"
                  id="lp_number"
                  onChange={e => this.setLP(e)}
                  onKeyPress={e => this.submitActionByEnterKey(e)}
                />
                <div className="form-options">
                  <div className="datePicker">
                    <label className="col-lg-2 control-label">Date</label>
                    <DatePicker
                      dateFormat="YYYY-MM-DD"
                      todayButton={"Today"}
                      selected={moment(this.props.date)}
                      onChange={date => this.datePickerAction(date.format("YYYY-MM-DD"))}
                      placeholderText="Please Select Date!"
                    />
                  </div>
                  <div className="turnPicker">
                    <label htmlFor="select" className="col-lg-2 control-label">
                      Turn
                    </label>
                    <select className="form-control" id="select" onChange={e => this.turnPickerAction(e.target.value)}>
                      <option value="" disabled>
                        Select turn
                      </option>
                      {loading ? "Loading.." : this.loadTurnOptionsByDate(queryTurnByDate.turn)}
                    </select>
                  </div>
                  <div className="checkbox previewMode">
                    <label className="col-lg-2 control-label">Preview</label>
                    <input type="checkbox" onClick={e => this.previewModeAction(e)} />
                  </div>
                </div>
              </div>
              <div className="form-buttons">
                <button onClick={e => this.submitAction(e)} type="button" id="submit-lp" className="btn btn-primary">
                  Submit
                </button>
                <button onClick={() => this.cancelAction()} type="button" id="submit-lp" className="btn btn-light">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
        <TipResult />
      </div>
    );
  }
}

Main.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    queryLpTotal: PropTypes.object,
    queryTurnByDate: PropTypes.object
  }).isRequired
};

export default Main;
