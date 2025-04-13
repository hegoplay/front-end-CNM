import AvatarImg from "@/components/AvatarImg";
import { MessageResponse } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import { Button } from "antd";
import React from "react";
import { IoTrashBin } from "react-icons/io5";
import axios from "axios";
import confirm from "antd/es/modal/confirm";
import { ExclamationCircleFilled } from "@ant-design/icons";

const MyMessageContent: React.FC<{
  children: React.ReactNode;
  message: MessageResponse;
  userInfo?: UserResponseDto;
}> = ({ children, message, userInfo }) => {
  return (
    <>
      <div className="flex flex-col items-end">
        <div className="flex flex-col bg-blue-400 text-white rounded-lg p-2 max-w-100">
          {children}
        </div>
        {!message.isRecalled && <Button
          type="text"
          size="small"
          onClick={() => {
            confirm({
              title: "Bạn có chắc muốn thu hồi tin nhắn này?",
              icon: <ExclamationCircleFilled />,
              content: "Tin nhắn sẽ bị xóa khỏi tất cả các thiết bị",
              okText: "Đồng ý",
              okType: "danger",
              cancelText: "Hủy",
              cancelButtonProps: { type: "text" }, // Thêm dòng này
              onOk() {
                return axios.delete(`/api/messages/recall/${message.id}`);
              },
              onCancel() {
                console.log("Đã hủy thao tác");
              },
            });
          }}
        >
          <IoTrashBin className="text-red-300" size={20} />
        </Button>}
        <span className="text-xs text-gray-500">{message.createdAt}</span>
      </div>
      <AvatarImg imgUrl={!!userInfo ? userInfo.baseImg : "/avatar.jpg"} />
    </>
  );
};

export default MyMessageContent;
