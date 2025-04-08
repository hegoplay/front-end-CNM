import React from "react";

interface UserBoxChatProps {
  id?: string;
}

const UserBoxChat : React.FC<UserBoxChatProps> = ({id}) => {
  return (
    <div className="flex items-center bg-transparent cursor-pointer hover:bg-gray-200 p-3" id={id}>
      <img src="/avatar.jpg" className="w-10 h-10 rounded-full mr-2" />
      <div className="flex flex-col">
        <span className="text-black">Người dùng 1</span>
        <span className="text-sm text-gray-500">Tin nhắn gần đây</span>
      </div>
    </div>
  );
};

export default UserBoxChat;
