"use client";
import React, { Suspense, useState } from "react";
import { Button, Flex, Input, Modal, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  MessageOutlined,
  PhoneOutlined,
  MessageFilled,
  SettingFilled,
} from "@ant-design/icons";
import "./ChatApp.css";
import IconButton from "@/components/IconButton";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoPersonAddOutline, IoPeopleOutline } from "react-icons/io5";
import UserBoxChat from "@/components/chatContent/userBoxChat";
import ConversationDetailPage from "@/components/chatContent/conversationDetailPage";
import "@ant-design/v5-patch-for-react-19";
import SearchInfo from "@/components/chatContent/search/searchInfo";
import Navbar from "@/components/navbar/Navbar";
import useSocket from "@/hooks/useSocket";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

// Định nghĩa kiểu dữ liệu cho navigation item
interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const ChatApp: React.FC<{ token: string }> = ({ token }) => {
  const { conversations, currentConversation } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL as string,
    token
  );

  console.log(currentConversation);

  return (
    <ReactQueryProvider>
      {/*Thanh này giúp xem thông tin cá nhân*/}
      <Navbar />
      <div className="chat-app">
        {/* Khu vực chính (để trống cho phần nhắn tin sau) */}
        <div className="main-content">
          {/* Danh sách tin nhắn đang chờ */}
          <div className="flex flex-col h-full w-150 border-gray-300 border-1">
            {/* Search area */}
            <SearchInfo />
            {/* Chat list */}
            <div className="flex flex-col gap-2 border-t-1 overflow-y-auto scroll-smooth">
              {conversations.map((conversation) => (
                <UserBoxChat {...conversation} key={conversation.id} />
              ))}
            </div>
            {/* Thêm các mục chat khác ở đây */}
          </div>
          {/* Thông tin đoạn chat */}

          {currentConversation ? (
            <Suspense fallback={<Spin tip="Loading" size="large"/>}>
              <ConversationDetailPage {...currentConversation} />
            </Suspense>
          ) : (
            <div className="flex flex-col h-full w-full justify-center align-center">
              <span className="text-black text-center"> PRO VJP</span>
            </div>
          )}
        </div>
      </div>
    </ReactQueryProvider>
  );
};

export default ChatApp;
