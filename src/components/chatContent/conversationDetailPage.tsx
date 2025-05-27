import React, { useLayoutEffect, useMemo, useState, useRef } from "react";
import { FiPaperclip, FiSend, FiX } from "react-icons/fi";
import { ConversationDetailDto, MessageResponse } from "@/types/chat";
import { useUser } from "@/context/UserContext";
import ConversationPageHeader from "./conversationDetailPageHeader";
import { Spin, message, Button } from "antd";
import { useOtherUserInfo } from "@/hooks/useOtherUserInfo";
import MessageList from "./messageType/MessageList";
import axios from "axios";
import RightMoreConversation from "./rightmore/RightMoreConversation";
import CallInvitation from "@/types/callInvitation";
import MessageSearch from "./search/MessageSearch";
import { FiMic, FiStopCircle } from "react-icons/fi";

interface Props {
  pressCall: () => void;
  conversation: ConversationDetailDto;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleStartRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
      setFile(new File([blob], "recording.webm", { type: "audio/webm" }));
      setIsRecording(false);
      stream.getTracks().forEach((track) => track.stop());
    };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }catch (err) {
      message.error("Không thể truy cập micro");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };


  // Đánh dấu cuộc trò chuyện là đã đọc khi tải trang
  useLayoutEffect(() => {
    if (props.conversation.id) {
      axios.post("/api/conversations/markAsRead", {
        conversationId: props.conversation.id,
      });
    }
  }, [props.conversation.id]);

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
    return props.conversation.participants?.find(
      (participant) => participant !== userInfo?.phoneNumber
    );
  }, [props.conversation.participants, userInfo?.phoneNumber]);

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
          file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/");
        const messageType = isMedia ? "MEDIA" : "FILE";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("senderId", userInfo?.phoneNumber || "");
        formData.append("conversationId", props.conversation.id || "");
        formData.append("type", messageType);
        const requestData = {
          senderId: userInfo?.phoneNumber,
          conversationId: props.conversation.id,
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

        if (requestData.replyTo) {
          formData.append("replyTo", requestData.replyTo);
        }
        // Log FormData for debugging

        console.log("FormData:", formData);

        const response = await axios.post("/api/messages/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Response:", response.data);
      } else {
        await axios.post("/api/messages/text", {
          senderId: userInfo.phoneNumber,
          conversationId: props.conversation.id,
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
    if (!props.conversation.id) return;

    props.pressCall();
  };

  // Xử lý tìm kiếm và focus tin nhắn
  const handleScrollToMessage = (messageId: string) => {
    setFocusedMessageId(messageId);
  };

  // Mở/đóng tìm kiếm
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setFocusedMessageId(null); // Reset focused message when toggling search
  };

  if (isLoading) return <Spin />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col h-full">
        {/* Header */}
        <ConversationPageHeader
          conversation={props.conversation}
          openMore={openMore}
          setOpenMore={setOpenMore}
          handleCall={handleCall}
          onSearchClick={toggleSearch}
        />

        {/* Khu vực tin nhắn */}
        <div className="flex flex-col flex-1 bg-gray-100 overflow-scroll">
          <MessageList
            conversation = {props.conversation}
            currentUserPhone={userInfo.phoneNumber}
            otherInfo={otherInfo || undefined}
            onReply={handleReply} // Truyền hàm xử lý trả lời
            focusedMessageId={focusedMessageId} // Truyền ID tin nhắn cần focus
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

                    {/* Nút ghi âm */}
          {!isRecording ? (
            <button
              className="p-2 rounded-full hover:bg-gray-200"
              onClick={handleStartRecording}
              disabled={isUploading}
              title="Ghi âm"
            >
              <FiMic className="text-gray-600" />
            </button>
          ) : (
            <button
              className="p-2 rounded-full hover:bg-red-200"
              onClick={handleStopRecording}
              title="Dừng ghi"
            >
              <FiStopCircle className="text-red-600" />
            </button>
          )}
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
                style={{
                  color: 'black'
                }}
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
      {openMore && <RightMoreConversation conversationInfo={props.conversation} />}
      
      {/* Hiển thị tìm kiếm tin nhắn */}
      {isSearchOpen && (
        <MessageSearch
          messages={props.conversation.messageDetails}
          onClose={toggleSearch}
          userInfo={userInfo}
          otherUserInfo={otherInfo || undefined}
          onScrollToMessage={handleScrollToMessage}
        />
      )}
    </div>
  );
};

export default ConversationDetailPage;
