import { MessageResponse } from "@/types/chat";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import MyMessageContent from "./MyMessageContent";
import OtherMessageContent from "./OtherMessageContent";
import TextChat from "./TextChat";
import { UserResponseDto } from "@/types/user";
import { useUser } from "@/context/UserContext";
import MediaChat from "./MediaChat";
import FileChat from "./FileChat";
import CallChat from "./CallChat";

interface MessageListProps {
  messages: MessageResponse[];
  currentUserPhone: string;
  otherInfo?: UserResponseDto;
  onReply?: (message: MessageResponse) => void;
  focusedMessageId?: string | null;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserPhone,
  otherInfo,
  onReply,
  focusedMessageId,
}) => {
  const { userInfo } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref cho container
  const focusedMessageRef = useRef<HTMLDivElement>(null); // Ref cho message đang focus

  // Hàm cuộn xuống dưới cùng
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Hàm cuộn đến message được focus
  const scrollToFocusedMessage = useCallback(() => {
    if (focusedMessageRef.current) {
      focusedMessageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Kiểm tra xem người dùng có đang ở gần dưới cùng không
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // Gần dưới cùng trong 100px
  }, []);

  // Cuộn đến message đang được focus hoặc xuống dưới cùng khi component mount
  useLayoutEffect(() => {
    if (focusedMessageId && messages.some(msg => msg.id === focusedMessageId)) {
      setTimeout(scrollToFocusedMessage, 100); // Thêm timeout để đảm bảo DOM đã render
    } else {
      scrollToBottom();
    }
  }, []);

  // Xử lý khi messages hoặc focusedMessageId thay đổi
  useEffect(() => {
    if (focusedMessageId && messages.some(msg => msg.id === focusedMessageId)) {
      scrollToFocusedMessage();
    } else if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages, focusedMessageId, scrollToBottom, isNearBottom, scrollToFocusedMessage]);

  const messageType = useCallback((message: MessageResponse) => {
    if (message.isRecalled) {
      return <span className="text-gray-300">Tin nhắn đã thu hồi</span>;
    }
    switch (message.type) {
      case "TEXT":
        return <TextChat message={message} />;
      case "MEDIA":
        return <MediaChat message={message} />;
      case "FILE":
        return <FileChat message={message} />;
      case "CALL":
        return <CallChat message={message} />;
      default:
        return <TextChat message={message} />;
    }
  }, []);

  const messageWrapper = useCallback(
    (message: MessageResponse) => {
      // Tìm tin nhắn gốc nếu có replyTo
      const repliedMessage = message.replyTo
        ? messages.find((msg) => msg.id === message.replyTo)
        : undefined;

      const content = (
        <>
          {repliedMessage && (
            <div className="bg-gray-100 text-sm p-2 rounded mb-1">
              <span className="font-semibold text-gray-700">
                {repliedMessage.senderId === currentUserPhone
                  ? "Bạn"
                  : otherInfo?.name || "Người dùng"}
                :{" "}
              </span>
              <span className="text-gray-600">
                {repliedMessage.isRecalled
                  ? "Tin nhắn đã thu hồi"
                  : repliedMessage.type === "TEXT"
                  ? repliedMessage.content
                  : repliedMessage.type === "MEDIA"
                  ? "Đã gửi một tệp đa phương tiện"
                  : repliedMessage.type === "FILE"
                  ? "Đã gửi một tệp"
                  : "Sự kiện cuộc gọi"}
              </span>
            </div>
          )}
          {messageType(message)}
        </>
      );

      if (message.senderId === currentUserPhone) {
        return (
          <MyMessageContent
            key={message.id}
            message={message}
            userInfo={userInfo || undefined}
            onReply={onReply}
          >
            {content}
          </MyMessageContent>
        );
      } else {
        return (
          <OtherMessageContent
            key={message.id}
            message={message}
            userInfo={otherInfo || undefined}
            onReply={onReply}
          >
            {content}
          </OtherMessageContent>
        );
      }
    },
    [currentUserPhone, userInfo, otherInfo, messageType, messages, onReply]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full p-4"
    >
      {messages.length > 0 ? (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              ref={focusedMessageId === message.id ? focusedMessageRef : null}
              className={`flex ${
                message.senderId === currentUserPhone
                  ? "justify-end"
                  : "justify-start"
              } mb-2 gap-4 ${focusedMessageId === message.id ? "bg-blue-100 rounded-lg p-1" : ""}`}
            >
              {messageWrapper(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Chưa có tin nhắn nào
        </div>
      )}
    </div>
  );
};

export default MessageList;
