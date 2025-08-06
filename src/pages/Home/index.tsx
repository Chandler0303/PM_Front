/* 主页 */

import React from "react";
import ImgLogo from "@/assets/react-logo.jpg";

import "./index.less";

export default function HomePageContainer(): JSX.Element {
  return (
    <div className="page-home all_nowarp">
      <div className="box">
        <img src={ImgLogo} />
        <div className="title">PM</div>
      </div>
    </div>
  );
}
