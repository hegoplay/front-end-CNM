import React from "react";

const BoxWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className= {`bg-white rounded-2xl w-120 h-120 shadow-2xl flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default BoxWrapper;
