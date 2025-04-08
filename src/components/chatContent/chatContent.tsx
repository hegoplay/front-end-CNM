import React from "react";
import IconButton from "../IconButton";
import { IoPersonAddOutline } from "react-icons/io5";
import { CiVideoOn } from "react-icons/ci";
import { FaMagnifyingGlass } from "react-icons/fa6";

interface ChatContentProps {
  name?: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
}

const ChatContent : React.FC<ChatContentProps> = ({...props}) => {
  props.name = "Người dùng 1";
  return (
    <div className="flex flex-col h-full w-full ">
      {/* header */}
      <div className="flex p-3 border-b-1 border-gray-300 gap-3">
        <img src="/avatar.jpg" className="w-12 h-12 rounded-full" />
        <div className="flex flex-1 flex-col justify-around">
          <span className="text-black font-semibold">{props.name}</span>
          <span className="text-sm text-gray-500">Trạng thái</span>
        </div>
        <div className="flex items-center gap-3">
          <IconButton
            icon={
              <IoPersonAddOutline style={{ fontSize: 20, color: "black" }} />
            }
            onClick={() => {}}
            selected={false}
            className="bg-white hover:bg-gray-200"
            size="sm"
          />
          <IconButton
            icon={
              <CiVideoOn style={{ fontSize: 20, color: "black" }} />
            }
            onClick={() => {}}
            selected={false}
            className="bg-white hover:bg-gray-200"
            size="sm"
          />
          <IconButton
            icon={
              <FaMagnifyingGlass style={{ fontSize: 20, color: "black" }} />
            }
            onClick={() => {}}
            selected={false}
            className="bg-white hover:bg-gray-200"
            size="sm"
          />
        </div>
      </div>
      {/* content */}
      <div className="flex flex-col flex-1 overflow-y-auto bg-gray-100">

      </div>
    </div>
  );
};

export default ChatContent;
