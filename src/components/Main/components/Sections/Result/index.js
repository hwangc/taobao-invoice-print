import React from "react";
import successSound from "../../../sound/success.wav";
import failSound from "../../../sound/fail.wav";

const TipResult = () => {
  return (
    <section className="result-section">
      <div id="successResult" className="alert alert-dismissible alert-success hide">
        <h4 className="alert-heading">lpNo</h4>
        <hr />
        <strong>Well done!</strong> <br />
        <span className="alert-message">The Invoice of the LP Successfully sent to the printer.</span>
        <audio className="alert-sound">
          <source src={successSound} />
        </audio>
      </div>
      <div id="failResult" className="alert alert-dismissible alert-danger hide">
        <h4 className="alert-heading">lpNo</h4>
        <hr />
        <strong>Oh snap!</strong>
        <br />
        <span className="alert-message">Print failed. Please check the LP number.</span>
        <audio className="alert-sound">
          <source src={failSound} />
        </audio>
      </div>
    </section>
  );
};

export default TipResult;
