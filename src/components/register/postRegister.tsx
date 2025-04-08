import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  DatePickerProps,
  Form,
  Input,
  message,
  Select,
  Upload,
  UploadFile,
} from "antd";
import React, { useActionState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { registerAction } from "@/app/register/actions";
import { useRouter } from 'next/navigation';

// B5: Nhập tên
// B6: Nhập thông tin cá nhân (ngày tháng + giới tính)
// B7: Cập nhật ảnh đại diện
type FieldType = {
  name?: string;
  dateOfBirth?: any;
  gender?: string;
  avatar?: string;
  phone: string;
};

const onChange: DatePickerProps["onChange"] = (date, dateString) => {
  console.log(date.toDate());
};

// lát nữa sẽ gửi thông tin tạo tài khoản và tạo 1 cái schema liên quan post gửi thông tin tạo tài khoản ở model
const PostRegister: React.FC<{
  phone: string;
  restartFn: () => void;
}> = ({ phone, restartFn}) => {

  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [selectedState, setSelectedState] = useState('');
  const router = useRouter();
  // const searchParams = useSearchParams();
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
        <Input.Password
          placeholder="Nhập mật khẩu của bạn"
          name="password"
        />
      </Form.Item>
      <Form.Item
        label="Tên"
        rules={[{ required: true, message: "Please input your name!" }]}
      >
        <Input
          placeholder="Nhập tên của bạn"
          name="name"
        />
      </Form.Item>
      <Form.Item
        label="Ngày sinh"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <DatePicker
          onChange={onChange}
          className="w-full"
          name="dateOfBirth"
        />
      </Form.Item>
      <Form.Item
        label="Giới tính"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Select onChange={setSelectedState}>
          <Select.Option value="nam">nam</Select.Option>
          <Select.Option value="nữ">nữ</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label="Ảnh đại diện"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <input type="file" name="avatar" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={isPending}
        className="w-full"
      >
        Đăng ký
      </Button>
      <Input hidden name="phone" value={phone}/>
      <Input hidden name="gender" value={selectedState}/>
    </form>
  );
};

export default PostRegister;
