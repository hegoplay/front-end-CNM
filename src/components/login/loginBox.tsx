import React from "react";
import { Button, Input } from "antd";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import FormLogin from "./formLogin";

interface LoginBoxProps {
  renderForm?:React.ReactNode;  // Thêm optional và đổi React.ReactNode
  title?: string;
}


const LoginBox: React.FC<LoginBoxProps> = ({renderForm, title}) => {
  


  return (
    <div className="bg-white rounded-2xl w-120 h-120 shadow-2xl flex flex-col">
      <p className="text-black text-center py-5 border-b font-bold border-black border-solid ">
        {title}
      </p>
      <div className="p-3 flex-1 flex flex-col justify-center ">
        <div>
        
          {renderForm}
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
