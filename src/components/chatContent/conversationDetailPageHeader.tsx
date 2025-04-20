import React, { useMemo } from "react";
import IconButton from "../IconButton";
import { IoPersonAddOutline } from "react-icons/io5";
import { CiVideoOn } from "react-icons/ci";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { UserResponseDto } from "@/types/user";
import ActionButtons from "./navigation/ActionButton";
import { ConversationDetailDto } from "@/types/chat";

interface Props {
  conversation: ConversationDetailDto
  openMore?: boolean;
  setOpenMore?: React.Dispatch<React.SetStateAction<boolean>>;
  handleCall?: () => void;
}

const ConversationDetailPrivatePageHeader: React.FC<Props> = ({
  openMore,
  setOpenMore,
  handleCall,
  conversation,
}) => {
  if (!conversation) {
    return <div className="flex p-3 border-b-1 border-gray-300 gap-3" />;
  }

  return (
    <div className="flex p-3 border-b-1 border-gray-300 gap-3">
      <img
        src={conversation?.conversationImgUrl}
        className="w-12 h-12 rounded-full"
        // alt={conversation?.conversationName || "User avatar"}
      />
      <div className="flex flex-1 flex-col justify-around">
        <span className="text-black font-semibold">{conversation?.conversationName}</span>
        <span className="text-sm text-gray-500">...</span>
      </div>
      {
        <ActionButtons
          onMoreClick={() => {
            if (setOpenMore) {
              setOpenMore((prev) => !prev);
            }
          }}
          onVideoCallClick={handleCall}
        />
      }
    </div>
  );
};

export default ConversationDetailPrivatePageHeader;
