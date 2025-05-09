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
import { useRouter } from "next/navigation";
import { UserResponseDto } from "@/types/user";
import { useUser } from "@/context/UserContext";
import { useFindUser } from "@/context/FindUserModelContext";

interface ModalItem {
  title?: string;
  content?: React.ReactNode;
  submitTitle?: string;
  cancelTitle?: string;
  onOkFn?: () => void;
  onCancelFn?: () => void;
  onCloseFn?: () => void;
}

interface ModalCreateGroupItem {
  title?: string;
  content?: React.ReactNode;
  submitTitle?: string;
  cancelTitle?: string;
  onOkGrFn?: () => void;
  onCancelGrFn?: () => void;
  onCloseGrFn?: () => void;
}

const SearchInfo = () => {
  // const [open, setOpen] = useState(false);
  const { modelOpen, setModelOpen, userPhoneRef } = useFindUser();
  const [index, setIndex] = useState(0);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [indexGr, setIndexGr] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  // const phoneRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [friends, setFriends] = useState<UserResponseDto[]>([]);
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  // const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;
  // có khả năng sẽ bị lỗi trong tương lai
  const { userInfo } = useUser();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/friends/get-friends-list"); // Thay bằng endpoint API thực tế
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const data = await response.json();
        console.log(data);
        setFriends(data.data); // Giả sử API trả về danh sách bạn bè

        if (friends.length === 0) {
          console.log("Không có bạn bè nào");
          return;
        }

        data.data.forEach((friend: UserResponseDto) => {
          console.log("Số điện thoại:", friend.phoneNumber);
        });
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [openCreateGroup]);

  const valuesCreateGroup: ModalCreateGroupItem[] = [
    {
      title: "Tạo nhóm",
      content: (
        <div>
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              htmlFor="upload-avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div>Chưa có ảnh</div>
              )}
            </label>
            <input
              id="upload-avatar"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImage(file); // setSelectedImage sẽ nhận kiểu File
                }
              }}
            />

            <Input
              type="text"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)} // Cập nhật tên nhóm
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>
          {/* <div>
            <Input
              type="text"
              placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div> */}
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px" }}>Danh sách bạn bè</h4>

            {friends.length > 0 &&
              friends.map((user, index) => {
                if (!user) return null; // Kiểm tra nếu user không tồn tại
                return (
                  <label
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(user.phoneNumber)}
                      onChange={() =>
                        setSelectedFriends((prev) =>
                          prev.includes(user.phoneNumber)
                            ? prev.filter((phoneNumber) => phoneNumber !== user.phoneNumber)
                            : [...prev, user.phoneNumber]
                        )
                      }
                      style={{ marginRight: "10px" }}
                    />
                    <img
                      src={user.baseImg}
                      alt={user.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <span>{user.name}</span>
                  </label>
                );
              })}
          </div>
        </div>
      ),
      submitTitle: "Tạo nhóm",
      cancelTitle: "Hủy",
      onOkGrFn: async () => {
        // Log tên nhóm khi nhấn "Tạo nhóm"
        console.log("Tên nhóm:", groupName);
        console.log("Danh sách bạn bè đã chọn:", selectedFriends);
        console.log("Hình ảnh đã chọn:", selectedImage);
        console.log("Danh sách số điện thoại đã chọn:", selectedFriends);
        let formData = new FormData();
        formData.append("name", groupName);
        let memberIds = selectedFriends.map((phone) => phone.trim());
        memberIds.push(userInfo?.phoneNumber || ""); // Thêm số điện thoại của người tạo nhóm vào danh sách
        formData.append("memberIds", JSON.stringify(memberIds));
        if (selectedImage) {
          formData.append("baseImg", selectedImage);
        }
        const response = await fetch("/api/conversations/group", {
          method: "POST",
          body: formData,
        });
        if(!response.ok) {
          message.error("Tạo nhóm không thành công");
          return;
        }
        message.success("Nhóm đã được tạo thành công!");
        hideCreateGroupModal();
      },
      onCancelGrFn: () => {
        hideCreateGroupModal();
      },
    },
  ];

  const values: ModalItem[] = [
    {
      title: "Thêm bạn",
      content: <SearchBox phoneRef={userPhoneRef} />,
      submitTitle: "Tìm kiếm",
      cancelTitle: "Hủy",
      onOkFn: async () => {
        const phoneInput = userPhoneRef.current;
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
        if (userPhoneRef.current) {
          userPhoneRef.current.value = "";
        }
        hideModal();
        setIndex(0);
      },
      onCloseFn: () => {
        if (userPhoneRef.current) {
          userPhoneRef.current.value = "";
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
        if (userPhoneRef.current) {
          userPhoneRef.current.value = "";
        }
        setIndex(0);
        hideModal();
      },
      onCancelFn() {
        if (userPhoneRef.current) {
          userPhoneRef.current.value = "";
        }
        setIndex(0);
      },
    },
  ];

  const showModal = () => {
    setModelOpen(true);
  };

  const hideModal = () => {
    if (userPhoneRef.current) {
      userPhoneRef.current.value = "";
    }
    setModelOpen(false);
  };

  const showCreateGroupModal = () => {
    setOpenCreateGroup(true);
    console.log("showCreateGroupModal");
  };

  const hideCreateGroupModal = () => {
    setOpenCreateGroup(false);
    setSelectedFriend(null);
    setSelectedFriends([]);
    setSelectedImage(null);
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
          onClick={() => {
            // router.push("/groups")
            showCreateGroupModal();
            setIndexGr(0);
          }}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
        {/* <IconButton
          icon={<IoPeopleOutline style={{ fontSize: 20, color: "black" }} />}
          onClick={() => {
            router.push("/friends");
          }}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        /> */}
      </div>
      {/* Modal */}
      <Modal
        open={modelOpen}
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

      <Modal
        open={openCreateGroup}
        // onCancel={valuesCreateGroup[indexGr].onCancelGrFn}
        // onClose={valuesCreateGroup[indexGr].onCloseGrFn}
        onCancel={hideCreateGroupModal}
        onClose={hideCreateGroupModal}
        onOk={valuesCreateGroup[indexGr].onOkGrFn}
        title={valuesCreateGroup[indexGr].title}
        okText={valuesCreateGroup[indexGr].submitTitle}
        cancelText={valuesCreateGroup[indexGr].cancelTitle}
      >
        {valuesCreateGroup[indexGr].content}
      </Modal>
    </>
  );
};

export default SearchInfo;
