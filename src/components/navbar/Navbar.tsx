"use client";
import { Button, Divider, Dropdown, message, Space, theme, Badge } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { MenuProps } from "antd";
import { useUser } from "@/context/UserContext";
import { BellOutlined } from "@ant-design/icons"; // Thêm biểu tượng chuông
import { UserResponseDto } from "@/types/user";
import '@ant-design/v5-patch-for-react-19';

const { useToken } = theme;

interface FriendRequest {
  id: string;
  senderPhoneNumber: string;
  senderName: string;
  createdAt: string;
}

const Navbar = () => {
  const router = useRouter();
  const { token } = useToken();
  const { logout, userInfo } = useUser();
  const [friendRequests, setFriendRequests] = useState<UserResponseDto[]>([]); // State để lưu danh sách yêu cầu kết bạn

  // Lấy danh sách yêu cầu kết bạn từ API
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await fetch("/api/friends/get-friend-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFriendRequests(data.requests || []);
        } else {
          message.error("Không thể tải danh sách yêu cầu kết bạn");
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        message.error("Lỗi khi tải danh sách yêu cầu kết bạn");
      }
    };

    if (userInfo) {
      fetchFriendRequests();
    }
  }, [userInfo]);

  // Xử lý chấp nhận yêu cầu kết bạn
  const handleAcceptRequest = async (responsePhone: string) => {
    try {
      const trimPhone = responsePhone.trim();
      const response = await fetch("/api/friends/accept-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responsePhone: trimPhone }),
      });

      if (response.ok) {
        message.success("Chấp nhận yêu cầu kết bạn thành công");
        setFriendRequests((prev) =>
          prev.filter((req) => req.phoneNumber !== responsePhone)
        );
      } else {
        message.error("Chấp nhận yêu cầu kết bạn thất bại");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      message.error("Lỗi khi chấp nhận yêu cầu kết bạn");
    }
  };

  // Xử lý từ chối yêu cầu kết bạn
  const handleRejectRequest = async (senderPhoneNumber: string) => {
    try {
      const response = await fetch("/api/friends/reject-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1]}`,
        },
        body: JSON.stringify({ senderPhoneNumber }),
      });

      if (response.ok) {
        message.success("Từ chối yêu cầu kết bạn thành công");
        setFriendRequests((prev) =>
          prev.filter((req) => req.phoneNumber !== senderPhoneNumber)
        );
      } else {
        message.error("Từ chối yêu cầu kết bạn thất bại");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      message.error("Lỗi khi từ chối yêu cầu kết bạn");
    }
  };

  // Tạo items cho dropdown yêu cầu kết bạn
  const friendRequestItems: MenuProps["items"] = friendRequests.length
    ? friendRequests.map((request) => ({
        key: request.phoneNumber,
        label: (
          <div className="flex justify-between items-center gap-2">
            <span>{request.name} ({request.phoneNumber})</span>
            <div>
              <Button
                type="link"
                onClick={() => handleAcceptRequest(request.phoneNumber)}
              >
                Chấp nhận
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleRejectRequest(request.phoneNumber)}
              >
                Từ chối
              </Button>
            </div>
          </div>
        ),
      }))
    : [
        {
          key: "no-requests",
          label: <span>Không có yêu cầu kết bạn</span>,
        },
      ];

  // Tạo items động dựa trên userInfo
  const userMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Link href={"/users/" + userInfo?.phoneNumber}>
          Thông tin cá nhân {userInfo?.name ? `(${userInfo.name})` : ""}
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link rel="noopener noreferrer" href="/settings/user">
          Thay đổi thông tin
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link rel="noopener noreferrer" href="/settings/changePassword">
          Thay đổi mật khẩu
        </Link>
      ),
    },
  ];

  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: "none",
  };

  return (
    <div className="flex justify-between items-center h-16 bg-red-50 w-full px-10 gap-4 sticky top-0">
      <div className="flex justify-start items-center">
        <Link href="/">
          <h3 className="text-2xl font-bold text-red-500">Zala</h3>
        </Link>
      </div>

      <div className="flex justify-end items-center gap-4">
        {/* Thêm Dropdown cho yêu cầu kết bạn với biểu tượng chuông */}
        <Dropdown
          menu={{ items: friendRequestItems }}
          dropdownRender={(menu) => (
            <div style={contentStyle}>
              {React.cloneElement(
                menu as React.ReactElement<{ style: React.CSSProperties }>,
                { style: menuStyle }
              )}
            </div>
          )}
        >
          <Badge count={friendRequests.length} offset={[10, 0]}>
            <BellOutlined
              style={{ fontSize: "24px", cursor: "pointer" }}
              className="text-gray-600 hover:text-gray-800"
            />
          </Badge>
        </Dropdown>

        {/* Dropdown người dùng hiện tại */}
        <Dropdown
          menu={{ items: userMenuItems }}
          dropdownRender={(menu) => (
            <div style={contentStyle}>
              {React.cloneElement(
                menu as React.ReactElement<{ style: React.CSSProperties }>,
                { style: menuStyle }
              )}
              <Divider style={{ margin: 0 }} />
              <Space style={{ padding: 8 }}>
                <Button danger type="link">
                  Xóa tài khoản
                </Button>
              </Space>
            </div>
          )}
        >
          <img
            src={userInfo?.baseImg || "/default-avatar.png"}
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
        </Dropdown>

        <Link href="/">
          <Button
            danger
            onClick={async () => {
              const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              });
              if (response.ok) {
                message.success("Đăng xuất thành công");
                logout();
                router.push("/login");
              } else {
                message.error("Đăng xuất thất bại");
              }
            }}
          >
            Đăng xuất
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;