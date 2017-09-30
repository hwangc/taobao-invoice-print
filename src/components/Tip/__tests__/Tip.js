import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";
import "../../../setupTests";
import Tip from "../index";

it("renders without crashing", () => {
  const shallowTip = shallow(<Tip />);
  expect(shallowTip.find("div.Tip")).toHaveLength(1);
});
