import AvatarImg from "@/components/AvatarImg";
import { MemberDto, MessageResponse } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import { FaReply, FaSmile } from "react-icons/fa";
import { Button, Popover } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactionMessageComponent from "./ReactionMessageComponent";

interface OtherMessageContentProps {
  children: React.ReactNode;
  message: MessageResponse;
  userInfo?: MemberDto;
  onReply?: (message: MessageResponse) => void;
}

const OtherMessageContent: React.FC<OtherMessageContentProps> = ({
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
  return (
    <div className="flex items-start gap-2">
      <AvatarImg imgUrl={userInfo?.baseImg || "/avatar.jpg"} />
      <div className="flex flex-col items-start group">
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
          </div>
        )}
        {/* Hiển thị phản ứng và số lượng */}
        {message.reactions && message.reactions.length > 0   && !message.isRecalled  && (
          <ReactionMessageComponent reactions={message.reactions} messageId={message.id}/>
        )}
        <span className="text-xs text-gray-500">{message.createdAt}</span>
      </div>
    </div>
  );
};

export default OtherMessageContent;