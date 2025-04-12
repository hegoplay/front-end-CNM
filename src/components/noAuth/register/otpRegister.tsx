import { UserOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React from "react";
import "@ant-design/v5-patch-for-react-19";
import Link from "next/link";

const OtpRegister: React.FC<{
  otp: string;
  setOtp: (value: string) => void;
  onClickEvt: () => void;
  wrongOTP?: boolean;
  resendOTPFn: () => void;
}> = ({ otp, setOtp, onClickEvt, wrongOTP, resendOTPFn }) => {
  return (
    <div className="flex flex-col items-center p-10 gap-4">
      <h1>Nhập OTP</h1>

      <p className="text-xs">
        Không nhận được OTP ?{" "}
        <Button type="link" size="small" onClick={resendOTPFn} ><span className="text-xs">Gửi lại OTP</span></Button>
      </p>

      <Input
        placeholder="Nhập OTP đi cu"
        // prefix={<UserOutlined />}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        status={wrongOTP ? "error" : ""}
      />
      {wrongOTP && <p className="text-red-500">Mã OTP không hợp lệ</p>}
      {/* <br /> */}
      <Button
        type="primary"
        htmlType="submit"
        className="mx-4 w-full"
        onClick={onClickEvt}
      >
        Đăng ký
      </Button>
    </div>
  );
};

export default OtpRegister;
