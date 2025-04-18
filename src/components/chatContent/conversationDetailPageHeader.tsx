import React, { useMemo } from "react";
import IconButton from "../IconButton";
import { IoPersonAddOutline } from "react-icons/io5";
import { CiVideoOn } from "react-icons/ci";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { UserResponseDto } from "@/types/user";
import ActionButtons from "./navigation/ActionButton";

interface Props {
  otherInfo?: UserResponseDto;
  openMore?: boolean;
  setOpenMore?: React.Dispatch<React.SetStateAction<boolean>>;
  handleCall?: () => void;
}

const ConversationDetailPrivatePageHeader: React.FC<Props> = ({
  otherInfo,
  openMore,
  setOpenMore,
  handleCall,
}) => {
  if (!otherInfo) {
    return <div className="flex p-3 border-b-1 border-gray-300 gap-3" />;
  }

  return (
    <div className="flex p-3 border-b-1 border-gray-300 gap-3">
      <img
        src={otherInfo?.baseImg}
        className="w-12 h-12 rounded-full"
        alt={otherInfo?.name || "User avatar"}
      />
      <div className="flex flex-1 flex-col justify-around">
        <span className="text-black font-semibold">{otherInfo?.name}</span>
        <span className="text-sm text-gray-500">{otherInfo?.status}</span>
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
