import React, { PureComponent } from "react";
import "./index.css";

class PrintResultTable extends PureComponent {
  // shouldComponentUpdate(newProps) {
  // newProps should have not same lp from the previous result list unless it was fail
  // }

  render() {
    const printResult = this.props.printResultList.map(print => {
      console.log("print ", print);
      return (
        <tr key={print.lp} id={print.lp}>
          <td>{print.id}</td>
          <td>{print.lp}</td>
          <td>{print.status}</td>
          {/* <td>
            {print.action !== "" && (
              <a href={print.action} className="preview" target="_blank">
                Preview
              </a>
            )}
          </td> */}
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
