import React, { PureComponent } from "react";
import { top_api_uri } from "../../services/config";
import { doPrint, socket, serviceUrl } from "../../services/cainiao";
import "./index.css";
import { gql } from "react-apollo";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import TipStatus from "./components/StatusBar";
import TipScanLpNo from "./components/ScanLpNo";
import TipResult from "./components/Sections/Result";

const SUBSCRIPTION = gql`
  subscription DoSubscription($date: String!, $turn: Int!) {
    subscribeLpTotal(date: $date, turn: $turn) {
      totalLP
    }
  }
`;

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
    this._baseURL = top_api_uri;
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
    this._preview = false;
    this.loadingChecker = this.isLoading.bind(this);
    this.hidePopUpWithSound = this.hidePopUpWithSound.bind(this);
    this.showPopUpWithSound = this.showPopUpWithSound.bind(this);
    this.datePickerAction = this.datePickerAction.bind(this);
    this.turnPickerAction = this.turnPickerAction.bind(this);
  }

  /* REACT CYCLE */
  componentWillMount() {
    this._unsubscribeHandle = this.newUnsubscribeHandle({ date: this.props.date, turn: this.props.turn });
  }

  componentDidMount() {
    this.setFullHeightEl();
    this.setFullHeightElResizeEvent();
    this.setPrintResultPopUpEl();
    this.setSocketMessage();
    this.setCursorFocus2Input();
    this.initTurn();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data.loading) {
      if (this._unsubscribeHandle) {
        if (newProps.date !== this.props.date || newProps.turn !== this.props.turn) {
          this._unsubscribeHandle();
          if (newProps.date !== this.props.date) {
            this.initTurn();
          }
        } else {
          return;
        }
      }

      this._unsubscribeHandle = this.newUnsubscribeHandle({ date: newProps.date, turn: newProps.turn });
    }
  }

  componentWillUnmount() {
    console.log("unsubscribe handle from ComponentWillUnmount ID: ", this._unsubscribeHandle);
    this._unsubscribeHandle();
  }

  /* ACTIONS */
  newUnsubscribeHandle = ({ date, turn }) => {
    console.group("Subscription Client");
    console.log(" -----> New date: %c" + date, "color:red");
    console.log(" -----> New turn: %c" + turn, "color:red");
    console.groupEnd();
    return this.props.data.subscribeToMore({
      document: SUBSCRIPTION,
      variables: {
        date: date,
        turn: turn
      },
      updateQuery: (prevData, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prevData;
        }
        const newLpTotal = subscriptionData.data.subscribeLpTotal;
        console.group("Update Query");
        console.log("-----> Prev Total: ", prevData.queryLpTotal.totalLP, ", New Total: ", subscriptionData.data.subscribeLpTotal.totalLP);
        console.groupEnd();
        return Object.assign({}, prevData, {
          queryLpTotal: Object.assign({}, prevData.queryLpTotal, {
            totalLP: newLpTotal.totalLP
          })
        });
      },
      onError: err => console.error(err)
    });
  };

  insertAction(lp, turn, date, timestamp) {
    return fetch(`${top_api_uri}/insert`, {
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

  submitActionByEnterKey(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      this.submitAction(event);
    }
  }

  submitAction(event) {
    event.preventDefault();
    const baseUrl = this._baseURL;
    this._submit = {
      lp: this.props.lp,
      turn: this.props.turn,
      date: this.props.date
    };
    console.group("Submit");
    console.log("Subscription date: ", this._submit.date, " and turn: ", this._submit.turn);
    console.groupEnd();
    this.hidePopUpWithSound("all");
    this.isLoading(true);
    this.getInvoiceByLP(baseUrl, this._submit)
      .then(invoiceData => {
        return doPrint(invoiceData);
      })
      .catch(reason => {
        this.showPopUpWithSound("fail", this._submit.lp, reason);
        this.isLoading(false);
        console.log("-----> Error Couldn't successfully submit the LP: ", reason);
      });
    this.cancelAction(event);
  }

  downloadAction(event) {
    event.preventDefault();
    if (window.confirm("Are you sure to donwload csv file?")) {
      window.open(`${top_api_uri}/download/${this.props.date}`);
    }
  }

  datePickerAction(date) {
    this.props.setDateTurn(date, "1");
  }

  turnPickerActionByEnterKey(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      this.turnPickerAction(event, event.target.value);
    }
  }

  turnPickerAction(event, newTurn) {
    event.preventDefault();
    if (this.varifyTurn(newTurn)) {
      this.props.setDateTurn(this.props.date, newTurn);
    } else {
      alert("Please enter only numbers!");
      this.initTurn();
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

  resetAction() {
    this.hidePopUpWithSound("all");
    this.setCursorFocus2Input();
  }

  cancelAction(event) {
    event.preventDefault();
    console.group("Clear Input");
    this.props.setLP("");
    console.log("cleared");
    console.groupEnd();
    this.resetAction();
  }

  /* GET */
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

  getTurnInput() {
    return document.getElementById("turnInput").value;
  }

  /* SET */
  setFullHeightEl() {
    const heightScreen = window.innerHeight;
    document.getElementsByClassName("Tip-main")[0].setAttribute("style", "height:" + heightScreen + "px");
  }

  setFullHeightElResizeEvent() {
    const resizeFn = this.setFullHeightEl.bind(this);
    window.addEventListener("resize", function() {
      resizeFn();
    });
  }

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

  setPrintResultPopUpEl() {
    this._printSuccessEl = document.getElementById("successResult");
    this._printFailEl = document.getElementById("failResult");
  }

  setCursorFocus2Input() {
    document.getElementById("lp_number").focus();
  }

  setSocketMessage() {
    const insertAction = this.insertAction.bind(this);
    const showPopUpWithSound = this.showPopUpWithSound.bind(this);
    const isLoading = this.isLoading.bind(this);

    socket.onopen = function(event) {
      console.group("Cainiao Client");
      console.log("-----> Cainiao socket is connected");
      console.groupEnd();
    };

    socket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      const lp = response.taskID;
      const turn = response.requestID.split("|")[0];
      const date = response.requestID.split("|")[1];
      const timestamp = moment(response.timeStamp).format("YYYY-MM-DD HH:mm:ss");
      console.log("-----> Cainiao client received a message");
      if (response.cmd === "print" && response.status === "success") {
        insertAction(lp, turn, date, timestamp)
          .then(insertRes => {
            showPopUpWithSound("success", lp);
            isLoading(false);
            console.log("-----> LP is inserted in the server DB");
          })
          .catch(reason => {
            showPopUpWithSound("fail", lp, reason);
            isLoading(false);
            console.log("-----> Error Couldn't insert LP: %c" + reason, "color:red");
          });
      } else if (response.cmd === "print" && response.status === "failed") {
        showPopUpWithSound("fail", "Wrong LP Number", response.msg);
        isLoading(false);
        console.log("-----> Invoice Print failed: %c" + response.msg, "color:red;font-size:2em", lp);
      }

      if (response.cmd === "getPrinterConfig" && response.status === "success") {
        console.log('-----> Printer"', response.printer.name, '" is ready');
      } else if (response.cmd === "getPrinterConfig" && response.status === "failed") {
        alert("-----> Printer is not ready. Please restart Cainiao tool");
      }
    };

    socket.onerror = function(error) {
      alert("Failed to connect CN print at " + serviceUrl, error);
    };

    socket.onclose = function(event) {
      alert("Client notified socket has closed", event);
    };
  }

  setLP(event) {
    const lpInput = event.target.value;
    this.props.setLP(lpInput);
  }

  /* OTHERS */
  isLoading(loading) {
    this.props.loadingChecker(loading);
  }

  showPopUpWithSound(whichPopUp, alertHeading = "", alertMsg = "") {
    if (whichPopUp === "fail") {
      if (this._printFailEl.classList.contains("hide")) {
        this._printFailEl.classList.remove("hide");
      }
      this._printFailEl.getElementsByClassName("alert-heading")[0].innerHTML = alertHeading ? alertHeading : "Hey, Scan LP first!";
      this._printFailEl.getElementsByClassName("alert-message")[0].innerHTML = alertMsg ? alertMsg : "Please check LP number";
      this._printFailEl.getElementsByClassName("alert-sound")[0].play();
    }

    if (whichPopUp === "success") {
      if (this._printSuccessEl.classList.contains("hide")) {
        this._printSuccessEl.classList.remove("hide");
      }
      this._printSuccessEl.getElementsByClassName("alert-heading")[0].innerHTML = alertHeading ? alertHeading : this._submit.lp;
      this._printSuccessEl.getElementsByClassName("alert-message")[0].innerHTML = alertMsg ? alertMsg : "The Invoice of the LP Successfully sent to the printer.";
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

  initTurn() {
    document.getElementById("turnInput").value = "1";
  }

  varifyTurn(turn) {
    const pattern = /^([1-9]|[1-9]\d+)$/;
    const result = pattern.test(turn);

    return result;
  }

  loadTurnOptionsByDate(turns = 1) {
    let turnStartFrom1 = turns ? turns : 1;
    return turnStartFrom1;
  }

  /* RENDER */
  render() {
    const { data: { loading, error, queryLpTotal } } = this.props;
    if (!loading) {
      console.log("-----> Render after loading");
    }
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
                  <button id="download-lp" className="btn btn-default btn-xs" onClick={e => this.downloadAction(e)}>
                    Download CSV
                  </button>
                  <div className="turnPicker">
                    <label htmlFor="turn-picker" className="col-lg-2 control-label">
                      Turn
                    </label>
                    <input type="text" name="turn-picker" id="turnInput" onKeyPress={e => this.turnPickerActionByEnterKey(e)} />
                  </div>
                  <button id="switch-turn" className="btn btn-default btn-xs" onClick={e => this.turnPickerAction(e, this.getTurnInput())}>
                    Switch Turn
                  </button>
                  <div className="checkbox previewMode">
                    <label htmlFor="preview-mode" className="col-lg-2 control-label">
                      Preview
                    </label>
                    <input type="checkbox" name="preview-mode" onClick={e => this.previewModeAction(e)} />
                  </div>
                </div>
              </div>
              <div className="form-buttons">
                <button id="submit-lp" className="btn btn-primary" onClick={e => this.submitAction(e)}>
                  Submit
                </button>

                <button id="cancel-lp" className="btn btn-light" onClick={e => this.cancelAction(e)}>
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
