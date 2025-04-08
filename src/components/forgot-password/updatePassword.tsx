import { forgotAction } from "@/app/forgot-password/action";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

interface PreProps {
  phone: string;
  restartFn: () => void;
}

const UpdatePassword: React.FC<PreProps> = ({ phone, restartFn }) => {
  const [state, formAction, isPending] = useActionState(forgotAction, null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      message.success("Đăng ký thành công! Đang chuyển hướng...");
      // Chuyển hướng sau 2 giây để người dùng có thể đọc thông báo
      const timer = setTimeout(() => {
        restartFn();
        router.push('/login');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (state?.error) {
      message.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col px-10">
      <Form.Item
        label="Mật khẩu"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Nhập mật khẩu của bạn" name="password" />
      </Form.Item>
      <Form.Item
        label="Nhập lại mật khẩu "
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Nhập mật khẩu của bạn" name="rePassword" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={isPending}
        className="w-full"
      >
        Thay đổi mật khẩu
      </Button>
      <Input hidden name="phone" value={phone}/>
    </form>
  );
};

export default UpdatePassword;
