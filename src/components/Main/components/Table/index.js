import React, { PureComponent } from "react";
import "./index.css";

class PrintResultTable extends PureComponent {
  render() {
    const printResult = this.props.printResultList.map(print => {
      console.log("print ", print);
      return (
        <tr key={print.lp} id={print.lp}>
          <td>{print.id}</td>
          <td>{print.lp}</td>
          <td>{print.status}</td>
          <td>{print.date}</td>
        </tr>
      );
    });

    return (
      <table className="table table-striped table-hover table-responsive ">
        <thead>
          <tr>
            <th>#</th>
            <th>LP No.</th>
            <th>Result</th>
            {/* <th>Action</th> */}
            <th>Date</th>
          </tr>
        </thead>
        <tbody>{printResult}</tbody>
      </table>
    );
  }
}

export default PrintResultTable;
