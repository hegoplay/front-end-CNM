import { useUser } from "@/context/UserContext";
import { ConversationDto } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import React, { useLayoutEffect, useMemo, useState } from "react";
import axios from "axios";

interface UserBoxChatProps extends ConversationDto {
  unreadCount?: number;
}

const ConversationBox: React.FC<UserBoxChatProps> = ({ ...props }) => {
  const { userInfo } = useUser();
  // const [otherInfo, setOtherInfo] = React.useState<UserResponseDto | undefined>(
  //   undefined
  // );
  // useLayoutEffect(() => {
  //   const otherPhone = props.participants.find(
  //     (participant) => participant !== userInfo?.phoneNumber
  //   );
  //   fetch(`/api/users/get-info/${otherPhone}`, {
  //     method: "GET",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.success) {
  //         setOtherInfo(data.message);
  //       } else {
  //         console.error("Error fetching user info:", data.message);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user info:", error);
  //     });
  // }, [props.participants, userInfo?.phoneNumber]);

  const handleOnPress = useMemo(
    () => async () => {
      // Update unreadCount immediately

      try {
        // Call API to handle backend logic
        const res = await axios.get(
          `/api/conversations/initialize/${props.id}`
        );
        if (res.status === 200) {
          console.log("Conversation initialized successfully");
        } else {
          // If API fails, revert the unreadCount
          console.error("Error initializing conversation:", res.data);
        }
      } catch (error) {
        // Handle API error, revert the unreadCount
        console.error("Error initializing conversation:", error);
      }
    },
    [props.id, props.unreadCount]
  );

  const printLastMessage = useMemo((): string => {
    const whoIsSender = props.lastMessage?.senderId === userInfo?.phoneNumber;

    const isMedia =
      props.lastMessage?.type === "MEDIA" || props.lastMessage?.type === "FILE";

    const isText = props.lastMessage?.type === "TEXT";

    let label = isText ? (whoIsSender ? "Bạn: " : "") : "";

    if (isMedia) {
      label = label + "Đã gửi một tệp đính kèm";
    } else if (isText) {
      label = label + props.lastMessage.content;
    } else {
      label = label + "Đã tạo Cuộc gọi";
    }

    if (props.lastMessage) {
      return label;
    } else {
      return "hãy bắt đầu cuộc hội thoại";
    }
  }, [props.lastMessage]);

  return (
    <div
      className="flex items-center bg-transparent cursor-pointer hover:bg-gray-200 p-3"
      id={props.id}
      key={props.id}
      onClick={handleOnPress}
    >
      <img
        src={props.conversationImgUrl || "/avatar.jpg"}
        className="w-10 h-10 rounded-full mr-2"
      />
      <div className="flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="text-black">
            {props.conversationName ? props.conversationName : "Loading..."}
          </span>
          <span className="text-sm text-gray-500">{props.updatedAt}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex-1">
            {printLastMessage}
          </span>
          <div className="mx-2">
            {(props.unreadCount || 0) > 0 && (
              <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {props.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
