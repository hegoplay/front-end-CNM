import { UserOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React from "react";
import "@ant-design/v5-patch-for-react-19";

const PreRegister: React.FC<{
  phone: string;
  setPhone: (value: string) => void;
  onClickEvt: () => void;
}> = ({ phone, setPhone, onClickEvt }) => {
  return (
    <div className="flex flex-col items-center p-10 gap-4">
      <Input
        placeholder="Số điện thoại, phải nhập +84 trước"
        name="phoneNumber"
        prefix={<UserOutlined />}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {/* <br /> */}
      <Button
        type="primary"
        htmlType="submit"
        className="mx-4 w-full"
        onClick={onClickEvt}
        disabled={phone.length > 8 ? false : true}
      >
        Đăng ký
      </Button>
    </div>
  );
};

export default PreRegister;
