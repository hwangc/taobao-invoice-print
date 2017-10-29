import React, { PureComponent } from "react";
import "./index.css";

class Log extends PureComponent {
  componentDidMount() {
    this.setFullHeightEl();
  }

  setFullHeightEl() {
    const heightScreen = window.innerHeight;
    document.getElementsByClassName("Tip-log")[0].setAttribute("style", "height:" + heightScreen + "px");
  }

  render() {
    return (
      <div className="Tip-log">
        LP Log
        <ul className="lp-list">
          <li>LP00083737584239</li>
          <li>LP00083734651555</li>
          <li>LP00083102854881</li>
          <li>LP00083734284799</li>
          <li>LP00083734561746</li>
          <li>LP00083104000358</li>
          <li>LP00079918778678</li>
          <li>LP00083105099329</li>
          <li>LP00083103071942</li>
          <li>LP00079917555413</li>
          <li>LP00083737584239</li>
          <li>LP00083734651555</li>
          <li>LP00083102854881</li>
          <li>LP00083734284799</li>
          <li>LP00083734561746</li>
          <li>LP00083104000358</li>
          <li>LP00079918778678</li>
          <li>LP00083105099329</li>
          <li>LP00083103071942</li>
          <li>LP00079917555413</li>
          <li>LP00083737584239</li>
          <li>LP00083734651555</li>
          <li>LP00083102854881</li>
          <li>LP00083734284799</li>
          <li>LP00083734561746</li>
          <li>LP00083104000358</li>
          <li>LP00079918778678</li>
          <li>LP00083105099329</li>
          <li>LP00083103071942</li>
          <li>LP00079917555413</li>
          <li>LP00083737584239</li>
          <li>LP00083734651555</li>
          <li>LP00083102854881</li>
          <li>LP00083734284799</li>
          <li>LP00083734561746</li>
          <li>LP00083104000358</li>
          <li>LP00079918778678</li>
          <li>LP00083105099329</li>
          <li>LP00083103071942</li>
          <li>LP00079917555413</li>
          <li>LP00083737584239</li>
          <li>LP00083734651555</li>
          <li>LP00083102854881</li>
          <li>LP00083734284799</li>
          <li>LP00083734561746</li>
          <li>LP00083104000358</li>
          <li>LP00079918778678</li>
          <li>LP00083105099329</li>
          <li>LP00083103071942</li>
          <li>LP00079917555413</li>
        </ul>
      </div>
    );
  }
}

export default Log;
