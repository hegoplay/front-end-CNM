"use client";

import { Input, message, Modal } from "antd";
import React, { use, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import IconButton from "../../IconButton";
import { IoPeopleOutline, IoPersonAddOutline } from "react-icons/io5";
import SearchBox from "./searchBox";
import { on } from "events";
import UserInfoBox from "./userInfoBox";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { MdOutlineGroupAdd } from "react-icons/md";

interface ModalItem {
  title?: string;
  content?: React.ReactNode;
  submitTitle?: string;
  cancelTitle?: string;
  onOkFn?: () => void;
  onCancelFn?: () => void;
  onCloseFn?: () => void;
}

const SearchInfo = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  
  const values: ModalItem[] = [
    {
      title: "Thêm bạn",
      content: <SearchBox phoneRef={phoneRef} />,
      submitTitle: "Tìm kiếm",
      cancelTitle: "Hủy",
      onOkFn: async () => {
        const phoneInput = phoneRef.current;
        if (!phoneInput) return;

        const phone = phoneInput.value.trim();
        if (!phone) {
          message.error("Vui lòng nhập số điện thoại");
          return;
        }

        try {
          const response = await fetch(`/api/users/get-info/${phone}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json", // Có thể bỏ nếu không cần
            },
          });

          // console.log(response);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `API error: ${response.status}`
            );
          }

          const data = await response.json();

          if (data.success) {
            setUserData(data.message);

            setIndex(1);
          } else {
            message.error(data.message || "Không tìm thấy thông tin");
          }
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi tìm kiếm"
          );
        }
      },
      onCancelFn: () => {
        if (phoneRef.current) {
          phoneRef.current.value = "";
        }
        hideModal();
        setIndex(0);
      },
      onCloseFn: () => {
        if (phoneRef.current) {
          phoneRef.current.value = "";
        }
        hideModal();
        setIndex(0);
      },
    },
    {
      title: "Thông tin tài khoản",
      content: <UserInfoBox {...userData} />,
      submitTitle: "Tìm kiếm",
      cancelTitle: "Trờ về",
      onCloseFn: () => {
        if (phoneRef.current) {
          phoneRef.current.value = "";
        }
        setIndex(0);
        hideModal();
      },
      onCancelFn() {
        if (phoneRef.current) {
          phoneRef.current.value = "";
        }
        setIndex(0);
      },
    },
  ];

  const showModal = () => {
    setOpen(true);
  };

  const hideModal = () => {
    if (phoneRef.current) {
      phoneRef.current.value = "";
    }
    setOpen(false);
  };
  return (
    <>
      <div className="flex items-center  p-2 border-gray-300 border-b-1 gap-2 overflow-auto">
        {/* cái này sẽ triển khai để quản lý thông tin người dùng */}

        <Input
          type="text"
          placeholder="Tìm kiếm..."
          prefix={<FaMagnifyingGlass />}
        />
        <IconButton
          icon={<IoPersonAddOutline style={{ fontSize: 20, color: "black" }} />}
          onClick={() => {
            showModal();
            setIndex(0);
          }}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
        <IconButton
          icon={<MdOutlineGroupAdd style={{ fontSize: 20, color: "black" }} />}
          onClick={() => {}}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
        <IconButton
          icon={<IoPeopleOutline style={{ fontSize: 20, color: "black" }} />}
          onClick={() => {}}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
      </div>
      {/* Modal */}
      <Modal
        open={open}
        onClose={values[index].onCloseFn}
        onCancel={values[index].onCancelFn}
        onOk={values[index].onOkFn}
        // className="relative z-50"
        title={values[index].title}
        okText={values[index].submitTitle}
        cancelText={values[index].cancelTitle}
        footer={index === 1 ? null : undefined}
      >
        {values[index].content}
      </Modal>
    </>
  );
};

export default SearchInfo;
