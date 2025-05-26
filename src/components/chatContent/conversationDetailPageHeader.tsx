import React, { useLayoutEffect, useMemo } from "react";
import ActionButtons from "./navigation/ActionButton";
import { ConversationDetailDto, ConversationType } from "@/types/chat";
import { message, Modal } from "antd";
import { useUser } from "@/context/UserContext";
import { UserResponseDto } from "@/types/user";
import MemberItem from "./rightmore/MemberItem";
import MemberComponent from "./addMembers/MemberComponent";

interface Props {
  conversation: ConversationDetailDto;
  openMore?: boolean;
  setOpenMore?: React.Dispatch<React.SetStateAction<boolean>>;
  handleCall?: () => void;
  onSearchClick?: () => void;
}

const ConversationPageHeader: React.FC<Props> = ({
  openMore,
  setOpenMore,
  handleCall,
  conversation,
  onSearchClick = () => {},
}) => {
  const { userInfo } = useUser();
  const [showUpdate, setShowUpdate] = React.useState(false);
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = React.useState<
    UserResponseDto[]
  >([]);

  useLayoutEffect(() => {
    const getAvailableMembers = async () => {
      const response = await fetch(`api/friends/get-friends-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Available members: ", data);
      const friends = data.data as UserResponseDto[];
      // setAvailableMembers();
      // console.log("Available members: ", data);
      const availableMembers = friends
        .filter((friend) => friend != null)
        .filter((friend) => {
          return !conversation.participants.some(
            (member) => member === friend.phoneNumber
          );
        });
      setAvailableMembers(availableMembers);
    };

    getAvailableMembers();
  }, [conversation]);

  if (!conversation) {
    return <div className="flex p-3 border-b-1 border-gray-300 gap-3" />;
  }

  return (
    <div className="flex p-3 border-b-1 border-gray-300 gap-3">
      <img
        src={conversation?.conversationImgUrl}
        className="w-12 h-12 rounded-full"
        // alt={conversation?.conversationName || "User avatar"}
      />
      <div className="flex flex-1 flex-col justify-around">
        <span className="text-black font-semibold">
          {conversation?.conversationName}
        </span>
        <span className="text-sm text-gray-500">...</span>
      </div>
      {
        <ActionButtons
          onMoreClick={() => {
            if (setOpenMore) {
              
              setOpenMore((prev) => !prev);
            }
          }}
          onVideoCallClick={handleCall}
          onAddPersonClick={() => {
            setShowUpdate(true);
          }}
          type={conversation.type}
          isAdmin = {conversation.admins?.some((admin) => admin === userInfo?.phoneNumber) || false}
          onSearchClick={onSearchClick}
        />
      }
      <Modal
        open={showUpdate}
        onClose={() => setShowUpdate(false)}
        onCancel={() => setShowUpdate(false)}
        onOk={async () => {
          const response = await fetch(
            `api/conversations/${conversation.id}/add-members`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                newMembersPhone: selectedMembers,
              }),
            }
          );
          // const data = await response.json();
          // console.log("Add members response: ", data);
          setShowUpdate(false);
          setSelectedMembers([]);
          if (response.ok) {
            message.success("Thêm thành viên thành công");
          }
          else {
            message.error("Thêm thành viên thất bại");
          }
        }}
        title="Thêm thành viên"
      >
        <div className="flex flex-col gap-2">
          <span className="text-gray-500">
            Bạn có thể thêm thành viên vào cuộc trò chuyện này
          </span>
          {availableMembers.map((member) => (
            <MemberComponent
              memberDto={member}
              key={member.phoneNumber}
              checked={selectedMembers.includes(member.phoneNumber)}
              onChange={() => {
                if (selectedMembers.includes(member.phoneNumber)) {
                  setSelectedMembers((prev) =>
                    prev.filter((item) => item !== member.phoneNumber)
                  );
                } else {
                  setSelectedMembers((prev) => [...prev, member.phoneNumber]);
                }
              }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ConversationPageHeader;
