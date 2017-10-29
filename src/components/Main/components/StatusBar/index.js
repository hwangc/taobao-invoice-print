import React from "react";

const TipStatus = props => {
  return (
    <div className="Tip-status">
      <div className="scanDate">
        <h3>{props.date}</h3>
      </div>
      <div className="scanTurn">
        <h3>Turn: {props.turn}</h3>
      </div>
      <div className="totalLP">
        <h3>Total: {props.total}</h3>
      </div>
    </div>
  );
};

export default TipStatus;
