import AvatarImg from "@/components/AvatarImg";
import { MemberDto } from "@/types/chat";
import { Button, message } from "antd";
import { useRouter } from "next/navigation";
import { FaDoorOpen, FaPlus, FaMinus } from "react-icons/fa6";
import React from "react";
import { useUser } from "@/context/UserContext";

interface Props extends MemberDto {
  // role là của người đang sử dụng
  role?: "admin" | "member" | "leader";
  handleLeaveRoom: () => void;
  conversationId: string;
}

const MemberItem: React.FC<Props> = ({ ...props }) => {
  const router = useRouter();
  const { userInfo } = useUser();

  console.log("MemberItem", props);

  const memberTitle = () => {
    let temp = "";
    if (props.isLeader && props.isAdmin) {
      temp = "Leader & Admin";
    } else if (props.isLeader) {
      temp = "Leader";
    } else if (props.isAdmin) {
      temp = "Admin";
    } else temp = "Member";
    return <span className="text-xs text-gray-500">{temp}</span>;
  };

  const handleOutRoomOperation = async () => {
    // xử lý người dùng muốn rời khỏi phòng
    if (props.phoneNumber === userInfo?.phoneNumber) {
      props.handleLeaveRoom();
      console.log("Người dùng đã rời khỏi phòng!");
      return;
    }
    // xử lý người dùng muốn xóa thành viên
    if (props.role === "admin" || props.role === "leader") {
      const isConfirmed = window.confirm(
        "Bạn có muốn xóa thành viên này không?"
      );

      if (isConfirmed) {
        // console.log("Người dùng đã xác nhận!");
        // Thêm mã xử lý, ví dụ gọi API, cập nhật UI, v.v.
        console.log(props.phoneNumber);
        const response = await fetch(
          `/api/conversations/${props.conversationId}/delete-member`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: props.phoneNumber,
            }),
          }
        );
        if (response.status === 200) {
          message.success("Người dùng đã bị xóa khỏi phòng!");
        } else {
          const json = await response.json();
          console.error("Error deletin4g user:", json);
          message.error(json.message);
        }
      } else {
        message.info("Người dùng đã hủy!");
      }
    }
  };

  const handleToggleAdminOperation = async () => {
    // xử lý người dùng muốn thêm admin
    if (props.role === "leader") {
      const isConfirmed = window.confirm(
        props.isAdmin
          ? "Bạn có muốn xóa thành viên này khỏi danh sách admin không ?"
          : "Bạn có muốn thêm thành viên này làm admin không?"
      );

      if (isConfirmed) {
        // console.log("Người dùng đã xác nhận!");
        // Thêm mã xử lý, ví dụ gọi API, cập nhật UI, v.v.
        console.log(props.phoneNumber);
        const response = await fetch(
          `/api/conversations/${props.conversationId}/admin`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              targetUserId: props.phoneNumber,
              isAdmin: !props.isAdmin,
            }),
          }
        );
        if (response.status === 200) {
          message.success("Người dùng đã được thêm admin!");
        } else {
          const json = await response.json();
          console.error("Error adding user:", json);
          message.error(json.message);
        }
      } else {
        message.info("Người dùng đã hủy!");
      }
    }
  };

  const adminButton = () =>
    props.isAdmin ? (
      <FaMinus
        className="text-red-500 cursor-pointer hover:text-red-700 transition-all duration-200"
        onClick={() => {
          handleToggleAdminOperation();
        }}
      />
    ) : (
      <FaPlus
        className="text-green-500 cursor-pointer hover:text-green-700 transition-all duration-200"
        onClick={() => {
          handleToggleAdminOperation();
        }}
      />
    );

  return (
    <div className="flex gap-2 items-center">
      <div
        className="shadow-sm rounded-full"
        onClick={() => {
          router.push(`/users/${props.phoneNumber}`);
        }}
      >
        <AvatarImg imgUrl={props.baseImg}></AvatarImg>
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-sm">{props.name}</span>
        {memberTitle()}
      </div>

      {props.role === "leader" && !props.isLeader && adminButton()}

      {(props.role === "admin" ||
        props.role === "leader" ||
        userInfo?.phoneNumber === props.phoneNumber) && (
        <FaDoorOpen
          className="text-red-500 cursor-pointer hover:text-red-700 transition-all duration-200"
          onClick={handleOutRoomOperation.bind(this)}
        />
      )}
    </div>
  );
};

export default MemberItem;
