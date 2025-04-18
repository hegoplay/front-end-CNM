import { Spin } from "antd";
import React from "react";

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large">
        <div style={{ height: "100px" }} /> {/* Placeholder content */}
      </Spin>
    </div>
  );
};

export default LoadingPage;
