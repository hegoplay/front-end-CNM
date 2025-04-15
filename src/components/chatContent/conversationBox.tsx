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
  const [otherInfo, setOtherInfo] = React.useState<UserResponseDto | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(props.unreadCount || 0); // Use useState instead of useOptimistic

  useLayoutEffect(() => {
    const otherPhone = props.participants.find(
      (participant) => participant !== userInfo?.phoneNumber
    );
    fetch(`/api/users/get-info/${otherPhone}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOtherInfo(data.message);
        } else {
          console.error("Error fetching user info:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  }, [props.participants, userInfo?.phoneNumber]);

  const handleOnPress = useMemo(
    () => async () => {
      // Update unreadCount immediately
      setUnreadCount(0);

      try {
        // Call API to handle backend logic
        const res = await axios.get(`/api/conversations/initialize/${props.id}`);
        if (res.status === 200) {
          console.log("Conversation initialized successfully");
        } else {
          // If API fails, revert the unreadCount
          setUnreadCount(props.unreadCount || 0);
          console.error("Error initializing conversation:", res.data);
        }
      } catch (error) {
        // Handle API error, revert the unreadCount
        setUnreadCount(props.unreadCount || 0);
        console.error("Error initializing conversation:", error);
      }
    },
    [props.id, props.unreadCount]
  );

  return (
    <div
      className="flex items-center bg-transparent cursor-pointer hover:bg-gray-200 p-3"
      id={props.id}
      key={props.id}
      onClick={handleOnPress}
    >
      <img
        src={otherInfo?.baseImg || "/avatar.jpg"}
        className="w-10 h-10 rounded-full mr-2"
      />
      <div className="flex flex-col">
        <span className="text-black">
          {otherInfo ? otherInfo.name : "Loading..."}
        </span>
        <span className="text-sm text-gray-500">
          {props.messages && props.messages.length > 0
            ? props.messages[props.messages.length - 1]
            : "..."}
        </span>
      </div>
      <div className="flex flex-1 justify-end">
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationBox;