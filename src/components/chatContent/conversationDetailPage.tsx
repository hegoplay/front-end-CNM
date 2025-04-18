import React, { useLayoutEffect, useMemo, useState, useRef } from "react";
import { FiPaperclip, FiSend, FiX } from "react-icons/fi";
import { ConversationDetailDto, MessageResponse } from "@/types/chat";
import { useUser } from "@/context/UserContext";
import ConversationDetailPrivatePageHeader from "./conversationDetailPageHeader";
import { Spin, message, Button } from "antd";
import { useOtherUserInfo } from "@/hooks/useOtherUserInfo";
import MessageList from "./messageType/MessageList";
import axios from "axios";
import RightMorePrivateConversation from "./rightmore/RightMoreConversation";
import CallInvitation from "@/types/callInvitation";

interface Props extends ConversationDetailDto {
  pressCall: () => void;
}

const ConversationDetailPage: React.FC<Props> = ({
  ...props
}) => {
  const { userInfo } = useUser();
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageResponse | null>(null); // Trạng thái tin nhắn đang trả lời
  const [openMore, setOpenMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Đánh dấu cuộc trò chuyện là đã đọc khi tải trang
  useLayoutEffect(() => {
    if (props.id) {
      axios.post("/api/conversations/markAsRead", {
        conversationId: props.id,
      });
    }
  }, [props.id]);

  // Kiểm tra nếu không có thông tin người dùng
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  }

  // Lấy số điện thoại của người kia
  const otherPhone = useMemo(() => {
    return props.participants?.find(
      (participant) => participant !== userInfo?.phoneNumber
    );
  }, [props.participants, userInfo?.phoneNumber]);

  const { data: otherInfo, isLoading, error } = useOtherUserInfo(otherPhone);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        message.error("Kích thước file tối đa là 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  // Xóa file đã chọn
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Xử lý chọn tin nhắn để trả lời
  const handleReply = (message: MessageResponse) => {
    setReplyingTo(message);
  };

  // Hủy trả lời
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputRef.current?.value.trim() && !file) return;

    try {
      setIsUploading(true);

      if (file) {
        const isMedia =
          file.type.startsWith("image/") || file.type.startsWith("video/");
        const messageType = isMedia ? "MEDIA" : "FILE";
        const formData = new FormData();
        formData.append("file", file);

        const requestData = {
          senderId: userInfo?.phoneNumber,
          conversationId: props.id,
          type: messageType,
          replyTo: replyingTo?.id, // Thêm replyTo
        };

        if (!requestData.senderId || !requestData.conversationId) {
          throw new Error("Thiếu senderId hoặc conversationId");
        }

        console.log("Client sending:", {
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          request: requestData,
        });

        formData.append("request", JSON.stringify(requestData));

        const response = await axios.post("/api/messages/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Response:", response.data);
      } else {
        await axios.post("/api/messages/text", {
          senderId: userInfo.phoneNumber,
          conversationId: props.id,
          content: inputRef.current?.value,
          type: "TEXT",
          replyTo: replyingTo?.id, // Thêm replyTo
        });
      }

      setMessageText("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setFile(null);
      setReplyingTo(null); // Xóa trạng thái trả lời
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      message.error("Gửi tin nhắn thất bại");
      console.error("Error sending message:", error);
      if (error) {
        console.log("Response error:", error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // xử lý cuộc gọi
  const handleCall = () => {
    if (!props.id) return;

    props.pressCall();
    
  };

  if (isLoading) return <Spin />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col h-full">
        {/* Header */}
        <ConversationDetailPrivatePageHeader
          otherInfo={otherInfo || undefined}
          openMore={openMore}
          setOpenMore={setOpenMore}
          handleCall={handleCall}
        />

        {/* Khu vực tin nhắn */}
        <div className="flex flex-col flex-1 bg-gray-100 overflow-scroll">
          <MessageList
            currentUserPhone={userInfo.phoneNumber}
            messages={props.messageDetails}
            otherInfo={otherInfo || undefined}
            onReply={handleReply} // Truyền hàm xử lý trả lời
          />
        </div>

        {/* Khu vực nhập tin nhắn */}
        <div className="p-3 border-t border-gray-300 bg-white">
          {/* Xem trước tin nhắn trả lời */}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
              <span className="truncate max-w-xs">
                <span className="font-semibold">
                  Trả lời{" "}
                  {replyingTo.senderId === userInfo.phoneNumber
                    ? "chính bạn"
                    : otherInfo?.name || "Người dùng"}
                  :{" "}
                </span>
                {replyingTo.isRecalled
                  ? "Tin nhắn đã thu hồi"
                  : replyingTo.type === "TEXT"
                  ? replyingTo.content
                  : replyingTo.type === "MEDIA"
                  ? "Đã gửi một tệp đa phương tiện"
                  : replyingTo.type === "FILE"
                  ? "Đã gửi một tệp"
                  : "Sự kiện cuộc gọi"}
              </span>
              <Button type="text" onClick={cancelReply}>
                <FiX />
              </Button>
            </div>
          )}

          {/* Hiển thị file đã chọn */}
          {file && (
            <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={removeFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 w-full min-w-0 flex-wrap">
            {/* Nút đính kèm file */}
            <button
              className="p-2 rounded-full hover:bg-gray-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiPaperclip className="text-gray-600" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="*"
              />
            </button>

            {/* Input nhập tin nhắn */}
            <div className="flex-1 relative min-w-0">
              <textarea
                // value={messageText}
                onChange={(e) => {
                  if (messageText.length == 0) setMessageText(e.target.value);
                  if (e.target.value.length == 0) setMessageText("");
                }}
                ref={inputRef}
                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 min-w-[50px] overflow-y-auto text-black"
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                rows={1}
                disabled={isUploading}
              />
            </div>

            {/* Nút gửi */}
            <button
              onClick={handleSendMessage}
              disabled={(!messageText.trim() && !file) || isUploading}
              className={`p-2 rounded-full ${
                (messageText.trim() || file) && !isUploading
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <Spin size="small" />
              ) : (
                <FiSend className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Hiển thị thông tin người dùng khác */}
      {openMore && <RightMorePrivateConversation conversationInfo={props} />}
    </div>
  );
};

export default ConversationDetailPage;
