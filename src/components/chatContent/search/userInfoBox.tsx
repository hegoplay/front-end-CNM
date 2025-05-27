import UserInfoProps from "@/models/UserInfoProps";
import { Button, message } from "antd";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { BasicResponse } from "@/types/utils";

const UserInfoBox: React.FC<UserInfoProps> = ({ ...props }) => {
  const { userInfo } = useUser();
  const [relationshipStatus, setRelationshipStatus] = useState<"not_friends" | "pending" | "friends" | "self">(
    "not_friends"
  );
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái quan hệ khi component mount hoặc phoneNumber thay đổi
  useEffect(() => {
    const trimPhone = props.phoneNumber?.trim();

    if (!trimPhone) {
      message.error("Không tìm thấy số điện thoại để kiểm tra trạng thái");
      return;
    }
    if (trimPhone === userInfo?.phoneNumber) {
      setRelationshipStatus("self");
      return;
    }

    const checkStatus = async () => {
      try {
        const friendResponse = await fetch(`/api/friends/check-friend-status/${trimPhone}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const friendData = await friendResponse.json() as BasicResponse;

        if (friendData.success && friendData.data.isFriend) {
          setRelationshipStatus("friends");
          return;
        }

        const requestResponse = await fetch(`/api/friends/check-request-status/${trimPhone}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const requestData = await requestResponse.json() as BasicResponse;

        if (requestData.success && requestData.data.isPending) {
          setRelationshipStatus("pending");
        } else {
          setRelationshipStatus("not_friends");
        }
      } catch (error) {
        console.error("Error checking relationship status:", error);
        message.error("Lỗi khi kiểm tra trạng thái quan hệ");
      }
    };

    checkStatus();
  }, [props.phoneNumber, userInfo]);

  // Xử lý gửi yêu cầu kết bạn
  const handleSendFriendRequest = async () => {
    const trimPhone = props.phoneNumber?.trim();
    if (!trimPhone) {
      message.error("Không tìm thấy số điện thoại để gửi yêu cầu");
      return;
    }

    if (trimPhone === userInfo?.phoneNumber) {
      message.error("Bạn không thể gửi yêu cầu kết bạn cho chính mình");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/friends/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverPhone: trimPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.data || "Gửi yêu cầu kết bạn thành công");
        setRelationshipStatus("pending");
      } else {
        message.error(data.message || "Gửi yêu cầu kết bạn thất bại");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      message.error("Lỗi khi gửi yêu cầu kết bạn");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy yêu cầu kết bạn
  const handleCancelFriendRequest = async () => {
    const trimPhone = props.phoneNumber?.trim();
    if (!trimPhone) {
      message.error("Không tìm thấy số điện thoại để hủy yêu cầu");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/friends/cancel-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderPhoneNumber: trimPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.data || "Hủy yêu cầu kết bạn thành công");
        setRelationshipStatus("not_friends");
      } else {
        message.error(data.message || "Hủy yêu cầu kết bạn thất bại");
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
      message.error("Lỗi khi hủy yêu cầu kết bạn");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy kết bạn
  const handleUnfriend = async () => {
    const trimPhone = props.phoneNumber?.trim();
    if (!trimPhone) {
      message.error("Không tìm thấy số điện thoại để hủy kết bạn");
      return;
    }

    // Hiển thị hộp thoại xác nhận
    if (!window.confirm("Bạn có chắc muốn hủy kết bạn với người này không?")) {
      return; // Nếu người dùng nhấn "Cancel", dừng lại
    }

    setLoading(true);
    try {
      const response = await fetch("/api/friends/remove-friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendPhone: trimPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.data || "Hủy kết bạn thành công");
        setRelationshipStatus("not_friends");
      } else {
        message.error(data.message || "Hủy kết bạn thất bại");
      }
    } catch (error) {
      console.error("Error unfriending:", error);
      message.error("Lỗi khi hủy kết bạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-150 flex flex-col">
      <img
        src={props.backgroundImg || "/default-background.jpg"}
        className="w-[calc(100%+3rem)] h-40 object-cover mx-[-1.5rem] overflow-x-visible max-w-[calc(100%+3rem)] bg-gray-200 border-0"
        alt="Background"
      />
      <div className="flex flex-col -mt-3 justify-items-start gap-4">
        <div className="flex gap-3 items-center">
          <img
            src={props.baseImg || "/default-avatar.png"}
            className="w-20 h-20 rounded-full border-2 border-white font-bold"
            alt="Avatar"
          />
          <h3 className="text-black font-semibold max-w-[60%]" style={{ margin: 0 }}>
            {props.name || "Không có tên"}
          </h3>
          {relationshipStatus === "friends" ? (
            <div className="flex gap-2">
              <Button type="primary" disabled={loading}>
                Chat
              </Button>
              <Button type="text" onClick={handleUnfriend} loading={loading} >
                Hủy kết bạn
              </Button>
            </div>
          ) : relationshipStatus === "pending" ? (
            <Button type="text" onClick={handleCancelFriendRequest} loading={loading}>
              Hủy yêu cầu
            </Button>
          ) : relationshipStatus === "self" ? null : (
            <Button type="text" onClick={handleSendFriendRequest} loading={loading}>
              Kết bạn
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Trạng thái</span>
          <p className="text-sm">{props.online ? "Online" : "Offline"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Giới thiệu</span>
          <p className="text-sm">{props.bio || "Không có giới thiệu"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Giới tính</span>
          <p className="text-sm">
            {props.isMale ? "Nam" : props.isMale === false ? "Nữ" : "Không xác định"}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Ngày sinh</span>
          <p className="text-sm">{props.dateOfBirth || "Không có ngày sinh"}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Điện thoại</span>
          <p className="text-sm">{props.phoneNumber || "Không có số điện thoại"}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoBox;