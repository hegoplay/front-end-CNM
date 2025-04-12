"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import axios from "axios";
import Link from "next/link";
import React, { Suspense, useActionState, useEffect, useLayoutEffect, useRef, useState } from "react";
import PreRegister from "../noAuth/register/preRegister";
import OtpRegister from "../noAuth/register/otpRegister";
import UpdatePassword from "../noAuth/forgot-password/updatePassword";
import { useRouter } from 'next/navigation';

const FormChangePass : React.FC<{phone: string}> = ({phone}) => {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [wrongOTP, setWrongOTP] = useState(false);
  // const [isError, setIsError] = useState(false);
  const hasSentRef = useRef(false); // lưu trạng thái đã gọi API chưa

  const router = useRouter();

  const restartFn = () => {
    setStep(1);
    setOtp("");
    setWrongOTP(false);
  };

  useLayoutEffect(() => {
    handleSendOtp();
  }, []);

  const handleSendOtp = async () => {
    if (hasSentRef.current) return; // đã gửi rồi, không gửi nữa
    hasSentRef.current = true; // đánh dấu là đã gửi
  
    try {
      const response = await axios.post("/api/auth/send-otp", { phone });
      if (response.data.success === true) {
        // setStep(1);
      }
    } catch (error) {
      console.error("Lỗi gửi OTP:", error);
      message.error("Lỗi gửi OTP, vui lòng thử lại sau.");
      router.back();
    }
  };


  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phone,
        otp,
      });
      // console.log(response)
      if (response.data.success === true) {
        setStep(2); // Chuyển sang bước nhập thông tin
        setWrongOTP(false);
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
    } else if (step === 2) {
      return <UpdatePassword
        phone={phone }
        restartFn={restartFn}
      />
    }
  };

  return (
    <>
      {<Suspense fallback={<div>Loading...</div>}>{renderElement()}</Suspense>}
      
    </>
  );
};

export default FormChangePass;
