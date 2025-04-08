import { Button } from "antd";
import React from "react";

interface UserInfoBoxProps {
  backgroundImg?: string;
  baseImg?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: boolean;
  name?: string;
  phoneNumber?: string;
}

const UserInfoBox: React.FC<UserInfoBoxProps> = ({ ...props }) => {
  return (
    <div className="h-150 flex flex-col ">
      <img
        src={props.backgroundImg}
        className="w-[calc(100%+3rem)] h-40 object-cover mx-[-1.5rem] overflow-x-visible max-w-[calc(100%+3rem)] bg-gray-200 border-0"
      />
      <div className="flex flex-col -mt-3 justify-items-start gap-4">
        <div className="flex gap-3 items-center">
          <img
            src={props.baseImg}
            className="w-20 h-20 rounded-full border-2 border-white font-bold"
          />
          <h3 className="text-black font-semibold max-w-[60%]">{props.name}</h3>
          <Button type="primary">Chat</Button>
          <Button type="text">Kết bạn</Button>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Giới thiệu</span>
          <p className="text-sm">{props.bio || "none"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Giới tính</span>
          <p className="text-sm">{props.gender ? "Nam" : "Nữ"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Ngày sinh </span>
          <p className="text-sm">{props.dateOfBirth || "none"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Điện thoại</span>
          <p className="text-sm">{props.phoneNumber || "none"}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoBox;
