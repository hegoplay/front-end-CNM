import { useUser } from "@/context/UserContext";
import { ConversationDto } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import React, { useLayoutEffect, useMemo } from "react";
import axios from "axios";
import { useOptimistic } from "react"; // Hook mới trong React 19

interface UserBoxChatProps extends ConversationDto {
  unreadCount?: number; // Đảm bảo prop này được định nghĩa
}

const ConversationBox: React.FC<UserBoxChatProps> = ({ ...props }) => {
  const { userInfo } = useUser();
  const [otherInfo, setOtherInfo] = React.useState<UserResponseDto | undefined>(undefined);

  // Sử dụng useOptimistic để quản lý unreadCount
  const [optimisticUnreadCount, setOptimisticUnreadCount] = useOptimistic(
    props.unreadCount || 0, // Giá trị thực tế ban đầu
    (currentUnreadCount: number, newUnreadCount: number) => newUnreadCount // Hàm cập nhật lạc quan
  );

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
      // Cập nhật lạc quan: đặt unreadCount về 0 ngay lập tức trên UI
      setOptimisticUnreadCount(0);

      try {
        // Gọi API để xử lý logic backend
        const res = await axios.get(`/api/conversations/initialize/${props.id}`);
        if (res.status === 200) {
          // API thành công, không cần làm gì thêm vì cập nhật lạc quan đã được áp dụng
          console.log("Conversation initialized successfully");
        } else {
          // Nếu API thất bại, hoàn nguyên trạng thái lạc quan về giá trị ban đầu
          setOptimisticUnreadCount(props.unreadCount || 0);
          console.error("Error initializing conversation:", res.data);
        }
      } catch (error) {
        // Xử lý lỗi API, hoàn nguyên trạng thái lạc quan
        setOptimisticUnreadCount(props.unreadCount || 0);
        console.error("Error initializing conversation:", error);
      }
    },
    [props.id, props.unreadCount, setOptimisticUnreadCount]
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
            ? props.messages[props.messages.length - 1] // Sửa lỗi truy cập index -1
            : "..."}
        </span>
      </div>
      <div className="flex flex-1 justify-end">
        {optimisticUnreadCount > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {optimisticUnreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationBox;