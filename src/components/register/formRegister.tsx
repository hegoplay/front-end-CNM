"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import axios from "axios";
import Link from "next/link";
import React, { Suspense, useActionState, useState } from "react";
import PreRegister from "./preRegister";
import OtpRegister from "./otpRegister";
import PostRegister from "./postRegister";

const FormRegister = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [wrongOTP, setWrongOTP] = useState(false);

  const restartFn = () => {
    setStep(1);
    setPhone("");
    setOtp("");
    setWrongOTP(false);
  };

  const handleSendOtp = async () => {
    // console.log("TEST")
    try {
      const response = await axios.post("/api/auth/send-otp", { phone });
      if (response.data.success === true) {
        setStep(2); // Chuyển sang bước nhập OTP
      }
    } catch (error) {
      console.error("Lỗi gửi OTP:", error);
    }
  };

  const handleCheckPhone = async () => {
    try {
      const response = await axios.post("/api/auth/check-phone", { phone });
      if (response.data.isExist === true) {
          // Nếu số điện thoại đã tồn tại, thông báo cho người dùng sử dụng số khác
          // thông báo lỗi
          // console.error("Số điện thoại đã tồn tại");
          // Xử lý thông báo cho người dùng
          message.error("Số điện thoại đã tồn tại, vui lòng sử dụng số khác");
          restartFn();
          return;

      }
      // Nếu số điện thoại chưa tồn tại, tiếp tục gửi OTP
      handleSendOtp();

    } catch (error) {
      // message.error("Số điện thoại đã tồn tại, vui lòng sử dụng số khác");
      console.error("Lỗi kiểm tra số điện thoại:", error);
      // Xử lý lỗi nếu cần
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phone,
        otp,
      });
      console.log(response)
      if (response.data.success === true) {
        setStep(3); // Chuyển sang bước nhập thông tin
      }
      else {
        setWrongOTP(true);
      }
    } catch (error) {
      console.error("OTP không hợp lệ:", error);
      setWrongOTP(true);
    }
  };

  const renderElement = () => {
    if (step === 1) {
      return (
        <PreRegister
          phone={phone}
          setPhone={setPhone}
          onClickEvt={handleCheckPhone}
        />
      );
    } else if (step === 2) {
      return (
        <OtpRegister
          otp={otp}
          setOtp={setOtp}
          onClickEvt={handleVerifyOtp}
          resendOTPFn={() => {
            axios.post("/api/auth/send-otp", { phone });
          }}
          wrongOTP={wrongOTP}
        />
      );
    } else if (step === 3) {
      return <PostRegister
        phone={phone}
        restartFn={restartFn}
      />
    }
  };

  return (
    <>
      {<Suspense fallback={<div>Loading...</div>}>{renderElement()}</Suspense>}
      <div style={{ justifyContent: "center", display: "flex" }}>
        <Link href="/signin">
          <Button type="text">Đăng nhập</Button>
        </Link>
        <Link href="/forgot-password">
          <Button type="text" onClick={(e) => {}}>
            Quên mật khẩu
          </Button>
        </Link>
      </div>
    </>
  );
};

export default FormRegister;
