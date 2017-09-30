import React from "react";
import ReactDOM from "react-dom";
import Tip from "../components/Tip";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Tip />, div);
});
