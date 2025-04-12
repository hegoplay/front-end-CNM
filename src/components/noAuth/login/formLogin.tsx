"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useActionState, useLayoutEffect } from "react";
import { loginAction } from "@/app/login/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface LoginState {
  error?: string;
  success?: boolean;
  message?: string;
}

const FormLogin: React.FC = () => {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();
  const { login } = useUser();

  useLayoutEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push(state.redirectUrl || "/"); // Redirect về trang chủ
      }, 1000); // Delay 1 giây (1000ms)
      login();
      // useUser().setPhoneNumber(state.phoneNumber); // Lưu số điện thoại vào context
      return () => clearTimeout(timer); // Cleanup timeout khi component unmount
    }
  }, [state, router]);

  return (
    <>
      <form action={formAction} className="flex flex-col items-center p-10">
        <Input
          placeholder="Số điện thoại"
          name="phoneNumber"
          prefix={<UserOutlined />}
          disabled={isPending}
        />
        <div className="my-4" />
        <Input.Password
          placeholder="Mật khẩu"
          name="password"
          prefix={<LockOutlined />}
          disabled={isPending}
        />
        <div className="my-4" />
        <Button
          type="primary"
          htmlType="submit"
          loading={isPending}
          className="w-full"
          disabled={state?.success}
        >
          Đăng nhập với mật khẩu
        </Button>

        {state?.error && (
          <div className="mt-4 text-red-500 text-center">{state.error}</div>
        )}

        {state?.success && (
          <div className="mt-4 text-green-500 text-center">
            {state.message || "Đăng nhập thành công!"}
          </div>
        )}
      </form>
      <br />
      <div style={{ justifyContent: "center", display: "flex" }}>
        <Link href="/register">
          <Button type="text" onClick={(e) => {}}>
            Đăng ký tài khoản
          </Button>
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

export default FormLogin;
