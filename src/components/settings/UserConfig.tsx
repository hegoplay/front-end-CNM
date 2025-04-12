"use client";
import React, { useActionState, useEffect, useRef, useState } from "react";
import BoxWrapper from "../BoxWrapper";
import { CiCamera } from "react-icons/ci";
import { Button, DatePicker, Form, Input, message, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useUser } from "@/context/UserContext";
import { UserResponseDto } from "@/types/user";
import dayjs, { Dayjs } from "dayjs";
import '@ant-design/v5-patch-for-react-19';
import { FormState, updateUserAction } from "@/app/settings/user/action";
import { useRouter } from "next/navigation";

const UserConfig: React.FC<UserResponseDto> = ({ ...props }) => {
  const [img, setImg] = useState(props.baseImg); // Ảnh gốc
  const [previewImg, setPreviewImg] = useState<string | null>(null); // Ảnh preview
  const fileInputRef = useRef<HTMLInputElement>(null); // Tham chiếu đến input file
  const [selectedState, setSelectedState] = useState(props.isMale); // nam / nu
  const { updateUserInfo } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Lưu file gốc
  const router = useRouter();
  // dung useActionState

  // tao state de luu thong tin user

  const [state, formAction, isPending] = useActionState<FormState | null, FormData>(
    (prevState, formData) => updateUserAction(prevState, formData, updateUserInfo),
    null // initialState
  );

  // sau khi form submit về "/"
  useEffect(() => {
    if (state?.success) {
      message.success("Đăng ký thành công! Đang chuyển hướng...");
      // Chuyển hướng sau 2 giây để người dùng có thể đọc thông báo
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (state?.error) {
      message.error(state.error);
    }
  }
  , [state]);


  // Xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Tạo URL tạm để preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImg(previewUrl);
      setSelectedFile(file); // Lưu file gốc
    }
  };

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <BoxWrapper className="items-center px-4 pb-4">
      <div className="relative inline-block -mt-12">
        <img src={previewImg || img} className="w-30 h-30 rounded-full"></img>
        {/* Nút chọn ảnh */}
        <button
          onClick={handleChooseImage}
          className="absolute bottom-0 right-0 mt-4 bg-blue-500 
                    text-white p-2 rounded-full 
                      cursor-pointer hover:bg-blue-800 
                      transition duration-300 ease-in-out"
        >
          <CiCamera style={{ fontSize: 24, color: "white" }} />
        </button>
      </div>

      {/* co multipart */}
      <form className="flex flex-col my-4 w-full" action={formAction}>
        <Form.Item
          label="Họ và tên"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input name="name" defaultValue={props.name} />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <DatePicker
            className="w-full"
            name="dateOfBirth"
            defaultValue={dayjs(props.dateOfBirth)}
          />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Select onChange={setSelectedState} defaultValue={selectedState}>
            <Select.Option value={true}>nam</Select.Option>
            <Select.Option value={false}>nữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Bio"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <TextArea name="bio" defaultValue={props.bio} rows={4} />
        </Form.Item>

        <Form.Item label="ảnh background">
          <input type="file" accept="image/*" name="backgroundImg" />
        </Form.Item>

        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          name="baseImg"
        />
        <input
          type="text"
          className="hidden"
          name="isMale"
          value={selectedState ? "true" : "false"}
          readOnly
        />

        <Button
          type="primary"
          htmlType="submit"
          // loading={isPending}
          className="w-full"
          loading={isPending}
        >
          Thay đổi thông tin
        </Button>
      </form>
    </BoxWrapper>
  );
};

export default UserConfig;
