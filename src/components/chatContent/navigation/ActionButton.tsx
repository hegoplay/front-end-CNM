import React, { useMemo } from "react";
import { IoPersonAddOutline } from "react-icons/io5";
import { CiVideoOn } from "react-icons/ci";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { UserResponseDto } from "@/types/user";
import IconButton from "@/components/IconButton";
import { ConversationType } from "@/types/chat";

interface ActionButtonsProps {
  onAddPersonClick?: () => void;
  onVideoCallClick?: () => void;
  onSearchClick?: () => void;
  onMoreClick?: () => void;
  type?: ConversationType;
  isAdmin?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddPersonClick = () => {},
  onVideoCallClick = () => {},
  onSearchClick = () => {},
  onMoreClick = () => {},
  type = ConversationType.PRIVATE,
  isAdmin = false,
}) => {
  const buttons = useMemo(
    () => (
      <div className="flex items-center gap-3">
        {
          (type == ConversationType.GROUP && (isAdmin)) && (
          <IconButton
            icon={
              <IoPersonAddOutline style={{ fontSize: 20, color: "black" }} />
            }
            onClick={onAddPersonClick}
            selected={false}
            className="bg-white hover:bg-gray-200"
            size="sm"
          />
          )
        }
        {type === ConversationType.PRIVATE && (
          <IconButton
            icon={<CiVideoOn style={{ fontSize: 20, color: "black" }} />}
            onClick={onVideoCallClick}
            selected={false}
            className="bg-white hover:bg-gray-200"
            size="sm"
          />
        )}

        <IconButton
          icon={<FaMagnifyingGlass style={{ fontSize: 20, color: "black" }} />}
          onClick={onSearchClick}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
        <IconButton
          icon={<IoIosMore style={{ fontSize: 20, color: "black" }} />}
          onClick={onMoreClick}
          selected={false}
          className="bg-white hover:bg-gray-200"
          size="sm"
        />
      </div>
    ),
    [onAddPersonClick, onVideoCallClick, onSearchClick, onMoreClick]
  );

  return buttons;
};

export default ActionButtons;
