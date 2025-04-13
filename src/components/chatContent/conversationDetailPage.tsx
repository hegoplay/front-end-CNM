import React, { useLayoutEffect, useMemo, useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { ConversationDetailDto } from "@/types/chat";
import { useUser } from "@/context/UserContext";
import ConversationDetailPrivatePageHeader from "./conversationDetailPageHeader";
import TextArea from "antd/es/input/TextArea";
// import MessageList from "./message/MessageList";
import { Spin } from "antd";
import { useOtherUserInfo } from "@/hooks/useOtherUserInfo";
import MessageList from "./messageType/MessageList";
import axios from "axios";

const ConversationDetailPage: React.FC<ConversationDetailDto> = ({ ...props }) => {
  const { userInfo } = useUser();
  // Sử dụng useMemo để tránh tính toán lại khi dependencies không thay đổi
  if (!userInfo) {
    return <div className="flex items-center justify-center h-full"><Spin></Spin></div>;
  }
  const otherPhone = useMemo(() => {
    return props.participants?.find((participant) => participant !== userInfo?.phoneNumber);
  }, [props.participants, userInfo?.phoneNumber]);

  const { data: otherInfo, isLoading, error } = useOtherUserInfo(otherPhone);
  const [message, setMessage] = useState("");
  

  const handleSendMessage = async () => {
    if (message.trim()) {
      axios.post("/api/messages/text", {
        senderId: userInfo.phoneNumber,
        conversationId: props.id,
        content: message,
        type: "TEXT",
      })
      // TODO: Xử lý gửi tin nhắn
      setMessage("");
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isLoading) return <Spin />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <ConversationDetailPrivatePageHeader otherInfo={!!otherInfo ? otherInfo : undefined} />
      
      {/* Khu vực tin nhắn */}
      <div className="flex flex-col flex-1 overflow-y-auto bg-gray-100 p-4">
        {/* Các tin nhắn sẽ hiển thị ở đây */}
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <MessageList currentUserPhone={userInfo.phoneNumber} messages={props.messageDetails} otherInfo={!!otherInfo ? otherInfo : undefined}/>
        </div>
      </div>
      
      {/* Khu vực nhập tin nhắn */}
      <div className="p-3 border-t border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          {/* Nút đính kèm (chưa xử lý) */}
          <button className="p-2 rounded-full hover:bg-gray-200">
            <FiPaperclip className="text-gray-600" />
          </button>
          
          {/* Input nhập tin nhắn */}
          <div className="flex-1 relative">
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              rows={1}
            />
          </div>
          
          {/* Nút gửi */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${message.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            <FiSend className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;