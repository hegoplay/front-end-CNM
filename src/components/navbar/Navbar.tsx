"use client";
import { Button, Divider, Dropdown, message, Space, theme } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import type { MenuProps } from "antd";
import { useUser } from "@/context/UserContext";

const { useToken } = theme;

const Navbar = () => {
  const router = useRouter();
  const { token } = useToken();
  const { logout, userInfo } = useUser();

  // Tạo items động dựa trên userInfo
  const items: MenuProps["items"] = [
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
          thay đổi mật khẩu
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
        <Dropdown
          menu={{ items }}
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
            src={userInfo?.baseImg || "/default-avatar.png"} // Thêm fallback nếu baseImg không có
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