import {
  ConversationDetailDto,
  ConversationType,
  MemberDto,
} from "@/types/chat";
import React, { useLayoutEffect, useRef } from "react";
import SectionBox from "./SectionBox";
import AvatarImg from "@/components/AvatarImg";
import styles from "./RightMoreConversation.module.css";
import ExtendWrapper from "../ExtendWrapper";
import { Button, message, Modal, Select } from "antd";
import { useUser } from "@/context/UserContext";
import MemberItem from "./MemberItem";
import LeaveRoomModel from "./LeaveRoomModel";
import { FaSave, FaEdit } from "react-icons/fa";
import { useFindUser } from "@/context/FindUserModelContext";

interface Props {
  conversationInfo: ConversationDetailDto;
}

const RightMoreConversation: React.FC<Props> = ({ conversationInfo }) => {
  const {setModelOpen, userPhoneRef} = useFindUser();
  const [showMedia, setShowMedia] = React.useState(false);
  const [showFiles, setShowFiles] = React.useState(false);
  const [showMembers, setShowMembers] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState("");
  const [userMember, setUserMember] = React.useState<MemberDto | null>(null);
  const [isShowLeaderModal, setIsShowLeaderModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState<string>(
    conversationInfo.conversationName || ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    setIsEditing(true); // Tắt chế độ chỉnh sửa

    const formData = new FormData();
    formData.append("conversationName", editedName);

    // Gửi PUT request để lưu tên mới
    const response = await fetch(
      `/api/conversations/${conversationInfo.id}/info`,
      {
        method: "PUT", // Đảm bảo dùng PUT thay vì POST
        body: formData,
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log("Tên cuộc hội thoại đã được cập nhật:", data);
      message.success("Cập nhật tên nhóm thành công");
    } else {
      console.error("Lỗi khi cập nhật tên cuộc hội thoại");
      message.error("Cập nhật tên nhóm thất bại");
    }
  };

  const { userInfo } = useUser();

  useLayoutEffect(() => {
    if (conversationInfo.participantsDetails) {
      const user = conversationInfo.participantsDetails.find(
        (member) => member.phoneNumber === userInfo?.phoneNumber
      );
      setUserMember(user || null);
    }
  }, [conversationInfo.participantsDetails, userInfo?.phoneNumber]);

  // Hàm kiểm tra URL có phải là video dựa vào phần mở rộng
  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isAudio = (url: string) => {  
    const audioExtensions = [".mp3", ".wav", ".ogg"];
    return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  }

  const handleClearConversation = () => {
    // Gọi API để xóa nội dung cuộc hội thoại
    fetch(`/api/messages/conversation/${conversationInfo.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete conversation content");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Conversation content deleted successfully", data);
      })
      .catch((error) => {
        console.error("Error deleting conversation content:", error);
      });
  };

  const handleDeleteConversation = () => {
    // Gọi API để xóa nội dung cuộc hội thoại
    fetch(`/api/conversations/delete/${conversationInfo.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete conversation content");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Conversation content deleted successfully", data);
        message.success("Xóa cuộc hội thoại thành công");
      })
      .catch((error) => {
        console.error("Error deleting conversation content:", error);
        message.error("Xóa cuộc hội thoại thất bại");
      });
  };

  // Mở modal khi nhấp vào ảnh
  const openModal = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "file";
  };
  //
  const leaveRoomAPI = async (newLeaderId: string | undefined) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationInfo.id}/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newLeaderPhone: newLeaderId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to leave room");
      }

      const data = await response.json();
      console.log("Left room successfully", data);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Hàm xử lý người dùng muốn tự thoát khỏi phòng
  const handleLeaveRoom = () => {
    const isConfirmed = window.confirm("Bạn có muốn rời khỏi phòng không?");

    if (isConfirmed) {
      // console.log("Người dùng đã xác nhận!");
      if (
        userMember?.isLeader &&
        conversationInfo.participantsDetails.length > 3
      ) {
        // hiện danh sách thành viên để chọn người thay thế
        setIsShowLeaderModal(true);
        // handleShowDialog();
        return;
      }
      leaveRoomAPI(undefined)
        .then(() => {
          message.success("Rời phòng thành công");
        })
        .catch((error) => {
          message.error("Rời phòng thất bại");
          console.error("Error leaving room:", error);
        }); // Không phải leader, rời phòng trực tiếp
      // leaveRoomAPI(userMember?.isLeader ? selectedLeader?.phoneNumber : undefined);
    } else {
      console.log("Người dùng đã hủy!");
    }
  };

  // Xử lý khi click vào avatar
  const handleAvatarClick = (): void => {
    fileInputRef.current?.click(); // Kích hoạt input file ẩn
  };

  // Xử lý khi chọn file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append("baseImg", file);

    try {
      const response = await fetch(`/api/conversations/${conversationInfo.id}/info`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload success:", data);
      message.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      message.error("Cập nhật ảnh đại diện thất bại");
      console.error("Error uploading file:", error);
    }
  };

  const openFindUserModal = () =>{
    // console.log("open modal");
    if (userPhoneRef.current) {
      userPhoneRef.current.value = conversationInfo.participants[0] === userInfo?.phoneNumber ? conversationInfo.participants[1] : conversationInfo.participants[0];
    }
    setModelOpen(true);
  }

  // quyết định xem nội dung rightmore của media được show như thế nào ?
  const showMediaContent = (content: string) => {
    if (isVideo(content)) {
      return (
        <video
          src={content}
          controls
          className="w-full h-full object-cover"
        />
      );
    } 
    
    if (isAudio(content)) {
      return (
        <audio
          src={content}
          controls
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <img
        src={content}
        alt="Media"
        className="w-full h-full object-cover cursor-pointer"
        onClick={() => openModal(content)} // Mở modal khi nhấp
      />
    );
    
  }

  return (
    <>
      <ExtendWrapper>
        <>
          <SectionBox>
            <p
              style={{ marginBottom: 0, fontWeight: 600, textAlign: "center", color: "black" }}
              className="text-sm"
            >
              {conversationInfo.type === "PRIVATE"
                ? "Thông tin hội thoại"
                : "Thông tin nhóm"}
            </p>
          </SectionBox>
          <SectionBox className="items-center flex flex-col gap-3">
            <>
              {conversationInfo.admins?.includes(userInfo?.phoneNumber || "") &&
              conversationInfo.type == ConversationType.GROUP ? (
                <>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                  <AvatarImg
                    imgUrl={
                      conversationInfo.conversationImgUrl || "/avatar.jpg"
                    }
                    onClick={handleAvatarClick} // Mở modal khi nhấp vào ảnh
                  />
                  {/* Hiển thị tên nhóm và nút chỉnh sửa */}

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)} // Cập nhật tên mới
                        className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                        autoFocus
                      />
                    ) : (
                      <span className="font-bold text-sm">
                        {conversationInfo.conversationName}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveName(); // Gọi hàm lưu tên mới khi nhấn nút
                        }
                        setIsEditing(!isEditing); // Bật/tắt chế độ chỉnh sửa
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {isEditing ? <FaSave /> : <FaEdit />}{" "}
                      {/* Hiển thị icon */}
                    </button>
                  </div>
                  <span className="text-sm w-full">Invite link: </span>
                </>
              ) : (
                <>
                  <AvatarImg
                    imgUrl={
                      conversationInfo.conversationImgUrl || "/avatar.jpg"
                    }
                    onClick={() =>{
                        if (conversationInfo.type === ConversationType.PRIVATE)
                          openFindUserModal()
                      }
                    } // Mở modal khi nhấp vào ảnh
                  />
                  <span className="font-bold text-sm">
                    {conversationInfo.conversationName}
                  </span>
                </>
              )}
            </>
          </SectionBox>

          {/* show danh sách thành viên */}
          {conversationInfo.type === ConversationType.GROUP && (
            <SectionBox>
              <div className="flex flex-col gap-2">
                {/* Nút toggle hiển thị media */}
                <div
                  onClick={() => setShowMembers((curState) => !curState)}
                  className="w-full flex cursor-pointer"
                >
                  <p
                    style={{ margin: 0, fontWeight: 600 }}
                    className="text-sm text-black hover:text-blue-800"
                  >
                    {showMembers
                      ? "Ẩn danh sách thành viên"
                      : "Hiển thị danh sách thành viên"}{" "}
                    ({conversationInfo.participantsDetails?.length})
                  </p>
                </div>
                {/* Hiển thị danh sách thành viên khi showMembers là true */}
                {showMembers &&
                  !!conversationInfo.participantsDetails &&
                  conversationInfo.participantsDetails.map((member, index) => (
                    <MemberItem
                      key={member.phoneNumber}
                      {...member}
                      role={
                        userMember?.isLeader
                          ? "leader"
                          : userMember?.isAdmin
                          ? "admin"
                          : "member"
                      }
                      handleLeaveRoom={handleLeaveRoom}
                      conversationId={conversationInfo.id}
                    />
                  ))}
              </div>
            </SectionBox>
          )}
          {/* show media */}
          <SectionBox>
            <div className="flex flex-col gap-2">
              {/* Nút toggle hiển thị media */}
              <div
                onClick={() => setShowMedia((x) => !x)}
                className="w-full flex cursor-pointer"
              >
                <p
                  style={{ margin: 0, fontWeight: 600 }}
                  className="text-sm text-black hover:text-blue-800"
                >
                  {showMedia ? "Ẩn Media" : "Hiển thị Media"}
                </p>
              </div>
              {/* Hiển thị danh sách media khi showMedia là true */}
              {showMedia && (
                <div className="grid grid-cols-3 gap-2">
                  {conversationInfo.messageDetails &&
                  conversationInfo.messageDetails.length > 0 ? (
                    conversationInfo.messageDetails
                      .filter((msg) => msg.type === "MEDIA" && !msg.isRecalled) // Lọc chỉ tin nhắn có type là "MEDIA"
                      .map((msg, index) => (
                        <div
                          key={index}
                          className="size-24 overflow-hidden rounded-lg"
                        >
                          {showMediaContent(msg.content)}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có media để hiển thị.
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionBox>

          {/* Hiển thị danh sách file */}
          <SectionBox>
            <div className="flex flex-col gap-2">
              {/* Nút toggle hiển thị file */}
              <div
                onClick={() => setShowFiles((curState) => !curState)}
                className="w-full flex cursor-pointer"
              >
                <p
                  style={{ margin: 0, fontWeight: 600 }}
                  className="text-sm text-black hover:text-blue-800"
                >
                  {showFiles ? "Ẩn File" : "Hiển thị File"}
                </p>
              </div>
              {/* Hiển thị danh sách file khi showFiles là true */}
              {showFiles && (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {conversationInfo.messageDetails &&
                  conversationInfo.messageDetails.length > 0 ? (
                    conversationInfo.messageDetails
                      .filter((msg) => msg.type === "FILE" && !msg.isRecalled) // Lọc tin nhắn FILE
                      .map((msg, index) => (
                        <a
                          key={index}
                          href={msg.content}
                          download
                          className={styles.fileLink}
                          title={getFileName(msg.content)}
                        >
                          {getFileName(msg.content)}
                        </a>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có file để hiển thị.
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionBox>
          {/* Modal phóng to ảnh */}
          {isModalOpen && (
            <div
              className={`${styles.modal} ${
                isModalOpen ? styles.modalOpen : styles.modalClose
              }`}
              onClick={closeModal} // Đóng modal khi nhấp vào nền
            >
              <div className={styles.modalContent}>
                <img
                  src={selectedImage}
                  alt="Zoomed media"
                  className="max-w-full max-h-[90vh] object-contain"
                />
                <button
                  className={styles.closeButton}
                  onClick={closeModal}
                  aria-label="Đóng modal"
                >
                  <span style={{ color: "white", margin: 4 }}>X</span>
                </button>
              </div>
            </div>
          )}
          {/* show button clear cuộc hội thoại (private) */}
          {conversationInfo.type == ConversationType.PRIVATE && (
            <SectionBox>
              <Button
                type="default"
                danger
                className="w-full"
                onClick={handleClearConversation}
              >
                Xóa nội dung cuộc hội thoại
              </Button>
            </SectionBox>
          )}
          {/* Show button xóa cuộc hội thoại (group) */}
          {conversationInfo.type == ConversationType.GROUP &&
            conversationInfo.leader === userInfo?.phoneNumber && (
              <SectionBox>
                <Button
                  type="default"
                  danger
                  className="w-full"
                  onClick={handleDeleteConversation}
                >
                  Giải tán nhóm
                </Button>
              </SectionBox>
            )}
          {/*modal hiện danh sách thành viên */}
        </>
      </ExtendWrapper>
      {conversationInfo.type === ConversationType.GROUP && (
        <LeaveRoomModel
          conversationInfo={conversationInfo}
          userMember={userMember}
          leaveRoomCallback={leaveRoomAPI}
          isShowLeaderModal={isShowLeaderModal}
          setIsShowLeaderModal={setIsShowLeaderModal}
        />
      )}
    </>
  );
};

export default RightMoreConversation;
