import React from "react";
import { Button, Input } from "antd";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import FormLogin from "./formLogin";
import BoxWrapper from "../../BoxWrapper";

interface LoginBoxProps {
  renderForm?:React.ReactNode;  // Thêm optional và đổi React.ReactNode
  title?: string;
}


const LoginBox: React.FC<LoginBoxProps> = ({renderForm, title}) => {
  


  return (
    <BoxWrapper>
      <p className="text-black text-center py-5 border-b font-bold border-black border-solid ">
        {title}
      </p>
      <div className="p-3 flex-1 flex flex-col justify-center ">
        <div>
        
          {renderForm}
        </div>
      </div>
    </BoxWrapper>
  );
};

export default LoginBox;
