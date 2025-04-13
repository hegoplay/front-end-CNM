import AvatarImg from "@/components/AvatarImg";
import { MessageResponse } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import React from "react";

const OtherMessageContent: React.FC<{
  children: React.ReactNode;
  message: MessageResponse;
  userInfo?: UserResponseDto;
}> = ({ children, message, userInfo }) => {
  return (
    <>
      <AvatarImg imgUrl={!!userInfo ? userInfo.baseImg : "/avatar.jpg"} />
      <div className="flex flex-col items-start">
        <div className="flex flex-col bg-blue-400 text-white rounded-lg p-2 max-w-[80%]">
          {children}
        </div>
        <span className="text-xs text-gray-500">{message.createdAt}</span>
      </div>
    </>
  );
};

export default OtherMessageContent;
