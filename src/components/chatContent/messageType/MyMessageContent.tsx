import AvatarImg from "@/components/AvatarImg";
import { MessageResponse } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import { Button, Popover } from "antd";
import React, { useState } from "react";
import { IoTrashBin } from "react-icons/io5";
import { FaReply, FaSmile } from "react-icons/fa";
import axios from "axios";
import confirm from "antd/es/modal/confirm";
import { ExclamationCircleFilled } from "@ant-design/icons";

interface MyMessageContentProps {
  children: React.ReactNode;
  message: MessageResponse;
  userInfo?: UserResponseDto;
  onReply?: (message: MessageResponse) => void;
}

const MyMessageContent: React.FC<MyMessageContentProps> = ({
  children,
  message,
  userInfo,
  onReply,
}) => {
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);

  // Danh sách emoji để chọn
  const emojis = ["👍", "❤️", "😂", "😢", "😡", "😮"];

  // Xử lý chọn emoji
  const handleReact = async (emoji: string) => {
    try {
      await axios.post(`/api/messages/react/${message.id}`, {
        emoji,
      });
      setIsReactionPopoverOpen(false); // Đóng popover sau khi chọn
    } catch (error) {
      console.error("Lỗi khi thả tương tác:", error);
    }
  };

  // Nội dung của Popover chọn emoji
  const reactionContent = (
    <div className="flex gap-2">
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          type="text"
          onClick={() => handleReact(emoji)}
          className="text-lg"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
  
  // Đếm số lượng mỗi emoji
  const reactionCounts = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = reaction.users.length; // Đếm số users trong reaction.users
    return acc;
  }, {} as Record<string, number>);
  
  // console.log(reactionCounts)
  return (
    <div className="flex gap-2 items-start">
      <div className="flex flex-col items-end group">
        <div className="flex flex-col bg-blue-400 text-white rounded-lg p-3 max-w-2xl">
          {children}
        </div>
        {/* Action buttons, visible on hover */}
        {!message.isRecalled && (
          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="text"
              size="small"
              onClick={() => onReply?.(message)}
              disabled={message.isRecalled}
            >
              <FaReply className="text-gray-500" />
            </Button>
            <Popover
              content={reactionContent}
              trigger="click"
              open={isReactionPopoverOpen}
              onOpenChange={setIsReactionPopoverOpen}
              placement="top"
            >
              <Button
                type="text"
                size="small"
                onClick={() => setIsReactionPopoverOpen(true)}
              >
                <FaSmile className="text-gray-500" />
              </Button>
            </Popover>
            <Button
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
                  cancelButtonProps: { type: "text" },
                  onOk() {
                    return axios.delete(`/api/messages/recall/${message.id}`);
                  },
                  onCancel() {
                    console.log("Đã hủy thao tác");
                  },
                });
              }}
              disabled={message.isRecalled}
            >
              <IoTrashBin className="text-red-300" />
            </Button>
          </div>
        )}
        {/* Hiển thị phản ứng và số lượng */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-2 mt-1">
            {Object.entries(reactionCounts || {}).map(([emoji, count]) => (
              <span key={emoji} className="text-sm flex items-center">
                {emoji} {count > 1 ? count : ""}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500">{message.createdAt}</span>
      </div>
      <AvatarImg imgUrl={userInfo?.baseImg || "/avatar.jpg"} />
    </div>
  );
};

export default MyMessageContent;