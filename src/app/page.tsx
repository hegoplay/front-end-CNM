"use client";
import React, { useState } from "react";
import { Button, Flex, Input, Modal } from "antd";
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
import ChatContent from "@/components/chatContent/chatContent";
import "@ant-design/v5-patch-for-react-19";
import SearchInfo from "@/components/chatContent/search/searchInfo";

// Định nghĩa kiểu dữ liệu cho navigation item
interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const ChatApp: React.FC = () => {
  

  return (
    <div className="chat-app">
      {/* Thanh điều hướng bên trái */}

      {/* <div className="w-16 bg-blue-600 items-center flex justify-between flex-col py-3">
        <div className="w-full bg-blue-600 items-center flex justify-items-start flex-col gap-4">
          <IconButton
            icon={
              <img
                src="/avatar.jpg"
                className="w-11 h-11 rounded-full p-0.5 bg-white"
              />
            }
            size="none"
            onClick={() => {
              // Handle avatar click
              
            }}
            className="rounded-full"
            style={{ borderRadius: "50%" }}
          />
          <IconButton
            icon={<MessageOutlined style={{ fontSize: 24 }} />}
            onClick={() => {}}
            selected={true}
            selectedIcon={<MessageFilled style={{ fontSize: 24 }} />}
          />
          <IconButton
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            onClick={() => {}}
            selected={false}
          />
        </div>
        <div className="w-full bg-blue-600 items-center flex justify-items-end flex-col">
          <IconButton
            icon={<SettingOutlined style={{ fontSize: 24 }} />}
            onClick={() => {}}
            selected={false}
            selectedIcon={<SettingFilled style={{ fontSize: 24 }} />}
          />
        </div>
      </div> */}

      {/* Khu vực chính (để trống cho phần nhắn tin sau) */}
      <div className="main-content">
        {/* Danh sách tin nhắn đang chờ */}
        <div className="flex flex-col h-full w-150 border-gray-300 border-1">
          {/* Search area */}
          <SearchInfo/>
          {/* Chat list */}
          <div className="flex flex-col gap-2 border-t-1 overflow-y-auto scroll-smooth">
            {
              // Giả lập danh sách tin nhắn
              Array.from({ length: 10 }, (_, index) => (
                <UserBoxChat key={index} />
              ))
            }
          </div>
          {/* Thêm các mục chat khác ở đây */}
        </div>
        {/* Thông tin đoạn chat */}
        <ChatContent />
      </div>

      
    </div>
  );
};

export default ChatApp;
